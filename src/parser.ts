import type { FAQEntry } from "./types";

// Common English words filtered out during slug generation and tag extraction.
// These add noise without helping match user queries to FAQ entries.
const STOP_WORDS = new Set([
  "my", "i", "im", "ive", "me", "the", "a", "an", "is", "are", "was", "were",
  "do", "does", "did", "can", "could", "would", "should", "will", "what", "why",
  "how", "when", "where", "which", "who", "whom", "that", "this", "it", "its",
  "am", "be", "been", "being", "have", "has", "had", "having", "so", "to", "of",
  "in", "for", "on", "with", "at", "dont", "cant", "wont", "isnt", "arent",
  "wasnt", "werent", "doesnt", "didnt", "and", "or", "but", "not", "no", "yes",
  "if", "then", "than", "from", "by", "about", "up", "out", "get", "got",
  "your", "you", "youre", "there", "their", "they", "them", "some", "all",
  "any", "each", "every", "more", "most", "other", "into", "also", "just",
  "like", "such", "these", "those", "may", "might", "here", "very", "too",
  "still", "even", "well", "only", "own", "same", "while", "during", "before",
  "after", "between", "through", "use", "using", "used", "make", "made",
]);

// Generates a URL-friendly slug from a question string.
// Strips stop words, takes the first 4 meaningful words, joins with hyphens.
// Example: "My account was banned! What can I do?" -> "account-banned"
export function generateSlug(question: string): string {
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
  return words.slice(0, 4).join("-") || "untitled";
}

// Extracts keyword tags from the question, subcategory, and answer text.
// Uses frequency analysis: words that appear more often across these fields
// are considered more relevant as search tags.
// Returns up to 15 tags sorted by frequency (most common first).
function extractTags(question: string, subcategory: string, answer: string): string[] {
  const source = `${question} ${subcategory} ${answer.slice(0, 500)}`.toLowerCase();
  const words = source
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

interface ParsedAnswer {
  text: string;
  hasContent: boolean;
}

// Cleans raw answer text. Filters out stub entries (empty or "</>") and
// strips [temp answer] prefixes used during content drafting.
function parseAnswer(raw: string): ParsedAnswer {
  const trimmed = raw.trim();

  if (!trimmed || trimmed === "</>") {
    return { text: "", hasContent: false };
  }

  const cleaned = trimmed
    .replace(/^\*\*\[temp answer\]\*\*\s*/i, "")
    .replace(/^\[temp answer\]\s*/i, "")
    .trim();

  return { text: cleaned, hasContent: cleaned.length > 0 };
}

// Parses a FAQ markdown file into structured FAQ entries.
//
// Expected markdown structure:
//   # Category Name            -> sets category
//   ## Subcategory Name        -> sets subcategory (or question in general-faq.md)
//   ### Question text?         -> starts a new entry
//   Answer content...          -> collected until next heading
//
// Special handling:
// - general-faq.md uses H2 headings as questions (no H3 subcategories)
// - "Still Need Help?" sections are ignored (breaks parse loop)
// - Entries with no answer content (stubs) are filtered out
// - Slug and tags are assigned later by assignSlugs()
export function parseMarkdownFile(content: string, filename: string): FAQEntry[] {
  const lines = content.split("\n");
  const entries: FAQEntry[] = [];

  let category = "";
  let subcategory = "";
  let currentQuestion = "";
  let currentAnswerLines: string[] = [];
  const isGeneralFaq = filename === "general-faq.md";

  function flushEntry() {
    if (!currentQuestion) return;

    const rawAnswer = currentAnswerLines.join("\n").trim();
    const { text, hasContent } = parseAnswer(rawAnswer);

    if (!hasContent) return;

    const sub = isGeneralFaq ? category : subcategory;

    entries.push({
      slug: "",
      tags: extractTags(currentQuestion, sub, text),
      category,
      subcategory: sub,
      question: currentQuestion,
      answer: text,
      source_file: filename,
    });

    currentQuestion = "";
    currentAnswerLines = [];
  }

  for (const line of lines) {
    const h1Match = line.match(/^# (.+)$/);
    if (h1Match) {
      flushEntry();
      category = h1Match[1].trim();
      continue;
    }

    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      const heading = h2Match[1].trim();
      if (heading.toLowerCase().startsWith("still need help")) {
        flushEntry();
        break;
      }
      if (isGeneralFaq) {
        flushEntry();
        currentQuestion = heading;
      } else {
        flushEntry();
        subcategory = heading;
      }
      continue;
    }

    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      flushEntry();
      currentQuestion = h3Match[1].trim();
      continue;
    }

    if (currentQuestion) {
      currentAnswerLines.push(line);
    }
  }

  flushEntry();
  return entries;
}

// Assigns unique slugs to all entries after parsing.
// If two entries generate the same slug (e.g. similar questions across files),
// the source filename is appended to disambiguate.
// If duplicates still exist after that, a numeric suffix is added.
export function assignSlugs(entries: FAQEntry[]): void {
  const slugCounts = new Map<string, number>();
  const baseSlugs = entries.map(e => generateSlug(e.question));

  for (const slug of baseSlugs) {
    slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
  }

  const usedSlugs = new Map<string, number>();
  for (let i = 0; i < entries.length; i++) {
    const base = baseSlugs[i];
    let finalSlug: string;

    if (slugCounts.get(base)! > 1) {
      const stem = entries[i].source_file.replace(/\.md$/, "");
      finalSlug = `${base}-${stem}`;
    } else {
      finalSlug = base;
    }

    const count = usedSlugs.get(finalSlug) || 0;
    if (count > 0) {
      finalSlug = `${finalSlug}-${count + 1}`;
    }
    usedSlugs.set(finalSlug, count + 1);

    entries[i].slug = finalSlug;
  }
}
