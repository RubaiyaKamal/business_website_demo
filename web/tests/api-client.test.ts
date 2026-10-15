import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  aiDraft,
  getCurrentUser,
  submitInquiry,
  ApiError,
} from "@/lib/api-client";

const fetchMock = vi.fn();

function respond(body: unknown, ok = true, status = 200): Promise<Response> {
  return Promise.resolve({ ok, status, json: async () => body } as Response);
}

function urlOf(index: number): unknown {
  return fetchMock.mock.calls[index]?.[0];
}

function initOf(index: number): RequestInit {
  return (fetchMock.mock.calls[index]?.[1] ?? {}) as RequestInit;
}

function headersOf(index: number): Record<string, string> {
  return (initOf(index).headers ?? {}) as Record<string, string>;
}

function bodyOf(index: number): Record<string, unknown> {
  return JSON.parse(String(initOf(index).body));
}

function clearCookies() {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  clearCookies();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api-client CSRF handling", () => {
  it("omits the CSRF header on safe GET requests", async () => {
    document.cookie = "gv_csrf=tok123";
    fetchMock.mockReturnValue(
      respond({
        id: 1,
        email: "a@b.c",
        full_name: "A",
        role: "admin",
        is_active: true,
        created_at: "",
      }),
    );

    await getCurrentUser();

    expect(urlOf(0)).toBe("/api/v1/auth/me");
    expect(headersOf(0)["x-csrf-token"]).toBeUndefined();
  });

  it("attaches the CSRF cookie to state-changing requests", async () => {
    document.cookie = "gv_csrf=tok123";
    fetchMock.mockReturnValue(respond({ detail: "ok", id: 5 }));

    await submitInquiry({ name: "Sara", email: "s@b.c", subject: "Hi", message: "Hello" });

    expect(headersOf(0)["x-csrf-token"]).toBe("tok123");
    expect(bodyOf(0)).toMatchObject({ name: "Sara", subject: "Hi" });
  });
});

describe("aiDraft", () => {
  it("posts the mode, title and context to the admin AI endpoint", async () => {
    fetchMock.mockReturnValue(respond({ text: "Drafted body.", mode: "draft" }));

    const result = await aiDraft("draft", "Best laptops", "some notes");

    expect(urlOf(0)).toBe("/api/v1/admin/ai/draft");
    expect(initOf(0).method).toBe("POST");
    expect(bodyOf(0)).toEqual({
      mode: "draft",
      title: "Best laptops",
      context: "some notes",
    });
    expect(result).toEqual({ text: "Drafted body.", mode: "draft" });
  });

  it("sends a null context when the editor has none", async () => {
    fetchMock.mockReturnValue(respond({ text: "x", mode: "meta" }));

    await aiDraft("meta", "Title", "");

    expect(bodyOf(0).context).toBeNull();
  });

  it("surfaces the API error message and status", async () => {
    fetchMock.mockReturnValue(respond({ detail: "AI helper is disabled" }, false, 404));

    await expect(aiDraft("draft", "Title", "")).rejects.toBeInstanceOf(ApiError);
    await expect(aiDraft("draft", "Title", "")).rejects.toThrow("AI helper is disabled");
  });

  it("extracts the first validation message from a detail array", async () => {
    fetchMock.mockReturnValue(
      respond({ detail: [{ msg: "Title must not be empty" }] }, false, 422),
    );

    await expect(aiDraft("draft", "", "")).rejects.toThrow("Title must not be empty");
  });
});
