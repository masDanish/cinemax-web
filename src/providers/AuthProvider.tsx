"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { setUnauthorizedHandler } from "@/lib/api";
import { authService } from "@/services";
import type { LoginInput, RegisterInput, User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput & { confirmPassword: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  /** Dibaca server dari cookie, jadi tidak ada kedip "belum login" saat load. */
  initialUser: User | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);

  // Sinkronkan saat server mengirim sesi baru (setelah router.refresh()).
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);
  if (initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    setUser(initialUser);
  }

  const login = useCallback(
    async (input: LoginInput) => {
      const { user } = await authService.login(input);
      setUser(user);
      router.refresh();
      return user as User;
    },
    [router]
  );

  const register = useCallback(
    async (input: RegisterInput & { confirmPassword: string }) => {
      const { user } = await authService.register(input);
      setUser(user);
      router.refresh();
      return user as User;
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      router.replace("/");
      router.refresh();
    }
  }, [router]);

  // Backend membalas 401 (token kedaluwarsa): proxy sudah menghapus cookie, sinkronkan UI.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      const current = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/";
      router.replace(`/login?next=${encodeURIComponent(current)}`);
      router.refresh();
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAdmin: user?.role === "ADMIN", login, register, logout }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
