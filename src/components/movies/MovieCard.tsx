"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Ticket } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Movie } from "@/types/api";
import { MoviePoster } from "./MoviePoster";

/**
 * Kartu film: scale saat hover + info tambahan (genre, durasi) yang muncul
 * di atas poster. Seluruh kartu adalah link ke detail film.
 */
export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      aria-label={`${movie.title}, ${formatDuration(movie.durationMinutes)}`}
      className="group relative block rounded-card focus-visible:z-10"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-card shadow-lg shadow-black/40 ring-1 ring-white/5 transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-black/80 group-hover:ring-white/20"
      >
        <MoviePoster movie={movie} />

        <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-linear-to-t from-black via-black/90 to-transparent px-3 pb-3 pt-14 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <p className="line-clamp-1 text-sm font-semibold">{movie.title}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-fg-secondary">
            <Clock className="size-3" aria-hidden />
            {formatDuration(movie.durationMinutes)}
          </p>
          {movie.genres.length > 0 && (
            <p className="mt-1 line-clamp-1 text-xs text-fg-muted">
              {movie.genres.map((g) => g.name).join(" • ")}
            </p>
          )}
          <span className="mt-2 inline-flex items-center gap-1 rounded-control bg-white px-2.5 py-1 text-xs font-semibold text-black">
            <Ticket className="size-3" aria-hidden />
            Pesan Tiket
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
