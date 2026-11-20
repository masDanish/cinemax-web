/**
 * API client untuk Server Components / route handler.
 * Memanggil backend langsung dan menempelkan Bearer token dari cookie.
 * Jangan diimpor dari client component (memakai next/headers).
 */
import { cookies } from "next/headers";
import { buildQueryString, createApiClient } from "./api";
import { API_BASE_URL, TOKEN_COOKIE } from "./config";

export const serverApi = createApiClient(async (path, query) => {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  return {
    url: `${API_BASE_URL}/api${path}${buildQueryString(query)}`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
});
