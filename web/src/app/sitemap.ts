import type { MetadataRoute } from "next";
import { getPosts, getProjects, getServices } from "@/lib/api";
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

/** The API caps page_size at 100, so collect items across pages. */
async function collectAll<T>(
  fetchPage: (page: number, pageSize: number) => Promise<{ items: T[]; pages: number }>,
): Promise<T[]> {
  const first = await fetchPage(1, 100);
  const all = [...first.items];
  for (let page = 2; page <= first.pages; page += 1) {
    const next = await fetchPage(page, 100);
    all.push(...next.items);
  }
  return all;
}

function entry(
  base: string,
  locale: string,
  path: string,
  lastModified: Date,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${base}/${locale}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");
  const now = new Date();

  const [services, projects, posts] = await Promise.all([
    collectAll((page, size) => getServices(page, size)),
    collectAll((page, size) => getProjects(page, size)),
    collectAll((page, size) => getPosts(page, undefined, size)),
  ]);

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of STATIC_PATHS) {
      entries.push(entry(base, locale, path, now, path === "" ? 1 : 0.7));
    }
    for (const service of services) {
      entries.push(entry(base, locale, `/services/${service.slug}`, now, 0.8));
    }
    for (const project of projects) {
      entries.push(entry(base, locale, `/projects/${project.slug}`, now, 0.6));
    }
    for (const post of posts) {
      const modified = post.published_at ? new Date(post.published_at) : now;
      entries.push(entry(base, locale, `/blog/${post.slug}`, modified, 0.6));
    }
  }
  return entries;
}
