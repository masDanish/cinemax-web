"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { movieService, showtimeService, theaterService } from "@/services";
import type { Movie, ShowtimeListItem, TheaterWithAuditoriums } from "@/types/api";
import { MovieHero } from "@/components/movies/MovieHero";
import { MovieCarousel } from "@/components/movies/MovieCarousel";
import { MovieCarouselSkeleton } from "@/components/movies/MovieSkeletons";
import { Container, SectionHeading } from "@/components/ui/section";
import { ErrorState } from "@/components/ui/state";
import { formatDate, formatTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<ShowtimeListItem[]>([]);
  const [theaters, setTheaters] = useState<TheaterWithAuditoriums[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [movieResult, showResult, theaterResult] = await Promise.allSettled([
        movieService.list({ page: 1, limit: 50 }),
        showtimeService.list(),
        theaterService.list(),
      ]);
      if (!active) return;
      const failures: string[] = [];
      if (movieResult.status === "fulfilled") {
        try {
          const first = movieResult.value;
          const remaining = await Promise.all(
            Array.from({ length: Math.max(0, first.meta.totalPages - 1) }, (_, i) =>
              movieService.list({ page: i + 2, limit: 50 })
            )
          );
          if (active) setMovies([...first.items, ...remaining.flatMap((page) => page.items)]);
        } catch (e) {
          failures.push(getErrorMessage(e));
        }
      } else failures.push(getErrorMessage(movieResult.reason));
      if (showResult.status === "fulfilled") setShows(showResult.value);
      else failures.push(getErrorMessage(showResult.reason));
      if (theaterResult.status === "fulfilled") setTheaters(theaterResult.value);
      else failures.push(getErrorMessage(theaterResult.reason));
      if (active) {
        setError(failures.join(" "));
        setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const showingIds = new Set(shows.map((s) => s.movieId));
  const nowShowing = movies.filter((m) => showingIds.has(m.id));
  const newest = [...movies].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const genres: string[] = Array.from(new Set<string>(movies.flatMap((m) => m.genres.map((g) => g.name)))).sort();

  return (
    <div className="pb-12">
      {loading ? (
        <div className="h-[80svh] animate-pulse bg-surface" />
      ) : movies[0] ? (
        <MovieHero movie={movies[0]} />
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-fg-secondary">{error || "Belum ada film yang tersedia."}</p>
        </div>
      )}

      {error && (
        <Container>
          <ErrorState title="Sebagian konten gagal dimuat" description={error} />
        </Container>
      )}

      <div className="relative z-10 -mt-8 space-y-10">
        {loading ? (
          <Container><MovieCarouselSkeleton /></Container>
        ) : (
          <>
            <MovieCarousel title="Now Showing" movies={nowShowing} href="/movies" />
            <MovieCarousel title="New Releases" movies={newest} />
            {genres.length > 0 && (
              <Container>
                <SectionHeading title="Jelajahi Genre" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <Link key={g} href={`/movies?genre=${encodeURIComponent(g)}`}
                      className="rounded-full bg-elevated px-4 py-2 text-sm text-fg-secondary transition hover:bg-primary hover:text-white">
                      {g}
                    </Link>
                  ))}
                </div>
              </Container>
            )}
            <Container>
              <SectionHeading title="Lokasi Bioskop" href="/cinemas" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {theaters.slice(0, 6).map((t) => (
                  <Link key={t.id} href="/cinemas"
                    className="flex items-center gap-3 rounded-card bg-surface p-4 transition hover:bg-elevated">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
                      <MapPin className="size-5" />
                    </span>
                    <span>
                      <strong className="block">{t.name}</strong>
                      <span className="text-sm text-fg-secondary">{t.city}</span>
                    </span>
                    <ArrowRight className="ml-auto size-4 text-fg-muted" />
                  </Link>
                ))}
              </div>
            </Container>
            <Container>
              <SectionHeading title="Jadwal Mendatang" href="/cinemas" />
              <div className="mt-4 divide-y divide-line">
                {shows.slice(0, 8).map((s) => (
                  <Link key={s.id} href={`/booking/${s.id}?movieId=${s.movieId}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 hover:text-primary">
                    <span>
                      <strong className="block text-sm">{s.movie.title}</strong>
                      <span className="text-xs text-fg-muted">{s.auditorium.theater.name} · {s.auditorium.name}</span>
                    </span>
                    <span className="text-sm text-fg-secondary">{formatDate(s.startsAt)} · {formatTime(s.startsAt)}</span>
                  </Link>
                ))}
                {shows.length === 0 && <p className="py-8 text-sm text-fg-muted">Belum ada jadwal mendatang.</p>}
              </div>
            </Container>
          </>
        )}
      </div>
    </div>
  );
}
