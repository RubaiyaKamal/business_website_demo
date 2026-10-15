import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

const SECTION_KEYS = ["intro", "collect", "use", "cookies", "contact"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  return { title: dict.privacy.title, description: dict.privacy.subtitle };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);

  return (
    <>
      <PageHero title={dict.privacy.title} subtitle={dict.privacy.subtitle} />
      <section className="container-page max-w-3xl py-16">
        <p className="text-sm text-slate-500">
          {dict.privacy.lastUpdated}: {new Date().getFullYear()} · {SITE.legalName}
        </p>
        <div className="prose-content mt-8 space-y-8">
          {SECTION_KEYS.map((key) => (
            <div key={key}>
              <h2>{dict.privacy.sections[`${key}Title` as keyof typeof dict.privacy.sections]}</h2>
              <p>{dict.privacy.sections[`${key}Text` as keyof typeof dict.privacy.sections]}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
