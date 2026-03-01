# Support and Access FAQ

## Billing Disputes and Support Escalation

### How do I update my payment method if my email account is disabled?

If the email on your Claude account is no longer accessible, don’t create a second paid account as a workaround. That usually makes billing harder to untangle later.

Instead, contact support through the official support flow and clearly state that you lost email access and need billing-profile recovery. Include the old email, any replacement email, the last 4 digits of the payment method (if available), and the approximate date of your last successful charge. That gives support enough context to validate ownership safely.

Official references:
- [How to Get Support](https://support.claude.com/en/articles/9015913-how-to-get-support)
- [How do I cancel my paid Claude subscription?](https://support.claude.com/en/articles/8325617-how-do-i-cancel-my-paid-claude-subscription)

### Why was my account charged $850 in 2 hours?

A sudden spike like this usually comes from one of three patterns: rapid API traffic, an automation loop (retries/requeues), or confusion between multiple billing surfaces (Claude app subscription + API + app store billing).

Start with a quick triage checklist:
- Confirm whether the charge is from **Claude app subscription**, **API usage**, or **app-store billing**
- Pull timestamps and request/job IDs around the spike window
- Check for repeated failed/retried jobs
- Freeze or rate-limit the affected workflow before re-running anything

Then open one support ticket with that evidence in one place. A single, clean timeline is much faster for investigation than multiple disconnected messages.

Official references:
- [How to Get Support](https://support.claude.com/en/articles/9015913-how-to-get-support)
- [Rate limits](https://docs.anthropic.com/en/api/rate-limits)
- [Create a Message Batch](https://docs.anthropic.com/en/api/creating-message-batches)

### How long does it take to get a response from support?

There is no single public SLA that applies to every support request. Response time depends on queue volume, issue type, and how complete your report is.

In practice, the fastest path is:
- One ticket, one timeline
- Clear reproduction details
- Relevant evidence (error text, timestamps, receipt IDs, request IDs)

For billing or account lockout issues, concise completeness usually matters more than message volume.

Official reference:
- [How to Get Support](https://support.claude.com/en/articles/9015913-how-to-get-support)

### Why do my emails to support@anthropic.com bounce?

This can happen due to sender-domain rules, mailbox filtering, or support intake routing changes. If direct email bounces, use the official support messenger/help-center workflow instead of retrying the same email path.

That route is the most reliable way to reach the Product Support team and keeps your case tied to a single thread.

Official reference:
- [How to Get Support](https://support.claude.com/en/articles/9015913-how-to-get-support)

### How often does support take to respond?

It varies by issue type and current support volume. Instead of thinking in a fixed number of hours, optimize for ticket quality:

- Include what happened
- Include when it happened (timezone included)
- Include what you already tried
- Include account/billing identifiers relevant to the issue

That usually shortens back-and-forth and gets you to resolution faster.

Official reference:
- [How to Get Support](https://support.claude.com/en/articles/9015913-how-to-get-support)

### How do I contact human support at Anthropic?

Use the official support channel documented in the Help Center. Start from the in-product/help-center flow, select the closest issue type, and include details support can act on immediately.

For bug or billing issues, include exact timestamps and the full error text. For account access issues, include both old/new email and any ownership details you can safely share.

Official reference:
- [How to Get Support](https://support.claude.com/en/articles/9015913-how-to-get-support)

### What's the support process for account and billing issues?

A reliable process looks like this:
1. Gather evidence first (receipt IDs, timestamps, error strings, request IDs, screenshots)
2. Submit one support thread with a concise timeline
3. Keep follow-ups in the same thread
4. Avoid parallel duplicate tickets unless instructed

This helps support avoid re-triaging the same issue across multiple threads and typically improves response quality.

Official references:
- [How to Get Support](https://support.claude.com/en/articles/9015913-how-to-get-support)
- [How do I request a refund for my Claude subscription?](https://support.claude.com/en/articles/9836398-how-do-i-request-a-refund-for-my-claude-subscription)

### How do I request a refund for unexpected charges?

Submit a refund request with enough context for audit:
- Charge amount/date
- Billing surface (Claude web, API, Apple/Google store)
- Account email
- Why the charge appears unexpected
- Supporting evidence (invoice, receipt, logs)

Refunds are reviewed case-by-case, so the clarity of your timeline matters.

Official references:
- [How do I request a refund for my Claude subscription?](https://support.claude.com/en/articles/9836398-how-do-i-request-a-refund-for-my-claude-subscription)
- [How to Get Support](https://support.claude.com/en/articles/9015913-how-to-get-support)

## Permissions and Channel Access

### How do I get access to specific Discord channels?

Discord channel visibility and posting rights are controlled by Discord roles and server permissions, not by Claude directly. If a channel is missing or read-only, ask server admins/mods which role gate applies.

When reporting this issue, include:
- Server name
- Channel name
- Your role(s)
- The exact action you cannot perform

Official reference:
- [Discord permissions FAQ](https://support.discord.com/hc/en-us/articles/206029707-Setting-Up-Permissions-FAQ)

### Why don't I have permission to reply in threads?

Thread replies are governed by thread/channel-level Discord permission settings. In most cases, this is a Discord configuration issue rather than a Claude issue.

If a Claude-powered bot is involved, verify both:
- Your role permissions in Discord
- The bot’s permission scope in that channel/thread

Official reference:
- [Discord Threads FAQ](https://support.discord.com/hc/en-us/articles/4403205878423-Threads-FAQ)

## Still Need Help?

If your issue is still unresolved:
- Open one focused support request with a full timeline
- Include timestamps, timezone, and exact error messages
- Link the relevant official documentation you already followed
