import type { Metadata } from "next";
import { ProjectCard } from "@/components/content/ProjectCard";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getProjects } from "@/lib/api";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  return { title: dict.projects.title, description: dict.projects.subtitle };
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const locale: Locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  const page = Math.max(1, Number((await searchParams).page ?? "1") || 1);
  const data = await getProjects(page, 9);

  return (
    <>
      <PageHero title={dict.projects.title} subtitle={dict.projects.subtitle} />
      <section className="container-page py-16 sm:py-20">
        {data.items.length === 0 ? (
          <EmptyState message={dict.common.noResults} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((project) => (
              <ProjectCard
                key={project.id}
                locale={locale}
                project={project}
                completedLabel={dict.projects.completed}
                detailsLabel={dict.common.viewDetails}
              />
            ))}
          </div>
        )}
        <Pagination
          currentPage={data.page}
          totalPages={data.pages}
          basePath={`/${locale}/projects`}
          previousLabel={dict.common.previous}
          nextLabel={dict.common.next}
          pageOfTemplate={dict.common.pageOf}
        />
      </section>
    </>
  );
}
