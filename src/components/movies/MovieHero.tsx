"use client";

import { motion } from "framer-motion";
import { Clock, Info, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import type { Movie } from "@/types/api";
import { MovieBackdrop } from "./MovieBackdrop";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Hero banner besar. Tombol trailer sengaja tidak ada karena API tidak
 * menyediakan sumber trailer.
 */
export function MovieHero({
  movie,
  eyebrow = "Film Pilihan",
}: {
  movie: Movie;
  eyebrow?: string;
}) {
  return (
    <section
      aria-label={`Film pilihan: ${movie.title}`}
      className="relative h-[82svh] min-h-[540px] w-full overflow-hidden sm:h-[86svh] sm:max-h-[900px]"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease }}
      >
        <MovieBackdrop movieId={movie.id} />
      </motion.div>

      {/* Gradient agar teks terbaca dan menyatu dengan background halaman */}
      <div aria-hidden className="absolute inset-0 bg-linear-to-r from-bg via-bg/55 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-bg via-transparent to-bg/60" />

      <div className="relative mx-auto flex h-full w-full max-w-[1600px] items-end px-4 pb-16 sm:px-6 sm:pb-24 lg:px-12">
        <motion.div
          className="max-w-2xl space-y-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
        >
          <Badge tone="primary">{eyebrow}</Badge>

          <h1 className="font-display text-6xl uppercase leading-[0.9] tracking-wide text-balance drop-shadow-lg sm:text-7xl lg:text-8xl">
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {formatDuration(movie.durationMinutes)}
            </span>
            {movie.genres.map((g) => (
              <Badge key={g.id} tone="muted">
                {g.name}
              </Badge>
            ))}
          </div>

          {movie.description && (
            <p className="line-clamp-3 max-w-xl text-base text-white/85 drop-shadow sm:text-lg">
              {movie.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={`/movies/${movie.id}`} variant="light" size="lg">
              <Ticket className="size-5" aria-hidden />
              Pesan Tiket
            </ButtonLink>
            <ButtonLink href={`/movies/${movie.id}`} variant="secondary" size="lg">
              <Info className="size-5" aria-hidden />
              Info Selengkapnya
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
