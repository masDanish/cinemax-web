import type { ApiClient } from "@/lib/api";
import type { LoginInput, RegisterInput, SessionResponse } from "@/types/api";

/**
 * Memakai bffApi (route handler frontend), bukan backend langsung, supaya JWT
 * disimpan di httpOnly cookie. Backend: POST /api/auth/login dan /register.
 * Backend tidak punya endpoint logout atau /me.
 */
export function createAuthService(client: ApiClient) {
  return {
    login: (input: LoginInput) => client.post<SessionResponse>("/auth/login", input),
    register: (input: RegisterInput & { confirmPassword: string }) => client.post<SessionResponse>("/auth/register", input),
    logout: () => client.post<SessionResponse>("/auth/logout"),
    session: () => client.get<SessionResponse>("/auth/session"),
  };
}
