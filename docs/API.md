# Claude FAQ API

Base URL: `https://api.kcodes.me/claude-faqs/v1`

The Claude FAQ API serves curated community FAQ content for the Claude AI platform. It's designed for Discord bots, dashboards, and internal tools that need to surface answers to common questions.

## Authentication

All requests require an API key. Keys are provisioned by admins.

Pass your key in **one** of two ways:

```
# Header (recommended)
Authorization: Bearer cfaq_your_key_here

# Query parameter
?apikey=cfaq_your_key_here
```

If no key is provided:
```json
{
  "error": "Unauthorized",
  "message": "API key required. Pass via Authorization: Bearer <key> header or ?apikey= parameter."
}
```

If the key is invalid:
```json
{
  "error": "Unauthorized",
  "message": "Invalid API key."
}
```

### Rate Limits

Limits are per-key, not per-IP. Every response includes these headers:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Remaining-Minute` | Requests left this minute |
| `X-RateLimit-Remaining-Day` | Requests left today |
| `X-Authenticated-As` | Name tied to your API key |

| Tier | Per Minute | Per Day |
|------|-----------|---------|
| Standard | 30 | 1,000 |
| Premium | 100 | 10,000 |

When rate limited you'll get a `429` with a `Retry-After` header (seconds):
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 45,
  "limits": { "perMinute": 30, "perDay": 1000 }
}
```

---

## Endpoints

### GET `/` — API Info

Returns metadata about the API and available endpoints.

```bash
curl -H "Authorization: Bearer $KEY" https://api.kcodes.me/claude-faqs/v1/
```

```json
{
  "name": "Claude FAQ API",
  "version": "1.0.0",
  "generated_at": "2026-02-17T06:45:13.349Z",
  "entry_count": 71,
  "categories": [
    "Account Issues FAQ",
    "General Questions About Claude",
    "Billing & Plans FAQ",
    "Claude Code FAQ",
    "Claude's Capabilities & Usage"
  ],
  "endpoints": { "..." },
  "auth": { "..." }
}
```

---

### GET `/{slug}` — Lookup by Slug

The primary way to fetch a specific FAQ entry. Slugs are short, hyphenated identifiers like `account-banned` or `refund-subscription`.

```bash
curl -H "Authorization: Bearer $KEY" https://api.kcodes.me/claude-faqs/v1/account-banned
```

