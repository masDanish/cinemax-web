/**
 * Next.js 16 "proxy" (pengganti middleware.ts): pengaman optimistis untuk route.
 *
 * Hanya memeriksa keberadaan + masa berlaku + role di cookie token supaya
 * pengguna tidak melihat halaman yang pasti akan ditolak. JWT tidak diverifikasi
 * di sini (frontend tidak memegang JWT_SECRET). Otorisasi sebenarnya tetap di
 * backend: setiap request API memeriksa token dan role (401/403).
 */
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_PREFIX, PROTECTED_PREFIXES } from "@/lib/constants";
import { TOKEN_COOKIE } from "@/lib/config";
import { decodeJwt, isExpired } from "@/lib/jwt";

const matches = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const payload = decodeJwt(req.cookies.get(TOKEN_COOKIE)?.value);
  const loggedIn = payload !== null && !isExpired(payload);

  // Sudah login: tidak perlu halaman login/register.
  if (loggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const isAdminRoute = matches(pathname, ADMIN_PREFIX);
  const isProtected = isAdminRoute || PROTECTED_PREFIXES.some((p) => matches(pathname, p));

  if (isProtected && !loggedIn) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(url);
    if (req.cookies.has(TOKEN_COOKIE)) res.cookies.delete(TOKEN_COOKIE); // token kedaluwarsa
    return res;
  }

  if (isAdminRoute && payload?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/?forbidden=1", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/booking/:path*",
    "/my-tickets/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/payment/:path*",
    "/admin/:path*",
  ],
};
