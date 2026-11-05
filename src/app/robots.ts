import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Search engines and AI crawlers may read the public site (design document §16.5; the client to confirm the
// AI crawlers). The admin, the API and the thank-you page stay out.
const disallow = ["/admin", "/api/", "/es/gracias", "/pt/gracias", "/en/gracias"];
const aiCrawlers = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiCrawlers, allow: "/", disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
