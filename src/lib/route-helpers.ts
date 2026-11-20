/** Helper untuk route handler frontend (BFF). Server only. */
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "./config";
import type { ApiErrorBody, ApiErrorDetail, BackendAuthResponse, User } from "@/types/api";
import { clearSessionCookies, setSessionCookies } from "./session";

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: ApiErrorDetail[]
) {
  const body: ApiErrorBody = { error: { code, message, ...(details ? { details } : {}) } };
  return NextResponse.json(body, { status });
}

/**
 * Perlindungan CSRF tambahan di atas cookie SameSite=Lax: request yang mengubah
 * data harus berasal dari host yang sama dengan frontend.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // request non-browser / same-origin tanpa header Origin
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function readJson(req: NextRequest): Promise<unknown | undefined> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

export function backendUnreachable() {
  return errorResponse(
    502,
    "BACKEND_UNREACHABLE",
    "Server backend tidak dapat dihubungi. Pastikan backend berjalan."
  );
}

/**
 * Login/register: kirim kredensial ke backend, simpan JWT di httpOnly cookie,
 * dan kembalikan hanya data user ke browser.
 */
export async function authenticate(
  endpoint: "/api/auth/login" | "/api/auth/register",
  credentials: { email: string; password: string },
  remember: boolean
): Promise<NextResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });
  } catch {
    return backendUnreachable();
  }

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    // Teruskan error backend apa adanya (code + message + details).
    return NextResponse.json(
      payload ?? { error: { code: `HTTP_${res.status}`, message: "Permintaan gagal" } },
      { status: res.status }
    );
  }

  const { user, token } = payload as BackendAuthResponse;
  const response = NextResponse.json<{ user: User }>({ user });
  setSessionCookies(response, token, user, remember);
  return response;
}

export { clearSessionCookies };
