# Claude Code FAQ

## Getting Started & Best Practices

### I'm new to Claude Code. What are the best workflows for building projects?

**Claude Code** is an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools. It is available in your terminal, IDE (VS Code, Cursor, JetBrains), as a standalone desktop app, and in the browser at [claude.ai/code](https://claude.ai/code). The best workflow for beginners is to start by navigating to your project directory and running `claude` in your terminal. Begin with small, focused tasks like "explain the structure of this project" or "write tests for the auth module." Use plain language to describe what you want -- Claude Code will plan its approach, write code across multiple files, and verify it works. For larger projects, establish a **CLAUDE.md** file at your project root (you can bootstrap one by running `/init`) that documents your coding standards, architecture decisions, preferred libraries, and common commands. This gives Claude Code persistent context about your project conventions. As you grow comfortable, you can leverage more advanced features like sub-agents, background tasks, custom slash commands, and MCP integrations.

### Should I start with small, iterative tasks or give Claude the full project scope at once?

Start with **small, iterative tasks**. This approach is strongly recommended for several reasons:

- **Verification**: You can confirm Claude understands your requirements correctly before it builds on potentially wrong assumptions
- **Error catching**: Issues are caught early before they compound across multiple files
- **Context management**: Smaller tasks keep the conversation context focused, reducing the chance of "context rot" in long sessions
- **Learning**: You develop an intuition for how Claude Code interprets different types of instructions

Once you are comfortable with Claude Code's capabilities and your CLAUDE.md is well-established, you can give it larger scope tasks like "implement the user authentication flow with signup, login, password reset, and session management." For truly large tasks, consider using **plan mode** first (accessible via `/plan` or by asking Claude to "make a plan") to have Claude research your codebase and present an implementation plan before writing any code. You can also use the `/todo` feature to break down large tasks into trackable subtasks.

### What is the best IDE setup for Claude Code (e.g., VS Code vs. Cursor)?

Claude Code is a standalone tool that works across multiple environments, and the best setup depends on your workflow:

- **Terminal CLI** (recommended starting point): The full-featured experience. Install via `curl -fsSL https://claude.ai/install.sh | bash` on macOS/Linux or via Homebrew with `brew install --cask claude-code`. Run `claude` in any project directory. This gives you the complete feature set with maximum flexibility.
- **VS Code / Cursor**: Install the "Claude Code" extension from the Extensions marketplace. Provides inline diffs, @-mentions for file references, plan review, and conversation history directly in your editor. Great for developers who prefer staying in their IDE.
- **JetBrains** (IntelliJ, PyCharm, WebStorm, etc.): Install the Claude Code plugin from the JetBrains Marketplace. Offers interactive diff viewing and selection context sharing.
- **Desktop App**: A standalone application for running Claude Code outside your IDE. Useful for visual diff review and running multiple sessions side by side. Download from [claude.ai](https://claude.ai) for macOS or Windows.
- **Web**: Run Claude Code in your browser at [claude.ai/code](https://claude.ai/code) with no local setup required. Ideal for long-running tasks, working on repos you do not have locally, or running tasks from mobile.

All surfaces connect to the same underlying Claude Code engine, so your CLAUDE.md files, settings, and MCP servers work across all of them.

### How can I make Claude less agreeable and more of a critical coding partner?

Claude Code (and Claude in general) has historically been criticized for **sycophancy** -- being overly agreeable and saying things like "You're absolutely right!" too frequently. Anthropic has been actively working to reduce this behavior, and recent models are significantly less sycophantic. To get more critical, honest feedback from Claude Code:

- Add instructions to your **CLAUDE.md** file such as: "Be direct and critical in code reviews. Point out issues, anti-patterns, and potential bugs without sugarcoating. Do not agree with the user unless the approach is genuinely correct."
- Ask explicitly for critiques: "What are the weaknesses of this approach?" or "Challenge my assumptions about this architecture"
- Request **alternative approaches**: "What are 3 different ways to implement this, and what are the trade-offs of each?"
- Use a code review subagent with a system prompt specifically designed for critical review (see the subagents documentation)
- When Claude agrees too readily, push back: "I don't think that's right. Can you think more carefully about edge cases?"

### How do I prevent Claude from over-engineering my code?

Claude Code can sometimes produce unnecessarily complex solutions when a simpler approach would suffice. To keep things pragmatic:

- Be explicit about simplicity: "Implement the simplest solution that works" or "Keep this minimal -- no abstractions unless they're clearly needed"
- Specify constraints: "Use only the standard library," "Maximum 50 lines," or "No new dependencies"
- Ask for an **MVP first**: "Build the minimum viable version first, and we can add complexity later if needed"
- Add a directive to your **CLAUDE.md**: "Prefer simple, readable code over clever abstractions. Only add complexity when there is a clear, immediate need."
- When Claude suggests a complex pattern, ask: "Do we actually need this abstraction right now, or is there a simpler way?"
- Specify the scale: "This is a small personal project" vs. "This needs to scale to millions of users" -- context about scope helps Claude calibrate the appropriate level of engineering

### I'm not a developer. How can I use Claude Code to build simple apps or for creative projects?

Claude Code is surprisingly accessible for non-developers because you can describe what you want in plain language. Here are ways to get started:

- **Simple web pages**: "Create a personal portfolio website with my name, a bio section, and links to my projects" -- Claude Code will generate HTML, CSS, and JavaScript files
- **Automation scripts**: "Write a script that renames all photos in this folder by their date taken"
- **Data processing**: "Create a tool that reads this CSV file and generates a summary report"
- **Learning**: "Explain what each line of this code does" -- use Claude Code as a patient teacher that explains concepts as it builds
- **Creative projects**: "Build a simple interactive story game in the browser" or "Create a webpage that generates random color palettes"

Start by installing Claude Code, navigating to an empty folder, and describing what you want to create. Claude will set up the project, create files, and guide you through running it. You do not need to understand the code it generates -- but asking it to explain what it did is a great way to learn. A **Pro** or **Max** subscription (or an API account) is required to use Claude Code.

## Context, Memory, and Limits

### How can I make Claude remember things across sessions (persistent memory)?

Claude Code has two types of persistent memory:

- **Auto memory**: Claude automatically saves useful context as it works, including project patterns, build commands, test conventions, code style preferences, debugging insights, and your workflow preferences. This is stored at `~/.claude/projects/<project>/memory/` and the first 200 lines of the main `MEMORY.md` file are loaded into every new session. You can ask Claude to save specific things: "Remember that we use pnpm, not npm" or "Save to memory that the API tests require a local Redis instance."
- **CLAUDE.md files**: Markdown files you write and maintain with instructions for Claude to follow. These are loaded at the start of every session. You can place them at multiple levels:
  - **Project level**: `./CLAUDE.md` or `./.claude/CLAUDE.md` -- shared with your team via version control
  - **User level**: `~/.claude/CLAUDE.md` -- your personal preferences across all projects
  - **Local level**: `./CLAUDE.local.md` -- your personal project-specific preferences (auto-added to .gitignore)
  - **Modular rules**: `.claude/rules/*.md` -- organized, topic-specific instructions for larger projects

Use `/memory` during a session to open any memory file in your editor for direct editing. Use `/init` to bootstrap a new CLAUDE.md for your project. CLAUDE.md files also support `@path/to/file` imports for referencing other documents.

### What is "context rot" and how can I prevent Claude from losing context in long sessions?

**Context rot** occurs when very long conversations cause Claude to gradually lose track of earlier information, instructions, or decisions. This happens because Claude has a finite context window (200K tokens by default), and as the conversation grows, older content gets less attention or is eventually compacted. To prevent context rot:

- **Start fresh conversations** for genuinely new topics or tasks rather than piling everything into one session
- **Use `/compact`** periodically to compress the conversation context while preserving key information
- **Save important decisions** to your CLAUDE.md or ask Claude to save them to auto memory, rather than relying on conversation history
- **Reference files directly** with `@/path/to/file` instead of relying on Claude remembering what you said earlier about a file
- **Break large projects** into focused sessions: one for planning, one for implementation, one for testing
- **Use subagents** for tasks that produce large amounts of output (like running tests or exploring a codebase), as their verbose results stay in the subagent's context while only a summary returns to your main conversation

### What is "auto-compaction" and how does it affect my conversation?

**Auto-compaction** is a feature that automatically triggers when your conversation approaches approximately 95% of Claude's context window capacity. When it activates, Claude summarizes the older parts of your conversation to free up context space while preserving the most important information. Effects of auto-compaction include:

- Earlier conversation details may be **summarized** rather than preserved verbatim -- specific code snippets, exact instructions, or nuanced discussions from early in the session may lose detail
- The **most recent** exchanges and the **most important** context are prioritized for retention
- Performance remains consistent because the context window does not overflow
- You can adjust the trigger threshold by setting the `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` environment variable (e.g., setting it to `50` triggers compaction at 50% capacity instead of 95%)

To mitigate information loss from compaction: save critical instructions in CLAUDE.md files (which are loaded fresh each session and are not affected by compaction), use auto memory for important project insights, and proactively run `/compact` before the automatic trigger to control what gets summarized.

### Why am I hitting my usage limit so quickly on the Pro/Max plan?

Claude Code can consume usage limits faster than regular Claude chat because of several factors:

- **Large codebases**: When Claude Code reads files, each file's content counts as input tokens. Scanning a large project can consume thousands of tokens before any work begins
- **Long conversations**: Each message in a conversation includes the entire prior history, so token consumption accelerates as conversations grow
- **Subagent usage**: Built-in subagents like Explore and general-purpose agents each run in their own context, consuming additional tokens. Parallel subagents multiply this effect
- **Complex operations**: Detailed code analysis, multi-file refactoring, and extensive test suites all require significant token processing
- **Opus model usage**: The Opus model consumes more of your allocation per message than Sonnet due to higher computational cost

To manage usage: start new sessions for new tasks, use `/compact` proactively, use Sonnet or Haiku for simpler tasks instead of defaulting to Opus, avoid uploading or scanning files unnecessarily, and break large tasks into focused sessions. See the Billing FAQ for more details on usage limits and optimization.

### How do I check my remaining usage or when my limit resets?

Unfortunately, Claude Code does **not** currently provide a built-in way to check your remaining usage or exact reset time for consumer plans (Pro/Max). You will receive a notification when you hit your limit, but there is no progress bar or usage dashboard for consumer plans. The limits operate on a **rolling window** (approximately every 5 hours), not a fixed monthly or daily reset. For **API users**, detailed usage tracking is available at [console.anthropic.com](https://console.anthropic.com) where you can monitor token consumption and costs in real time. If precise usage tracking is important to your workflow, consider using Claude Code with an API key (via the Anthropic Console) instead of a consumer subscription, as the API provides exact token counts per request.

## Advanced Features (Agents & MCPs)

### How do I effectively use subagents with Claude Code?

**Subagents** are specialized AI assistants that handle specific types of tasks within Claude Code. Each runs in its own context window with a custom system prompt and independent permissions. Claude Code includes several built-in subagents:

- **Explore**: A fast, read-only agent using Haiku that searches and analyzes codebases without making changes. Claude automatically delegates exploration tasks to it
- **Plan**: A research agent used during plan mode to gather context before presenting an implementation plan
- **General-purpose**: A capable agent for complex, multi-step tasks that require both reading and modifying code

You can also create **custom subagents** by placing markdown files with YAML frontmatter in `.claude/agents/` (project-level) or `~/.claude/agents/` (user-level), or by using the interactive `/agents` command. Custom subagents let you define specialized system prompts, restrict tool access, choose specific models, and add lifecycle hooks. Best practices: use subagents to isolate high-volume operations (like running test suites) so verbose output stays out of your main conversation, spawn multiple subagents in parallel for independent research tasks, and design each subagent for one specific purpose rather than making it generalist.

### What are MCPs and how do I connect them to Claude Code?

**MCP (Model Context Protocol)** is an open standard for connecting AI tools to external data sources and services. With MCP servers connected, Claude Code can interact with your tools, databases, APIs, and third-party services. To add an MCP server:

- **Remote HTTP server** (recommended for cloud services): `claude mcp add --transport http <name> <url>` (e.g., `claude mcp add --transport http notion https://mcp.notion.com/mcp`)
- **Local stdio server**: `claude mcp add --transport stdio <name> -- <command>` (e.g., `claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "postgresql://..."`)

Popular MCP servers include GitHub, Sentry, Notion, Jira, Slack, PostgreSQL, Figma, and many more. Use `/mcp` within Claude Code to view connected servers and manage authentication. MCP servers can be scoped to **local** (just you, current project), **project** (shared via `.mcp.json` in version control), or **user** (available across all your projects). When Claude Code has many MCP tools configured, it automatically enables **Tool Search** to load tools on-demand instead of preloading all of them.

### How can I get subagents to run in parallel instead of one by one?

Claude Code supports both **foreground** (blocking) and **background** (concurrent) subagents. Claude decides whether to run subagents in the foreground or background based on the task, but you can influence this:

- Ask explicitly: "Run these tasks in parallel" or "Research the authentication, database, and API modules in parallel using separate subagents"
- Press **Ctrl+B** to background a currently running task
- Ask Claude to "run this in the background"

Background subagents run concurrently while you continue working in your main conversation. Before launching, Claude Code prompts for any tool permissions the subagent will need upfront. When background subagents complete, their results return to your main conversation. Keep in mind that running many subagents that each return detailed results can consume significant context. For tasks requiring sustained parallelism or exceeding your context window, consider using **agent teams** (separate from subagents) which give each worker its own independent context. You can disable background tasks entirely by setting `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`.

### How do I connect my own custom MCP server to Claude Code?

To connect a custom MCP server, use the `claude mcp add` command with the appropriate transport type. For a **local stdio server** (runs as a process on your machine):

```bash
claude mcp add --transport stdio my-server -- /path/to/your/server --any-flags
```

For a **remote HTTP server**:

```bash
claude mcp add --transport http my-server https://your-server-url.com/mcp
```

You can pass environment variables with `--env KEY=value`, set authentication headers with `--header "Authorization: Bearer token"`, and choose the scope with `--scope` (local, project, or user). For JSON-based configuration, use `claude mcp add-json my-server '{"type":"stdio","command":"/path/to/server","args":["--config","config.json"]}'`. If you already have MCP servers configured in Claude Desktop, import them with `claude mcp add-from-claude-desktop`. Build custom MCP servers using the [MCP SDK](https://modelcontextprotocol.io/quickstart/server) in Python, TypeScript, or other supported languages.

## Troubleshooting, Bugs, and Performance Issues

### Why has Claude's personality changed? It feels colder/more robotic.

Perceived personality changes in Claude Code can stem from several sources. **Model updates** are the most common cause -- Anthropic regularly releases updated model versions that may adjust tone, verbosity, or response style. The model powering your session depends on your plan and settings, and it can change without explicit notification. **System prompt changes** by Anthropic can also affect how Claude presents itself. **Conversation context** matters too -- if your session is long and has gone through auto-compaction, earlier context about conversational style may have been summarized away. Try starting a **fresh session**, checking which model you are using, and adding style preferences to your CLAUDE.md (e.g., "Be conversational and friendly, use a casual but professional tone"). If the change feels significant and persistent, it may correlate with a recent model update -- check Anthropic's release notes or community channels for confirmation.

### Why does Claude say "You're absolutely right!" all the time, and how can I stop it?

This is **sycophancy** -- a well-documented tendency in language models to agree with users rather than push back or provide critical feedback. Anthropic has actively worked to reduce sycophancy in recent Claude models, and the latest versions are described as the least sycophantic of any frontier model. However, it can still occur, especially when you present an opinion alongside a question. To reduce it:

- Add to your CLAUDE.md: "Never say phrases like 'You're absolutely right' or 'Great question.' Be direct and skip pleasantries. If I'm wrong, tell me."
- Frame questions neutrally: Instead of "I think we should use Redux, right?" ask "What are the pros and cons of using Redux vs. Context API for this use case?"
- Explicitly ask for disagreement: "Play devil's advocate" or "What would a senior engineer criticize about this approach?"
- Use **custom subagents** with system prompts designed for critical code review rather than general assistance

### How do I stop Claude from "lying" or falsely claiming a task is complete?

Claude Code can sometimes report that a task is "done" when it has not actually finished or has only partially completed the work. This typically happens because of context limitations (Claude lost track of what was left), over-optimistic completion signals, or genuine hallucination about the state of the code. To mitigate this:

- **Ask for verification**: "Run the tests to confirm everything passes" or "Show me the diff of all changes you made"
- **Use concrete acceptance criteria**: "The task is done when all tests pass, the linter shows no errors, and the feature works with these specific inputs"
- **Break tasks into small, verifiable steps** rather than one large task that is hard to verify
- **Check the actual file changes** yourself after Claude claims completion -- review diffs before committing
- **Use the `/commit` skill** or ask Claude to commit changes with a descriptive message, which forces it to summarize what was actually done
- Add to your CLAUDE.md: "Never claim a task is complete without verifying. Always run tests or demonstrate the result before reporting completion."

### My Claude Code is running slowly or lagging. How can I fix it?

Performance issues in Claude Code can have several causes:

- **Long conversation context**: The most common cause. As your conversation grows, each new message must process the entire history. Use `/compact` to compress the context or start a fresh session.
- **Large codebase scanning**: If Claude Code is reading many files in your project, this takes time and tokens. Add a `.claudeignore` file (similar to `.gitignore`) to exclude directories like `node_modules`, `dist`, `build`, or large data files.
- **Network latency**: Claude Code communicates with Anthropic's servers for every interaction. Slow or unstable internet connections will cause delays.
- **MCP server issues**: Malfunctioning or slow MCP servers can bottleneck Claude Code. Use `/mcp` to check server status and disconnect problematic ones.
- **Multiple concurrent sessions**: Running several Claude Code instances simultaneously can hit rate limits, causing each session to slow down.
- **High server demand**: During peak usage periods, response times may increase. Max plan subscribers receive priority access.

### Why does Claude execute dangerous commands (like rm -rf) without asking permission?

Claude Code has a **permission system** designed to prevent unauthorized dangerous actions. By default, it should prompt you for confirmation before running destructive commands. If Claude executed a dangerous command without permission, this may have happened because:

- You are running in **`bypassPermissions`** mode or used the `--dangerously-skip-permissions` flag, which disables all permission checks
- You previously approved a broad permission rule (like "allow all Bash commands") that persisted in your settings
- A custom subagent was configured with `permissionMode: bypassPermissions`

To ensure safety: review your permission settings with `/permissions`, never use `--dangerously-skip-permissions` unless you fully understand the risks, be careful about granting broad "always allow" permissions, and use the `acceptEdits` permission mode if you want auto-approval for file edits only while still requiring approval for shell commands. If Claude executes a destructive command unexpectedly, report it as a bug through Anthropic's feedback channels. You can also use **hooks** (PreToolUse) to add custom validation before commands execute.

### Why is my request being blocked for a "Usage Policy violation" for harmless topics?

Claude's safety filters can sometimes produce **false positives**, blocking legitimate requests that contain keywords or patterns associated with harmful use cases. This is more likely when discussing topics like security research, medical information, historical events involving violence, creative writing with mature themes, or technical topics that overlap with restricted areas (like cryptography or network security). To work around false positives:

- **Rephrase your request** with more context about your benign intent: "For my cybersecurity course assignment, explain how SQL injection works so I can write defensive code"
- **Provide professional context**: Mention that you are a researcher, student, or professional working on a specific project
- **Break the request into smaller parts** that are less likely to trigger filters individually
- **Avoid red-flag keywords** that might be associated with harmful intent, even in benign contexts
- If the issue persists and you believe it is a genuine false positive, **report it** through Anthropic's support channels or the feedback button -- this helps improve the filters for everyone

## Still Need Help?

If your Claude Code question isn't answered here:
- **Check the official Claude Code documentation** at [code.claude.com/docs](https://code.claude.com/docs)
- **Browse troubleshooting guides** at [code.claude.com/docs/en/troubleshooting](https://code.claude.com/docs/en/troubleshooting)
- **Search GitHub issues** at [github.com/anthropics/claude-code](https://github.com/anthropics/claude-code) for similar problems and known bugs
- **Join the community** on [Discord](https://www.anthropic.com/discord) for real-time help from other developers
- **Contact support** at [support.claude.com](https://support.claude.com) for account-specific issues
