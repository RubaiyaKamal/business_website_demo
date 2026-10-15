import type {
  BlogPostListItem,
  BlogPostRead,
  Page,
  ProjectListItem,
  ProjectRead,
  PublicSettings,
  ServiceListItem,
  ServiceRead,
  Testimonial,
} from "@/lib/types";

/**
 * Server-side API base. Reaches the backend directly (container-to-container in
 * Docker) instead of going back out through the public origin.
 */
const SERVER_BASE = (
  process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const DEFAULT_REVALIDATE = 120;

type GetOptions = {
  /** Seconds to cache, or `false` to opt out of caching entirely. */
  revalidate?: number | false;
  tags?: string[];
};

/**
 * Fetch JSON from the API on the server. Never throws: on network/HTTP errors it
 * resolves to `null` so pages can render graceful empty states during builds or
 * when the backend is unavailable.
 */
export async function serverGet<T>(path: string, options: GetOptions = {}): Promise<T | null> {
  const revalidate = options.revalidate ?? DEFAULT_REVALIDATE;
  const init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } =
    revalidate === false
      ? { cache: "no-store" }
      : { next: { revalidate, tags: options.tags } };

  try {
    const res = await fetch(`${SERVER_BASE}${path}`, {
      ...init,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const PAGE_SIZE = 9;

export async function getServices(page = 1, pageSize = 50): Promise<Page<ServiceListItem>> {
  const data = await serverGet<Page<ServiceListItem>>(
    `/services?page=${page}&page_size=${pageSize}`,
    { tags: ["services"] },
  );
  return data ?? { items: [], total: 0, page, page_size: pageSize, pages: 0 };
}

export async function getService(slug: string): Promise<ServiceRead | null> {
  return serverGet<ServiceRead>(`/services/${encodeURIComponent(slug)}`, { tags: ["services"] });
}

export async function getProjects(page = 1, pageSize = PAGE_SIZE): Promise<Page<ProjectListItem>> {
  const data = await serverGet<Page<ProjectListItem>>(
    `/projects?page=${page}&page_size=${pageSize}`,
    { tags: ["projects"] },
  );
  return data ?? { items: [], total: 0, page, page_size: pageSize, pages: 0 };
}

export async function getProject(slug: string): Promise<ProjectRead | null> {
  return serverGet<ProjectRead>(`/projects/${encodeURIComponent(slug)}`, { tags: ["projects"] });
}

export async function getPosts(
  page = 1,
  category?: string,
  pageSize = PAGE_SIZE,
): Promise<Page<BlogPostListItem>> {
  const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (category) query.set("category", category);
  const data = await serverGet<Page<BlogPostListItem>>(`/blog?${query.toString()}`, {
    tags: ["blog"],
  });
  return data ?? { items: [], total: 0, page, page_size: pageSize, pages: 0 };
}

export async function getPost(slug: string): Promise<BlogPostRead | null> {
  return serverGet<BlogPostRead>(`/blog/${encodeURIComponent(slug)}`, { tags: ["blog"] });
}

export async function getRelatedPosts(slug: string): Promise<BlogPostListItem[]> {
  return (
    (await serverGet<BlogPostListItem[]>(`/blog/${encodeURIComponent(slug)}/related`, {
      tags: ["blog"],
    })) ?? []
  );
}

export async function getPostCategories(): Promise<string[]> {
  return (await serverGet<string[]>("/blog/categories", { tags: ["blog"] })) ?? [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return (await serverGet<Testimonial[]>("/testimonials", { tags: ["testimonials"] })) ?? [];
}

export async function getPublicSettings(): Promise<PublicSettings | null> {
  return serverGet<PublicSettings>("/settings/public", { tags: ["settings"] });
}
