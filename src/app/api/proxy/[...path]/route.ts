/**
 * Backend-for-frontend proxy: browser -> /api/proxy/* -> backend /api/*.
 *
 *  - Menempelkan `Authorization: Bearer <token>` dari httpOnly cookie, jadi JWT
 *    tidak pernah tersentuh JavaScript browser.
 *  - Menghindari CORS (backend tidak mengatur header CORS sama sekali).
 *  - Hanya meneruskan endpoint yang memang dipakai frontend (allowlist); auth
 *    ditangani /api/auth/*, dan webhook Stripe tidak boleh lewat sini.
 */
import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL, TOKEN_COOKIE } from "@/lib/config";
import {
  backendUnreachable,
  clearSessionCookies,
  errorResponse,
  isSameOrigin,
} from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

const ALLOWED_ROOTS = new Set([
  "movies",
  "showtimes",
  "theaters",
  "reservations",
  "payments",
  "reports",
]);

/** Di dalam `payments` hanya checkout yang boleh. */
function isAllowed(segments: string[]): boolean {
  if (segments.length === 0 || !ALLOWED_ROOTS.has(segments[0])) return false;
  if (segments.some((s) => s === "" || s === "." || s === ".." || /[\\/]/.test(s))) return false;
  if (segments[0] === "payments") return segments.length === 2 && segments[1] === "checkout";
  return true;
}

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { path } = await params;
  if (!isAllowed(path)) return errorResponse(404, "NOT_FOUND", "Endpoint tidak ditemukan");

  const method = req.method;
  const mutating = method !== "GET" && method !== "HEAD";
  if (mutating && !isSameOrigin(req)) {
    return errorResponse(403, "FORBIDDEN", "Origin tidak diizinkan");
  }

  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: string | undefined;
  if (mutating) {
    body = await req.text();
    if (body) headers["Content-Type"] = req.headers.get("content-type") ?? "application/json";
  }

  const url = `${API_BASE_URL}/api/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, { method, headers, body: body || undefined, cache: "no-store" });
  } catch {
    return backendUnreachable();
  }

  const response =
    upstream.status === 204
      ? new NextResponse(null, { status: 204 })
      : new NextResponse(await upstream.text(), {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "application/json",
            "Cache-Control": "no-store",
          },
        });

  // Token ditolak backend (kedaluwarsa / tidak valid): bersihkan cookie agar UI konsisten.
  if (upstream.status === 401 && token) clearSessionCookies(response);

  return response;
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
