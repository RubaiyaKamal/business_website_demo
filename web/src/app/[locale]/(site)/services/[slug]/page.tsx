import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/content/RichText";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getPublicSettings, getService, getServices } from "@/lib/api";
import { env, whatsappLink } from "@/lib/env";
import { getDictionary, locales, resolveLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { alternatesFor, absoluteMedia, breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import { absoluteUrl, formatPrice, localized, truncate } from "@/lib/utils";

const KNOWN_ICONS: IconName[] = [
  "smartphone",
  "laptop",
  "truck",
  "shield-check",
  "credit-card",
  "tv",
  "wrench",
];

export async function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  const services = await getServices(1, 100);
  for (const locale of locales) {
    for (const service of services.items) {
      params.push({ locale, slug: service.slug });
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
  const service = await getService(slug);
  if (!service) return {};
  const title = localized(locale, service.title, service.title_ur);
  const description = truncate(localized(locale, service.summary, service.summary_ur));
  return {
    title,
    description,
    alternates: alternatesFor(locale, `/services/${slug}`),
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(`/${locale}/services/${slug}`, env.siteUrl),
      images: service.image_url ? [absoluteMedia(service.image_url)] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const service = await getService(slug);
  if (!service) notFound();

  const all = await getServices(1, 100);
  const others = all.items.filter((item) => item.slug !== slug).slice(0, 3);
  const provider = await getPublicSettings();
  const icon: IconName =
    service.icon && (KNOWN_ICONS as string[]).includes(service.icon)
      ? (service.icon as IconName)
      : "wrench";

  return (
    <>
      <JsonLd
        data={serviceJsonLd(service, locale, provider ?? null)}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.services, url: absoluteUrl(`/${locale}/services`, env.siteUrl) },
          {
            name: localized(locale, service.title, service.title_ur),
            url: absoluteUrl(`/${locale}/services/${slug}`, env.siteUrl),
          },
        ])}
      />
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr] lg:py-20">
          <div>
            <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
              <Link href={`/${locale}/services`} className="hover:text-primary">
                {dict.nav.services}
              </Link>
              <span>/</span>
              <span className="text-slate-700">
                {localized(locale, service.title, service.title_ur)}
              </span>
            </nav>
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-primary-50 text-primary">
              <Icon name={icon} size={30} />
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl">
              {localized(locale, service.title, service.title_ur)}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              {localized(locale, service.summary, service.summary_ur)}
            </p>
          </div>

          <aside className="card h-fit p-6">
            <h2 className="text-lg">{dict.services.requestTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">{dict.services.requestText}</p>
            {service.price_from !== null ? (
              <p className="mt-5 text-2xl font-bold text-primary">
                {dict.services.priceLabel} {formatPrice(service.price_from, locale)}
              </p>
            ) : null}
            <Link href={`/${locale}/contact?service=${service.id}`} className="btn-primary mt-6 w-full">
              {dict.common.getInTouch}
              <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
            </Link>
            <a
              href={whatsappLink(
                `Hello, I would like to request the "${localized(locale, service.title, service.title_ur)}" service.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-3 w-full"
            >
              <Icon name="whatsapp" size={18} />
              {dict.common.chatOnWhatsApp}
            </a>
          </aside>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="prose-content max-w-3xl">
          <RichText
            text={localized(locale, service.body, service.body_ur) || dict.services.detailIntro}
          />
        </div>
      </section>

      {others.length > 0 ? (
        <section className="bg-white py-16">
          <div className="container-page">
            <h2 className="text-2xl">{dict.services.otherServices}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {others.map((item) => (
                <Link
                  key={item.id}
                  href={`/${locale}/services/${item.slug}`}
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
