import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "ur"];
const DEFAULT_LOCALE = "en";

const FILE_EXTENSION = /\.[^/]+$/;

const CSRF_COOKIE = "gv_csrf";
const HSTS = "max-age=63072000; includeSubDomains; preload";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "form-action 'self'",
].join("; ");

function isSecure(request: NextRequest): boolean {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

/** Attach security headers and bootstrap the CSRF cookie when missing. */
function harden(request: NextRequest, response: NextResponse): NextResponse {
  const secure = isSecure(request);

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  if (secure) {
    response.headers.set("Strict-Transport-Security", HSTS);
  }
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  }

  if (!request.cookies.get(CSRF_COOKIE)) {
    response.cookies.set(CSRF_COOKIE, crypto.randomUUID(), {
      httpOnly: false,
      sameSite: "lax",
      secure,
      path: "/",
    });
  }

  return response;
}

/**
 * Redirect locale-less paths to the default locale and keep machine routes
 * (API, static assets, special files) untouched. Admin/auth guards are layered
 * on top of this in a later phase.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLocalePath = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (isLocalePath) return harden(request, NextResponse.next());

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    FILE_EXTENSION.test(pathname)
  ) {
    return harden(request, NextResponse.next());
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return harden(request, NextResponse.redirect(url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
