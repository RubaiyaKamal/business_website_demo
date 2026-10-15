/** Admin dashboard configuration: labels, navigation and resource field maps. */

import type { ResourceRecord } from "@/lib/types";

export type AdminNavItem = {
  href: string;
  labelKey: keyof AdminLabels;
  icon: string;
};

export type AdminLabels = {
  adminTitle: string;
  dashboard: string;
  services: string;
  projects: string;
  blog: string;
  testimonials: string;
  inquiries: string;
  settings: string;
  viewSite: string;
  logout: string;
  signedInAs: string;
  // common
  create: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  saving: string;
  confirmDelete: string;
  loading: string;
  empty: string;
  error: string;
  retry: string;
  search: string;
  status: string;
  all: string;
  actions: string;
  published: string;
  draft: string;
  publish: string;
  unpublish: string;
  yes: string;
  no: string;
  id: string;
  close: string;
  of: string;
  page: string;
  // dashboard
  welcome: string;
  totalServices: string;
  totalProjects: string;
  totalPosts: string;
  totalTestimonials: string;
  newInquiries: string;
  totalInquiries: string;
  recentInquiries: string;
  noInquiries: string;
  // uploads
  uploadImage: string;
  uploading: string;
  removeImage: string;
  imageUrlPlaceholder: string;
  // inquiries
  markRead: string;
  markReplied: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  received: string;
  // settings
  settingsSaved: string;
  saveSettings: string;
  // auth-ish
  notAuthorized: string;
};

const EN: AdminLabels = {
  adminTitle: "Admin",
  dashboard: "Dashboard",
  services: "Services",
  projects: "Projects",
  blog: "Blog",
  testimonials: "Testimonials",
  inquiries: "Inquiries",
  settings: "Settings",
  viewSite: "View site",
  logout: "Log out",
  signedInAs: "Signed in as",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  save: "Save",
  cancel: "Cancel",
  saving: "Saving…",
  confirmDelete: "Delete this item? This cannot be undone.",
  loading: "Loading…",
  empty: "Nothing here yet.",
  error: "Something went wrong.",
  retry: "Retry",
  search: "Search",
  status: "Status",
  all: "All",
  actions: "Actions",
  published: "Published",
  draft: "Draft",
  publish: "Publish",
  unpublish: "Unpublish",
  yes: "Yes",
  no: "No",
  id: "ID",
  close: "Close",
  of: "of",
  page: "Page",
  welcome: "Welcome back",
  totalServices: "Services",
  totalProjects: "Projects",
  totalPosts: "Blog posts",
  totalTestimonials: "Testimonials",
  newInquiries: "New inquiries",
  totalInquiries: "Total inquiries",
  recentInquiries: "Recent inquiries",
  noInquiries: "No inquiries yet.",
  uploadImage: "Upload image",
  uploading: "Uploading…",
  removeImage: "Remove",
  imageUrlPlaceholder: "https://… or /media/…",
  markRead: "Mark read",
  markReplied: "Mark replied",
  email: "Email",
  phone: "Phone",
  subject: "Subject",
  message: "Message",
  received: "Received",
  settingsSaved: "Settings saved.",
  saveSettings: "Save settings",
  notAuthorized: "You do not have access to this area.",
};

const UR: AdminLabels = {
  ...EN,
  adminTitle: "ایڈمن",
  dashboard: "ڈیش بورڈ",
  services: "خدمات",
  projects: "منصوبے",
  blog: "بلاگ",
  testimonials: "تعریفیں",
  inquiries: "استفسارات",
  settings: "ترتیبات",
  viewSite: "سائٹ دیکھیں",
  logout: "لاگ آؤٹ",
  signedInAs: "لاگ ان بطور",
  create: "بنائیں",
  edit: "ترمیم",
  delete: "حذف کریں",
  save: "محفوظ کریں",
  cancel: "منسوخ",
  saving: "محفوظ ہو رہا ہے…",
  loading: "لوڈ ہو رہا ہے…",
  empty: "ابھی کچھ نہیں۔",
  search: "تلاش",
  status: "حالت",
  all: "سب",
  actions: "اقدامات",
  published: "شائع شدہ",
  draft: "ڈرافٹ",
  welcome: "خوش آمدید",
  settingsSaved: "ترتیبات محفوظ ہو گئیں۔",
  saveSettings: "ترتیبات محفوظ کریں",
};

