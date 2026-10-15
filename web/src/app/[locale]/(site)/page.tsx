import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/content/PostCard";
import { ProjectCard } from "@/components/content/ProjectCard";
import { ServiceCard } from "@/components/content/ServiceCard";
import { TestimonialCard } from "@/components/content/TestimonialCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPosts, getProjects, getPublicSettings, getServices, getTestimonials } from "@/lib/api";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import {
  alternatesFor,
  localBusinessJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { SITE } from "@/lib/site";

const WHY_FEATURES: { key: string; icon: IconName }[] = [
  { key: "warranty", icon: "shield-check" },
  { key: "delivery", icon: "truck" },
  { key: "repair", icon: "wrench" },
  { key: "installments", icon: "credit-card" },
  { key: "genuine", icon: "check" },
  { key: "support", icon: "user" },
];

const STATS = [
  { key: "customers", value: "5,000+" },
  { key: "years", value: "12+" },
  { key: "products", value: "800+" },
  { key: "reviews", value: "4.9/5" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return { alternates: alternatesFor(locale, "") };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);

  const [services, projects, testimonials, posts, settings] = await Promise.all([
    getServices(1, 6),
    getProjects(1, 3),
    getTestimonials(),
    getPosts(1, undefined, 3),
    getPublicSettings(),
  ]);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <JsonLd data={localBusinessJsonLd(settings)} />
      <JsonLd data={websiteJsonLd()} />
      <section className="relative overflow-hidden bg-dark text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,142,62,0.45),transparent_55%)]" />
        <div className="container-page relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
              <Icon name="bolt" size={16} className="text-accent" />
              {dict.home.heroBadge}
            </span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent">
              {dict.home.heroEyebrow}
            </p>
            <h1 className="mt-3 text-4xl text-white sm:text-5xl lg:text-6xl">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/75">{dict.home.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}/services`} className="btn-accent">
                {dict.home.heroPrimaryCta}
                <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="btn border border-white/25 text-white hover:bg-white/10"
              >
                {dict.home.heroSecondaryCta}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat) => (
              <div key={stat.key} className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-white/70">
                  {dict.stats[stat.key as keyof typeof dict.stats]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={SITE.tagline}
          title={dict.home.servicesTitle}
          subtitle={dict.home.servicesSubtitle}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.items.map((service) => (
            <ServiceCard
              key={service.id}
              locale={locale}
              service={service}
              priceLabel={dict.services.priceLabel}
              detailsLabel={dict.common.viewDetails}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href={`/${locale}/services`} className="btn-outline">
            {dict.common.viewAll}
            <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
          </Link>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading title={dict.home.whyTitle} subtitle={dict.home.whySubtitle} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_FEATURES.map((feature) => (
              <div key={feature.key} className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                  <Icon name={feature.icon} size={24} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-dark">
                    {dict.home.why[`${feature.key}Title` as keyof typeof dict.home.why]}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {dict.home.why[`${feature.key}Text` as keyof typeof dict.home.why]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {projects.items.length > 0 ? (
        <section className="container-page py-16 sm:py-20">
          <SectionHeading title={dict.home.projectsTitle} subtitle={dict.home.projectsSubtitle} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.items.map((project) => (
              <ProjectCard
                key={project.id}
                locale={locale}
                project={project}
                completedLabel={dict.projects.completed}
                detailsLabel={dict.common.viewDetails}
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={`/${locale}/projects`} className="btn-outline">
              {dict.common.viewAll}
              <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
            </Link>
          </div>
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section className="bg-white py-16 sm:py-20">
          <div className="container-page">
            <SectionHeading
              title={dict.home.testimonialsTitle}
              subtitle={dict.home.testimonialsSubtitle}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 3).map((testimonial) => (
                <TestimonialCard key={testimonial.id} locale={locale} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {posts.items.length > 0 ? (
        <section className="container-page py-16 sm:py-20">
          <SectionHeading title={dict.home.blogTitle} subtitle={dict.home.blogSubtitle} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.items.map((post) => (
              <PostCard key={post.id} locale={locale} post={post} minReadLabel={dict.common.minRead} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={`/${locale}/blog`} className="btn-outline">
              {dict.common.viewAll}
              <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-dark px-8 py-14 text-center text-white sm:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,142,62,0.5),transparent_55%)]" />
          <div className="relative">
            <h2 className="text-3xl text-white sm:text-4xl">{dict.home.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">{dict.home.ctaSubtitle}</p>
            <Link href={`/${locale}/contact`} className="btn-accent mt-8">
              {dict.home.ctaButton}
              <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