**Response (200):**
```json
{
  "slug": "account-banned",
  "tags": ["account", "disabled", "review", "systems", "policy", "..."],
  "category": "Account Issues FAQ",
  "subcategory": "Account Bans and Suspensions",
  "question": "My account was banned! What can I do?",
  "answer": "If your account has been disabled, you will typically see a message stating...",
  "answered_by": "konacodes",
  "source_file": "account-issues-faqs.md"
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | Unique identifier for this entry |
| `tags` | string[] | Keywords associated with this entry (up to 15). Used for search matching |
| `category` | string | Top-level category (e.g. "Billing & Plans FAQ") |
| `subcategory` | string | More specific grouping within the category |
| `question` | string | The FAQ question |
| `answer` | string | Full answer text. May contain markdown formatting (`**bold**`, links, lists) |
| `answered_by` | string \| null | Optional credit for who wrote the answer |
| `source_file` | string | Which markdown file this entry was parsed from |

**If the slug doesn't exist (404):**

The API returns suggestions based on keyword matching so you can point users in the right direction.

```json
{
  "error": "FAQ entry not found",
  "slug": "my-account-banned",
  "did_you_mean": [
    { "slug": "account-banned", "question": "My account was banned! What can I do?" },
    { "slug": "account-temporarily-suspended-long", "question": "My account is temporarily suspended. How long will it last?" },
    { "slug": "access-account-because-changed", "question": "I can't access my account because I changed email addresses" }
  ]
}
```

`did_you_mean` may be empty if nothing matches. It returns up to 3 suggestions.

---

### GET `/{slug}?format=discord` — Discord Embed Format

Append `?format=discord` to any slug lookup to get a response shaped for the Discord embed API. You can pass this directly to Discord's embed field.

```bash
curl -H "Authorization: Bearer $KEY" https://api.kcodes.me/claude-faqs/v1/account-banned?format=discord
```

**Response (200):**
```json
{
  "title": "My account was banned! What can I do?",
  "description": "If your account has been disabled, you will typically see...",
  "color": 7886330,
  "fields": [
    {
      "name": "Category",
      "value": "Account Issues FAQ > Account Bans and Suspensions",
      "inline": true
    },
    {
      "name": "Tags",
      "value": "account, disabled, review, systems, policy",
      "inline": true
    }
  ],
  "footer": {
    "text": "Claude Community FAQ | api.kcodes.me"
  }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | The FAQ question (max 256 chars per Discord limits) |
| `description` | string | The answer text, truncated to 4096 chars if needed |
| `color` | number | Embed accent color as decimal integer (7886330 = `#7855FA`, our purple) |
| `fields` | array | Category and tags as inline fields, plus optional "Answered By" |
| `footer.text` | string | Attribution footer |

**Usage in discord.py:**
```python
data = response.json()
embed = discord.Embed.from_dict(data)
await channel.send(embed=embed)
```

**Usage in discord.js:**
```javascript
const data = await response.json();
await message.channel.send({ embeds: [data] });
```

---

### GET `/search?q={query}` — Search

Search FAQ entries by keyword. Returns previews, not full answers — use the `slug` from results to fetch the full entry.

**Parameters:**

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `q` | Yes | — | Search keywords (e.g. `billing refund`) |
| `limit` | No | 5 | Max results to return (1-20) |
| `mode` | No | `tags` | `tags` for keyword matching, `semantic` for AI-powered search |
| `format` | No | — | Set to `discord` for embed-formatted results |

```bash
# Tag-based search (fast, keyword matching)
curl -H "Authorization: Bearer $KEY" "https://api.kcodes.me/claude-faqs/v1/search?q=billing+refund&limit=2"

# AI semantic search (understands meaning, slower)
curl -H "Authorization: Bearer $KEY" "https://api.kcodes.me/claude-faqs/v1/search?q=why+was+i+charged&mode=semantic"
```

**Response (200):**
```json
{
  "query": "billing refund",
  "mode": "tags",
  "count": 2,
  "results": [
    {
      "slug": "refund-subscription",
      "question": "Can I get a refund for my subscription?",
      "tags": ["subscription", "billing", "refunds", "anthropics", "service"],
      "answered_by": "konacodes",
      "answer_preview": "Refunds are **generally not provided** for Claude subscriptions. Anthropic's terms of service typically state that subscription fees are non-refundable. However, there are some circumstances where ref...",
      "category": "Billing & Plans FAQ",
      "subcategory": "Payment and Billing Issues"
    }
  ]
}
```

**Result fields:**

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | Use this to fetch the full entry via `GET /{slug}` |
| `question` | string | The FAQ question |
| `tags` | string[] | Top 5 tags for this entry |
| `answered_by` | string \| null | Optional answer credit |
| `answer_preview` | string | First 200 characters of the answer, truncated with `...` |
| `category` | string | Top-level category |
| `subcategory` | string | Subcategory within the category |

**Search modes:**

- **`tags`** (default) — Fast keyword matching. Scores entries by how many search terms appear in slugs, tags, questions, and categories. Best for when the user knows roughly what they're looking for.
- **`semantic`** — Uses Cloudflare's EmbeddingGemma-300M model to understand the meaning of the query. Better for natural language questions like "why was I charged after canceling". Falls back to tag search if AI is unavailable.

---

### POST `/ask` — AI-Powered Answer

Ask a natural language question and get an AI-generated answer based on the FAQ content. Uses Cloudflare Workers AI (Llama 3.1 8B) with the most relevant FAQ entries as context.

Also available as `GET /ask?q={question}` for convenience.

```bash
# POST (recommended)
curl -X POST \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"question": "how do I reset my password?"}' \
  https://api.kcodes.me/claude-faqs/v1/ask

# GET shorthand
curl -H "Authorization: Bearer $KEY" "https://api.kcodes.me/claude-faqs/v1/ask?q=how+do+I+reset+my+password"
```

**Response (200):**
```json
{
  "question": "how do I reset my password?",
  "answer": "To reset your Claude password, go to claude.ai and click \"Forgot password\" on the login page. Enter the email address associated with your account and you'll receive a password reset link...",
  "sources": [
    { "slug": "forgot-password-reset", "question": "I forgot my password. How do I reset it?" },
    { "slug": "log-account-try", "question": "I can't log in to my account. What should I try?" }
  ]
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `question` | string | The question you asked |
| `answer` | string | AI-generated answer based on FAQ content. Written to be conversational and concise |
| `sources` | array | The FAQ entries used as context. Each has `slug` and `question` |
| `note` | string? | Only present if AI was unavailable — indicates the answer is a direct FAQ match instead |

**When no relevant FAQs are found:**
```json
{
  "question": "what is the meaning of life?",
  "answer": "I couldn't find any relevant FAQ entries for your question. Try rephrasing or browse /categories.",
  "sources": []
}
```

**When AI is unavailable** (falls back to best FAQ match):
```json
{
  "question": "how do I reset my password?",
  "answer": "Go to claude.ai and click \"Forgot password\"...",
  "sources": [{ "slug": "forgot-password-reset", "question": "I forgot my password. How do I reset it?" }],
  "note": "AI response unavailable, returning best FAQ match directly."
}
```

---

### GET `/categories` — List Categories

Returns all FAQ categories with their subcategories and entry counts.

```bash
curl -H "Authorization: Bearer $KEY" https://api.kcodes.me/claude-faqs/v1/categories
```

**Response (200):**
```json
{
  "count": 5,
  "categories": [
    {
      "name": "Account Issues FAQ",
      "entry_count": 13,
      "subcategories": [
        "Account Bans and Suspensions",
        "Login and Access Problems",
        "Account Recovery",
        "Profile and Settings"
      ]
    },
    {
      "name": "Billing & Plans FAQ",
      "entry_count": 14,
      "subcategories": ["Plan Comparisons and Pricing", "Payment and Billing Issues", "Usage and Features", "Account Management"]
    }
  ]
}
```

---

### GET `/entries` — List All Entries

Returns a summary of all FAQ entries. Useful for building menus, autocomplete, or index pages.

**Parameters:**

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `category` | No | — | Filter by category or subcategory name (partial match, case-insensitive) |

```bash
# All entries
curl -H "Authorization: Bearer $KEY" https://api.kcodes.me/claude-faqs/v1/entries

# Filtered by category
curl -H "Authorization: Bearer $KEY" "https://api.kcodes.me/claude-faqs/v1/entries?category=billing"
```

**Response (200):**
```json
{
  "count": 14,
  "entries": [
    {
      "slug": "free-pro-max-plans",
      "question": "What are the differences between Free, Pro, and Max plans?",
      "tags": ["plans", "free", "pro", "max", "pricing"],
      "category": "Billing & Plans FAQ",
      "subcategory": "Plan Comparisons and Pricing"
    }
  ]
}
```

Note: This returns summaries (no full answers). Use `GET /{slug}` to get the full entry.

---

### GET `/slugs` — List All Slugs

Returns a flat list of every slug in the system. Useful for validation, autocomplete, or pre-caching.

```bash
curl -H "Authorization: Bearer $KEY" https://api.kcodes.me/claude-faqs/v1/slugs
```

**Response (200):**
```json
{
  "count": 71,
  "slugs": [
    "account-banned",
    "appeal-account-ban",
    "account-temporarily-suspended-long",
    "log-account-try",
    "forgot-password-reset",
    "..."
  ]
}
```

---

## Error Responses

All errors follow the same shape:

```json
{
  "error": "Short error name",
  "message": "Human-readable explanation (when available)"
}
```

| Status | Error | When |
|--------|-------|------|
| 400 | `Missing ?q= parameter` | Search without a query |
| 400 | `Missing question` | Ask without a question |
| 401 | `Unauthorized` | Missing or invalid API key |
| 404 | `FAQ entry not found` | Slug doesn't exist (includes `did_you_mean`) |
| 404 | `Not Found` | Unknown endpoint |
| 405 | `Method not allowed` | Using PUT, DELETE, etc. |
| 429 | `Rate limit exceeded` | Too many requests (check `Retry-After` header) |

---

## Common Patterns

### Discord Bot: Slash command that looks up a FAQ

```python
@tree.command(name="faq")
async def faq(interaction, slug: str):
    await interaction.response.defer()
    r = await http.get(f"{API}/v1/{slug}?format=discord", headers=headers)

    if r.status_code == 404:
        data = r.json()
        suggestions = data.get("did_you_mean", [])
        msg = f"Not found: `{slug}`"
        if suggestions:
            msg += "\n" + "\n".join(f"- `{s['slug']}`" for s in suggestions)
        await interaction.followup.send(msg)
    else:
        embed = discord.Embed.from_dict(r.json())
        await interaction.followup.send(embed=embed)
```

### Discord Bot: @mention to ask a question

```python
@client.event
async def on_message(message):
    if client.user in message.mentions:
        question = message.content.replace(f"<@{client.user.id}>", "").strip()

        # If replying to another message, use that as the question
        if not question and message.reference:
            ref = await message.channel.fetch_message(message.reference.message_id)
            question = ref.content.strip()

        r = await http.post(f"{API}/v1/ask", json={"question": question}, headers=headers)
        data = r.json()
        await message.reply(data["answer"])
```

### Handling Rate Limits

```python
r = await http.get(url, headers=headers)
if r.status_code == 429:
    retry_after = int(r.headers.get("Retry-After", 60))
    await asyncio.sleep(retry_after)
    r = await http.get(url, headers=headers)  # retry
```
