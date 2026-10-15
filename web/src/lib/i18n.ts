import type en from "@/dictionaries/en.json";
import enDict from "@/dictionaries/en.json";
import urDict from "@/dictionaries/ur.json";

export const locales = ["en", "ur"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export type Dictionary = typeof en;

export const localeNames: Record<Locale, string> = {
  en: "English",
  ur: "اردو",
};

const dictionaries: Record<Locale, Dictionary> = {
  en: enDict,
  ur: urDict as Dictionary,
};

/** Type guard that narrows an arbitrary string to a supported Locale. */
export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Resolve a locale from a route param, falling back to the default. */
export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** Get the synchronous dictionary for a locale. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Text direction for a locale. */
export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ur" ? "rtl" : "ltr";
}

/**
 * Interpolate `{token}` placeholders in a dictionary string, e.g.
 * `interpolate("Page {page} of {total}", { page: 1, total: 3 })`.
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
