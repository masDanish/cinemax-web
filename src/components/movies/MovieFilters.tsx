"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Filter katalog: pencarian judul (`q`) dan genre (`genre`) disimpan di URL.
 * Server Component halaman membaca query yang sama lalu memanggil API
 * (`GET /api/movies?q&genre&page&limit`). Mengubah filter selalu mereset `page`.
 *
 * Dipakai di dalam <Suspense> karena memakai useSearchParams.
 */
export function MovieFilters({ genres }: { genres: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const activeGenre = searchParams.get("genre") ?? "";
  const [text, setText] = useState(urlQuery);

  const update = useCallback(
    (changes: { q?: string | null; genre?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Debounce pencarian supaya tidak memanggil API di setiap ketukan.
  useEffect(() => {
    const next = text.trim();
    if (next === urlQuery) return;
    const id = setTimeout(() => update({ q: next || null }), 400);
    return () => clearTimeout(id);
  }, [text, urlQuery, update]);

  const isActive = (name: string) => activeGenre.toLowerCase() === name.toLowerCase();

  return (
    <div className="space-y-4">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: text.trim() || null });
        }}
        className="relative max-w-xl"
      >
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
          aria-hidden
        />
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cari judul film…"
          aria-label="Cari judul film"
          className="h-12 w-full rounded-full border border-line bg-elevated pl-11 pr-11 text-sm text-fg placeholder:text-fg-muted transition focus:border-white/60 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {text && (
          <button
            type="button"
            aria-label="Hapus pencarian"
            onClick={() => {
              setText("");
              update({ q: null });
            }}
            className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-fg-muted transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </form>

      {genres.length > 0 && (
        <div
          role="group"
          aria-label="Filter genre"
          className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {[{ label: "Semua", value: "" }, ...genres.map((g) => ({ label: g, value: g }))].map(
            ({ label, value }) => {
              const active = value === "" ? activeGenre === "" : isActive(value);
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ genre: value || null })}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-white text-black"
                      : "bg-elevated text-fg-secondary hover:bg-white/15 hover:text-white"
                  )}
                >
                  {label}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
