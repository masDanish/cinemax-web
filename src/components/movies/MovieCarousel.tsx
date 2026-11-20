"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import type { Movie } from "@/types/api";
import { MovieCard } from "./MovieCard";

/** Baris film horizontal ala Netflix: scroll-snap + tombol panah (desktop). */
export function MovieCarousel({
  title,
  movies,
  href,
}: {
  title: string;
  movies: Movie[];
  href?: string;
}) {
  const scroller = useRef<HTMLUListElement>(null);

  if (movies.length === 0) return null;

  const scrollBy = (direction: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section aria-label={title} className="group/row space-y-3">
      <div className="px-4 sm:px-6 lg:px-12">
        <SectionHeading title={title} href={href} />
      </div>

      <div className="relative">
        <ul
          ref={scroller}
          className="scrollbar-hide flex snap-x snap-proximity gap-3 overflow-x-auto scroll-px-4 px-4 py-3 sm:gap-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-12 lg:px-12"
        >
          {movies.map((movie) => (
            <li
              key={movie.id}
              className="w-[140px] shrink-0 snap-start sm:w-[170px] lg:w-[200px]"
            >
              <MovieCard movie={movie} />
            </li>
          ))}
        </ul>

        {(["prev", "next"] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => scrollBy(dir === "prev" ? -1 : 1)}
            aria-label={dir === "prev" ? "Geser ke kiri" : "Geser ke kanan"}
            className={`absolute inset-y-3 z-10 hidden w-12 items-center justify-center bg-black/50 text-white opacity-0 transition hover:bg-black/70 group-hover/row:opacity-100 focus-visible:opacity-100 md:flex ${
              dir === "prev" ? "left-0 rounded-r-card" : "right-0 rounded-l-card"
            }`}
          >
            {dir === "prev" ? (
              <ChevronLeft className="size-7" aria-hidden />
            ) : (
              <ChevronRight className="size-7" aria-hidden />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
