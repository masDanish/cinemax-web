/** URL backend. Hanya dipakai di sisi server frontend. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** Prefix route handler frontend yang meneruskan request ke backend. */
export const PROXY_PREFIX = "/api/proxy";

/** Route handler frontend untuk sesi (login, register, logout, session). */
export const BFF_PREFIX = "/api";

export const TOKEN_COOKIE = "cinemax_token";
export const USER_COOKIE = "cinemax_user";
