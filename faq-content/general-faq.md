# General Questions About Claude

## Understanding Claude's Behavior

### Why does Claude ignore my instructions?

Claude is designed to follow clear instructions, but there are several reasons it may appear to ignore what you ask. First, Claude has **safety guidelines** and an Acceptable Use Policy that take precedence over user instructions -- if your request conflicts with these guardrails, Claude will decline or modify its response rather than comply. Second, if your prompt contains contradictory or ambiguous instructions, Claude may prioritize one part over another based on its interpretation. Third, very long or complex system prompts can cause Claude to lose track of specific instructions buried within them, especially if they conflict with other directives. To get Claude to follow your instructions more reliably, be explicit and specific about what you want, place the most important instructions prominently (at the beginning or end of your prompt), use structured formatting like numbered lists or XML tags to separate instructions, and test iteratively to see how Claude interprets your phrasing.

### Why does Claude "lie" or make things up (hallucinate)?

Claude does not intentionally lie, but it can generate information that sounds confident yet is factually incorrect -- a phenomenon known as **hallucination**. This happens because Claude is a language model that predicts the most likely next tokens based on patterns in its training data, not a database that retrieves verified facts. Claude may hallucinate when it lacks sufficient training data on a topic, when it attempts to fill gaps in its knowledge with plausible-sounding details, when it misinterprets your question and answers something slightly different, or when asked about events after its **knowledge cutoff date**. What looks like lying is often Claude constructing a plausible answer rather than admitting uncertainty. To reduce hallucinations: explicitly give Claude permission to say "I don't know," ask it to cite direct quotes from provided documents, request step-by-step reasoning so you can spot faulty logic, verify critical claims independently, and use grounding techniques like providing reference documents for Claude to draw from rather than relying on its general knowledge.

### What is Claude's "personality" and why does it sometimes change?

Claude is designed to be helpful, harmless, and honest -- these are the core values from Anthropic's **Constitutional AI** approach. Claude aims to be thoughtful, nuanced, and direct without being overly agreeable or sycophantic. However, Claude's personality can appear to shift between conversations or after model updates. Anthropic periodically releases updated model versions that may adjust tone, verbosity, or how Claude handles certain types of requests. The persona you experience also depends on the **system prompt** being used -- different applications may configure Claude with different instructions about tone and style. Within a single conversation, Claude adapts to context, so a technical coding discussion will feel different from a casual brainstorming session. If Claude feels noticeably different, it may be due to a recent model update, different system prompt settings, or simply different conversational context.

### How do system prompts work, and can I customize how Claude responds?

A **system prompt** is a set of instructions provided to Claude before your conversation begins that shapes how it behaves, responds, and what persona it adopts. On the Claude web app, Anthropic sets a default system prompt, but developers using the API have full control over the system prompt. You cannot directly edit the system prompt on claude.ai, but you can influence Claude's behavior by providing clear instructions in your messages, such as "Respond in a formal academic tone" or "Keep all answers under 3 sentences." On the API, system prompts support detailed customization including persona definition, response formatting rules, domain-specific knowledge boundaries, and conversation guidelines. If you use Claude through third-party applications, those applications may use custom system prompts that change Claude's default behavior. The **Projects** feature on claude.ai allows Pro and higher-tier users to set custom instructions that function similarly to a system prompt for all conversations within that project.

### What are the best tips for getting good responses from Claude?

The quality of Claude's output is heavily influenced by the quality of your input. Here are key strategies for better results:

- **Be specific and explicit**: Instead of "help me with my code," say "Review this Python function for edge cases and suggest error handling improvements"
- **Provide context**: Share relevant background information, constraints, and goals
- **Use structured prompts**: Numbered steps, XML tags, and clear sections help Claude parse complex requests
- **Set the output format**: Tell Claude exactly how you want the response (bullet points, code blocks, tables, specific length)
- **Iterate**: If the first response is not quite right, provide feedback and refine -- Claude improves with guidance
- **Use examples**: Show Claude one or two examples of what you want, and it will follow the pattern
- **Break complex tasks into steps**: Rather than one massive request, chain smaller focused prompts together
- **Place important instructions at the beginning or end of your prompt**, as information in the middle of very long prompts can get less attention

## Claude's Capabilities

### What can Claude do?

Claude is a versatile AI assistant with a broad range of capabilities. Claude can **analyze and generate text** across many domains including writing, coding, math, research, and creative work. It can **process images** (photos, screenshots, diagrams, documents) and answer questions about their content. It can **analyze uploaded documents** including PDFs, spreadsheets, and code files. Claude supports **extended thinking** for complex reasoning tasks, can **search the web** for current information (on supported plans), and can work with **200K tokens of context** (approximately 150,000 words) in a single conversation, with up to **1M tokens** available in beta for certain models. Claude excels at **coding** across many programming languages, **creative writing**, **summarization**, **translation**, **data analysis**, and **step-by-step problem solving**. Through Claude Code, it can directly read codebases, edit files, run commands, and create pull requests.

### What can't Claude do?

Despite its broad capabilities, Claude has several important limitations. Claude **cannot generate, create, or edit images** -- it can only analyze images provided to it. Claude **cannot access the internet in real time** on all plans (web search availability depends on your plan and the specific model). Claude **cannot remember information between separate conversations** unless you use features like Projects or CLAUDE.md files in Claude Code. Claude **cannot execute code on its own** outside of Claude Code (it can write code but not run it in the standard chat interface). Claude has a **knowledge cutoff date** (which varies by model -- for example, Claude Opus 4.6 has a reliable knowledge cutoff of May 2025 and training data through August 2025), so it may not know about very recent events. Claude **cannot make phone calls, send emails, or take actions in the real world** unless connected to tools through MCP integrations or API tool use. Claude also **cannot process audio or video files** directly.

