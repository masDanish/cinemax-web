"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { reservationService } from "@/services";
import type { Reservation } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency, formatDateTime, reservationTotal, seatLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReservationStatusBadge, PaymentStatusBadge } from "@/components/ui/badge";
import { AdminInput, DataTable, PageHeading, Panel, TableCell } from "@/components/admin/AdminUI";
import { toast } from "sonner";

function ReservationDetail({ item }: { item: Reservation }) {
  return <Panel className="mt-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-fg-muted">Detail reservasi</p><h2 className="mt-1 font-mono text-sm font-bold">{item.id}</h2></div><ReservationStatusBadge status={item.status} /></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div><p className="text-xs text-fg-muted">Film</p><p className="mt-1 font-semibold">{item.showtime.movie.title}</p></div>
      <div><p className="text-xs text-fg-muted">Bioskop / Studio</p><p className="mt-1 font-medium">{item.showtime.auditorium.theater.name} · {item.showtime.auditorium.name}</p><p className="text-xs text-fg-muted">{item.showtime.auditorium.theater.city}</p></div>
      <div><p className="text-xs text-fg-muted">Jadwal</p><p className="mt-1 text-sm">{formatDateTime(item.showtime.startsAt)}</p></div>
      <div><p className="text-xs text-fg-muted">Pemilik user ID</p><p className="mt-1 break-all font-mono text-xs">{item.userId}</p></div>
      <div><p className="text-xs text-fg-muted">Kursi</p><div className="mt-1 flex flex-wrap gap-1.5">{item.tickets.length ? item.tickets.map(t => <span key={t.id} className="rounded bg-elevated px-2 py-1 text-xs">{seatLabel(t.seat)}</span>) : <span className="text-xs text-fg-muted">Tidak ada kursi tersimpan untuk status ini.</span>}</div></div>
      <div><p className="text-xs text-fg-muted">Total snapshot tiket</p><p className="mt-1 font-semibold">{formatCurrency(reservationTotal(item.tickets))}</p></div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><div><p className="text-xs text-fg-muted">Status pembayaran</p><div className="mt-1">{item.payment ? <PaymentStatusBadge status={item.payment.status} /> : <span className="text-xs text-fg-muted">Belum ada pembayaran</span>}</div></div><div className="text-right"><p className="text-xs text-fg-muted">Dibuat</p><p className="text-xs">{formatDateTime(item.createdAt)}</p></div></div>
  </Panel>;
}

export default function AdminReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [query, setQuery] = useState(""), [detail, setDetail] = useState<Reservation | null>(null), [searching, setSearching] = useState(false), [detailError, setDetailError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setItems(await reservationService.list()); } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);

  const find = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) { toast.error("Masukkan ID reservasi."); return; }
    setSearching(true); setDetailError(""); setDetail(null);
    try { setDetail(await reservationService.get(query.trim())); }
    catch (err) { setDetailError(getErrorMessage(err)); }
    finally { setSearching(false); }
  };

  return <div>
    <PageHeading title="Reservasi" description="Lihat reservasi milik akun admin dan cari detail reservasi berdasarkan ID." />
    <Panel className="mb-6">
      <h2 className="mb-1 font-semibold">Cari detail reservasi</h2>
      <p className="mb-3 text-xs text-fg-muted">Admin dapat membuka detail reservasi pengguna lain jika mengetahui ID reservasinya.</p>
      <form onSubmit={find} className="flex flex-col gap-2 sm:flex-row"><AdminInput value={query} onChange={e => setQuery(e.target.value)} placeholder="Masukkan ID reservasi" /><Button type="submit" loading={searching}><Search className="size-4" />Cari reservasi</Button></form>
      {detailError && <div className="mt-3 rounded-control bg-danger/10 p-3 text-sm text-danger">{detailError}</div>}
      {detail && <ReservationDetail item={detail} />}
    </Panel>
    <div className="mb-3"><h2 className="font-semibold">Reservasi akun admin</h2><p className="mt-1 text-xs text-fg-muted">Endpoint GET /reservations hanya mengembalikan reservasi milik akun yang sedang login.</p></div>
    <DataTable headers={["Kode reservasi","Film","Jadwal","Kursi","Status","Pembayaran"]} loading={loading} error={error} onRetry={() => void load()} empty={!items.length}>
      {items.map(r => <tr key={r.id} className="hover:bg-white/[.025]"><TableCell><button onClick={() => { setQuery(r.id); setDetail(r); setDetailError(""); }} className="font-mono text-xs text-primary hover:underline">{r.id.slice(0, 14)}…</button></TableCell><TableCell><span className="font-medium">{r.showtime.movie.title}</span><p className="text-xs text-fg-muted">{r.showtime.auditorium.theater.name}</p></TableCell><TableCell className="whitespace-nowrap text-xs">{formatDateTime(r.showtime.startsAt)}</TableCell><TableCell>{r.tickets.length ? r.tickets.map(t => seatLabel(t.seat)).join(", ") : "—"}</TableCell><TableCell><ReservationStatusBadge status={r.status} /></TableCell><TableCell>{r.payment ? <PaymentStatusBadge status={r.payment.status} /> : <span className="text-xs text-fg-muted">—</span>}</TableCell></tr>)}
    </DataTable>
    {!loading && !error && !items.length && <p className="mt-2 text-center text-xs text-fg-muted">Belum ada reservasi milik akun admin.</p>}
    <p className="mt-4 rounded-control bg-card p-3 text-xs leading-5 text-fg-muted">Keterbatasan API: tidak tersedia endpoint daftar reservasi global. Halaman ini tidak menampilkan seluruh reservasi pengguna. Admin juga tidak dapat membayar reservasi milik orang lain, sehingga tidak ada tombol pembayaran di sini.</p>
  </div>;
}
