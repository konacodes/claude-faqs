import type { FAQEntry } from "./types";

// Tag-based keyword matching (fast, no AI)
export function tagSearch(entries: FAQEntry[], query: string, limit = 5): FAQEntry[] {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (terms.length === 0) return [];

  const scored = entries.map(entry => {
    let score = 0;

    for (const term of terms) {
      // Exact slug match is highest signal
      if (entry.slug.includes(term)) score += 5;
      // Tag match (the Jeopardy clues)
      for (const tag of entry.tags) {
        if (tag === term) score += 3;
        else if (tag.includes(term)) score += 1.5;
      }
      // Question text match
      if (entry.question.toLowerCase().includes(term)) score += 2;
      // Category/subcategory match
      if (entry.subcategory.toLowerCase().includes(term)) score += 1;
    }

    return { entry, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);
}

// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Semantic search using pre-computed embeddings
export function embeddingSearch(
  queryEmbedding: number[],
  entryEmbeddings: number[][],
  entries: FAQEntry[],
  limit = 5
): Array<{ entry: FAQEntry; score: number }> {
  const scored = entries.map((entry, i) => ({
    entry,
    score: cosineSimilarity(queryEmbedding, entryEmbeddings[i]),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
