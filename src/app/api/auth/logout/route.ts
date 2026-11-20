import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookies, errorResponse, isSameOrigin } from "@/lib/route-helpers";
import type { SessionResponse } from "@/types/api";

/**
 * Backend memakai JWT stateless dan tidak punya endpoint logout / revoke.
 * Logout = menghapus cookie di frontend. Token lama tetap valid sampai
 * kedaluwarsa (7 hari) jika pernah disalin, sebuah keterbatasan backend.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return errorResponse(403, "FORBIDDEN", "Origin tidak diizinkan");
  const res = NextResponse.json<SessionResponse>({ user: null });
  clearSessionCookies(res);
  return res;
}
