import { env } from "@/lib/env";
import type {
  AiDraftResult,
  AiMode,
  AuthResponse,
  DashboardStats,
  InquiryCreate,
  InquiryCreated,
  InquiryRead,
  Page,
  ResourceRecord,
  UploadResult,
  User,
} from "@/lib/types";

const CLIENT_BASE = env.apiBaseUrl.replace(/\/$/, "");

const CSRF_COOKIE = "gv_csrf";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Read the double-submit CSRF token from its (non-httpOnly) cookie. */
function csrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return value ? decodeURIComponent(value) : null;
}

/** CSRF header for state-changing requests, or an empty object for safe ones. */
function csrfHeaders(method: string): Record<string, string> {
  if (SAFE_METHODS.has(method.toUpperCase())) return {};
  const token = csrfToken();
  return token ? { [CSRF_HEADER]: token } : {};
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Turn a FastAPI error body (string or validation array) into a message. */
function extractDetail(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method ?? "GET";
  const res = await fetch(`${CLIENT_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...csrfHeaders(method),
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as T;

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(extractDetail(body, "Request failed"), res.status);
  }
  return body as T;
}

export function submitInquiry(payload: InquiryCreate): Promise<InquiryCreated> {
  return request<InquiryCreated>("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  fullName: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name: fullName, email, password }),
  });
}

export function logout(): Promise<{ detail: string }> {
  return request<{ detail: string }>("/auth/logout", { method: "POST" });
}

export function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me");
}

// --- Admin: dashboard & generic resource helpers ---------------------------

export function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/admin/stats");
}

export function listResource(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
): Promise<Page<ResourceRecord>> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return request<Page<ResourceRecord>>(`${endpoint}${query ? `?${query}` : ""}`);
}

export function createResource(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<ResourceRecord> {
  return request<ResourceRecord>(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateResource(
  endpoint: string,
  id: number,
  payload: Record<string, unknown>,
): Promise<ResourceRecord> {
  return request<ResourceRecord>(`${endpoint}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteResource(endpoint: string, id: number): Promise<void> {
  return request<void>(`${endpoint}/${id}`, { method: "DELETE" });
}

export function setPublished(
  endpoint: string,
  id: number,
  isPublished: boolean,
): Promise<ResourceRecord> {
  return request<ResourceRecord>(`${endpoint}/${id}/publish`, {
    method: "PATCH",
    body: JSON.stringify({ is_published: isPublished }),
  });
}

// --- Admin: inquiries ------------------------------------------------------

export function listInquiries(
  params: { page?: number; page_size?: number; q?: string; status?: string } = {},
): Promise<Page<InquiryRead>> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return request<Page<InquiryRead>>(`/admin/inquiries${query ? `?${query}` : ""}`);
}

export function updateInquiryStatus(id: number, status: string): Promise<InquiryRead> {
  return request<InquiryRead>(`/admin/inquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteInquiry(id: number): Promise<void> {
  return request<void>(`/admin/inquiries/${id}`, { method: "DELETE" });
}

// --- Admin: settings -------------------------------------------------------

export function getAdminSettings(): Promise<Record<string, string>> {
  return request<Record<string, string>>("/admin/settings");
}

export function saveAdminSettings(items: { key: string; value: string }[]): Promise<
  Record<string, string>
> {
  return request<Record<string, string>>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

// --- Admin: uploads --------------------------------------------------------

export async function uploadImage(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${CLIENT_BASE}/admin/uploads`, {
    method: "POST",
    credentials: "include",
    body: form,
    headers: { Accept: "application/json", ...csrfHeaders("POST") },
  });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(extractDetail(body, "Upload failed"), res.status);
  }
  return body as UploadResult;
}

// --- Admin: AI helper (flagged off on the API until ENABLE_AI=true) --------

export function aiDraft(mode: AiMode, title: string, context: string): Promise<AiDraftResult> {
  return request<AiDraftResult>("/admin/ai/draft", {
    method: "POST",
    body: JSON.stringify({ mode, title, context: context || null }),
  });
}
