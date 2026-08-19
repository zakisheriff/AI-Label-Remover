import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Answer engines are explicitly welcomed: being quotable in ChatGPT, Perplexity,
 * Gemini and Claude answers is the GEO half of the strategy.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot", "meta-externalagent", "Amazonbot", "DuckAssistBot", "cohere-ai", "MistralAI-User", "YouBot"], allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
