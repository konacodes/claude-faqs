# Claude Code Operations FAQ

## Installation and Runtime Stability

### Why is Claude Code segfaulting on WSL (Windows Subsystem for Linux)?

WSL segfaults are usually environment problems, not one universal Claude bug. The common culprits are shell startup scripts, incompatible runtime layers, or stale installs.

Use this sequence:
1. Run `claude doctor`
2. Update Claude Code to the latest build
3. Test in a minimal shell profile (no heavy dotfile customization)
4. If reproducible, file a bug with logs and exact repro steps

That gives maintainers enough signal to separate local environment issues from product regressions.

Official references:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [Claude Code troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)
- [Claude Code issue tracker](https://github.com/anthropics/claude-code/issues/new/choose)

### What's the fix for the bun version issue (1.3.10 segfaults)?

There isn’t a single public fix that covers every Bun-related crash case. If a specific runtime version is unstable on your machine, treat it as an environment compatibility incident:

- Capture `claude doctor` output
- Reinstall cleanly
- Reproduce in a minimal shell
- Submit a bug report with exact version details

Avoid silently pinning unknown versions without documenting why, because that makes team-wide debugging harder later.

Official references:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [Claude Code troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)

### How do I install Claude Code on different operating systems?

Use Anthropic’s setup guide and follow the OS-specific path directly. Supported workflows cover macOS, Linux distributions, and Windows-oriented flows (including WSL-based setups).

For team onboarding, create a short internal runbook that mirrors the official steps, plus your own org-specific prerequisites.

Official reference:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)

### Why does Claude Code crash on my system?

Most crash reports trace back to one of these:
- environment/runtime mismatch
- unstable shell/plugin setup
- resource constraints
- corrupted local install state

Treat crashes as reproducibility work: isolate variables, reduce the environment, then report with logs.

Official references:
- [Claude Code troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)

### How do I use my system's Node.js instead of the bundled bun?

Follow official install/runtime guidance first, then test custom runtime behavior only if you have a clear reason. If you deviate, standardize it in your team docs and verify with `claude doctor` so everyone runs the same known-good stack.

The key is consistency across developers and CI, not just a one-machine workaround.

Official references:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [Claude Code troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)

### What are the system requirements for Claude Code?

The baseline expectations are modern supported OS, Node.js 18+ for the documented install path, and reliable network access for authentication/model calls. For large repos, additional memory/CPU headroom improves stability and response time.

Official reference:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)

## Workflow, Permissions, and Project Structure

### How does Claude Code handle file indexing?

Claude Code generally works by reading relevant files as needed via tool calls, not by maintaining one permanent global index that stays fully loaded forever. In very large repos, explicit scoping is still important.

Practical habits that help:
- keep `.claudeignore` clean
- run focused tasks
- split long jobs into smaller phases

Official references:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [Connect Claude Code to tools via MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)

### Can Claude Code automatically accept permissions without prompting?

It can be configured to reduce prompts, but full blanket auto-approval is risky for everyday development. Most teams should prefer narrower settings that keep command execution gated while reducing repetitive safe prompts.

If you enable broader permissions, do it in controlled environments and review settings regularly.

Official reference:
- [Claude Code troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)

### What permissions does Claude Code need?

At a minimum: file access in your project, command execution permissions for tasks you approve, and network access when calling external services/tools.

For security, use least privilege:
- restrict filesystem scope
- avoid persistent dangerous command approvals
- separate local dev and production credentials

Official reference:
- [Claude Code troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)

### Can I automate permission acceptance?

Yes, but treat it as an operations decision, not convenience only. If you automate approvals, scope it tightly and pair it with logging/guardrails. For interactive sessions, explicit command gating is still the safer default.

Official reference:
- [Claude Code troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)

### How do I save workspace context between sessions?

Use `CLAUDE.md` as your canonical persistent instructions, keep conventions explicit, and update it whenever project decisions change. Pair that with clear task boundaries so each session starts from stable context rather than long chat history.

This is more reliable than relying on one giant ongoing thread.

Official references:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [Claude Code tutorials](https://docs.anthropic.com/en/docs/claude-code/tutorials)

### How do I persist memory across Claude sessions?

Persist process memory in project artifacts, not only in conversation text:
- `CLAUDE.md` for standing instructions
- architecture docs for design decisions
- task notes/checklists for in-flight work

This makes handoffs and restarts predictable for both humans and agents.

Official references:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [Claude Code tutorials](https://docs.anthropic.com/en/docs/claude-code/tutorials)

### What's the best way to save context between chats?

Summarize decisions into files that live with your codebase. A short "state of project" note plus updated `CLAUDE.md` usually beats trying to continue one massive conversation forever.

Long-lived projects benefit most from documented context checkpoints.

Official references:
- [Claude Code tutorials](https://docs.anthropic.com/en/docs/claude-code/tutorials)
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)

### Can I create session-type profiles for different use cases?

Yes. Many teams keep separate profile styles for planning, implementation, and review. The trick is to codify each profile’s objective and output format so sessions stay consistent.

A simple pattern:
- planner profile
- builder profile
- reviewer profile

Official references:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [Claude Code tutorials](https://docs.anthropic.com/en/docs/claude-code/tutorials)

### Can I use Claude Code with different databases (Firebase, PostgreSQL, etc.)?

Yes. Claude Code can help across many backend stacks, including SQL and BaaS workflows. What changes is your tooling and deployment discipline, not Claude Code’s core workflow.

Use migration files, environment isolation, and reproducible local setup scripts so generated changes remain safe to ship.

Official reference:
- [Connect Claude Code to tools via MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)

### What's the best way to structure projects in Claude Code?

Keep structure simple and explicit:
- one repo/worktree per major task stream
- clear folder boundaries
- consistent scripts (`test`, `lint`, `build`)
- project instructions in `CLAUDE.md`

Claude performs best when conventions are obvious and executable.

Official references:
- [Claude Code tutorials](https://docs.anthropic.com/en/docs/claude-code/tutorials)
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)

### Can I use Claude Code for free?

Claude Code availability depends on plan/access model and can change over time. Confirm current access terms in official plan/product docs before assuming long-term free usage for development workflows.

Official references:
- [Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)

## Still Need Help?

If your Claude Code workflow still feels unstable:
- capture `claude doctor` output
- reduce to a minimal reproducible case
- submit a bug with exact versions and repro steps
