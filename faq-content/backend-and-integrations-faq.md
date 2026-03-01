# Backend and Integrations FAQ

## Database Selection and Security

### Should I use Firebase or look for alternatives?

Firebase is great for fast prototyping and small-team velocity, but it is not automatically the best long-term choice for every workload. If your project needs strict SQL control, portability, complex reporting, or tight compliance boundaries, alternatives may fit better.

Pick based on requirements first:
- query patterns
- auth model
- ops ownership
- future migration cost

### What are the security issues with Firebase?

Most real incidents come from permissive or incorrectly tested security rules, not from Firebase being inherently unsafe. The biggest risk is shipping prototype defaults into production.

Treat rule design like code: review it, test it, and version it.

Official reference:
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

### How do I set up a database with Claude Code?

Use Claude Code to scaffold setup files, migrations, and starter queries, but keep production controls in your normal engineering process: reviewed migrations, environment-specific secrets, and explicit deploy gates.

Claude can accelerate setup, but it should not replace your data governance and release discipline.

Official references:
- [Claude Code tutorials](https://docs.anthropic.com/en/docs/claude-code/tutorials)
- [Connect Claude Code to tools via MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)

### Can I build a full-stack app with Claude Code and Firebase?

Yes. This is a common pattern for MVPs and internal tools. Claude Code can help with frontend scaffolding, backend glue code, rule templates, and testing utilities.

The quality of the final system still depends on architecture decisions, test depth, and security-review quality.

Official references:
- [Claude Code tutorials](https://docs.anthropic.com/en/docs/claude-code/tutorials)
- [Firebase docs](https://firebase.google.com/docs)

### What's the cheapest database option for Claude Code projects?

For local prototypes, SQLite is often the lowest-cost place to start. For hosted production, the "cheapest" option depends on traffic, storage growth, egress, and developer ops time.

Look at total cost of ownership, not just the entry-tier price.

Official reference:
- [Manage costs effectively](https://docs.anthropic.com/en/docs/claude-code/costs)

### Why does Firebase free tier have security concerns?

The free tier itself is not the problem. The risk comes when teams leave permissive rules enabled while usage grows.

If you use Firebase in production, make rule hardening and continuous rule testing part of your release checklist.

Official reference:
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

## App Integrations and Tooling

### What MCPs (Model Context Protocol tools) are available?

The MCP ecosystem changes quickly and includes both official and community servers. Instead of memorizing a static list, pick MCPs by workflow category:
- source control
- issue tracking
- observability
- internal data/tools

Always validate security posture before connecting sensitive systems.

Official reference:
- [Connect Claude Code to tools via MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)

### What payment and identity tools work with Claude?

Claude doesn’t force a single payment or identity stack. You typically integrate payment/identity at your application layer and call Anthropic from your backend.

The practical requirement is robust server-side control: token handling, auth boundaries, and audit logs.

Official references:
- [Messages API](https://docs.anthropic.com/en/api/messages)
- [Connect Claude Code to tools via MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)

### Can I integrate Claude with Telegram?

Yes. A common pattern is Telegram bot frontend + your backend + Anthropic Messages API. Keep moderation, retry, and timeout logic in your backend rather than pushing complexity into the bot transport layer.

Official references:
- [Messages API](https://docs.anthropic.com/en/api/messages)
- [Rate limits](https://docs.anthropic.com/en/api/rate-limits)

## Still Need Help?

If you're choosing infra or integration strategy:
- start from your requirements, not trend recommendations
- model security and cost early
- document your chosen architecture so future contributors can reason about tradeoffs
