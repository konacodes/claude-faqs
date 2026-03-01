# Contributing

We welcome all kinds of contributions to make this FAQ more helpful for the Claude community.

## What You Can Do

- **Suggest new FAQ questions** based on common Discord/Reddit questions you see
- **Improve existing answers** to make them clearer or more complete
- **Fix errors or typos** you spot while browsing
- **Update outdated information** when policies or features change
- **Add examples** to help explain complex topics
- **Reorganize content** for better navigation

## Pull Request Workflow

1. Fork the repository to your own GitHub account
2. Clone your fork and create a feature branch (`faq/<topic>`)
3. Make your FAQ edits in `faq-content/*.md`
4. Run `bun run check:faq`
5. Run `bun scripts/build-faq-index.ts` to regenerate `faq-index.json`
6. Commit your changes and push your branch
7. Open a pull request to this repository
8. In the PR description, include what changed, why it changed, and any official sources used

## PR Checklist

- `bun run check:faq` passes
- `faq-index.json` is rebuilt and committed with your content changes
- Answer text is clear and actionable
- Links point to official docs/support pages where possible
- Optional per-answer credit is set when desired (`Answered by: YourName`)
- Time-sensitive answers include at least one official source link

## Need Help Contributing?

- Open an issue on this repository
- Use the GitHub issue form **Suggest FAQ** for non-code submissions
- Ask in community channels if you are unsure about GitHub flow
- Share feedback in Reddit/Discord communities

## FAQ Content Guidelines

- Keep answers **clear and jargon-free**
- Focus on **practical, actionable information**
- Include **examples** when they help clarify the answer
- **Cross-reference** related questions when relevant
- Maintain a **friendly, helpful tone**

## FAQ File Structure

FAQ entries live in `faq-content/` as markdown files. New `.md` files in that folder are automatically included when you run the build script.
Category and subcategory slugs are generated automatically from markdown headings during build.

Supported structures:

### Structure A (recommended for grouped topics)

```markdown
# Category Name

## Subcategory Name

### Question goes here?

Answered by: YourName
Sources: https://docs.anthropic.com/...

Answer content goes here. Supports **markdown formatting**,
links, lists, and code blocks.
```

### Structure B (simple flat file)

```markdown
# Category Name

## Question goes here?

Answer content goes here.
```

After editing, run:

```bash
bun run check:faq
bun scripts/build-faq-index.ts
```

## Recognition

All contributors are recognized on our [Wall of Fame](#wall-of-fame). Make your first contribution and we'll add you!

You can also add per-question credits in FAQ content with an optional first line:

```markdown
Answered by: YourName
```

You can add source metadata with:

```markdown
Sources: https://docs.anthropic.com/..., https://support.claude.com/...
```

`last_verified_at` is automatically set during index build using Anthropic HQ timezone (`America/Los_Angeles`).

---

## Wall of Fame

A huge thank you to the people who build and maintain this project. This resource exists because of their dedication to making the Claude community more helpful and welcoming.

### Maintainers

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/konacodes">
        <img src="https://github.com/konacodes.png" width="100" height="100" style="border-radius: 50%;" alt="konacodes"><br>
        <strong>konacodes</strong>
      </a><br>
      <sub>Project Lead</sub>
    </td>
  </tr>
</table>

### Contributors

*Your name here!* Open a PR or issue and join the Wall of Fame.

---

*Want to be listed? Make your first contribution and we'll add you.*
