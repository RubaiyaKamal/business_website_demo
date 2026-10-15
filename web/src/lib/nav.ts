import type { NavLink } from "@/components/layout/Header";
import type { Dictionary, Locale } from "@/lib/i18n";
import { NAV_ITEMS } from "@/lib/site";

/** Resolve NAV_ITEMS into labeled, locale-aware links for the header. */
export function buildNavLinks(locale: Locale, dict: Dictionary): NavLink[] {
  return NAV_ITEMS.map((item) => ({
    key: item.key,
    label: dict.nav[item.key as keyof Dictionary["nav"]],
    href: item.href(locale),
  }));
}
