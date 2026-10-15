/**
 * Typed access to public (NEXT_PUBLIC_*) environment variables.
 * Values are inlined at build time, so always read them through this module.
 */
export const env = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "GreenVolt Electronics",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Browser-facing API base. Relative so requests go through the Next proxy. */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923365447805",
  googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "",
  googleMapsEmbedUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "",
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://facebook.com/greenvolt",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/greenvolt",
  tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://tiktok.com/@greenvolt",
  enableUserAuth: process.env.NEXT_PUBLIC_ENABLE_USER_AUTH === "true",
  enableAi: process.env.NEXT_PUBLIC_ENABLE_AI === "true",
} as const;

/** Build a wa.me link with an optional pre-filled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${env.whatsappNumber.replace(/[^\d]/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
