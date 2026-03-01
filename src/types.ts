// A single FAQ entry as stored in faq-index.json and returned by the API.
// The `answer` field may contain markdown formatting (bold, links, lists).
// The `tags` field contains up to 15 keywords extracted by frequency analysis
// from the question, subcategory, and first 500 chars of the answer.
export interface FAQEntry {
  slug: string;
  tags: string[];
  category: string;
  subcategory: string;
  question: string;
  answer: string;
  answered_by?: string;
  source_file: string;
}

// The full FAQ dataset loaded from faq-index.json at startup.
// `slugs` is a lookup map: slug -> index into the `entries` array.
export interface FAQData {
  version: string;
  generated_at: string;
  entry_count: number;
  entries: FAQEntry[];
  slugs: Record<string, number>;
  categories: string[];
}

// Discord embed format — matches Discord's embed object structure.
// Returned when ?format=discord is passed to slug lookup or search.
// Can be passed directly to discord.py's Embed.from_dict() or discord.js embeds.
// Color 0x7855FA (7886330 decimal) is our brand purple.
export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: Array<{ name: string; value: string; inline: boolean }>;
  footer: { text: string };
}

// Cloudflare Worker environment bindings.
export interface Env {
  RATE_LIMITS: KVNamespace;     // Sliding window rate limit counters
  FAQ_API_KEYS: KVNamespace;    // API key -> { name, tier } mapping
  FAQ_EMBEDDINGS: KVNamespace;  // Cached embedding vectors for semantic search
  AI: Ai;                       // Cloudflare Workers AI binding
}

// Stored in FAQ_API_KEYS KV. The key is the API key string itself.
// tier determines rate limits: standard (30/min, 1k/day) or premium (100/min, 10k/day).
export interface ApiKeyData {
  name: string;
  tier: "standard" | "premium";
}

// Stored in RATE_LIMITS KV. Two entries per key: one for minute window, one for day window.
// resetAt is a Unix timestamp (ms) — when the window expires and count resets to 0.
export interface RateLimitData {
  count: number;
  resetAt: number;
}
