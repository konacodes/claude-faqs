/**
 * Parses FAQ markdown files and generates faq-index.json
 *
 * Usage: bun scripts/build-faq-index.ts [path-to-faq-content]
 */

import { parseMarkdownFile, assignSlugs } from "../src/parser";
import type { FAQData } from "../src/types";
import { resolve } from "path";

const SCRIPT_DIR = import.meta.dir;
const PROJECT_ROOT = resolve(SCRIPT_DIR, "..");
const FAQ_DIR = process.argv[2] || resolve(PROJECT_ROOT, "faq-content");
const OUTPUT = resolve(PROJECT_ROOT, "faq-index.json");

const FAQ_FILES = [
  "account-issues-faqs.md",
  "general-faq.md",
  "billing-faq.md",
  "claude-code-faq.md",
  "claude-usage.md",
];

async function build() {
  console.log(`Reading FAQ files from: ${FAQ_DIR}`);

  const allEntries: ReturnType<typeof parseMarkdownFile> = [];

  for (const filename of FAQ_FILES) {
    const filepath = resolve(FAQ_DIR, filename);
    const file = Bun.file(filepath);

    if (!(await file.exists())) {
      console.warn(`  ⚠ Skipping ${filename} (not found)`);
      continue;
    }

    const content = await file.text();
    const entries = parseMarkdownFile(content, filename);
    console.log(`  ✓ ${filename}: ${entries.length} entries`);
    allEntries.push(...entries);
  }

  if (allEntries.length === 0) {
    console.error("\n✗ No entries found. Make sure faq-content/ has markdown files.");
    process.exit(1);
  }

  assignSlugs(allEntries);

  const slugs: Record<string, number> = {};
  for (let i = 0; i < allEntries.length; i++) {
    slugs[allEntries[i].slug] = i;
  }

  const categories: string[] = [];
  const seenCats = new Set<string>();
  for (const entry of allEntries) {
    if (!seenCats.has(entry.category)) {
      seenCats.add(entry.category);
      categories.push(entry.category);
    }
  }

  const indexData: FAQData = {
    version: "1.0.0",
    generated_at: new Date().toISOString(),
    entry_count: allEntries.length,
    entries: allEntries,
    slugs,
    categories,
  };

  await Bun.write(OUTPUT, JSON.stringify(indexData, null, 2));
  console.log(`\n✓ Generated ${OUTPUT}`);
  console.log(`  ${allEntries.length} entries across ${categories.length} categories`);

  console.log("\nSlug table:");
  for (const entry of allEntries) {
    console.log(`  ${entry.slug} → [${entry.tags.slice(0, 5).join(", ")}]`);
  }
}

build().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});
