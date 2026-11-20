/**
 * Lapisan visual film di frontend.
 *
 * API film belum punya poster/backdrop, dan tidak ada field gambar yang dikirim
 * ke API. Maka tampilan poster dibuat generatif dan deterministik dari id film
 * (warna selalu sama untuk film yang sama), tanpa memakai gambar milik pihak lain.
 * Jika backend nanti punya field gambar, cukup ganti di MoviePoster/MovieBackdrop.
 */

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface MovieTheme {
  hue: number;
  hue2: number;
  /** Nilai CSS `background` untuk poster portrait. */
  poster: string;
  /** Nilai CSS `background` untuk backdrop lebar. */
  backdrop: string;
}

export function getMovieTheme(id: string): MovieTheme {
  const h = hashString(id);
  const hue = h % 360;
  const hue2 = (hue + 35 + ((h >> 8) % 70)) % 360;
  const angle = 120 + ((h >> 16) % 100);

  const poster = [
    `radial-gradient(120% 80% at 20% 8%, hsl(${hue} 72% 34% / 0.95) 0%, transparent 58%)`,
    `radial-gradient(100% 70% at 90% 92%, hsl(${hue2} 68% 28% / 0.9) 0%, transparent 62%)`,
    `linear-gradient(${angle}deg, hsl(${hue} 45% 11%), hsl(${hue2} 50% 6%))`,
  ].join(", ");

  const backdrop = [
    `radial-gradient(60% 90% at 78% 30%, hsl(${hue} 75% 36% / 0.85) 0%, transparent 60%)`,
    `radial-gradient(50% 80% at 95% 85%, hsl(${hue2} 70% 30% / 0.8) 0%, transparent 65%)`,
    `radial-gradient(40% 60% at 55% 10%, hsl(${hue2} 60% 22% / 0.6) 0%, transparent 70%)`,
    `linear-gradient(${angle}deg, hsl(${hue} 40% 9%), hsl(${hue2} 45% 5%))`,
  ].join(", ");

  return { hue, hue2, poster, backdrop };
}

/** Tekstur grain film (SVG inline, tanpa request jaringan). */
export const FILM_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/></svg>\")";
