import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n";

/** Merge conditional class names, de-duplicating conflicting Tailwind classes. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Estimate reading time (minutes) from a plain-text or HTML body. */
export function readingTime(text: string): number {
  const words = text
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Format a date for display; returns an empty string for invalid input. */
export function formatDate(value: string | Date | null | undefined, locale = "en-PK"): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Build a URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Truncate text to a maximum length on a word boundary. */
export function truncate(input: string, max = 160): string {
  const clean = input.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/** Absolute URL helper for canonical links and JSON-LD. */
export function absoluteUrl(path: string, base?: string): string {
  const root = (base ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${root}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Pick the Urdu translation for the `ur` locale, falling back to English. */
export function localized(locale: Locale, en: string, ur?: string | null): string {
  return locale === "ur" && ur ? ur : en;
}

/** Format a numeric price as Pakistani Rupees, locale-aware. */
export function formatPrice(value: number | null | undefined, locale: Locale = "en"): string {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}
