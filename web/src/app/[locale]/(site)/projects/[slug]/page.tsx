import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/content/RichText";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { getProject, getProjects } from "@/lib/api";
import { env } from "@/lib/env";
import { getDictionary, locales, resolveLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { alternatesFor, absoluteMedia, breadcrumbJsonLd, projectJsonLd } from "@/lib/seo";
import { absoluteUrl, formatDate, localized, truncate } from "@/lib/utils";

export async function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  const projects = await getProjects(1, 100);
  for (const locale of locales) {
    for (const project of projects.items) {
      params.push({ locale, slug: project.slug });
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
  const project = await getProject(slug);
  if (!project) return {};
  const title = localized(locale, project.title, project.title_ur);
  const description = truncate(localized(locale, project.summary, project.summary_ur));
  return {
    title,
    description,
    alternates: alternatesFor(locale, `/projects/${slug}`),
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(`/${locale}/projects/${slug}`, env.siteUrl),
      images: project.image_url ? [absoluteMedia(project.image_url)] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const project = await getProject(slug);
  if (!project) notFound();

  const all = await getProjects(1, 100);
  const others = all.items.filter((item) => item.slug !== slug).slice(0, 3);
  const title = localized(locale, project.title, project.title_ur);

  return (
    <>
      <JsonLd data={projectJsonLd(project, locale)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.projects, url: absoluteUrl(`/${locale}/projects`, env.siteUrl) },
          { name: title, url: absoluteUrl(`/${locale}/projects/${slug}`, env.siteUrl) },
        ])}
      />
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page py-14 lg:py-20">
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link href={`/${locale}/projects`} className="hover:text-primary">
              {dict.nav.projects}
            </Link>
            <span>/</span>
            <span className="text-slate-700">{title}</span>
          </nav>
          <h1 className="max-w-3xl text-3xl sm:text-4xl">{title}</h1>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600">
            {project.client ? (
              <span className="inline-flex items-center gap-2">
                <Icon name="user" size={16} className="text-primary" />
                {dict.projects.client}: <strong className="text-dark">{project.client}</strong>
              </span>
            ) : null}
            {project.completed_at ? (
              <span className="inline-flex items-center gap-2">
                <Icon name="calendar" size={16} className="text-primary" />
                {dict.projects.completed}:{" "}
                <strong className="text-dark">
                  {formatDate(project.completed_at, locale === "ur" ? "ur-PK" : "en-PK")}
                </strong>
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="prose-content max-w-3xl">
            <p className="text-lg text-slate-700">{localized(locale, project.summary, project.summary_ur)}</p>
            {localized(locale, project.body, project.body_ur) ? (
              <RichText text={localized(locale, project.body, project.body_ur)} />
            ) : null}
          </div>

          {project.image_url ? (
            <Image
              src={project.image_url}
              alt={title}
              width={800}
              height={600}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="card h-fit w-full object-cover"
            />
          ) : null}
        </div>

        {project.gallery.length > 0 ? (
          <div className="mt-12">
            <h2 className="text-2xl">{dict.projects.gallery}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery.map((url, index) => (
                <Image
                  key={`${url}-${index}`}
                  src={url}
                  alt={`${title} ${index + 1}`}
                  width={600}
                  height={400}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-56 w-full rounded-2xl object-cover shadow-card"
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {others.length > 0 ? (
        <section className="bg-white py-16">
          <div className="container-page">
            <h2 className="text-2xl">{dict.projects.otherProjects}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {others.map((item) => (
                <Link
                  key={item.id}
                  href={`/${locale}/projects/${item.slug}`}
                  className="card flex items-center justify-between gap-3 p-5 transition-shadow hover:shadow-card-hover"
                >
                  <span className="text-sm font-semibold text-dark">
                    {localized(locale, item.title, item.title_ur)}
                  </span>
                  <Icon name="arrow-right" size={18} className="text-primary rtl:rotate-180" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
