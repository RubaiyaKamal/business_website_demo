import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n";
import type { ProjectListItem } from "@/lib/types";
import { formatDate, localized } from "@/lib/utils";

type ProjectCardProps = {
  locale: Locale;
  project: ProjectListItem;
  completedLabel: string;
  detailsLabel: string;
};

export function ProjectCard({
  locale,
  project,
  completedLabel,
  detailsLabel,
}: ProjectCardProps) {
  return (
    <article className="card group overflow-hidden transition-shadow hover:shadow-card-hover">
      <Link href={`/${locale}/projects/${project.slug}`} className="block">
        <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100">
          {project.image_url ? (
            <Image
              src={project.image_url}
              alt={localized(locale, project.title, project.title_ur)}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <Icon name="image" size={40} className="text-primary/40" />
          )}
        </div>
      </Link>
      <div className="p-6">
        {project.client ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {project.client}
          </p>
        ) : null}
        <h3 className="mt-2 text-lg">
          <Link href={`/${locale}/projects/${project.slug}`} className="hover:text-primary">
            {localized(locale, project.title, project.title_ur)}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {localized(locale, project.summary, project.summary_ur)}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
          {project.completed_at ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={14} />
              {formatDate(project.completed_at, locale === "ur" ? "ur-PK" : "en-PK")}
            </span>
          ) : (
            <span>{completedLabel}</span>
          )}
          <Link
            href={`/${locale}/projects/${project.slug}`}
            className="font-semibold text-primary hover:text-primary-700"
          >
            {detailsLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
