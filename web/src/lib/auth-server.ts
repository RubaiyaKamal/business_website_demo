import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SITE } from "@/lib/site";
import type { User } from "@/lib/types";

const SERVER_BASE = (
  process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const COOKIE_NAME = "gv_access";

/** Fetch the signed-in user on the server, forwarding the auth cookie. */
export async function fetchCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${SERVER_BASE}/auth/me`, {
      headers: { cookie: `${COOKIE_NAME}=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch {
    return null;
  }
}

/**
 * Guard an admin route: redirect to login when unauthenticated and to the home
 * page when the user is not an administrator. Returns the admin user otherwise.
 */
export async function requireAdmin(locale: string): Promise<User> {
  const user = await fetchCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== "admin") redirect(`/${locale}`);
  return user;
}

export { SITE };
