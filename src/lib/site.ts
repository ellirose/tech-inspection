/** Absolute base for canonical URLs, the sitemap and OG images. Set NEXT_PUBLIC_SITE_URL per environment. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tech-inspection.com";

/** WhatsApp click-to-chat link with a prefilled message. `number` is in international format without "+". */
export const whatsappLink = (number: string, text: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
