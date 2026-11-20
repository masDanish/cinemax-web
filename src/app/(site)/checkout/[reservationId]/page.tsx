"use client";
import { useCallback,useEffect,useState } from "react";
import { useParams,useRouter } from "next/navigation";
import { toast } from "sonner";
import { reservationService,paymentService } from "@/services";
import type { Reservation } from "@/types/api";
import { Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/state";
import { ReservationStatusBadge,PaymentStatusBadge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/booking/CountdownTimer";
import { formatCurrency,formatDateTime,reservationTotal,seatLabel } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
export default function CheckoutPage(){
 const {reservationId}=useParams<{reservationId:string}>();const router=useRouter();const [r,setR]=useState<Reservation|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const load=useCallback(()=>reservationService.get(reservationId).then(setR).catch(e=>setError(getErrorMessage(e))),[reservationId]);
 useEffect(()=>{load()},[load]);
 const expired=r?new Date(r.expiresAt).getTime()<=Date.now():false;
 const cancel=async()=>{setBusy(true);try{const result=await reservationService.cancel(reservationId);toast.success(result.refunded?"Reservasi dibatalkan. Pengembalian dana diproses backend.":"Reservasi dibatalkan.");await load()}catch(e){toast.error(getErrorMessage(e))}finally{setBusy(false)}};
 const pay=async()=>{setBusy(true);try{const result=await paymentService.checkout(reservationId);window.location.href=result.checkoutUrl}catch(e){toast.error(getErrorMessage(e));setBusy(false)}};
 return <Container navOffset className="max-w-3xl py-10"><p className="mb-2 text-sm font-semibold uppercase tracking-[.2em] text-primary">Konfirmasi Pesanan</p><h1 className="mb-8 text-3xl font-bold">Checkout</h1>{error?<ErrorState title="Reservasi tidak dapat dimuat" description={error}/>:!r?<div className="h-64 animate-pulse rounded-card bg-surface"/>:<div className="space-y-6 rounded-card bg-surface p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{r.showtime.movie.title}</h2><ReservationStatusBadge status={r.status}/></div><p className="text-sm text-fg-secondary">{r.showtime.auditorium.theater.name} · {r.showtime.auditorium.theater.city} · {r.showtime.auditorium.name}</p><p className="text-sm text-fg-secondary">{formatDateTime(r.showtime.startsAt)}</p><div className="flex flex-wrap gap-2">{r.tickets.map(t=><span key={t.id} className="rounded-control bg-elevated px-3 py-2 text-sm">{seatLabel(t.seat)}</span>)}</div><div className="border-t border-line pt-5"><div className="flex justify-between text-sm text-fg-secondary"><span>Total pembayaran</span><strong className="text-lg text-white">{formatCurrency(reservationTotal(r.tickets))}</strong></div>{r.payment&&<div className="mt-3 flex justify-between text-sm"><span>Status pembayaran</span><PaymentStatusBadge status={r.payment.status}/></div>}</div>{r.status==="PENDING"&&!expired?<div className="rounded-control bg-warning/10 p-4 text-center"><p className="text-sm text-fg-secondary">Selesaikan pembayaran sebelum reservasi berakhir</p><p className="mt-1 text-2xl font-bold text-warning"><CountdownTimer expiresAt={r.expiresAt} onExpire={load}/></p></div>:r.status==="EXPIRED"?<p className="rounded-control bg-danger/10 p-4 text-sm text-danger">Reservasi telah kedaluwarsa. Silakan buat reservasi baru.</p>:null}{r.status==="CONFIRMED"&&r.payment?.status==="PAID"&&<p className="rounded-control bg-success/10 p-4 text-sm text-success">Pembayaran terkonfirmasi. Tiket Anda tersedia di Tiket Saya.</p>}{expired&&r.status==="PENDING"&&<p className="rounded-control bg-warning/10 p-3 text-sm text-warning">Waktu reservasi habis. Status sedang diperbarui dari server.</p>}<div className="flex flex-col gap-3 sm:flex-row"><Button fullWidth disabled={r.status!=="PENDING"||expired} loading={busy} onClick={pay}>Bayar dengan Stripe</Button><Button fullWidth variant="outline" disabled={r.status!=="PENDING"} loading={busy} onClick={cancel}>Batalkan reservasi</Button></div></div>}</Container>
}
