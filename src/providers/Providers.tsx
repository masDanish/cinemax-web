"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./AuthProvider";
import type { User } from "@/types/api";

export function Providers({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) {
  return (
    <AuthProvider initialUser={initialUser}>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#1C1C1C",
            border: "1px solid #303030",
            color: "#FFFFFF",
          },
        }}
      />
    </AuthProvider>
  );
}
