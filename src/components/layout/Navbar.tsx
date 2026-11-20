"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { ButtonLink, Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { NAV_LINKS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { NavSearch } from "./NavSearch";
import { UserMenu } from "./UserMenu";

/** Halaman dengan hero/backdrop di bawah navbar: navbar transparan saat di paling atas. */
const isHeroPage = (pathname: string) => pathname === "/" || /^\/movies\/[^/]+$/.test(pathname);

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Navbar fixed. Transparan di atas hero, berubah gelap setelah di-scroll.
 * Halaman tanpa hero harus memberi ruang atas (lihat <Container navOffset>).
 */
export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || menuOpen || !isHeroPage(pathname);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    try {
      await logout();
      toast.success("Anda telah keluar.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid
          ? "bg-bg/95 shadow-[0_1px_0_0_var(--color-line)] backdrop-blur-md"
          : "bg-linear-to-b from-black/80 via-black/30 to-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-6 px-4 sm:px-6 lg:px-12">
        <Logo />

        <nav aria-label="Navigasi utama" className="hidden items-center gap-5 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors hover:text-fg-secondary",
                  active ? "font-semibold text-white" : "text-white/75"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <NavSearch />
          </div>

          {/* Notifikasi tidak ditampilkan: API belum menyediakan datanya. */}

          {user ? (
            <div className="hidden md:block">
              <UserMenu />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <ButtonLink href="/login" variant="ghost" size="sm">
                Masuk
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" size="sm">
                Daftar
              </ButtonLink>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-control text-white transition hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="space-y-4 px-4 pb-6 pt-4">
              <NavSearch inline onNavigate={closeMenu} />

              <nav aria-label="Navigasi seluler" className="flex flex-col">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    aria-current={isActive(pathname, href) ? "page" : undefined}
                    className={cn(
                      "rounded-control px-3 py-3 text-base transition hover:bg-white/10",
                      isActive(pathname, href) ? "font-semibold text-white" : "text-fg-secondary"
                    )}
                  >
                    {label}
                  </Link>
                ))}
                {user && (
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="rounded-control px-3 py-3 text-base text-fg-secondary transition hover:bg-white/10"
                  >
                    Profil
                  </Link>
                )}
              </nav>

              {user ? (
                <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                  <p className="min-w-0 truncate text-sm text-fg-secondary">{user.email}</p>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Keluar
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
                  <ButtonLink href="/login" variant="outline" onClick={closeMenu}>
                    Masuk
                  </ButtonLink>
                  <ButtonLink href="/register" onClick={closeMenu}>
                    Daftar
                  </ButtonLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
