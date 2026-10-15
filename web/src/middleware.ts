import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "ur"];
const DEFAULT_LOCALE = "en";

const FILE_EXTENSION = /\.[^/]+$/;

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
  if (isLocalePath) return NextResponse.next();

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    FILE_EXTENSION.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
