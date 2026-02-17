import type { FAQEntry } from "./types";

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

export function generateSlug(question: string): string {
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
  return words.slice(0, 4).join("-") || "untitled";
}

function extractTags(question: string, subcategory: string, answer: string): string[] {
  // Pull meaningful keywords from question, subcategory, and first ~500 chars of answer
  const source = `${question} ${subcategory} ${answer.slice(0, 500)}`.toLowerCase();
  const words = source
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  // Frequency-based: words that appear more are more relevant
  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  // Sort by frequency, deduplicate
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

interface ParsedAnswer {
  text: string;
  hasContent: boolean;
}

function parseAnswer(raw: string): ParsedAnswer {
  const trimmed = raw.trim();

  if (!trimmed || trimmed === "</>") {
    return { text: "", hasContent: false };
  }

  // Strip [temp answer] prefixes
  const cleaned = trimmed
    .replace(/^\*\*\[temp answer\]\*\*\s*/i, "")
    .replace(/^\[temp answer\]\s*/i, "")
    .trim();

  return { text: cleaned, hasContent: cleaned.length > 0 };
}

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

    // Skip entries with no answer content
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