const LABELS: Record<"en" | "ur", AdminLabels> = { en: EN, ur: UR };

export function adminLabels(locale: string): AdminLabels {
  return locale === "ur" ? LABELS.ur : LABELS.en;
}

export function adminNav(locale: string): AdminNavItem[] {
  const base = `/${locale}/admin`;
  return [
    { href: base, labelKey: "dashboard", icon: "layout" },
    { href: `${base}/services`, labelKey: "services", icon: "wrench" },
    { href: `${base}/projects`, labelKey: "projects", icon: "briefcase" },
    { href: `${base}/blog`, labelKey: "blog", icon: "newspaper" },
    { href: `${base}/testimonials`, labelKey: "testimonials", icon: "star" },
    { href: `${base}/inquiries`, labelKey: "inquiries", icon: "mail" },
    { href: `${base}/settings`, labelKey: "settings", icon: "settings" },
  ];
}

// --- Resource field definitions -------------------------------------------

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "list"
  | "image"
  | "date";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  full?: boolean;
  rows?: number;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
};

export type ColumnDef = {
  name: string;
  label: string;
  kind?: "text" | "image" | "bool" | "number";
};

export type ResourceDef = {
  titleKey: keyof AdminLabels;
  endpoint: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  hasSlug: boolean;
  hasPublish: boolean;
};

const SLUG_FIELD: FieldDef = { name: "slug", label: "Slug (optional)", type: "text" };

