import { getDictionary, resolveLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);

  return (
    <main className="container-page py-24">
      <p className="font-semibold uppercase tracking-wide text-primary">{SITE.tagline}</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">{dict.home.heroTitle}</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600">{dict.home.heroSubtitle}</p>
    </main>
  );
}
