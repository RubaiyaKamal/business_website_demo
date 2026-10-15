import type { Metadata } from "next";
import { env } from "@/lib/env";
import { SITE } from "@/lib/site";
import { absoluteUrl, localized } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import type { BlogPostRead, ProjectRead, PublicSettings, ServiceRead } from "@/lib/types";

const BASE = env.siteUrl.replace(/\/$/, "");

/** Return an absolute URL, leaving already-absolute URLs untouched. */
export function absoluteMedia(url: string): string {
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url, BASE);
}

/** Canonical URL plus hreflang alternates for the EN/UR editions. */
export function alternatesFor(locale: Locale, path: string): Metadata["alternates"] {
  const clean = path === "" || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: `${BASE}/${locale}${clean}`,
    languages: {
      en: `${BASE}/en${clean}`,
      ur: `${BASE}/ur${clean}`,
      "x-default": `${BASE}/en${clean}`,
    },
  };
}

/** Standard metadata for a top-level (non-detail) page. */
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: { type: "website", title, description, url: `${BASE}/${locale}${path}` },
    twitter: { card: "summary", title, description },
  };
}

type Json = Record<string, unknown>;

function orgRef(): Json {
  return { "@type": "Organization", name: SITE.name, url: BASE };
}

export function organizationJsonLd(settings?: PublicSettings | null): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.legalName,
    url: BASE,
    logo: absoluteUrl("/favicon.svg", BASE),
    email: settings?.contact_email || SITE.email,
    telephone: settings?.contact_phone || SITE.phoneDisplay,
    sameAs: [
      settings?.social_facebook || env.facebookUrl,
      settings?.social_instagram || env.instagramUrl,
      settings?.social_tiktok || env.tiktokUrl,
    ].filter(Boolean),
  };
}

export function localBusinessJsonLd(settings?: PublicSettings | null): Json {
  const address = SITE.address;
  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: SITE.name,
    image: absoluteUrl("/favicon.svg", BASE),
    url: BASE,
    telephone: settings?.contact_phone || SITE.phoneDisplay,
    email: settings?.contact_email || SITE.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address_street || address.street,
      addressLocality: settings?.address_city || address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "11:00",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "14:00",
        closes: "20:00",
      },
    ],
  };
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: BASE,
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function serviceJsonLd(
  service: ServiceRead,
  locale: Locale,
  provider: PublicSettings | null,
): Json {
  const data: Json = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: localized(locale, service.title, service.title_ur),
    description: localized(locale, service.summary, service.summary_ur),
    serviceType: localized(locale, service.title, service.title_ur),
    provider: orgRef(),
    areaServed: {
      "@type": "City",
      name: provider?.address_city || SITE.address.city,
    },
  };
  if (service.price_from !== null) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: service.price_from,
      url: `${BASE}/${locale}/services/${service.slug}`,
    };
  }
  return data;
}

export function projectJsonLd(project: ProjectRead, locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: localized(locale, project.title, project.title_ur),
    description: localized(locale, project.summary, project.summary_ur),
    creator: orgRef(),
    dateCreated: project.completed_at ?? undefined,
    url: `${BASE}/${locale}/projects/${project.slug}`,
  };
}

export function blogPostingJsonLd(post: BlogPostRead, locale: Locale): Json {
  const url = `${BASE}/${locale}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: localized(locale, post.title, post.title_ur),
    description: localized(locale, post.excerpt, post.excerpt_ur),
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author?.full_name ?? SITE.legalName },
    publisher: orgRef(),
    mainEntityOfPage: url,
    image: post.cover_image_url ? absoluteUrl(post.cover_image_url, BASE) : undefined,
  };
}
