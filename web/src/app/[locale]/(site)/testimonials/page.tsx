import type { Metadata } from "next";
import { TestimonialCard } from "@/components/content/TestimonialCard";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { getTestimonials } from "@/lib/api";
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
    "/testimonials",
    dict.testimonials.title,
    dict.testimonials.subtitle,
  );
}

export default async function TestimonialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale: Locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  const testimonials = await getTestimonials();

  return (
    <>
      <PageHero title={dict.testimonials.title} subtitle={dict.testimonials.subtitle} />
      <section className="container-page py-16 sm:py-20">
        {testimonials.length === 0 ? (
          <EmptyState message={dict.common.noResults} icon="quote" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} locale={locale} testimonial={testimonial} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
