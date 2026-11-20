"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Ticket, User as UserIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/errors";

/** Avatar + dropdown akun. Avatar memakai inisial email (API tidak punya foto profil). */
export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
      toast.success("Anda telah keluar.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-left text-sm text-fg-secondary transition hover:bg-white/10 hover:text-white";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu akun"
        className="flex items-center gap-1.5 rounded-control p-1 transition hover:bg-white/10"
      >
        <span className="grid size-8 place-items-center rounded-control bg-primary text-sm font-bold uppercase text-white">
          {user.email.charAt(0)}
        </span>
        <ChevronDown
          className={`size-4 text-white transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-card border border-line bg-surface/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-md"
          >
            <div className="border-b border-line px-3 pb-3 pt-2">
              <p className="truncate text-sm font-medium">{user.email}</p>
              <p className="mt-0.5 text-xs text-fg-muted">
                {user.role === "ADMIN" ? "Administrator" : "Pengguna"}
              </p>
            </div>
            <div className="pt-2">
              <Link href="/profile" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                <UserIcon className="size-4" aria-hidden /> Profil
              </Link>
              <Link href="/my-tickets" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                <Ticket className="size-4" aria-hidden /> Tiket Saya
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                  <ShieldCheck className="size-4" aria-hidden /> Admin
                </Link>
              )}
              <button type="button" role="menuitem" onClick={handleLogout} className={itemClass}>
                <LogOut className="size-4" aria-hidden /> Keluar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
