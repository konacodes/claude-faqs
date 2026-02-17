# Contributing

We welcome all kinds of contributions to make this FAQ more helpful for the Claude community.

## What You Can Do

- **Suggest new FAQ questions** based on common Discord/Reddit questions you see
- **Improve existing answers** to make them clearer or more complete
- **Fix errors or typos** you spot while browsing
- **Update outdated information** when policies or features change
- **Add examples** to help explain complex topics
- **Reorganize content** for better navigation

## How to Contribute

1. **Open an issue** on this repository to discuss your suggestion
2. **Submit a pull request** with your changes
3. **Message the community team on Discord** if you're not sure about GitHub
4. **Share feedback** in our Reddit community

## FAQ Content Guidelines

- Keep answers **clear and jargon-free**
- Focus on **practical, actionable information**
- Include **examples** when they help clarify the answer
- **Cross-reference** related questions when relevant
- Maintain a **friendly, helpful tone**

## FAQ File Structure

FAQ entries live in `faq-content/` as markdown files. The parser expects this structure:

```markdown
# Category Name

## Subcategory Name

### Question goes here?

Answer content goes here. Supports **markdown formatting**,
links, lists, and code blocks.
```

After editing, rebuild the index:

```bash
bun scripts/build-faq-index.ts
```

## Recognition

All contributors are recognized on our [Wall of Fame](#wall-of-fame). Make your first contribution and we'll add you!

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
