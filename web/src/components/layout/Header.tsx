"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n";
import { localeNames, locales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type NavLink = { key: string; label: string; href: string };

type HeaderProps = {
  locale: Locale;
  brandName: string;
  nav: NavLink[];
  labels: {
    openMenu: string;
    closeMenu: string;
    toggleLanguage: string;
    login: string;
    register: string;
  };
  enableUserAuth: boolean;
};

export function Header({ locale, brandName, nav, labels, enableUserAuth }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const otherLocale = locales.find((item) => item !== locale) ?? locale;
  const restPath = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");
  const localeHref = `/${otherLocale}${restPath}` || `/${otherLocale}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2" aria-label={brandName}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
            <Icon name="bolt" size={20} />
          </span>
          <span className="text-lg font-bold text-dark">{brandName}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary-50 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-dark",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={localeHref}
            className="btn-ghost px-3"
            title={labels.toggleLanguage}
            aria-label={labels.toggleLanguage}
          >
            <Icon name="globe" size={18} />
            <span className="hidden text-sm sm:inline">{localeNames[otherLocale]}</span>
          </Link>

          {enableUserAuth ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href={`/${locale}/login`} className="btn-ghost px-3">
                {labels.login}
              </Link>
              <Link href={`/${locale}/register`} className="btn-primary">
                {labels.register}
              </Link>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="btn-ghost px-3 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? labels.closeMenu : labels.openMenu}
          >
            <Icon name={open ? "x" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-slate-200 bg-white lg:hidden"
          aria-label="Mobile"
        >
          <div className="container-page grid gap-1 py-3">
            {nav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(item.href) ? "bg-primary-50 text-primary" : "text-slate-700",
                )}
              >
                {item.label}
              </Link>
            ))}
            {enableUserAuth ? (
              <div className="mt-2 flex gap-2">
                <Link href={`/${locale}/login`} className="btn-outline flex-1">
                  {labels.login}
                </Link>
                <Link href={`/${locale}/register`} className="btn-primary flex-1">
                  {labels.register}
                </Link>
              </div>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
