import type { Metadata } from "next";
import { ServiceCard } from "@/components/content/ServiceCard";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getServices } from "@/lib/api";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  return pageMetadata(
    locale,
    "/services",
    dict.services.title,
    dict.services.subtitle,
  );
}

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const locale: Locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  const page = Math.max(1, Number((await searchParams).page ?? "1") || 1);
  const data = await getServices(page, 12);

  return (
    <>
      <PageHero title={dict.services.title} subtitle={dict.services.subtitle} />
      <section className="container-page py-16 sm:py-20">
        {data.items.length === 0 ? (
          <EmptyState message={dict.common.noResults} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((service) => (
              <ServiceCard
                key={service.id}
                locale={locale}
                service={service}
                priceLabel={dict.services.priceLabel}
                detailsLabel={dict.common.viewDetails}
              />
            ))}
          </div>
        )}
        <Pagination
          currentPage={data.page}
          totalPages={data.pages}
          basePath={`/${locale}/services`}
          previousLabel={dict.common.previous}
          nextLabel={dict.common.next}
          pageOfTemplate={dict.common.pageOf}
        />
      </section>
    </>
  );
}
