export interface FAQEntry {
  slug: string;
  tags: string[];
  category: string;
  subcategory: string;
  question: string;
  answer: string;
  source_file: string;
}

export interface FAQData {
  version: string;
  generated_at: string;
  entry_count: number;
  entries: FAQEntry[];
  slugs: Record<string, number>;
  categories: string[];
}

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: Array<{ name: string; value: string; inline: boolean }>;
  footer: { text: string };
}

export interface Env {
  RATE_LIMITS: KVNamespace;
  FAQ_API_KEYS: KVNamespace;
  FAQ_EMBEDDINGS: KVNamespace;
  AI: Ai;
}

export interface ApiKeyData {
  name: string;
  tier: "standard" | "premium";
}

export interface RateLimitData {
  count: number;
  resetAt: number;
}
