"use client";
import { Suspense, useCallback,useEffect,useState } from "react";
import { useParams,useRouter,useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { showtimeService,reservationService } from "@/services";
import { useAuth } from "@/hooks/use-auth";
import type { SeatMap,ShowtimeListItem } from "@/types/api";
import { SeatMap as SeatMapView } from "@/components/booking/SeatMap";
import { SeatLegend } from "@/components/booking/SeatLegend";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Container } from "@/components/ui/section";
import { ErrorState } from "@/components/ui/state";
import { formatDateTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import { MAX_SEATS_PER_RESERVATION } from "@/lib/constants";
export default function BookingPage(){return <Suspense fallback={<Container navOffset className="py-8"><div className="h-[440px] animate-pulse rounded-card bg-surface"/></Container>}><BookingContent/></Suspense>}
function BookingContent(){
 const {showtimeId}=useParams<{showtimeId:string}>();const sp=useSearchParams();const movieId=sp.get("movieId");const router=useRouter();const {user}=useAuth();
 const [map,setMap]=useState<SeatMap|null>(null),[show,setShow]=useState<ShowtimeListItem|null>(null),[selected,setSelected]=useState<string[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true),[submitting,setSubmitting]=useState(false);
 const load=useCallback(async()=>{setLoading(true);try{const [seatData,all]=await Promise.all([showtimeService.seats(showtimeId),showtimeService.list(movieId?{movieId}: {})]);const matched=all.find(s=>s.id===showtimeId)||null;if(!matched)throw new Error("Informasi jadwal tidak ditemukan atau jadwal sudah dimulai.");setMap(seatData);setShow(matched);setError("")}catch(e){setError(getErrorMessage(e))}finally{setLoading(false)}},[showtimeId,movieId]);
 useEffect(()=>{load()},[load]);
 const toggle=(id:string)=>setSelected(old=>old.includes(id)?old.filter(v=>v!==id):old.length>=MAX_SEATS_PER_RESERVATION?(toast.error("Maksimal 6 kursi dalam satu reservasi."),old):[...old,id]);
 const submit=async()=>{if(!user){router.push(`/login?next=${encodeURIComponent(`/booking/${showtimeId}${movieId?`?movieId=${movieId}`:""}`)}`);return}setSubmitting(true);try{const reservation=await reservationService.create({showtimeId,seatIds:selected});router.push(`/checkout/${reservation.id}`)}catch(e){const code=(e as {code?:string}).code;if(code==="SEAT_TAKEN"){toast.error("Kursi baru saja dipesan orang lain. Silakan pilih ulang.");setSelected([]);await load()}else if(code==="SHOWTIME_STARTED"){toast.error("Jadwal sudah dimulai.");setError(getErrorMessage(e))}else if((e as {status?:number}).status===401){router.push(`/login?next=${encodeURIComponent(`/booking/${showtimeId}`)}`)}else toast.error(getErrorMessage(e))}finally{setSubmitting(false)}};
 return <Container navOffset className="py-8"><p className="mb-2 text-sm font-semibold uppercase tracking-[.2em] text-primary">Pilih Kursi</p><h1 className="mb-2 text-3xl font-bold">Pilih tempat duduk</h1>{show&&<p className="mb-8 text-sm text-fg-secondary">{show.movie.title} · {show.auditorium.theater.name} · {show.auditorium.name} · {formatDateTime(show.startsAt)}</p>}{loading?<div className="h-[440px] animate-pulse rounded-card bg-surface"/>:error?<ErrorState title="Peta kursi tidak tersedia" description={error}/>:map&&<div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="space-y-5"><SeatMapView seats={map.seats} selected={selected} onToggle={toggle}/><SeatLegend/><p className="text-center text-xs text-fg-muted">{map.summary.available} dari {map.summary.total} kursi tersedia</p></div><div className="lg:sticky lg:top-24 lg:h-fit"><BookingSummary count={selected.length} price={map.price} loading={submitting} onContinue={submit}/>{selected.length>0&&<p className="mt-3 text-center text-xs text-fg-secondary">Kursi: {map.seats.filter(s=>selected.includes(s.id)).map(s=>`${s.row}${s.number}`).join(", ")}</p>}</div></div>}</Container>
}
