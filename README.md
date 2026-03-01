# Claude Community FAQ API

A community-driven FAQ resource for Claude's Developer Discord and Reddit communities (r/Anthropic, r/ClaudeAI), served as a Cloudflare Worker API.

Whether you're dealing with account issues, wondering about Claude's capabilities, or having technical problems, the answers are here — programmatically accessible for Discord bots, dashboards, and internal tools.

## API

**Base URL:** `https://api.kcodes.me/claude-faqs/v1`

All requests require an API key. See the full [API Documentation](docs/API.md) for endpoints, response formats, and usage examples.

### Quick Start

```bash
# Look up a FAQ by slug
curl -H "Authorization: Bearer $KEY" https://api.kcodes.me/claude-faqs/v1/account-banned

# Search by keyword
curl -H "Authorization: Bearer $KEY" "https://api.kcodes.me/claude-faqs/v1/search?q=billing+refund"

# AI-powered answer
curl -X POST -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"question": "how do I reset my password?"}' \
  https://api.kcodes.me/claude-faqs/v1/ask
```

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /{slug}` | Direct FAQ lookup |
| `GET /{slug}?format=discord` | FAQ as Discord embed |
| `GET /search?q={query}` | Keyword search |
| `GET /search?q={query}&mode=semantic` | AI semantic search |
| `POST /ask` | AI-powered natural language answer |
| `GET /categories` | List all categories |
| `GET /category/{category_slug}` | List entries in a category slug |
| `GET /entries` | List all entries (filterable) |
| `GET /slugs` | List all slug identifiers |

## FAQ Categories

### [Account Issues](faq-content/account-issues-faqs.md)
Account bans and suspensions, login problems, account recovery, profile settings

### [General Questions](faq-content/general-faq.md)
About Claude and Anthropic, capabilities and limitations, safety and policies

### [Billing & Plans](faq-content/billing-faq.md)
Plan comparisons and pricing, payment issues, usage limits, refunds

### [Claude Code](faq-content/claude-code-faq.md)
Getting started, context and memory, sub-agents and MCPs, troubleshooting

### [Capabilities & Usage](faq-content/claude-usage.md)
Model comparisons, API pricing, privacy and data safety

### [Support and Access](faq-content/support-and-access-faq.md)
Support workflows, billing dispute handling, and access/permission issues

### [Claude Code Operations](faq-content/claude-code-operations-faq.md)
Installation/runtime troubleshooting, session workflows, permissions, and project operations

### [Models, Safety, and Updates](faq-content/models-safety-and-updates-faq.md)
Model differences, release cadence, vision capabilities, and safety/governance topics

### [Context, Caching, Streaming, and Batch](faq-content/context-caching-streaming-and-batch-faq.md)
Token strategy, prompt caching, streaming responses, and batch reliability/cost controls

### [Backend and Integrations](faq-content/backend-and-integrations-faq.md)
Database choices, Firebase security patterns, MCP ecosystem, and external app integrations

## Contributing Quick Start

```bash
# 1) Fork this repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/claude-faqs.git
cd claude-faqs

# 2) Create a branch for your change
git checkout -b faq/<short-topic>

# 3) Install dependencies
bun install

# 4) Edit FAQ markdown in faq-content/
# Optional per-question credit line inside an answer:
# Answered by: YourName
# Optional source metadata line:
# Sources: https://docs.anthropic.com/...
# last_verified_at is auto-stamped at build time in HQ timezone (America/Los_Angeles)
# Category and subcategory slugs are auto-generated from headings

# 5) Validate FAQ content
bun run check:faq

# 6) Rebuild faq-index.json
bun scripts/build-faq-index.ts

# 7) Commit and push
git add .
git commit -m "Add/update FAQ: <topic>"
git push -u origin faq/<short-topic>
```

Then open a pull request from your fork to this repo's default branch.

If you are not opening a PR, use the GitHub issue form: `Suggest FAQ`.

## Local Preview (Optional)

```bash
bun run dev
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

*This project is maintained by the community. We are not affiliated, employed, or associated in any official way with Anthropic, PBC.*
