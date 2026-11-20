"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Plus, Rows3 } from "lucide-react";
import { theaterService } from "@/services";
import type { TheaterWithAuditoriums } from "@/types/api";
import { auditoriumSchema, theaterSchema } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { AdminInput, Field, Modal, PageHeading, Panel } from "@/components/admin/AdminUI";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type TheaterValues = z.infer<typeof theaterSchema>;
type AuditoriumValues = z.infer<typeof auditoriumSchema>;

function TheaterForm({ onSave, onClose, busy }: { onSave: (v: TheaterValues) => Promise<void>; onClose: () => void; busy: boolean }) {
  const form = useForm<TheaterValues>({ resolver: zodResolver(theaterSchema), defaultValues: { name: "", city: "" } });
  return <form className="space-y-4" onSubmit={form.handleSubmit(onSave)}>
    <Field label="Nama bioskop" error={form.formState.errors.name?.message}><AdminInput {...form.register("name")} placeholder="CINEMAX Semarang" /></Field>
    <Field label="Kota" error={form.formState.errors.city?.message}><AdminInput {...form.register("city")} placeholder="Semarang" /></Field>
    <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={onClose}>Batal</Button><Button type="submit" loading={busy}>Simpan bioskop</Button></div>
  </form>;
}
function AuditoriumForm({ theaterName, onSave, onClose, busy }: { theaterName: string; onSave: (v: AuditoriumValues) => Promise<void>; onClose: () => void; busy: boolean }) {
  const form = useForm<AuditoriumValues>({ resolver: zodResolver(auditoriumSchema), defaultValues: { name: "", rows: 8, seatsPerRow: 12 } });
  const rows = form.watch("rows") || 1, seatsPerRow = form.watch("seatsPerRow") || 1;
  const safeRows = Math.min(26, Math.max(1, rows)), safeCols = Math.min(40, Math.max(1, seatsPerRow));
  const total = safeRows * safeCols;
  return <form className="space-y-4" onSubmit={form.handleSubmit(onSave)}>
    <p className="text-xs text-fg-muted">Bioskop: <span className="font-medium text-fg">{theaterName}</span></p>
    <Field label="Nama studio" error={form.formState.errors.name?.message}><AdminInput {...form.register("name")} placeholder="Studio 1" /></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Jumlah baris (1–26)" error={form.formState.errors.rows?.message}><AdminInput type="number" min={1} max={26} {...form.register("rows", { valueAsNumber: true })} /></Field>
      <Field label="Kursi per baris (1–40)" error={form.formState.errors.seatsPerRow?.message}><AdminInput type="number" min={1} max={40} {...form.register("seatsPerRow", { valueAsNumber: true })} /></Field>
    </div>
    <Panel className="bg-card">
      <div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-semibold">Pratinjau denah</p><p className="text-xs text-fg-muted">Layar berada di bagian atas</p></div><span className="text-sm font-bold text-primary">{total} kursi</span></div>
      <div className="mx-auto mb-5 h-1.5 w-3/4 rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,.2)]" />
      <div className="max-h-52 space-y-1.5 overflow-auto">
        {Array.from({ length: safeRows }, (_, r) => <div key={r} className="flex items-center justify-center gap-1"><span className="w-4 text-[9px] text-fg-muted">{String.fromCharCode(65+r)}</span>{Array.from({ length: safeCols }, (_, c) => <span key={c} className="grid size-3 shrink-0 place-items-center rounded-[3px] bg-elevated sm:size-4" />)}</div>)}
      </div>
      <p className="mt-3 text-center text-[10px] text-fg-muted">Denah ini pratinjau jumlah kursi. Backend akan membuat kursi secara otomatis setelah studio disimpan.</p>
    </Panel>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Batal</Button><Button type="submit" loading={busy}>Buat studio ({total} kursi)</Button></div>
  </form>;
}

export default function AdminCinemasPage() {
  const [items, setItems] = useState<TheaterWithAuditoriums[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [theaterOpen, setTheaterOpen] = useState(false), [auditoriumTheater, setAuditoriumTheater] = useState<TheaterWithAuditoriums | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(""); try { setItems(await theaterService.list()); } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);

  const addTheater = async (v: TheaterValues) => { setBusy(true); try { await theaterService.create(v); toast.success("Bioskop berhasil ditambahkan."); setTheaterOpen(false); await load(); } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); } };
  const addAuditorium = async (v: AuditoriumValues) => { if (!auditoriumTheater) return; setBusy(true); try { const result = await theaterService.createAuditorium(auditoriumTheater.id, v); toast.success(`Studio berhasil dibuat dengan ${result.totalSeats} kursi.`); setAuditoriumTheater(null); await load(); } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); } };

  return <div>
    <PageHeading title="Kelola Bioskop" description="Atur lokasi bioskop dan studio. Kursi studio dibuat otomatis oleh backend." action={<Button onClick={() => setTheaterOpen(true)}><Plus className="size-4" />Tambah bioskop</Button>} />
    {loading ? <div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map(i => <Panel key={i}><Skeleton className="mb-3 h-6 w-1/2" /><Skeleton className="h-24 w-full" /></Panel>)}</div> : error ? <ErrorState title="Bioskop gagal dimuat" description={error} action={<Button variant="outline" onClick={() => void load()}>Coba lagi</Button>} /> : !items.length ? <Panel><EmptyState title="Belum ada bioskop" description="Tambahkan bioskop pertama untuk mulai mengelola studio." /></Panel> : <div className="grid gap-4 xl:grid-cols-2">
      {items.map(t => <Panel key={t.id} className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-control bg-primary/15 text-primary"><Building2 className="size-5" /></span><div><h2 className="text-lg font-bold">{t.name}</h2><p className="mt-0.5 text-sm text-fg-secondary">{t.city}</p></div></div><Button size="sm" variant="outline" onClick={() => setAuditoriumTheater(t)}><Plus className="size-4" />Tambah studio</Button></div>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4"><p className="text-xs text-fg-muted">{t.auditoriums.length} studio</p><p className="text-xs font-semibold text-fg-secondary">{t.auditoriums.reduce((n,a) => n + a._count.seats, 0)} kursi total</p></div>
        {t.auditoriums.length ? <div className="mt-3 space-y-2">{t.auditoriums.map(a => <div key={a.id} className="flex items-center justify-between rounded-control bg-card px-3 py-3"><div className="flex items-center gap-2"><Rows3 className="size-4 text-fg-muted" /><span className="text-sm font-medium">{a.name}</span></div><span className="text-xs text-fg-secondary">{a._count.seats} kursi</span></div>)}</div> : <p className="mt-3 rounded-control bg-card px-3 py-4 text-center text-xs text-fg-muted">Belum ada studio di bioskop ini.</p>}
      </Panel>)}
    </div>}
    <Modal open={theaterOpen} title="Tambah bioskop" onClose={() => setTheaterOpen(false)}><TheaterForm onSave={addTheater} onClose={() => setTheaterOpen(false)} busy={busy} /></Modal>
    <Modal open={!!auditoriumTheater} title="Tambah studio" onClose={() => setAuditoriumTheater(null)} wide><AuditoriumForm key={auditoriumTheater?.id ?? "none"} theaterName={auditoriumTheater?.name ?? ""} onSave={addAuditorium} onClose={() => setAuditoriumTheater(null)} busy={busy} /></Modal>
  </div>;
}
