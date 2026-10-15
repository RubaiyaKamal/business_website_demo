import { getDictionary, isLocale, defaultLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import Link from "next/link";

type NotFoundProps = {
  params?: Promise<{ locale?: string }>;
};

export default async function NotFound({ params }: NotFoundProps) {
  const resolved = await params;
  const locale = resolved && isLocale(resolved.locale) ? resolved.locale : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <main className="container-page flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-3xl">{dict.notFound.title}</h1>
      <p className="mt-3 max-w-md text-slate-600">{dict.notFound.message}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/${locale}`} className="btn-primary">
          {dict.notFound.homeButton}
        </Link>
        <Link href={`/${locale}/contact`} className="btn-outline">
          {dict.notFound.contactButton}
        </Link>
      </div>
      <p className="mt-12 text-xs text-slate-400">{SITE.name}</p>
    </main>
  );
}