### What is Claude's knowledge cutoff date?

Claude's knowledge cutoff depends on the specific model version you are using. For the latest models: **Claude Opus 4.6** has a reliable knowledge cutoff of **May 2025** (with training data through August 2025), **Claude Sonnet 4.5** has a reliable knowledge cutoff of **January 2025** (training data through July 2025), and **Claude Haiku 4.5** has a reliable knowledge cutoff of **February 2025** (training data through July 2025). The "reliable knowledge cutoff" means that information through that date is the most extensive and dependable, while the "training data cutoff" indicates the broader range of data used in training. For events or information after these dates, Claude may not have accurate knowledge. On supported plans, Claude can use **web search** to find current information beyond its training data, but it will typically indicate when it is drawing from search results versus its built-in knowledge.

### How does Claude differ from ChatGPT and Gemini?

Each AI assistant has distinct strengths and design philosophies. **Claude** (by Anthropic) emphasizes safety, nuanced reasoning, and long-document analysis. It excels at complex coding tasks (leading on benchmarks like SWE-bench), thoughtful writing with a natural tone, extended context processing (200K-1M tokens), and has strong ethical guardrails as part of Anthropic's safety-focused mission. Claude tends to be more conservative -- it will refuse uncertain queries rather than confidently hallucinate. **ChatGPT** (by OpenAI) has the largest user base, a broad plugin/integration ecosystem, strong voice mode, image generation via DALL-E/GPT-4o, and broad general knowledge. It tends to attempt answers more frequently but can sometimes be confidently incorrect. **Gemini** (by Google) offers deep Google Workspace integration, the fastest response times, a massive 1M token context window natively, strong multimodal capabilities (especially audio and video), and the best integration with Google's product ecosystem. In general, choose Claude for precision writing and complex coding, ChatGPT for general-purpose versatility and creative tasks with the broadest ecosystem, and Gemini for Google-integrated workflows and multimodal processing.

## Limitations and Safety

### Why does Claude refuse certain requests?

Claude's refusal behavior stems from Anthropic's **Constitutional AI** training approach and Acceptable Use Policy. Claude is designed to decline requests that could lead to harm, including generating dangerous instructions (weapons, drugs, self-harm), producing content that exploits minors, assisting with fraud or deception, creating malware or cyberattack tools, and generating content that violates privacy or enables harassment. Claude may also refuse requests that seem harmless if they contain keywords or patterns that trigger safety filters -- this is sometimes called a "false positive." If your legitimate request is being refused, try rephrasing it to clarify your benign intent, provide context about why you need the information (e.g., "I'm writing a novel" or "This is for academic research"), and avoid language patterns that might be associated with harmful use cases. Anthropic continuously refines these filters to reduce over-refusal while maintaining safety. Claude's latest models are calibrated to refuse less on benign topics while maintaining strong guardrails where they matter most.

### Does Claude have biases?

Like all AI systems trained on human-generated data, Claude can exhibit biases present in its training data. Anthropic actively works to reduce harmful biases through its Constitutional AI approach, reinforcement learning from human feedback (RLHF), and ongoing evaluation. Claude may still show subtle biases in areas like cultural assumptions, gender stereotypes, or Western-centric perspectives. Anthropic publishes model cards and safety evaluations that document known limitations and bias assessments. If you notice biased behavior in Claude's responses, you can point it out directly in the conversation (Claude will often acknowledge and correct it), report it through Anthropic's feedback mechanisms, and use specific prompts to request multiple perspectives on a topic. Anthropic's approach is to make Claude transparent about uncertainty and limitations rather than hiding them.

### What is Anthropic's approach to AI safety?

Anthropic was founded specifically to advance **AI safety research** and describes itself as a safety-focused AI company. Their core methodology is **Constitutional AI (CAI)**, which trains Claude using a set of principles (a "constitution") rather than relying solely on human preference ratings. In January 2026, Anthropic released an updated 80-page constitution that shifted from rule-based to reason-based alignment, teaching models the underlying ethical reasoning behind guidelines rather than just a list of rules. Anthropic also conducts extensive red-teaming and publishes **Responsible Scaling Policies** that define safety evaluations required before deploying more capable models. They participate in joint safety evaluations with other labs (including a collaborative test with OpenAI) and publish research through their **Transparency Hub**. Anthropic's safety work includes evaluating models for deception, scheming, and harmful capabilities before release, and they commit to not deploying models that exceed defined risk thresholds.

### Why does Claude sometimes give different answers to the same question?

Claude's responses are generated with a degree of **randomness** (controlled by a parameter called "temperature"), which means asking the same question twice may produce different but equally valid responses. This is by design -- it allows Claude to be creative and avoid repetitive outputs. Additionally, conversation context matters: the same question asked at the beginning of a conversation versus after a long discussion will have different surrounding context that influences the response. Model updates also play a role -- Anthropic regularly improves Claude's models, so behavior can change subtly over time. On the API, developers can adjust the temperature parameter (lower values produce more consistent outputs, higher values produce more varied ones). If you need consistent, reproducible answers, provide very specific instructions, keep the conversation context minimal, and consider using the API with a low temperature setting.

## Still Need Help?

If your question isn't answered here:
- **Visit Anthropic's documentation** at [docs.anthropic.com](https://docs.anthropic.com) for technical details
- **Check the Help Center** at [support.claude.com](https://support.claude.com) for official support articles
- **Join the community** on [Discord](https://www.anthropic.com/discord) or [Reddit](https://www.reddit.com/r/ClaudeAI/) for discussions and tips
- **Read Anthropic's blog** at [anthropic.com/news](https://www.anthropic.com/news) for the latest announcements and research
