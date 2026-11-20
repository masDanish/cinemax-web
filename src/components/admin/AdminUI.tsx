"use client";

import { type ReactNode, type InputHTMLAttributes } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/state";

export function PageHeading({ eyebrow = "PENGELOLAAN CINEMAX", title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-primary">{eyebrow}</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm text-fg-secondary">{description}</p>}</div>{action}</div>;
}
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card bg-surface p-4 sm:p-5 ${className}`}>{children}</section>;
}
export function Modal({ open, title, onClose, children, wide = false }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label={title} className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-card border border-line bg-surface p-5 shadow-2xl sm:rounded-card ${wide ? "max-w-2xl" : "max-w-xl"}`}>
      <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-lg font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-2 text-fg-muted hover:bg-white/10 hover:text-white"><X className="size-5" /></button></div>{children}
    </section>
  </div>;
}
export function ConfirmDialog({ open, title, description, onCancel, onConfirm, loading }: { open: boolean; title: string; description: string; onCancel: () => void; onConfirm: () => void; loading?: boolean }) {
  return <Modal open={open} title={title} onClose={onCancel}><p className="text-sm leading-6 text-fg-secondary">{description}</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={onCancel}>Batal</Button><Button variant="danger" loading={loading} onClick={onConfirm}>Ya, lanjutkan</Button></div></Modal>;
}
export function StatCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon: ReactNode }) {
  return <Panel><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-fg-muted">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>{detail && <p className="mt-1 text-xs text-fg-secondary">{detail}</p>}</div><span className="grid size-10 place-items-center rounded-control bg-elevated text-primary">{icon}</span></div></Panel>;
}
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return <div className="space-y-3">{Array.from({ length: rows }, (_, i) => <div key={i} className="flex gap-3">{Array.from({ length: cols }, (_, j) => <Skeleton key={j} className="h-10 flex-1" />)}</div>)}</div>;
}
export function DataTable({ headers, children, empty, loading, error, onRetry }: { headers: string[]; children: ReactNode; empty: boolean; loading: boolean; error?: string; onRetry?: () => void }) {
  if (loading) return <Panel><TableSkeleton cols={headers.length} /></Panel>;
  if (error) return <Panel><ErrorState title="Data gagal dimuat" description={error} action={onRetry ? <Button onClick={onRetry} variant="outline">Coba lagi</Button> : undefined} /></Panel>;
  if (empty) return <Panel><EmptyState title="Belum ada data" description="Data akan muncul setelah tersedia di backend." /></Panel>;
  return <Panel className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-card text-xs uppercase tracking-wide text-fg-muted"><tr>{headers.map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-line">{children}</tbody></table></div></Panel>;
}
export function TableCell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return <div className="space-y-1.5"><label className="block text-sm font-medium text-fg-secondary">{label}</label>{children}{error && <p className="text-xs text-danger">{error}</p>}{hint && !error && <p className="text-xs text-fg-muted">{hint}</p>}</div>;
}
export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-11 w-full rounded-control border border-line bg-elevated px-3 text-sm text-fg placeholder:text-fg-muted outline-none transition focus:border-white/60 disabled:opacity-50 ${props.className ?? ""}`} />;
}
