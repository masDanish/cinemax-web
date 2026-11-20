"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Armchair } from "lucide-react";
import { theaterService, showtimeService } from "@/services";
import type { TheaterWithAuditoriums, ShowtimeListItem } from "@/types/api";
import { Container } from "@/components/ui/section";
import { ErrorState, EmptyState } from "@/components/ui/state";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";

export default function CinemasPage() {
  const [theaters, setTheaters] = useState<TheaterWithAuditoriums[]>([]);
  const [shows, setShows] = useState<ShowtimeListItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([theaterService.list(), showtimeService.list()])
      .then(([theaterResult, showResult]) => {
        if (!active) return;
        const failures: string[] = [];
        if (theaterResult.status === "fulfilled") setTheaters(theaterResult.value);
        else failures.push(getErrorMessage(theaterResult.reason));
        if (showResult.status === "fulfilled") setShows(showResult.value);
        else failures.push(getErrorMessage(showResult.reason));
        setError(failures.join(" "));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <Container navOffset className="py-10">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[.2em] text-primary">Lokasi</p>
      <h1 className="mb-8 text-4xl font-bold">Bioskop CINEMAX</h1>
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-56 animate-pulse rounded-card bg-surface" />)}
        </div>
      ) : theaters.length === 0 ? (
        error ? <ErrorState title="Data bioskop gagal dimuat" description={error} /> :
          <EmptyState title="Belum ada bioskop" description="Data bioskop belum tersedia." />
      ) : (
        <>
          {error && <p role="alert" className="mb-5 text-sm text-warning">{error}</p>}
          <div className="grid gap-6 md:grid-cols-2">
            {theaters.map((theater) => {
              const theaterShows = shows.filter((show) => show.auditorium.theater.id === theater.id);
              return (
                <article key={theater.id} className="space-y-5 rounded-card bg-surface p-6">
                  <div>
                    <h2 className="text-xl font-bold">{theater.name}</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-fg-secondary">
                      <MapPin className="size-4" />{theater.city}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-fg-secondary">
                    <span className="flex items-center gap-2"><Building2 className="size-4" />{theater.auditoriums.length} studio</span>
                    <span className="flex items-center gap-2"><Armchair className="size-4" />{theater.auditoriums.reduce((total, auditorium) => total + auditorium._count.seats, 0)} kursi</span>
                  </div>
                  <div className="border-t border-line pt-4">
                    <h3 className="mb-3 text-sm font-semibold">Jadwal tersedia ({theaterShows.length})</h3>
                    {theaterShows.length === 0 ? (
                      <p className="text-sm text-fg-muted">Belum ada jadwal mendatang.</p>
                    ) : (
                      <div className="space-y-2">
                        {theaterShows.map((show) => (
                          <Link key={show.id} href={`/booking/${show.id}?movieId=${show.movieId}`}
                            className="flex items-center justify-between gap-3 rounded-control px-2 py-2 hover:bg-elevated">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{show.movie.title}</span>
                              <span className="text-xs text-fg-muted">{formatDate(show.startsAt)} · {formatTime(show.startsAt)} · {show.auditorium.name}</span>
                            </span>
                            <span className="shrink-0 text-xs text-fg-secondary">{formatCurrency(show.price)}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </Container>
  );
}
