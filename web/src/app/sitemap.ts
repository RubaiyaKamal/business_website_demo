import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { locales } from "@/lib/i18n";

const STATIC_PATHS = [
  "",
  "/about",
  "/services",
  "/projects",
  "/blog",
  "/testimonials",
  "/contact",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl.replace(/\/$/, "");
  const now = new Date();

  return locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
