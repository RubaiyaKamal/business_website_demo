import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/content/PostCard";
import { RichText } from "@/components/content/RichText";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { getPost, getPosts, getRelatedPosts } from "@/lib/api";
import { env } from "@/lib/env";
import { getDictionary, locales, resolveLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { alternatesFor, blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl, formatDate, localized, truncate } from "@/lib/utils";

export async function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  const posts = await getPosts(1, undefined, 100);
  for (const locale of locales) {
    for (const post of posts.items) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const post = await getPost(slug);
  if (!post) return {};
  const title = localized(locale, post.title, post.title_ur);
  const description = truncate(localized(locale, post.excerpt, post.excerpt_ur));
  const canonical = absoluteUrl(`/${locale}/blog/${slug}`, env.siteUrl);
  return {
    title,
    description,
    alternates: alternatesFor(locale, `/blog/${slug}`),
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
      publishedTime: post.published_at ?? undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(slug);
  const title = localized(locale, post.title, post.title_ur);
  const dateLocale = locale === "ur" ? "ur-PK" : "en-PK";
  const canonical = absoluteUrl(`/${locale}/blog/${slug}`, env.siteUrl);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post, locale)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.blog, url: absoluteUrl(`/${locale}/blog`, env.siteUrl) },
          { name: title, url: canonical },
        ])}
      />
      <article className="container-page max-w-3xl py-14">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-700"
        >
          <Icon name="arrow-left" size={16} className="rtl:rotate-180" />
          {dict.blog.backToBlog}
        </Link>

        <span className="badge-sale mt-6 inline-flex">{post.category}</span>
        <h1 className="mt-4 text-3xl sm:text-4xl">{title}</h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          {post.published_at ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={15} />
              {formatDate(post.published_at, dateLocale)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" size={15} />
            {post.reading_time} {dict.common.minRead}
          </span>
          {post.author ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="user" size={15} />
              {dict.blog.writtenBy} {post.author.full_name}
            </span>
          ) : null}
        </div>

        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={title}
            width={1200}
            height={675}
            sizes="(min-width: 768px) 768px, 100vw"
            className="mt-8 aspect-video w-full rounded-2xl object-cover shadow-card"
          />
        ) : null}

        <div className="prose-content mt-10">
          <RichText text={localized(locale, post.body, post.body_ur)} />
        </div>

        {post.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                <Icon name="tag" size={12} />
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-500">{dict.blog.shareArticle}</span>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title} ${canonical}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline px-3 py-2"
            aria-label="WhatsApp"
          >
            <Icon name="whatsapp" size={18} />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline px-3 py-2"
            aria-label="Facebook"
          >
            <Icon name="facebook" size={18} />
          </a>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="bg-white py-16">
          <div className="container-page">
            <h2 className="text-2xl">{dict.common.relatedPosts}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard
                  key={item.id}
                  locale={locale}
                  post={item}
                  minReadLabel={dict.common.minRead}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
