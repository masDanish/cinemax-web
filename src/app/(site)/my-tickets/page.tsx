"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { reservationService } from "@/services";
import type { Reservation,ReservationStatus } from "@/types/api";
import { Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { ReservationStatusBadge,PaymentStatusBadge } from "@/components/ui/badge";
import { EmptyState,ErrorState } from "@/components/ui/state";
import { formatCurrency,formatDateTime,reservationTotal,seatLabel } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
const tabs:("ALL"|ReservationStatus)[]=["ALL","PENDING","CONFIRMED","CANCELLED","EXPIRED"];
export default function MyTicketsPage(){
 const [items,setItems]=useState<Reservation[]>([]),[filter,setFilter]=useState<typeof tabs[number]>("ALL"),[error,setError]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState("");
 const load=()=>reservationService.list().then(setItems).catch(e=>setError(getErrorMessage(e))).finally(()=>setLoading(false));
 useEffect(()=>{load()},[]);
 const cancel=async(id:string)=>{setBusy(id);try{const result=await reservationService.cancel(id);toast.success(result.refunded?"Reservasi dibatalkan. Pengembalian dana diproses backend.":"Reservasi dibatalkan.");await load()}catch(e){toast.error(getErrorMessage(e))}finally{setBusy("")}};
 const filtered=filter==="ALL"?items:items.filter(i=>i.status===filter);
 return <Container navOffset className="py-10"><p className="mb-2 text-sm font-semibold uppercase tracking-[.2em] text-primary">Akun Saya</p><h1 className="mb-7 text-3xl font-bold">Tiket Saya</h1><div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto">{tabs.map(t=><button key={t} onClick={()=>setFilter(t)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${filter===t?"bg-white text-black":"bg-elevated text-fg-secondary"}`}>{t==="ALL"?"Semua":t==="PENDING"?"Menunggu":t==="CONFIRMED"?"Terkonfirmasi":t==="CANCELLED"?"Dibatalkan":"Kedaluwarsa"}</button>)}</div>{loading?<div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-44 animate-pulse rounded-card bg-surface"/>)}</div>:error?<ErrorState title="Tiket gagal dimuat" description={error}/>:filtered.length===0?<EmptyState title="Belum ada reservasi" description="Reservasi film Anda akan muncul di sini."/>:<div className="space-y-4">{filtered.map(r=><article key={r.id} className="rounded-card bg-surface p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{r.showtime.movie.title}</h2><p className="mt-1 text-sm text-fg-secondary">{r.showtime.auditorium.theater.name} · {r.showtime.auditorium.theater.city} · {r.showtime.auditorium.name}</p><p className="mt-1 text-sm text-fg-muted">{formatDateTime(r.showtime.startsAt)}</p></div><ReservationStatusBadge status={r.status}/></div>{r.tickets.length>0&&<div className="mt-4 flex flex-wrap gap-2">{r.tickets.map(t=><span key={t.id} className="rounded-control bg-elevated px-3 py-1.5 text-xs">{seatLabel(t.seat)}</span>)}</div>}<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><div><p className="text-xs text-fg-muted">Kode reservasi</p><p className="font-mono text-xs">{r.id}</p><p className="mt-1 text-sm font-semibold">{formatCurrency(reservationTotal(r.tickets))}</p>{r.payment&&<div className="mt-2"><PaymentStatusBadge status={r.payment.status}/></div>}</div><div className="flex gap-2">{r.status==="PENDING"&&<Link href={`/checkout/${r.id}`} className="rounded-control bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover">Lanjut bayar</Link>}{(r.status==="PENDING"||r.status==="CONFIRMED")&&<Button size="sm" variant="outline" loading={busy===r.id} onClick={()=>cancel(r.id)}>Batalkan</Button>}</div></div></article>)}</div>}</Container>
}
