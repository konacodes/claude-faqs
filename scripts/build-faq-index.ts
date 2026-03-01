/**
 * Parses FAQ markdown files and generates faq-index.json
 *
 * Usage: bun scripts/build-faq-index.ts [path-to-faq-content]
 */

import { parseMarkdownFile, assignSlugs, slugifyLabel } from "../src/parser";
import type { FAQData, FAQCategoryMeta, FAQSubcategoryMeta } from "../src/types";
import { resolve } from "path";
import { readdir } from "fs/promises";

const SCRIPT_DIR = import.meta.dir;
const PROJECT_ROOT = resolve(SCRIPT_DIR, "..");
const FAQ_DIR = process.argv[2] || resolve(PROJECT_ROOT, "faq-content");
const OUTPUT = resolve(PROJECT_ROOT, "faq-index.json");

function pacificDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function build() {
  console.log(`Reading FAQ files from: ${FAQ_DIR}`);
  const faqFiles = (await readdir(FAQ_DIR))
    .filter(filename => filename.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));

  if (faqFiles.length === 0) {
    console.error("\n✗ No markdown files found in faq-content.");
    process.exit(1);
  }

  const allEntries: ReturnType<typeof parseMarkdownFile> = [];

  for (const filename of faqFiles) {
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

  const hqVerifiedDate = pacificDateString();
  const usedCategorySlugs = new Set<string>();
  const categorySlugByName = new Map<string, string>();
  const subcategorySlugByCategory = new Map<string, Map<string, string>>();

  function uniqueSlug(base: string, used: Set<string>): string {
    let slug = base;
    let i = 2;
    while (used.has(slug)) {
      slug = `${base}-${i}`;
      i++;
    }
    used.add(slug);
    return slug;
  }

  for (const entry of allEntries) {
    let categorySlug = categorySlugByName.get(entry.category);
    if (!categorySlug) {
      categorySlug = uniqueSlug(slugifyLabel(entry.category), usedCategorySlugs);
      categorySlugByName.set(entry.category, categorySlug);
    }

    let subMap = subcategorySlugByCategory.get(categorySlug);
    if (!subMap) {
      subMap = new Map<string, string>();
      subcategorySlugByCategory.set(categorySlug, subMap);
    }
    let subSlug = subMap.get(entry.subcategory);
    if (!subSlug) {
      subSlug = uniqueSlug(slugifyLabel(entry.subcategory), new Set(subMap.values()));
      subMap.set(entry.subcategory, subSlug);
    }

    entry.category_slug = categorySlug;
    entry.subcategory_slug = subSlug;
  }

  for (const entry of allEntries) {
    if (!entry.last_verified_at || entry.last_verified_at.toLowerCase() === "auto") {
      entry.last_verified_at = hqVerifiedDate;
    }
    if (!entry.source_urls) {
      entry.source_urls = [];
    }
  }

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

  const categorySlugs: Record<string, string> = {};
  for (const [name, slug] of categorySlugByName.entries()) {
    categorySlugs[slug] = name;
  }

  const categoryIndex: FAQCategoryMeta[] = [];
  for (const categoryName of categories) {
    const entriesInCategory = allEntries.filter(e => e.category === categoryName);
    const categorySlug = entriesInCategory[0]?.category_slug || slugifyLabel(categoryName);

    const subMetaMap = new Map<string, FAQSubcategoryMeta>();
    for (const entry of entriesInCategory) {
      const key = `${entry.subcategory_slug}::${entry.subcategory}`;
      const current = subMetaMap.get(key);
      if (current) {
        current.entry_count += 1;
      } else {
        subMetaMap.set(key, {
          name: entry.subcategory,
          slug: entry.subcategory_slug,
          entry_count: 1,
        });
      }
    }

    categoryIndex.push({
      name: categoryName,
      slug: categorySlug,
      entry_count: entriesInCategory.length,
      subcategories: [...subMetaMap.values()],
    });
  }

  const indexData: FAQData = {
    version: "1.0.0",
    generated_at: new Date().toISOString(),
    entry_count: allEntries.length,
    entries: allEntries,
    slugs,
    categories,
    category_index: categoryIndex,
    category_slugs: categorySlugs,
  };

  await Bun.write(OUTPUT, JSON.stringify(indexData, null, 2));
  console.log(`\n✓ Generated ${OUTPUT}`);
  console.log(`  ${allEntries.length} entries across ${categories.length} categories`);
  console.log(`  Source files: ${faqFiles.length}`);
  console.log(`  Default last_verified_at (HQ PT): ${hqVerifiedDate}`);

  console.log("\nSlug table:");
  for (const entry of allEntries) {
    console.log(`  ${entry.slug} → [${entry.tags.slice(0, 5).join(", ")}]`);
  }
}

build().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});
