"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock, CalendarDays, MapPin } from "lucide-react";
import { movieService } from "@/services";
import type { MovieDetail, MovieShowtime } from "@/types/api";
import { MovieBackdrop } from "@/components/movies/MovieBackdrop";
import { MoviePoster } from "@/components/movies/MoviePoster";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { formatCurrency, formatDate, formatDuration, formatTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
export default function MovieDetailPage(){
 const {id}=useParams<{id:string}>(); const [movie,setMovie]=useState<MovieDetail|null>(null);const [error,setError]=useState("");const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;movieService.get(id).then(v=>{if(active)setMovie(v)}).catch(e=>{if(active)setError(getErrorMessage(e))}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[id]);
 if(loading)return <div className="min-h-screen animate-pulse bg-surface"/>;
 if(error||!movie)return <Container navOffset><ErrorState title="Detail film tidak tersedia" description={error||"Film tidak ditemukan."}/></Container>;
 const days=movie.showtimes.reduce<Record<string, typeof movie.showtimes>>((acc,s)=>{const key=formatDate(s.startsAt);(acc[key]??=[]).push(s);return acc;},{});
 return <><section className="relative min-h-[540px] overflow-hidden"><MovieBackdrop movieId={movie.id}/><div className="absolute inset-0 bg-linear-to-r from-bg via-bg/80 to-bg/20"/><div className="absolute inset-0 bg-linear-to-t from-bg to-transparent"/><Container className="relative grid min-h-[540px] items-end gap-8 pb-14 pt-32 md:grid-cols-[220px_1fr]"><div className="hidden md:block"><MoviePoster movie={movie} /></div><div className="max-w-3xl"><p className="mb-3 text-sm font-semibold uppercase tracking-[.2em] text-primary">Detail Film</p><h1 className="font-display text-5xl uppercase sm:text-7xl">{movie.title}</h1><div className="my-4 flex flex-wrap items-center gap-3 text-sm text-fg-secondary"><span className="flex items-center gap-2"><Clock className="size-4"/>{formatDuration(movie.durationMinutes)}</span>{movie.genres.map(g=><Badge key={g.id}>{g.name}</Badge>)}</div><p className="max-w-2xl leading-7 text-fg-secondary">{movie.description||"Belum ada deskripsi untuk film ini."}</p></div></Container></section><Container className="py-10"><h2 className="mb-6 text-2xl font-bold">Jadwal Tayang</h2>{movie.showtimes.length===0?<EmptyState title="Belum ada jadwal tayang" description="Jadwal untuk film ini belum tersedia."/>:<div className="space-y-8">{Object.keys(days).map((day) => {
 const dayShows: MovieShowtime[] = days[day] ?? [];
 const grouped = dayShows.reduce<Record<string, MovieShowtime[]>>((acc, show) => {
   (acc[show.auditorium.theater.name] ??= []).push(show);
   return acc;
 }, {});
 return <section key={day}>
   <h3 className="mb-4 flex items-center gap-2 font-semibold"><CalendarDays className="size-4 text-primary"/>{day}</h3>
   <div className="grid gap-4 lg:grid-cols-2">
     {Object.keys(grouped).map((theaterName) => {
       const group = grouped[theaterName];
       return <div key={theaterName} className="space-y-3">
         <p className="flex items-center gap-2 text-sm text-fg-secondary"><MapPin className="size-4"/>{theaterName} · {group[0].auditorium.theater.city}</p>
         <div className="flex flex-wrap gap-2">{group.map((show) => <Link key={show.id} href={`/booking/${show.id}?movieId=${movie.id}`} className="rounded-control border border-line bg-surface px-4 py-3 transition hover:border-primary"><span className="block font-semibold">{formatTime(show.startsAt)}</span><span className="mt-1 block text-xs text-fg-secondary">{show.auditorium.name} · {formatCurrency(show.price)}</span></Link>)}</div>
       </div>;
     })}
   </div>
 </section>;
})}</div>}</Container></>;
}
