"use client";

import { motion, type Variants } from "framer-motion";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/state";
import type { Movie } from "@/types/api";
import { MovieCard } from "./MovieCard";
import { MovieGridSkeleton } from "./MovieSkeletons";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

/** Grid poster responsif dengan animasi stagger, skeleton, dan empty state. */
export function MovieGrid({
  movies,
  loading = false,
  emptyTitle = "Film tidak ditemukan",
  emptyDescription = "Coba ubah kata kunci atau pilih genre lain.",
  emptyAction,
}: {
  movies: Movie[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}) {
  if (loading) return <MovieGridSkeleton />;

  if (movies.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-6" aria-hidden />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <motion.ul
      // key mengulang animasi saat daftar berganti (halaman / filter baru)
      key={movies.map((m) => m.id).join(",")}
      variants={list}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      {movies.map((movie) => (
        <motion.li key={movie.id} variants={item}>
          <MovieCard movie={movie} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
