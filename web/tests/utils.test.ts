import { describe, expect, it } from "vitest";
import { cn, readingTime, slugify, truncate } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});

describe("slugify", () => {
  it("creates URL-safe slugs", () => {
    expect(slugify("Mobile & Laptop Repair!")).toBe("mobile-laptop-repair");
    expect(slugify("  Home   Delivery  ")).toBe("home-delivery");
  });
});

describe("readingTime", () => {
  it("returns at least one minute", () => {
    expect(readingTime("short text")).toBe(1);
  });

  it("scales with word count", () => {
    const words = Array.from({ length: 600 }, () => "word").join(" ");
    expect(readingTime(words)).toBe(3);
  });
});

describe("truncate", () => {
  it("shortens long text on a word boundary", () => {
    const result = truncate("The quick brown fox jumps over the lazy dog", 20);
    expect(result.length).toBeLessThanOrEqual(21);
    expect(result.endsWith("…")).toBe(true);
  });

  it("leaves short text untouched", () => {
    expect(truncate("short", 20)).toBe("short");
  });
});
