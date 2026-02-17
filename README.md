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

## Development

```bash
# Install dependencies
bun install

# Rebuild the FAQ index after editing markdown files
bun scripts/build-faq-index.ts

# Run locally
bun run dev

# Deploy
bun run deploy
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

*This project is maintained by the community. We are not affiliated, employed, or associated in any official way with Anthropic, PBC.*
