"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, Film, Plus, Search, Trash2 } from "lucide-react";
import { movieService } from "@/services";
import type { Movie, MovieListResponse } from "@/types/api";
import { movieSchema } from "@/lib/schemas";
import { ApiError, getErrorMessage } from "@/lib/errors";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminInput, ConfirmDialog, DataTable, Field, Modal, PageHeading, TableCell } from "@/components/admin/AdminUI";
import { toast } from "sonner";

type MovieValues = z.infer<typeof movieSchema>;
const blank: MovieValues = { title: "", description: "", durationMinutes: 120, genres: [] };

function MovieForm({ initial, onSave, onClose, saving }: { initial?: Movie; onSave: (v: MovieValues) => Promise<void>; onClose: () => void; saving: boolean }) {
  const form = useForm<MovieValues>({ resolver: zodResolver(movieSchema), defaultValues: initial ? { title: initial.title, description: initial.description ?? "", durationMinutes: initial.durationMinutes, genres: initial.genres.map(g => g.name) } : blank });
  const [genre, setGenre] = useState("");
  const genres = form.watch("genres");
  const addGenre = () => {
    const value = genre.trim();
    if (value && !genres.some(g => g.toLowerCase() === value.toLowerCase())) form.setValue("genres", [...genres, value], { shouldValidate: true });
    setGenre("");
  };
  return <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
    <Field label="Judul film" error={form.formState.errors.title?.message}><AdminInput {...form.register("title")} placeholder="Contoh: Interstellar" /></Field>
    <Field label="Deskripsi" error={form.formState.errors.description?.message}><textarea {...form.register("description")} rows={3} maxLength={2000} placeholder="Sinopsis film..." className="w-full rounded-control border border-line bg-elevated p-3 text-sm outline-none focus:border-white/60" /></Field>
    <Field label="Durasi (menit)" error={form.formState.errors.durationMinutes?.message}><AdminInput type="number" min={1} max={600} {...form.register("durationMinutes", { valueAsNumber: true })} /></Field>
    <Field label="Genre" hint="Masukkan satu genre lalu tekan Enter atau Tambah. Genre yang dikirim akan menggantikan seluruh genre lama." error={form.formState.errors.genres?.message}>
      <div className="flex gap-2"><AdminInput value={genre} onChange={e => setGenre(e.target.value)} placeholder="Tambah genre" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addGenre(); } }} /><Button type="button" variant="secondary" onClick={addGenre}>Tambah</Button></div>
      <div className="mt-2 flex flex-wrap gap-2">{genres.map(g => <button key={g} type="button" onClick={() => form.setValue("genres", genres.filter(x => x !== g), { shouldValidate: true })} className="rounded-full bg-primary/15 px-3 py-1 text-xs text-white ring-1 ring-primary/40">{g} <span aria-hidden>×</span></button>)}</div>
    </Field>
    <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" loading={saving}>Simpan film</Button></div>
  </form>;
}

