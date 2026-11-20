import { FILM_GRAIN, getMovieTheme } from "@/lib/movie-visuals";
import { cn } from "@/lib/utils";

/** Backdrop lebar (generatif). Isi penuh parent: parent harus `relative`. */
export function MovieBackdrop({ movieId, className }: { movieId: string; className?: string }) {
  const theme = getMovieTheme(movieId);

  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden", className)} style={{ background: theme.backdrop }}>
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: FILM_GRAIN }}
      />
      {/* Garis horizontal tipis ala letterbox/lens flare */}
      <div
        className="absolute right-[8%] top-[34%] h-px w-[46%] opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(${theme.hue} 90% 70%), transparent)`,
        }}
      />
    </div>
  );
}
