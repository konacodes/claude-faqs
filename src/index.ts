import type { Env, FAQEntry, DiscordEmbed, RateLimitData, ApiKeyData } from "./types";
import { FAQ_DATA } from "./data";
import { tagSearch, embeddingSearch } from "./search";

const DISCORD_COLOR = 0x7855FA;
const EMBEDDING_CACHE_KEY = "faq:embeddings:v1";

function toDiscordEmbed(entry: FAQEntry): DiscordEmbed {
  const description = entry.answer.length > 4096
    ? entry.answer.slice(0, 4093) + "..."
    : entry.answer;

  return {
    title: entry.question,
    description,
    color: DISCORD_COLOR,
    fields: [
      {
        name: "Category",
        value: entry.subcategory !== entry.category
          ? `${entry.category} > ${entry.subcategory}`
          : entry.category,
        inline: true,
      },
      {
        name: "Tags",
        value: entry.tags.slice(0, 5).join(", "),
        inline: true,
      },
    ],
    footer: { text: "Claude Community FAQ | api.kcodes.me" },
  };
}

function json(data: object, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function cors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, { status: response.status, headers });
}

async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limits: { perMinute: number; perDay: number }
): Promise<{ allowed: boolean; retryAfter?: number; remaining?: { minute: number; day: number } }> {
  const now = Date.now();
  const minuteKey = `rl:faq:min:${key}`;
  const dayKey = `rl:faq:day:${key}`;

  const minuteData = await kv.get<RateLimitData>(minuteKey, "json");
  let minuteCount = 0;
  if (minuteData && minuteData.resetAt > now) {
    minuteCount = minuteData.count;
    if (minuteCount >= limits.perMinute) {
      return { allowed: false, retryAfter: Math.ceil((minuteData.resetAt - now) / 1000) };
    }
  }

  const dayData = await kv.get<RateLimitData>(dayKey, "json");
  let dayCount = 0;
  if (dayData && dayData.resetAt > now) {
    dayCount = dayData.count;
    if (dayCount >= limits.perDay) {
      return { allowed: false, retryAfter: Math.ceil((dayData.resetAt - now) / 1000) };
    }
  }

  const newMinute: RateLimitData = {
    count: minuteCount + 1,
    resetAt: minuteData && minuteData.resetAt > now ? minuteData.resetAt : now + 60_000,
  };
  const newDay: RateLimitData = {
    count: dayCount + 1,
    resetAt: dayData && dayData.resetAt > now ? dayData.resetAt : now + 86_400_000,
  };

  await Promise.all([
    kv.put(minuteKey, JSON.stringify(newMinute), { expirationTtl: 70 }),
    kv.put(dayKey, JSON.stringify(newDay), { expirationTtl: 86410 }),
  ]);

  return {
    allowed: true,
    remaining: { minute: limits.perMinute - newMinute.count, day: limits.perDay - newDay.count },
  };
}

