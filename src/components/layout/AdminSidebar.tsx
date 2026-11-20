"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Clapperboard, Film, House, LogOut, Menu, Ticket, X, Building2, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

const links = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { href: "/admin/movies", label: "Film", icon: Film },
  { href: "/admin/cinemas", label: "Bioskop", icon: Building2 },
  { href: "/admin/showtimes", label: "Jadwal", icon: CalendarDays },
  { href: "/admin/reservations", label: "Reservasi", icon: Ticket },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const active = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const signOut = async () => {
    setBusy(true);
    try { await logout(); toast.success("Anda telah keluar."); }
    catch (e) { toast.error(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  const nav = (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 border-b border-line px-5 py-6">
        <span className="grid size-10 place-items-center rounded-control bg-primary"><Clapperboard className="size-5" /></span>
        <span><span className="block font-display text-2xl tracking-wide">CINEMAX</span><span className="text-[10px] font-semibold uppercase tracking-[.2em] text-fg-muted">Administrator</span></span>
      </Link>
      <nav className="flex-1 space-y-1 p-3 pt-5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-fg-muted">Menu utama</p>
        {links.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-control px-3 py-3 text-sm font-medium transition ${active(href, exact) ? "bg-primary text-white" : "text-fg-secondary hover:bg-white/8 hover:text-white"}`}>
            <Icon className="size-4" />{label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-control px-3 py-3 text-sm text-fg-secondary hover:bg-white/8 hover:text-white"><House className="size-4" />Kembali ke situs</Link>
        <div className="mt-3 flex items-center gap-3 rounded-control bg-card p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-elevated text-sm font-bold">{user?.email?.[0]?.toUpperCase() ?? "A"}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{user?.email}</span><span className="text-[10px] text-fg-muted">Administrator</span></span>
        </div>
      </div>
    </div>
  );

  return <>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-surface lg:block">{nav}</aside>
    <header className="fixed left-64 right-0 top-0 z-30 hidden h-16 items-center justify-between border-b border-line bg-bg/95 px-8 backdrop-blur lg:flex">
      <div><p className="text-sm font-semibold">{links.find(item => active(item.href, item.exact))?.label ?? "Dashboard"}</p><p className="text-[10px] text-fg-muted">Panel administrasi CINEMAX</p></div>
      <div className="flex items-center gap-4"><span className="text-xs text-fg-secondary">{user?.email}</span><button type="button" disabled={busy} onClick={signOut} className="inline-flex items-center gap-2 rounded-control border border-line px-3 py-2 text-xs font-medium text-fg-secondary transition hover:bg-white/10 hover:text-white disabled:opacity-50"><LogOut className="size-3.5" />Keluar</button></div>
    </header>
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-bg/95 px-4 backdrop-blur lg:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-label="Buka menu" className="rounded-control p-2 hover:bg-white/10"><Menu className="size-5" /></button>
      <Link href="/admin" className="font-display text-2xl tracking-wide">CINEMAX <span className="text-xs font-sans tracking-normal text-fg-muted">ADMIN</span></Link>
      <button type="button" onClick={signOut} disabled={busy} aria-label="Keluar" className="rounded-control p-2 hover:bg-white/10"><LogOut className="size-5" /></button>
    </header>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Tutup menu" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} /><aside className="absolute inset-y-0 left-0 w-[min(84vw,300px)] bg-surface shadow-2xl"><div className="absolute right-3 top-4 z-10"><button onClick={() => setOpen(false)} aria-label="Tutup" className="rounded p-2 hover:bg-white/10"><X className="size-5" /></button></div>{nav}</aside></div>}
  </>;
}