export const RESOURCES = {
  services: {
    titleKey: "services",
    endpoint: "/admin/services",
    hasSlug: true,
    hasPublish: true,
    fields: [
      { name: "title", label: "Title (EN)", type: "text", required: true },
      { name: "title_ur", label: "Title (UR)", type: "text" },
      { name: "summary", label: "Summary (EN)", type: "textarea", rows: 2, required: true, full: true },
      { name: "summary_ur", label: "Summary (UR)", type: "textarea", rows: 2, full: true },
      { name: "body", label: "Body (EN)", type: "textarea", rows: 6, full: true },
      { name: "body_ur", label: "Body (UR)", type: "textarea", rows: 6, full: true },
      { name: "icon", label: "Icon", type: "text", placeholder: "wrench" },
      { name: "price_from", label: "Price from (PKR)", type: "number" },
      { name: "image_url", label: "Image", type: "image", full: true },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "is_published", label: "Published", type: "checkbox" },
    ],
    columns: [
      { name: "image_url", label: "Image", kind: "image" },
      { name: "title", label: "Title" },
      { name: "price_from", label: "Price", kind: "number" },
      { name: "sort_order", label: "Order", kind: "number" },
      { name: "is_published", label: "Published", kind: "bool" },
    ],
  },
  projects: {
    titleKey: "projects",
    endpoint: "/admin/projects",
    hasSlug: true,
    hasPublish: true,
    fields: [
      { name: "title", label: "Title (EN)", type: "text", required: true },
      { name: "title_ur", label: "Title (UR)", type: "text" },
      { name: "client", label: "Client", type: "text" },
      { name: "summary", label: "Summary (EN)", type: "textarea", rows: 2, required: true, full: true },
      { name: "summary_ur", label: "Summary (UR)", type: "textarea", rows: 2, full: true },
      { name: "body", label: "Body (EN)", type: "textarea", rows: 6, full: true },
      { name: "body_ur", label: "Body (UR)", type: "textarea", rows: 6, full: true },
      { name: "completed_at", label: "Completed on", type: "date" },
      { name: "image_url", label: "Cover image", type: "image", full: true },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "is_published", label: "Published", type: "checkbox" },
    ],
    columns: [
      { name: "image_url", label: "Image", kind: "image" },
      { name: "title", label: "Title" },
      { name: "client", label: "Client" },
      { name: "completed_at", label: "Completed" },
      { name: "is_published", label: "Published", kind: "bool" },
    ],
  },
  blog: {
    titleKey: "blog",
    endpoint: "/admin/blog",
    hasSlug: true,
    hasPublish: true,
    fields: [
      { name: "title", label: "Title (EN)", type: "text", required: true },
      { name: "title_ur", label: "Title (UR)", type: "text" },
      { name: "category", label: "Category", type: "text", placeholder: "News" },
      {
        name: "tags",
        label: "Tags (one per line)",
        type: "list",
        full: true,
      },
      { name: "excerpt", label: "Excerpt (EN)", type: "textarea", rows: 2, required: true, full: true },
      { name: "excerpt_ur", label: "Excerpt (UR)", type: "textarea", rows: 2, full: true },
      { name: "body", label: "Body (EN)", type: "textarea", rows: 8, full: true },
      { name: "body_ur", label: "Body (UR)", type: "textarea", rows: 8, full: true },
      { name: "cover_image_url", label: "Cover image", type: "image", full: true },
      { name: "is_published", label: "Published", type: "checkbox" },
    ],
    columns: [
      { name: "cover_image_url", label: "Image", kind: "image" },
      { name: "title", label: "Title" },
      { name: "category", label: "Category" },
      { name: "published_at", label: "Published" },
      { name: "is_published", label: "Live", kind: "bool" },
    ],
  },
  testimonials: {
    titleKey: "testimonials",
    endpoint: "/admin/testimonials",
    hasSlug: false,
    hasPublish: true,
    fields: [
      { name: "name", label: "Customer name", type: "text", required: true },
      { name: "role", label: "Role / company", type: "text" },
      { name: "rating", label: "Rating (1-5)", type: "number" },
      { name: "avatar_url", label: "Avatar", type: "image" },
      { name: "message", label: "Message (EN)", type: "textarea", rows: 3, required: true, full: true },
      { name: "message_ur", label: "Message (UR)", type: "textarea", rows: 3, full: true },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "is_published", label: "Published", type: "checkbox" },
    ],
    columns: [
      { name: "name", label: "Name" },
      { name: "role", label: "Role" },
      { name: "rating", label: "Rating", kind: "number" },
      { name: "is_published", label: "Published", kind: "bool" },
    ],
  },
} satisfies Record<string, ResourceDef>;

export const BLOG_CATEGORIES = ["News", "Guides", "Tips", "Repairs", "Offers"];

// --- Pure form helpers (used by ResourceManager) ---------------------------

export function allFields(resource: ResourceDef): FieldDef[] {
  return resource.hasSlug ? [...resource.fields, SLUG_FIELD] : resource.fields;
}

export function defaultFormValue(field: FieldDef, resource: ResourceDef): unknown {
  if (field.type === "checkbox") {
    return field.name === "is_published" ? !resource.endpoint.includes("/blog") : false;
  }
  if (field.type === "number" && field.name === "rating") return "5";
  return "";
}

export function recordToForm(
  record: ResourceRecord,
  fields: FieldDef[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = record[field.name];
    if (field.type === "checkbox") values[field.name] = Boolean(raw);
    else if (field.type === "list") values[field.name] = Array.isArray(raw) ? raw.join("\n") : "";
    else if (field.type === "date") values[field.name] = raw ? String(raw).slice(0, 10) : "";
    else if (raw === null || raw === undefined) values[field.name] = "";
    else values[field.name] = String(raw);
  }
  return values;
}

export function buildPayload(
  values: Record<string, unknown>,
  fields: FieldDef[],
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = values[field.name];
    switch (field.type) {
      case "checkbox":
        payload[field.name] = Boolean(raw);
        break;
      case "number":
        payload[field.name] = raw === "" || raw === null || raw === undefined ? null : Number(raw);
        break;
      case "list":
        payload[field.name] = String(raw ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        break;
      case "date":
        payload[field.name] = raw ? String(raw) : null;
        break;
      default:
        payload[field.name] = typeof raw === "string" ? raw : "";
    }
  }
  return payload;
}