// Get or compute FAQ embeddings, cached in KV
async function getEmbeddings(env: Env): Promise<number[][] | null> {
  // Try cache first
  const cached = await env.FAQ_EMBEDDINGS.get<number[][]>(EMBEDDING_CACHE_KEY, "json");
  if (cached) return cached;

  // Compute embeddings for all entries
  const texts = FAQ_DATA.entries.map(e =>
    `${e.tags.join(" ")} ${e.question} ${e.answer.slice(0, 300)}`
  );

  try {
    const result = await env.AI.run("@cf/google/embeddinggemma-300m", { text: texts }) as {
      data: number[][];
    };
    // Cache for 1 hour
    await env.FAQ_EMBEDDINGS.put(EMBEDDING_CACHE_KEY, JSON.stringify(result.data), {
      expirationTtl: 3600,
    });
    return result.data;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }));
    }

    // /ask accepts POST with JSON body
    if (request.method !== "GET" && request.method !== "POST") {
      return cors(json({ error: "Method not allowed." }, 405));
    }

    // Normalize path
    const subPath = path.startsWith("/claude-faqs/v1")
      ? path.slice("/claude-faqs/v1".length)
      : path.startsWith("/v1")
        ? path.slice("/v1".length)
        : path;
    const format = url.searchParams.get("format");

    // ── Auth ──
    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : url.searchParams.get("apikey");

    if (!apiKey) {
      return cors(json({ error: "Unauthorized", message: "API key required. Pass via Authorization: Bearer <key> header or ?apikey= parameter." }, 401));
    }

    const keyData = await env.FAQ_API_KEYS.get<ApiKeyData>(apiKey, "json");
    if (!keyData) {
      return cors(json({ error: "Unauthorized", message: "Invalid API key." }, 401));
    }

    const keyName = keyData.name;
    const rateLimits = keyData.tier === "premium"
      ? { perMinute: 100, perDay: 10000 }
      : { perMinute: 30, perDay: 1000 };

    // ── Rate Limit ──
    const rlKey = apiKey;
    const rl = await checkRateLimit(env.RATE_LIMITS, rlKey, rateLimits);

    if (!rl.allowed) {
      const resp = json({ error: "Rate limit exceeded", retryAfter: rl.retryAfter, limits: rateLimits }, 429);
      const h = new Headers(resp.headers);
      h.set("Retry-After", String(rl.retryAfter));
      return cors(new Response(resp.body, { status: 429, headers: h }));
    }

    function respond(data: object, status = 200): Response {
      const resp = json(data, status);
      const h = new Headers(resp.headers);
      h.set("X-RateLimit-Remaining-Minute", String(rl.remaining?.minute));
      h.set("X-RateLimit-Remaining-Day", String(rl.remaining?.day));
      h.set("X-Authenticated-As", keyName);
      return cors(new Response(resp.body, { status, headers: h }));
    }

    // ── Routes ──

    // API info
    if (subPath === "" || subPath === "/") {
      return respond({
        name: "Claude FAQ API",
        version: FAQ_DATA.version,
        generated_at: FAQ_DATA.generated_at,
        entry_count: FAQ_DATA.entry_count,
        categories: FAQ_DATA.categories,
        endpoints: {
          "GET /claude-faqs/v1/{slug}": "Get FAQ entry by slug (direct lookup)",
          "GET /claude-faqs/v1/{slug}?format=discord": "Get as Discord embed",
          "GET /claude-faqs/v1/search?q={query}": "Tag-based keyword search",
          "GET /claude-faqs/v1/search?q={query}&mode=semantic": "AI semantic search (embeddings)",
          "POST /claude-faqs/v1/ask": "AI-powered answer (body: { question: '...' })",
          "GET /claude-faqs/v1/categories": "List categories",
          "GET /claude-faqs/v1/entries": "List entries (?category=, filter)",
          "GET /claude-faqs/v1/slugs": "List all slugs",
        },
        auth: {
          description: "API key required for all requests",
          methods: ["Authorization: Bearer <key>", "?apikey=<key>"],
          tiers: { standard: "30/min, 1000/day", premium: "100/min, 10000/day" },
        },
      });
    }

    // ── Search (tag-based or semantic) ──
    if (subPath === "/search") {
      const query = url.searchParams.get("q");
      if (!query) {
        return respond({ error: "Missing ?q= parameter" }, 400);
      }

      const limit = Math.min(parseInt(url.searchParams.get("limit") || "5") || 5, 20);
      const mode = url.searchParams.get("mode") || "tags";

      let results: FAQEntry[];

      if (mode === "semantic") {
        // AI-powered embedding search
        const embeddings = await getEmbeddings(env);
        if (!embeddings) {
          // Fallback to tag search if embeddings fail
          results = tagSearch(FAQ_DATA.entries, query, limit);
        } else {
          const qResult = await env.AI.run("@cf/google/embeddinggemma-300m", { text: [query] }) as {
            data: number[][];
          };
          const matches = embeddingSearch(qResult.data[0], embeddings, FAQ_DATA.entries, limit);
          results = matches.map(m => m.entry);
        }
      } else {
        results = tagSearch(FAQ_DATA.entries, query, limit);
      }

      if (format === "discord") {
        return respond({ query, count: results.length, results: results.map(toDiscordEmbed) });
      }

      return respond({
        query,
        mode,
        count: results.length,
        results: results.map(e => ({
          slug: e.slug,
          question: e.question,
          tags: e.tags.slice(0, 5),
          answer_preview: e.answer.slice(0, 200) + (e.answer.length > 200 ? "..." : ""),
          category: e.category,
          subcategory: e.subcategory,
        })),
      });
    }

    // ── Ask (LLM-powered contextual answer) ──
    if (subPath === "/ask") {
      let question: string | null = null;

      if (request.method === "POST") {
        const body = await request.json() as { question?: string };
        question = body.question || null;
      } else {
        question = url.searchParams.get("q");
      }

      if (!question) {
        return respond({ error: "Missing question", usage: "POST { question: '...' } or GET ?q=..." }, 400);
      }

      // Find relevant FAQ entries using embeddings (or tag fallback)
      let context: FAQEntry[];
      const embeddings = await getEmbeddings(env);
      if (embeddings) {
        const qResult = await env.AI.run("@cf/google/embeddinggemma-300m", { text: [question] }) as {
          data: number[][];
        };
        const matches = embeddingSearch(qResult.data[0], embeddings, FAQ_DATA.entries, 3);
        context = matches.map(m => m.entry);
      } else {
        context = tagSearch(FAQ_DATA.entries, question, 3);
      }

      if (context.length === 0) {
        return respond({
          question,
          answer: "I couldn't find any relevant FAQ entries for your question. Try rephrasing or browse /categories.",
          sources: [],
        });
      }

      // Build context for the LLM
      const faqContext = context.map((e, i) =>
        `[FAQ ${i + 1}] ${e.question}\n${e.answer}`
      ).join("\n\n---\n\n");

      const messages = [
        {
          role: "system" as const,
          content: `You are a helpful assistant for the Claude AI community. Answer the user's question using ONLY the FAQ entries provided below. Be concise and friendly. If the FAQ entries don't fully answer the question, say so and suggest they check the official docs at docs.anthropic.com.\n\nFAQ ENTRIES:\n${faqContext}`,
        },
        { role: "user" as const, content: question },
      ];

      try {
        const llmResult = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages }) as {
          response: string;
        };

        return respond({
          question,
          answer: llmResult.response,
          sources: context.map(e => ({ slug: e.slug, question: e.question })),
        });
      } catch (err) {
        // Fallback: return the best matching FAQ entry directly
        return respond({
          question,
          answer: context[0].answer,
          sources: [{ slug: context[0].slug, question: context[0].question }],
          note: "AI response unavailable, returning best FAQ match directly.",
        });
      }
    }

    // ── Categories ──
    if (subPath === "/categories") {
      return respond({
        count: FAQ_DATA.categories.length,
        categories: FAQ_DATA.categories.map(cat => {
          const entries = FAQ_DATA.entries.filter(e => e.category === cat);
          return {
            name: cat,
            entry_count: entries.length,
            subcategories: [...new Set(entries.map(e => e.subcategory))],
          };
        }),
      });
    }

    // ── Entries ──
    if (subPath === "/entries") {
      let entries = FAQ_DATA.entries;
      const category = url.searchParams.get("category")?.toLowerCase();

      if (category) {
        entries = entries.filter(e =>
          e.category.toLowerCase().includes(category) ||
          e.subcategory.toLowerCase().includes(category)
        );
      }

      return respond({
        count: entries.length,
        entries: entries.map(e => ({
          slug: e.slug,
          question: e.question,
          tags: e.tags.slice(0, 5),
          category: e.category,
          subcategory: e.subcategory,
        })),
      });
    }

    // ── Slugs ──
    if (subPath === "/slugs") {
      return respond({ count: FAQ_DATA.entry_count, slugs: Object.keys(FAQ_DATA.slugs) });
    }

    // ── Slug lookup (catch-all) ──
    const slug = subPath.replace(/^\//, "");
    if (!slug || slug.includes("/")) {
      return respond({ error: "Not Found", message: `Unknown endpoint: ${path}` }, 404);
    }

    const entryIndex = FAQ_DATA.slugs[slug];
    if (entryIndex === undefined) {
      const suggestions = tagSearch(FAQ_DATA.entries, slug.replace(/-/g, " "), 3);
      return respond({
        error: "FAQ entry not found",
        slug,
        did_you_mean: suggestions.map(e => ({ slug: e.slug, question: e.question })),
      }, 404);
    }

    const entry = FAQ_DATA.entries[entryIndex];

    if (format === "discord") {
      return respond(toDiscordEmbed(entry));
    }

    return respond(entry);
  },
};
