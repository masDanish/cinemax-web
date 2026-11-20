import { FILM_GRAIN, getMovieTheme } from "@/lib/movie-visuals";
import { cn } from "@/lib/utils";
import type { Movie } from "@/types/api";

type PosterMovie = Pick<Movie, "id" | "title"> & { genres?: Movie["genres"] };

/** Poster portrait 2:3 (generatif, lihat lib/movie-visuals.ts). */
export function MoviePoster({ movie, className }: { movie: PosterMovie; className?: string }) {
  const theme = getMovieTheme(movie.id);
  const firstGenre = movie.genres?.[0]?.name;

  return (
    <div
      role="img"
      aria-label={`Poster film ${movie.title}`}
      className={cn("@container relative aspect-2/3 w-full overflow-hidden bg-surface", className)}
      style={{ background: theme.poster }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ backgroundImage: FILM_GRAIN }}
      />
      {/* Huruf awal raksasa sebagai ornamen */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[8cqw] -top-[10cqw] font-display leading-none text-white/[0.07]"
        style={{ fontSize: "95cqw" }}
      >
        {movie.title.trim().charAt(0).toUpperCase()}
      </span>

      {firstGenre && (
        <span className="absolute left-[8cqw] top-[8cqw] rounded-full bg-black/40 px-[3cqw] py-[1cqw] text-[5cqw] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
          {firstGenre}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent px-[8cqw] pb-[9cqw] pt-[24cqw]">
        <p
          className="line-clamp-4 font-display uppercase leading-[0.95] tracking-wide text-white"
          style={{ fontSize: "clamp(1.1rem, 15cqw, 3.5rem)" }}
        >
          {movie.title}
        </p>
      </div>
    </div>
  );
}
