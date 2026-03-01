# Context, Caching, Streaming, and Batch FAQ

## Context and Token Management

### What is the context window limit for Claude?

Context limits depend on model and surface. Don’t assume one global number applies everywhere. Check the model documentation for your exact deployment target (API vs app, model family, feature flags).

For long-running workflows, design prompts so critical instructions stay stable and easy to re-inject instead of depending on one huge continuously growing thread.

Official reference:
- [All Claude models](https://docs.anthropic.com/en/docs/about-claude/models/all-models)

### How does the 1M token context window work?

The 1M-context experience is model/surface dependent and may be gated by specific configurations. Treat it as a capability you verify per environment, not a guaranteed baseline for every use case.

Even with very large context, quality still depends on prompt structure. Big context is not a replacement for clean task decomposition.

Official reference:
- [All Claude models](https://docs.anthropic.com/en/docs/about-claude/models/all-models)

### How do I manage tokens efficiently with large projects?

Use an economy strategy:
- keep stable project instructions in reusable blocks
- avoid resending bulky changing context every turn
- split tasks into smaller scoped runs
- summarize and checkpoint frequently

Token efficiency is mostly architecture, not just prompt wording.

Official references:
- [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Manage costs effectively](https://docs.anthropic.com/en/docs/claude-code/costs)

### How does context compaction work?

Compaction keeps sessions tractable by compressing older context into smaller summaries. This helps prevent runaway token growth, but you can lose fine-grained detail if you rely entirely on long chat history.

Important project decisions should live in files/docs, not only in prior chat turns.

Official references:
- [Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [Claude Code tutorials](https://docs.anthropic.com/en/docs/claude-code/tutorials)

### Why am I hitting token limits so quickly?

Common reasons:
- very large context payloads
- repeated retries/loops
- verbose outputs on every turn
- no caching strategy for stable prefixes

Start by inspecting request shape and frequency, then reduce duplicated context and excessive replays.

Official references:
- [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Rate limits](https://docs.anthropic.com/en/api/rate-limits)

### How do I optimize context usage for long-running tasks?

Use staged execution:
1. Planning pass
2. Focused implementation pass
3. Verification pass

And persist important facts in project files between stages. This approach usually outperforms one enormous monolithic conversation.

Official references:
- [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Claude Code tutorials](https://docs.anthropic.com/en/docs/claude-code/tutorials)

## Prompt Caching and Performance

### What's prompt caching and how do I use it?

Prompt caching lets Anthropic reuse stable prompt prefixes so repeated workloads are cheaper and faster. You configure caching with `cache_control` in Messages API requests.

It works best when your reusable prefix is genuinely stable across requests.

Official reference:
- [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

### Why is my cache usage so high?

High cache activity usually means your application is repeatedly sending large prefixes or frequently invalidating cache boundaries with small but important prompt changes.

Audit your request template and separate stable context from per-request dynamic fields.

Official reference:
- [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

### How can I reduce token usage with caching?

Put long-lived instructions/context into cached sections and keep high-churn data outside those cache segments. If your prefix changes every request, you get little cache benefit.

Measure improvements by comparing token usage before/after template refactors.

Official references:
- [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Manage costs effectively](https://docs.anthropic.com/en/docs/claude-code/costs)

### What's the cache drive feature?

There isn’t a broadly documented Anthropic product feature called "cache drive" today. Most community references map to Messages API prompt caching.

When in doubt, align implementation with official API docs rather than community shorthand terms.

Official reference:
- [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

## Streaming and Real-time Responses

### How do I use streaming mode with Claude?

Use the Messages API streaming flow (SSE) and consume partial events as they arrive. Production clients should also handle reconnects, timeouts, and partial-output state management.

Streaming improves perceived latency, but you still need robust error handling and cancellation logic.

Official references:
- [Streaming](https://docs.anthropic.com/en/docs/build-with-claude/streaming)
- [Messages API](https://docs.anthropic.com/en/api/messages)

### What's the stream-json interface?

"stream-json" is usually an application-level parsing pattern, not a separate Anthropic endpoint. Anthropic documents streaming event delivery; how you parse/compose JSON chunks is your client implementation detail.

Official reference:
- [Streaming](https://docs.anthropic.com/en/docs/build-with-claude/streaming)

### Can I get real-time responses from Claude?

Yes. Streaming gives progressive output so users see response tokens/events quickly. To make it production-safe, implement backpressure, retry logic, and request cancellation semantics.

Official references:
- [Streaming](https://docs.anthropic.com/en/docs/build-with-claude/streaming)
- [Messages API](https://docs.anthropic.com/en/api/messages)

## Batch Processing and Cost Control

### Why did my batch job get stuck in a loop?

Looping jobs are almost always orchestration bugs: retry storms, missing terminal checks, duplicate schedulers, or non-idempotent handlers.

Treat loop prevention as part of your job design, not a postmortem step.

Official reference:
- [Create a Message Batch](https://docs.anthropic.com/en/api/creating-message-batches)

### How do I prevent batch processing loops?

Use guardrails by default:
- idempotency keys/custom request IDs
- max retry ceilings
- explicit terminal-state transitions
- duplicate-trigger detection

Alerting on abnormal repeat count is essential for cost protection.

Official references:
- [Create a Message Batch](https://docs.anthropic.com/en/api/creating-message-batches)
- [Rate limits](https://docs.anthropic.com/en/api/rate-limits)

### What happened to my batch job that ran 46 times?

That pattern usually points to scheduler/retry duplication, not one single Anthropic execution repeating by itself. Inspect scheduler logs, webhook handlers, and retry middleware for duplicate dispatch paths.

Official reference:
- [Create a Message Batch](https://docs.anthropic.com/en/api/creating-message-batches)

### How are batch jobs billed?

Batch workloads are billed by the underlying token usage of the batched requests. If your orchestrator replays jobs unexpectedly, cost can scale quickly.

That’s why idempotency and retry controls are both reliability features and billing controls.

Official references:
- [Create a Message Batch](https://docs.anthropic.com/en/api/creating-message-batches)
- [Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)

## Still Need Help?

If you are debugging performance or cost spikes:
- capture request templates and run IDs
- identify replay loops before re-running jobs
- tune caching and streaming deliberately, not ad hoc
