import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/en/admin", "/ur/admin", "/en/login", "/ur/login", "/en/register", "/ur/register"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
