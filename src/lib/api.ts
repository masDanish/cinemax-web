/**
 * Centralized API client.
 *
 * Satu implementasi request() dipakai oleh semua service. Yang berbeda hanya
 * "transport" (ke mana request dikirim dan header apa yang dipasang):
 *
 *  - browserApi : browser -> /api/proxy/* (route handler frontend yang
 *                 menempelkan Authorization dari httpOnly cookie).
 *  - bffApi     : browser -> /api/* milik frontend (login, logout, session).
 *  - serverApi  : lihat api.server.ts (server components -> backend langsung).
 *
 * File ini aman diimpor dari client component (tidak memakai next/headers).
 */
import { BFF_PREFIX, PROXY_PREFIX } from "./config";
import { ApiError, fallbackMessage } from "./errors";
import type { ApiErrorBody } from "@/types/api";

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

export interface Target {
  url: string;
  headers?: Record<string, string>;
}

export type Transport = (path: string, query?: Query) => Promise<Target> | Target;

export interface RequestOptions {
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
  /** Diteruskan ke fetch (mis. next: { revalidate } di server). */
  init?: RequestInit;
}

export interface ApiClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
}

export function buildQueryString(query?: Query): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** Didaftarkan AuthProvider: dipanggil di browser saat backend membalas 401. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  const err = (payload as Partial<ApiErrorBody> | undefined)?.error;
  if (err && typeof err === "object" && typeof err.code === "string") {
    return new ApiError(status, err.code, err.message || fallbackMessage(status), err.details);
  }
  return new ApiError(status, `HTTP_${status}`, fallbackMessage(status));
}

export function createApiClient(transport: Transport): ApiClient {
  async function request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const target = await transport(path, options.query);
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...target.headers,
    };
    const hasBody = options.body !== undefined;
    if (hasBody) headers["Content-Type"] = "application/json";

    let res: Response;
    try {
      res = await fetch(target.url, {
        cache: "no-store",
        ...options.init,
        method,
        headers,
        body: hasBody ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e;
      throw new ApiError(
        0,
        "NETWORK_ERROR",
        "Tidak dapat terhubung ke server. Periksa koneksi Anda."
      );
    }

    const payload = await parseBody(res);
    if (!res.ok) {
      const error = toApiError(res.status, payload);
      if (res.status === 401 && typeof window !== "undefined") onUnauthorized?.();
      throw error;
    }
    return payload as T;
  }

  return {
    get: (path, options) => request("GET", path, options),
    post: (path, body, options) => request("POST", path, { ...options, body }),
    patch: (path, body, options) => request("PATCH", path, { ...options, body }),
    delete: (path, options) => request("DELETE", path, options),
  };
}

/** Browser -> backend (lewat proxy frontend). */
export const browserApi = createApiClient((path, query) => ({
  url: `${PROXY_PREFIX}${path}${buildQueryString(query)}`,
}));

/** Browser -> route handler sesi frontend (/api/auth/*). */
export const bffApi = createApiClient((path, query) => ({
  url: `${BFF_PREFIX}${path}${buildQueryString(query)}`,
}));
