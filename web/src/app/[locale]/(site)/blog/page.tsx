import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/content/PostCard";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getPostCategories, getPosts } from "@/lib/api";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  return { title: dict.blog.title, description: dict.blog.subtitle };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const locale: Locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  const query = await searchParams;
  const page = Math.max(1, Number(query.page ?? "1") || 1);
  const category = query.category;

  const [data, categories] = await Promise.all([
    getPosts(page, category, 9),
    getPostCategories(),
  ]);

  const filterHref = (value?: string) =>
    value ? `/${locale}/blog?category=${encodeURIComponent(value)}` : `/${locale}/blog`;

  return (
    <>
      <PageHero title={dict.blog.title} subtitle={dict.blog.subtitle} />
      <section className="container-page py-16 sm:py-20">
        {categories.length > 0 ? (
          <div className="mb-10 flex flex-wrap gap-2">
            <Link
              href={filterHref()}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                !category
                  ? "border-primary bg-primary text-white"
                  : "border-slate-300 text-slate-600 hover:border-primary hover:text-primary",
              )}
            >
              {dict.common.allCategories}
            </Link>
            {categories.map((item) => (
              <Link
                key={item}
                href={filterHref(item)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  category === item
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 text-slate-600 hover:border-primary hover:text-primary",
                )}
              >
                {item}
              </Link>
            ))}
          </div>
        ) : null}

        {data.items.length === 0 ? (
          <EmptyState message={dict.blog.noPosts} icon="sparkles" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((post) => (
              <PostCard
                key={post.id}
                locale={locale}
                post={post}
                minReadLabel={dict.common.minRead}
              />
            ))}
          </div>
        )}

        <Pagination
          currentPage={data.page}
          totalPages={data.pages}
          basePath={`/${locale}/blog`}
          query={{ category }}
          previousLabel={dict.common.previous}
          nextLabel={dict.common.next}
          pageOfTemplate={dict.common.pageOf}
        />
      </section>
    </>
  );
}
