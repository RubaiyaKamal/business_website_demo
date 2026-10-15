import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.legalName,
    short_name: SITE.shortName,
    description: "Electronics retail, repair and installation in Karachi.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4FAF6",
    theme_color: "#1E8E3E",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
    lang: "en",
    dir: "ltr",
    id: env.siteUrl,
  };
}
