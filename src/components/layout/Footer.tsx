import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Jelajahi",
    links: [
      { href: "/", label: "Beranda" },
      { href: "/movies", label: "Film" },
      { href: "/cinemas", label: "Bioskop" },
    ],
  },
  {
    title: "Akun",
    links: [
      { href: "/login", label: "Masuk" },
      { href: "/register", label: "Daftar" },
      { href: "/my-tickets", label: "Tiket Saya" },
      { href: "/profile", label: "Profil" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-12">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-fg-secondary">{BRAND.tagline}</p>
          <p className="max-w-xs text-sm text-fg-muted">
            Pilih film, tentukan kursi, bayar dengan aman. Kursi ditahan selama 15 menit setelah
            Anda memesan.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-3 text-sm font-semibold">{col.title}</h2>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-fg-secondary transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-[1600px] px-4 py-5 text-xs text-fg-muted sm:px-6 lg:px-12">
          © {new Date().getFullYear()} {BRAND.name}. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
