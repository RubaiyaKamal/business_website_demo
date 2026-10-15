import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { env } from "@/lib/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return { title: getDictionary(locale).auth.registerTitle, robots: { index: false } };
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);

  if (!env.enableUserAuth) {
    return (
      <div className="card w-full max-w-md p-8 text-center">
        <h1 className="text-2xl">{dict.auth.registerTitle}</h1>
        <p className="mt-3 text-sm text-slate-600">{dict.auth.disabled}</p>
        <Link href={`/${locale}/login`} className="btn-primary mt-6">
          {dict.auth.loginButton}
        </Link>
      </div>
    );
  }

  return <AuthForm mode="register" locale={locale} labels={dict.auth} />;
}
