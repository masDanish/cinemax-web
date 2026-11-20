import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Daftar halaman dengan elipsis, mis. [1, "…", 4, 5, 6, "…", 12]. */
function pageWindow(page: number, total: number): (number | "…")[] {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

const item =
  "grid h-10 min-w-10 place-items-center rounded-control px-3 text-sm font-medium transition";

/** Pagination berbasis link (bisa dipakai di Server Component). Pagination asli dari API. */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(item, "text-fg-secondary hover:bg-elevated")} aria-label="Halaman sebelumnya">
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={cn(item, "opacity-30")} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-fg-muted" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              item,
              p === page ? "bg-primary text-white" : "text-fg-secondary hover:bg-elevated"
            )}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={cn(item, "text-fg-secondary hover:bg-elevated")} aria-label="Halaman berikutnya">
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={cn(item, "opacity-30")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
