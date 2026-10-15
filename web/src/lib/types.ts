/** Shared API response types (mirrors the FastAPI Pydantic schemas). */

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type ServiceListItem = {
  id: number;
  slug: string;
  title: string;
  title_ur: string | null;
  summary: string;
  summary_ur: string | null;
  icon: string | null;
  image_url: string | null;
  price_from: number | null;
};

export type ServiceRead = ServiceListItem & {
  body: string;
  body_ur: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectListItem = {
  id: number;
  slug: string;
  title: string;
  title_ur: string | null;
  summary: string;
  summary_ur: string | null;
  client: string | null;
  image_url: string | null;
  completed_at: string | null;
};

export type ProjectRead = ProjectListItem & {
  body: string;
  body_ur: string | null;
  gallery: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BlogPostListItem = {
  id: number;
  slug: string;
  title: string;
  title_ur: string | null;
  excerpt: string;
  excerpt_ur: string | null;
  cover_image_url: string | null;
  category: string;
  reading_time: number;
  published_at: string | null;
};

export type BlogPostRead = BlogPostListItem & {
  body: string;
  body_ur: string | null;
  tags: string[];
  author: { id: number; full_name: string } | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: number;
  name: string;
  role: string | null;
  message: string;
  message_ur: string | null;
  rating: number;
  avatar_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PublicSettings = {
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address_street: string;
  address_city: string;
  google_maps_embed_url: string;
  google_analytics_id: string;
  social_facebook: string;
  social_instagram: string;
  social_tiktok: string;
  shop_hours: string;
};

export type InquiryCreate = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  service_id?: number | null;
};

export type InquiryCreated = {
  detail: string;
  id: number;
};

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
};

export type AuthResponse = {
  user: User;
};

export type InquiryStatus = "new" | "read" | "replied";

export type InquiryRead = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  service_id: number | null;
  status: InquiryStatus;
  source: string;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  services: number;
  projects: number;
  blog_posts: number;
  testimonials: number;
  inquiries_total: number;
  inquiries_new: number;
  recent_inquiries: InquiryRead[];
};

export type UploadResult = {
  url: string;
  filename: string;
  size: number;
  content_type: string;
};

export type ResourceRecord = Record<string, unknown> & { id: number };

export type AiMode = "draft" | "meta";

export type AiDraftResult = {
  text: string;
  mode: AiMode;
};
