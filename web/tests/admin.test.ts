import { describe, expect, it } from "vitest";
import {
  RESOURCES,
  adminLabels,
  adminNav,
  allFields,
  buildPayload,
  defaultFormValue,
  recordToForm,
} from "@/lib/admin";
import type { ResourceRecord } from "@/lib/types";

describe("adminLabels", () => {
  it("returns English labels for en and falls back for unknown locales", () => {
    expect(adminLabels("en").dashboard).toBe("Dashboard");
    expect(adminLabels("fr").dashboard).toBe("Dashboard");
  });

  it("returns Urdu labels for ur", () => {
    expect(adminLabels("ur").dashboard).toBe("ڈیش بورڈ");
  });
});

describe("adminNav", () => {
  it("builds locale-prefixed admin links", () => {
    const nav = adminNav("en");
    expect(nav[0]?.href).toBe("/en/admin");
    expect(nav.some((item) => item.href === "/en/admin/settings")).toBe(true);
  });
});

describe("RESOURCES", () => {
  it("uses admin endpoints for every resource", () => {
    for (const resource of Object.values(RESOURCES)) {
      expect(resource.endpoint.startsWith("/admin/")).toBe(true);
      expect(resource.fields.length).toBeGreaterThan(0);
      expect(resource.columns.length).toBeGreaterThan(0);
    }
  });
});

describe("allFields", () => {
  it("appends a slug field when the resource supports slugs", () => {
    const fields = allFields(RESOURCES.services);
    expect(fields.some((field) => field.name === "slug")).toBe(true);
  });

  it("omits the slug field for testimonials", () => {
    const fields = allFields(RESOURCES.testimonials);
    expect(fields.some((field) => field.name === "slug")).toBe(false);
  });
});

describe("defaultFormValue", () => {
  it("defaults blog posts to draft and other resources to published", () => {
    const publish = RESOURCES.blog.fields.find((field) => field.name === "is_published")!;
    expect(defaultFormValue(publish, RESOURCES.blog)).toBe(false);
    expect(defaultFormValue(publish, RESOURCES.services)).toBe(true);
  });
});

describe("recordToForm", () => {
  it("joins list fields and trims dates", () => {
    const record = {
      id: 1,
      tags: ["news", "tips"],
      completed_at: "2024-05-01T00:00:00",
      title: "Hello",
    } as unknown as ResourceRecord;
    const values = recordToForm(record, [
      { name: "tags", label: "Tags", type: "list" },
      { name: "completed_at", label: "Date", type: "date" },
      { name: "title", label: "Title", type: "text" },
    ]);
    expect(values.tags).toBe("news\ntips");
    expect(values.completed_at).toBe("2024-05-01");
    expect(values.title).toBe("Hello");
  });
});

describe("buildPayload", () => {
  it("coerces numbers, splits lists and nulls empty optionals", () => {
    const payload = buildPayload(
      { price_from: "", tags: "a\n\n b ", is_published: true, title: "Hi" },
      [
        { name: "price_from", label: "Price", type: "number" },
        { name: "tags", label: "Tags", type: "list" },
        { name: "is_published", label: "Published", type: "checkbox" },
        { name: "title", label: "Title", type: "text" },
      ],
    );
    expect(payload.price_from).toBeNull();
    expect(payload.tags).toEqual(["a", "b"]);
    expect(payload.is_published).toBe(true);
    expect(payload.title).toBe("Hi");
  });
});