function MoviesContent() {
  const router = useRouter(), pathname = usePathname(), params = useSearchParams();
  const [data, setData] = useState<MovieListResponse | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [modal, setModal] = useState(false), [editing, setEditing] = useState<Movie | undefined>();
  const [saving, setSaving] = useState(false), [deleting, setDeleting] = useState<Movie | null>(null), [deleteBusy, setDeleteBusy] = useState(false);

  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const search = params.get("q") ?? "";
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await movieService.list({ q: search || undefined, page, limit: 10 })); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [search, page]);
  useEffect(() => { setQ(params.get("q") ?? ""); }, [params]);
  useEffect(() => { void load(); }, [load]);

  const navigate = (nextPage: number, nextQ = search) => {
    const p = new URLSearchParams();
    if (nextQ) p.set("q", nextQ);
    if (nextPage > 1) p.set("page", String(nextPage));
    router.push(`${pathname}${p.size ? `?${p}` : ""}`);
  };
  const save = async (values: MovieValues) => {
    setSaving(true);
    try {
      if (editing) await movieService.update(editing.id, { ...values, description: values.description || undefined });
      else await movieService.create({ ...values, description: values.description || undefined });
      toast.success(editing ? "Film berhasil diperbarui." : "Film berhasil ditambahkan.");
      setModal(false); setEditing(undefined); await load();
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try { await movieService.remove(deleting.id); toast.success("Film berhasil dihapus."); setDeleting(null); await load(); }
    catch (e) {
      if (e instanceof ApiError && e.code === "IN_USE") toast.error(`${e.message} Film tidak dapat dihapus karena masih memiliki jadwal tayang.`);
      else toast.error(getErrorMessage(e));
    } finally { setDeleteBusy(false); }
  };

  return <div>
    <PageHeading title="Kelola Film" description="Tambah, perbarui, cari, dan hapus katalog film." action={<Button onClick={() => { setEditing(undefined); setModal(true); }}><Plus className="size-4" />Tambah film</Button>} />
    <form onSubmit={e => { e.preventDefault(); navigate(1, q.trim()); }} className="mb-4 flex gap-2"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" /><AdminInput value={q} onChange={e => setQ(e.target.value)} placeholder="Cari judul film..." className="pl-9" /></div><Button type="submit">Cari</Button></form>
    <DataTable headers={["Film","Durasi","Genre","Dibuat","Aksi"]} loading={loading} error={error} onRetry={() => void load()} empty={!data?.items.length}>
      {data?.items.map(movie => <tr key={movie.id} className="hover:bg-white/[.025]"><TableCell><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-control bg-elevated text-primary"><Film className="size-4" /></span><div><p className="font-semibold">{movie.title}</p><p className="mt-0.5 max-w-xs truncate text-xs text-fg-muted">{movie.description || "Tidak ada deskripsi"}</p></div></div></TableCell><TableCell>{formatDuration(movie.durationMinutes)}</TableCell><TableCell><div className="flex max-w-xs flex-wrap gap-1">{movie.genres.length ? movie.genres.map(g => <span key={g.id} className="rounded-full bg-elevated px-2 py-1 text-[10px]">{g.name}</span>) : <span className="text-fg-muted">—</span>}</div></TableCell><TableCell className="whitespace-nowrap text-xs text-fg-muted">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(movie.createdAt))}</TableCell><TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => { setEditing(movie); setModal(true); }}><Edit2 className="size-4" /><span className="sr-only">Edit</span></Button><Button size="sm" variant="ghost" className="text-danger hover:text-danger" onClick={() => setDeleting(movie)}><Trash2 className="size-4" /><span className="sr-only">Hapus</span></Button></div></TableCell></tr>)}
    </DataTable>
    {data && <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-fg-muted">Halaman {data.meta.page} dari {data.meta.totalPages} · {data.meta.total} film</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => navigate(page - 1)}>Sebelumnya</Button><Button size="sm" variant="outline" disabled={page >= data.meta.totalPages} onClick={() => navigate(page + 1)}>Berikutnya</Button></div></div>}
    <Modal open={modal} title={editing ? "Edit film" : "Tambah film"} onClose={() => { if (!saving) { setModal(false); setEditing(undefined); } }}><MovieForm key={editing?.id ?? "new"} initial={editing} onSave={save} onClose={() => { setModal(false); setEditing(undefined); }} saving={saving} /></Modal>
    <ConfirmDialog open={!!deleting} title="Hapus film?" description={`Film "${deleting?.title}" akan dihapus. Film yang masih memiliki jadwal akan ditolak oleh backend (409 IN_USE).`} onCancel={() => setDeleting(null)} onConfirm={() => void remove()} loading={deleteBusy} />
  </div>;
}
export default function AdminMoviesPage() { return <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-surface" />}><MoviesContent /></Suspense>; }
