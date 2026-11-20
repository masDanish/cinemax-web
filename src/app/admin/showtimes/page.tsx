"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Plus } from "lucide-react";
import { movieService, showtimeService, theaterService } from "@/services";
import type { Movie, ShowtimeListItem, TheaterWithAuditoriums } from "@/types/api";
import { showtimeSchema } from "@/lib/schemas";
import { ApiError, getErrorMessage } from "@/lib/errors";
import { dayRangeIso, formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminInput, DataTable, Field, Modal, PageHeading, TableCell } from "@/components/admin/AdminUI";
import { toast } from "sonner";

type ShowtimeValues = z.infer<typeof showtimeSchema>;
function ShowtimeForm({ movies, theaters, onSave, onClose, busy }: { movies: Movie[]; theaters: TheaterWithAuditoriums[]; onSave: (v: ShowtimeValues) => Promise<void>; onClose: () => void; busy: boolean }) {
  const form = useForm<ShowtimeValues>({ resolver: zodResolver(showtimeSchema), defaultValues: { movieId: "", auditoriumId: "", startsAt: "", price: 50000 } });
  const [theaterId, setTheaterId] = useState("");
  const auditoriumOptions = theaters.find(t => t.id === theaterId)?.auditoriums ?? [];
  return <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
    <Field label="Film" error={form.formState.errors.movieId?.message}><select {...form.register("movieId")} className="h-11 w-full rounded-control border border-line bg-elevated px-3 text-sm"><option value="">Pilih film</option>{movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></Field>
    <Field label="Bioskop"><select value={theaterId} onChange={e => { setTheaterId(e.target.value); form.setValue("auditoriumId", ""); }} className="h-11 w-full rounded-control border border-line bg-elevated px-3 text-sm"><option value="">Pilih bioskop</option>{theaters.map(t => <option key={t.id} value={t.id}>{t.name} — {t.city}</option>)}</select></Field>
    <Field label="Studio" error={form.formState.errors.auditoriumId?.message}><select {...form.register("auditoriumId")} disabled={!theaterId} className="h-11 w-full rounded-control border border-line bg-elevated px-3 text-sm disabled:opacity-50"><option value="">Pilih studio</option>{auditoriumOptions.map(a => <option key={a.id} value={a.id}>{a.name} ({a._count.seats} kursi)</option>)}</select></Field>
    <Field label="Tanggal dan waktu tayang" error={form.formState.errors.startsAt?.message} hint="Waktu diinterpretasikan sebagai Asia/Jakarta (WIB)."><AdminInput type="datetime-local" {...form.register("startsAt")} /></Field>
    <Field label="Harga tiket (Rupiah)" error={form.formState.errors.price?.message}><AdminInput type="number" min={1} step={1} {...form.register("price", { valueAsNumber: true })} /></Field>
    <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={onClose}>Batal</Button><Button type="submit" loading={busy}>Buat jadwal</Button></div>
  </form>;
}

export default function AdminShowtimesPage() {
  const [items, setItems] = useState<ShowtimeListItem[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<TheaterWithAuditoriums[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(""), [optionsError, setOptionsError] = useState("");
  const [movieId, setMovieId] = useState(""), [theaterId, setTheaterId] = useState(""), [date, setDate] = useState("");
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      const [theaterData, first] = await Promise.all([theaterService.list(), movieService.list({ page: 1, limit: 50 })]);
      const allMovies = [...first.items];
      for (let p = 2; p <= first.meta.totalPages; p++) {
        const page = await movieService.list({ page: p, limit: 50 });
        allMovies.push(...page.items);
      }
      setTheaters(theaterData); setMovies(allMovies); setOptionsError("");
    } catch (e) { setOptionsError(getErrorMessage(e)); }
  }, []);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const range = date ? dayRangeIso(date) : { from: "2000-01-01T00:00:00.000Z", to: undefined };
      setItems(await showtimeService.list({ from: range.from, to: range.to, movieId: movieId || undefined, theaterId: theaterId || undefined }));
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [date, movieId, theaterId]);
  useEffect(() => { void loadOptions(); }, [loadOptions]);
  useEffect(() => { void load(); }, [load]);

  const save = async (v: ShowtimeValues) => {
    setBusy(true);
    try {
      // datetime-local tidak membawa offset. Kontrak CINEMAX menetapkan input admin dalam WIB.
      const startsAt = new Date(`${v.startsAt}:00+07:00`);
      if (!Number.isFinite(startsAt.getTime())) throw new Error("Format tanggal dan waktu tidak valid.");
      await showtimeService.create({ movieId: v.movieId, auditoriumId: v.auditoriumId, startsAt: startsAt.toISOString(), price: v.price });
      toast.success("Jadwal berhasil dibuat."); setOpen(false); await load();
    } catch (e) {
      if (e instanceof ApiError && e.code === "SHOWTIME_CONFLICT") toast.error(`${e.message} Jadwal bentrok di studio yang sama; backend memperhitungkan durasi film dan jeda 15 menit.`);
      else if (e instanceof ApiError && e.code === "INVALID_TIME") toast.error(`${e.message} Waktu tayang harus berada di masa depan.`);
      else toast.error(getErrorMessage(e));
    } finally { setBusy(false); }
  };
  const empty = !items.length;
  const optionsReady = movies.length > 0 && theaters.length > 0;

  return <div>
    <PageHeading title="Kelola Jadwal" description="Atur jadwal tayang berdasarkan film, bioskop, studio, waktu, dan harga." action={<Button onClick={() => setOpen(true)} disabled={!optionsReady}><Plus className="size-4" />Tambah jadwal</Button>} />
    {optionsError && <div role="alert" className="mb-4 rounded-control bg-danger/10 p-3 text-sm text-danger">{optionsError} <button type="button" className="ml-2 underline" onClick={() => void loadOptions()}>Coba lagi</button></div>}
    <div className="mb-4 grid gap-2 sm:grid-cols-3">
      <select value={movieId} onChange={e => setMovieId(e.target.value)} className="h-11 rounded-control border border-line bg-surface px-3 text-sm"><option value="">Semua film</option>{movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
      <select value={theaterId} onChange={e => setTheaterId(e.target.value)} className="h-11 rounded-control border border-line bg-surface px-3 text-sm"><option value="">Semua bioskop</option>{theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <div className="flex gap-2"><AdminInput type="date" value={date} onChange={e => setDate(e.target.value)} /><Button variant="outline" onClick={() => { setMovieId(""); setTheaterId(""); setDate(""); }}>Reset</Button></div>
    </div>
    <DataTable headers={["Film","Bioskop / Kota","Studio","Waktu tayang","Harga"]} loading={loading} error={error} onRetry={() => void load()} empty={empty}>
      {items.map(s => <tr key={s.id} className="hover:bg-white/[.025]"><TableCell><span className="font-semibold">{s.movie.title}</span><p className="mt-0.5 text-xs text-fg-muted">{s.movie.durationMinutes} menit</p></TableCell><TableCell>{s.auditorium.theater.name}<p className="mt-0.5 text-xs text-fg-muted">{s.auditorium.theater.city}</p></TableCell><TableCell>{s.auditorium.name}</TableCell><TableCell className="whitespace-nowrap">{formatDateTime(s.startsAt)}</TableCell><TableCell className="font-semibold">{formatCurrency(s.price)}</TableCell></tr>)}
    </DataTable>
    <p className="mt-3 flex items-center gap-2 text-xs text-fg-muted"><CalendarDays className="size-3.5" />Daftar memuat jadwal sejak 1 Januari 2000 agar jadwal lama ikut tampil. Jadwal tidak dapat diedit atau dihapus melalui API.</p>
    <Modal open={open} title="Tambah jadwal tayang" onClose={() => { if (!busy) setOpen(false); }}><ShowtimeForm movies={movies} theaters={theaters} onSave={save} onClose={() => setOpen(false)} busy={busy} /></Modal>
  </div>;
}
