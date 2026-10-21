import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n";
import type { BlogPostListItem } from "@/lib/types";
import { formatDate, localized } from "@/lib/utils";

type PostCardProps = {
  locale: Locale;
  post: BlogPostListItem;
  minReadLabel: string;
};

export function PostCard({ locale, post, minReadLabel }: PostCardProps) {
  const dateLocale = locale === "ur" ? "ur-PK" : "en-PK";

  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover">
      <Link href={`/${locale}/blog/${post.slug}`} className="block">
        <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={localized(locale, post.title, post.title_ur)}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <Icon name="sparkles" size={36} className="text-primary/40" />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {post.published_at ? <span>{formatDate(post.published_at, dateLocale)}</span> : null}
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={13} />
            {post.reading_time} {minReadLabel}
          </span>
        </div>
        <h3 className="mt-3 text-lg">
          <Link href={`/${locale}/blog/${post.slug}`} className="hover:text-primary">
            {localized(locale, post.title, post.title_ur)}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
          {localized(locale, post.excerpt, post.excerpt_ur)}
        </p>
      </div>
    </article>
  );
}
