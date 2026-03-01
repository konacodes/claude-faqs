import type { FAQEntry } from "./types";

// Tag-based keyword search (fast, no AI required).
// Strips punctuation and splits the query into individual terms, then scores
// each FAQ entry by how many terms match across different fields:
//   - slug contains term:          +5  (strongest signal — slug is the entry's identity)
//   - exact tag match:             +3  (tags are the Jeopardy-style clues)
//   - partial tag match:           +1.5
//   - question text contains term: +2
//   - subcategory contains term:   +1
// Results are sorted by score descending. Only entries with score > 0 are returned.
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
      if (entry.slug.includes(term)) score += 5;
      for (const tag of entry.tags) {
        if (tag === term) score += 3;
        else if (tag.includes(term)) score += 1.5;
      }
      if (entry.question.toLowerCase().includes(term)) score += 2;
      if (entry.subcategory.toLowerCase().includes(term)) score += 1;
      if (entry.category_slug.includes(term)) score += 1.5;
      if (entry.subcategory_slug.includes(term)) score += 1.5;
    }

    return { entry, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);
}

// Cosine similarity between two vectors.
// Returns a value between -1 and 1, where 1 means identical direction.
// Used to compare embedding vectors from EmbeddingGemma-300M.
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Semantic search using pre-computed embedding vectors.
// Compares the query's embedding against all entry embeddings via cosine similarity.
// Returns the top N matches with their similarity scores.
// Unlike tagSearch, this understands meaning — "why was I charged" will match
// billing entries even without exact keyword overlap.
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
