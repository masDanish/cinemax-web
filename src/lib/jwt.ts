import type { Role } from "@/types/api";

export interface JwtPayload {
  sub: string;
  role: Role;
  /** Detik sejak epoch. */
  exp: number;
  iat?: number;
}

/**
 * Hanya MEMBACA payload JWT (tanpa verifikasi tanda tangan).
 * Frontend tidak (dan tidak boleh) memegang JWT_SECRET. Hasilnya cuma dipakai
 * untuk UX (redirect cepat, tampilan menu). Keamanan sebenarnya tetap ada di
 * backend: token palsu akan ditolak 401/403 pada setiap request API.
 */
export function decodeJwt(token: string | undefined | null): JwtPayload | null {
  if (!token) return null;
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    if (
      typeof payload.sub !== "string" ||
      typeof payload.exp !== "number" ||
      (payload.role !== "USER" && payload.role !== "ADMIN")
    ) {
      return null;
    }
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload, skewSeconds = 10): boolean {
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
