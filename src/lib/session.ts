/**
 * Sesi berbasis httpOnly cookie (server only).
 *
 *  - cinemax_token : JWT dari backend. httpOnly, tidak terbaca oleh JavaScript browser.
 *  - cinemax_user  : data tampilan user (backend tidak punya endpoint /me, jadi
 *                    email disimpan di sini dari respons login/register).
 *
 * Token tidak pernah dikirim ke browser sebagai body respons.
 */
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { TOKEN_COOKIE, USER_COOKIE } from "./config";
import { decodeJwt, isExpired } from "./jwt";
import type { User } from "@/types/api";

export interface Session {
  user: User;
  token: string;
  /** ms epoch */
  expiresAt: number;
}

function parseUser(raw: string | undefined): User | null {
  if (!raw) return null;
  for (const candidate of [raw, safeDecode(raw)]) {
    try {
      const u = JSON.parse(candidate) as User;
      if (u && typeof u.id === "string" && typeof u.email === "string" && u.role) return u;
    } catch {
      /* coba kandidat berikutnya */
    }
  }
  return null;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  const payload = decodeJwt(token);
  if (!token || !payload || isExpired(payload)) return null;

  const user = parseUser(store.get(USER_COOKIE)?.value);
  if (!user || user.id !== payload.sub) return null;

  // Role dari token (sumber yang sama dengan yang dipakai backend) menang atas cookie user.
  return { user: { ...user, role: payload.role }, token, expiresAt: payload.exp * 1000 };
}

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/**
 * @param remember true: cookie bertahan sampai token kedaluwarsa (7 hari dari backend).
 *                 false: cookie sesi, hilang saat browser ditutup.
 */
export function setSessionCookies(
  res: NextResponse,
  token: string,
  user: User,
  remember: boolean
) {
  const payload = decodeJwt(token);
  const maxAge =
    remember && payload ? Math.max(Math.floor(payload.exp - Date.now() / 1000), 0) : undefined;

  res.cookies.set(TOKEN_COOKIE, token, { ...baseCookie, maxAge });
  res.cookies.set(USER_COOKIE, JSON.stringify(user), { ...baseCookie, maxAge });
}

export function clearSessionCookies(res: NextResponse) {
  res.cookies.set(TOKEN_COOKIE, "", { ...baseCookie, maxAge: 0 });
  res.cookies.set(USER_COOKIE, "", { ...baseCookie, maxAge: 0 });
}
