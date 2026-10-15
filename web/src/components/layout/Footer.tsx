import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { env, whatsappLink } from "@/lib/env";
import { SITE, FOOTER_LEGAL, type NavItem } from "@/lib/site";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { PublicSettings, ServiceListItem } from "@/lib/types";

type FooterProps = {
  locale: Locale;
  dict: Dictionary;
  settings: PublicSettings | null;
  services: ServiceListItem[];
};

export function Footer({ locale, dict, settings, services }: FooterProps) {
  const year = new Date().getFullYear();
  const email = settings?.contact_email || SITE.email;
  const phone = settings?.contact_phone || SITE.phoneDisplay;
  const street = settings?.address_street || SITE.address.street;
  const city = settings?.address_city || SITE.address.city;

  const socials = [
    { href: settings?.social_facebook || env.facebookUrl, icon: "facebook" as const },
    { href: settings?.social_instagram || env.instagramUrl, icon: "instagram" as const },
    { href: settings?.social_tiktok || env.tiktokUrl, icon: "tiktok" as const },
  ].filter((item) => item.href);

  return (
    <footer className="mt-20 bg-dark text-dark-foreground">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
              <Icon name="bolt" size={20} />
            </span>
            <span className="text-lg font-bold text-white">{SITE.name}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/70">{dict.footer.aboutText}</p>
          {socials.length > 0 ? (
            <div className="mt-5 flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary"
                  aria-label={social.icon}
                >
                  <Icon name={social.icon} size={18} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
            {dict.footer.quickLinks}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {(
              [
                { key: "about", href: () => `/${locale}/about` },
                { key: "services", href: () => `/${locale}/services` },
                { key: "projects", href: () => `/${locale}/projects` },
                { key: "blog", href: () => `/${locale}/blog` },
                { key: "contact", href: () => `/${locale}/contact` },
              ] as NavItem[]
            ).map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href(locale)}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {dict.nav[item.key as keyof Dictionary["nav"]]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
            {dict.footer.servicesTitle}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {services.length === 0 ? (
              <li className="text-white/50">{dict.common.noResults}</li>
            ) : (
              services.slice(0, 5).map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/${locale}/services/${service.slug}`}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {service.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
            {dict.footer.contactTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <Icon name="map-pin" size={18} className="mt-0.5 shrink-0 text-primary" />
              <span>
                {street}, {city}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="phone" size={18} className="shrink-0 text-primary" />
              <a href={SITE.phoneHref} className="transition-colors hover:text-white">
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="mail" size={18} className="shrink-0 text-primary" />
              <a href={`mailto:${email}`} className="transition-colors hover:text-white">
                {email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="whatsapp" size={18} className="mt-0.5 shrink-0 text-primary" />
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {dict.common.chatOnWhatsApp}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <p>
            © {year} {SITE.legalName}. {dict.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            {FOOTER_LEGAL.map((item) => (
              <Link
                key={item.key}
                href={item.href(locale)}
                className="transition-colors hover:text-white"
              >
                {dict.privacy.title}
              </Link>
            ))}
            <span>{dict.footer.madeIn}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
