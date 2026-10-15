import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { env } from "@/lib/env";
import { SITE } from "@/lib/site";
import {
  defaultLocale,
  getDictionary,
  getDirection,
  isLocale,
  locales,
  type Locale,
} from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-urdu",
  display: "swap",
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: "#1E8E3E",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams(): { locale: Locale }[] {
  return locales.map((locale) => ({ locale }));
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale);
  return {
    metadataBase: new URL(env.siteUrl),
    title: {
      default: `${SITE.name} — ${dict.meta.tagline}`,
      template: `%s | ${SITE.name}`,
    },
    description: dict.meta.defaultDescription,
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/favicon.svg" }],
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: locale === "ur" ? "ur_PK" : "en_PK",
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${urdu.variable}`}>
      <body>{children}</body>
    </html>
  );
}
