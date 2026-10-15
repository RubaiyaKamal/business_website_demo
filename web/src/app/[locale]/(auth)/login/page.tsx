import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { getDictionary, resolveLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return { title: getDictionary(locale).auth.loginTitle, robots: { index: false } };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  return <AuthForm mode="login" locale={locale} labels={dict.auth} />;
}
