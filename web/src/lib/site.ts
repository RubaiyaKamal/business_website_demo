import type { Locale } from "@/lib/i18n";

/** Static business identity used across the site (server and client safe). */
export const SITE = {
  name: "GreenVolt Electronics",
  shortName: "GreenVolt",
  tagline: "Power Up Your Life",
  legalName: "GreenVolt Electronics",
  email: "info@greenvolt.example",
  phoneDisplay: "+92 336 5447805",
  phoneHref: "tel:+923365447805",
  whatsappDisplay: "+92 336 5447805",
  address: {
    street: "Shop 12, Electronics Market",
    locality: "Saddar",
    city: "Karachi",
    region: "Sindh",
    country: "PK",
    postalCode: "74400",
  },
  /** Fallback Google Maps embed when NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL is unset. */
  mapsQuery: "Electronics Market Saddar Karachi",
  hours: [
    { days: "Mon – Sat", time: "11:00 am – 9:00 pm" },
    { days: "Sunday", time: "2:00 pm – 8:00 pm" },
  ],
} as const;

export type NavItem = {
  key: string;
  href: (locale: Locale) => string;
};

/** Primary navigation, resolved per-locale at render time. */
export const NAV_ITEMS: NavItem[] = [
  { key: "home", href: (l) => `/${l}` },
  { key: "about", href: (l) => `/${l}/about` },
  { key: "services", href: (l) => `/${l}/services` },
  { key: "projects", href: (l) => `/${l}/projects` },
  { key: "blog", href: (l) => `/${l}/blog` },
  { key: "testimonials", href: (l) => `/${l}/testimonials` },
  { key: "contact", href: (l) => `/${l}/contact` },
];

export const FOOTER_LEGAL = [
  { key: "privacy", href: (l: Locale) => `/${l}/privacy` },
] as const;
