"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, CalendarDays, CircleDollarSign, Ticket } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { reportService } from "@/services";
import type { Report } from "@/types/api";
import { dayRangeIso, formatCurrency, formatDateTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/state";
import { AdminInput, DataTable, PageHeading, Panel, StatCard, TableCell } from "@/components/admin/AdminUI";

function DashboardContent() {
  const router = useRouter(), pathname = usePathname(), params = useSearchParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [from, setFrom] = useState(params.get("from") ?? ""), [to, setTo] = useState(params.get("to") ?? "");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (from && to) {
        const a = dayRangeIso(from), b = dayRangeIso(to);
        setReport(await reportService.get({ from: a.from, to: b.to }));
      } else if (from) setReport(await reportService.get({ from: dayRangeIso(from).from }));
      else if (to) setReport(await reportService.get({ to: dayRangeIso(to).to }));
      else setReport(await reportService.get());
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { setFrom(params.get("from") ?? ""); setTo(params.get("to") ?? ""); }, [params]);
  useEffect(() => { void load(); }, [load]);
  const apply = () => {
    const next = new URLSearchParams();
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    router.push(`${pathname}${next.size ? `?${next}` : ""}`);
  };
  const rows = report?.showtimes ?? [];
  const average = rows.length ? rows.reduce((total, item) => total + item.occupancyPercent, 0) / rows.length : 0;
  const chartData = useMemo(() => rows.map((r, i) => ({ name: r.movie.length > 18 ? `${r.movie.slice(0, 18)}…` : r.movie, urutan: i + 1, sold: r.sold, occupancy: r.occupancyPercent })), [rows]);

  return <div>
    <PageHeading title="Dashboard" description="Ringkasan performa penjualan tiket dan jadwal CINEMAX." />
    <Panel className="mb-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-48"><label className="mb-1.5 block text-xs text-fg-muted">Dari tanggal</label><AdminInput type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
        <div className="w-full sm:w-48"><label className="mb-1.5 block text-xs text-fg-muted">Sampai tanggal</label><AdminInput type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} /></div>
        <Button onClick={apply}>Terapkan filter</Button>
        <Button variant="ghost" onClick={() => { setFrom(""); setTo(""); router.push(pathname); }}>Reset</Button>
      </div>
      <p className="mt-3 text-xs text-fg-muted">Rentang tanggal dihitung berdasarkan waktu mulai jadwal (startsAt), bukan tanggal transaksi pembayaran.</p>
    </Panel>

    {error ? <Panel><ErrorState title="Laporan tidak dapat dimuat" description={error} action={<Button variant="outline" onClick={() => void load()}>Coba lagi</Button>} /></Panel> : <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Revenue" value={loading ? "—" : formatCurrency(report?.totalRevenue ?? 0)} detail="Total pendapatan pada rentang terpilih" icon={<CircleDollarSign className="size-5" />} />
        <StatCard label="Total Tiket Terjual" value={loading ? "—" : (report?.totalTicketsSold ?? 0).toLocaleString("id-ID")} detail="Akumulasi tiket terjual" icon={<Ticket className="size-5" />} />
        <StatCard label="Rata-rata Occupancy" value={loading ? "—" : `${average.toFixed(1)}%`} detail="Rata-rata aritmetika occupancy seluruh jadwal pada laporan" icon={<BarChart3 className="size-5" />} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Panel><div className="mb-4"><h2 className="font-semibold">Tiket terjual per jadwal</h2><p className="mt-1 text-xs text-fg-muted">Jumlah tiket berdasarkan data sold dari laporan.</p></div>
          {loading ? <div className="h-64 animate-pulse rounded bg-card" /> : chartData.length ? <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 35 }}><CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" /><XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fill: "var(--color-fg-muted)", fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fill: "var(--color-fg-muted)", fontSize: 11 }} /><Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-line)", borderRadius: 8 }} /><Bar dataKey="sold" name="Tiket terjual" fill="var(--color-primary)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div> : <p className="py-20 text-center text-sm text-fg-muted">Belum ada data jadwal pada rentang ini.</p>}
        </Panel>
        <Panel><div className="mb-4"><h2 className="font-semibold">Okupansi per jadwal</h2><p className="mt-1 text-xs text-fg-muted">Persentase okupansi yang dilaporkan backend.</p></div>
          {loading ? <div className="h-64 animate-pulse rounded bg-card" /> : chartData.length ? <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 35 }}><CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" /><XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fill: "var(--color-fg-muted)", fontSize: 10 }} /><YAxis domain={[0,100]} unit="%" tick={{ fill: "var(--color-fg-muted)", fontSize: 11 }} /><Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Okupansi"]} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-line)", borderRadius: 8 }} /><Line type="monotone" dataKey="occupancy" name="Okupansi" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-primary)" }} /></LineChart></ResponsiveContainer></div> : <p className="py-20 text-center text-sm text-fg-muted">Belum ada data jadwal pada rentang ini.</p>}
        </Panel>
      </div>
      <div className="mt-6"><div className="mb-3 flex items-center gap-2"><CalendarDays className="size-4 text-primary" /><h2 className="font-semibold">Performa jadwal</h2></div>
        <DataTable headers={["Film","Studio","Waktu","Kapasitas","Terjual","Okupansi"]} loading={loading} error="" empty={!rows.length}>
          {rows.map(r => <tr key={r.showtimeId} className="hover:bg-white/[.025]"><TableCell><span className="font-medium">{r.movie}</span></TableCell><TableCell>{r.auditorium}</TableCell><TableCell className="whitespace-nowrap text-fg-secondary">{formatDateTime(r.startsAt)}</TableCell><TableCell>{r.capacity}</TableCell><TableCell>{r.sold}</TableCell><TableCell><span className="font-semibold">{r.occupancyPercent.toFixed(1)}%</span></TableCell></tr>)}
        </DataTable>
      </div>
    </>}
  </div>;
}

export default function AdminDashboardPage() {
  return <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-surface" />}><DashboardContent /></Suspense>;
}
