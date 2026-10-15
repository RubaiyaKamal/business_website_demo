import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getPublicSettings, getServices } from "@/lib/api";
import { env } from "@/lib/env";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { buildNavLinks } from "@/lib/nav";
import { SITE } from "@/lib/site";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  const [settings, services] = await Promise.all([
    getPublicSettings(),
    getServices(1, 5),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main">
        {dict.nav.home}
      </a>
      <Header
        locale={locale}
        brandName={SITE.name}
        nav={buildNavLinks(locale, dict)}
        labels={{
          openMenu: dict.nav.openMenu,
          closeMenu: dict.nav.closeMenu,
          toggleLanguage: dict.nav.toggleLanguage,
          login: dict.nav.login,
          register: dict.nav.register,
        }}
        enableUserAuth={env.enableUserAuth}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} dict={dict} settings={settings} services={services.items} />
      <WhatsAppButton settings={settings} label={dict.common.chatOnWhatsApp} />
    </div>
  );
}
