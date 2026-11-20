"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pencarian di navbar: mengarahkan ke /movies?q=<kata kunci>.
 * `inline` = selalu terbuka (dipakai di menu mobile).
 */
export function NavSearch({
  inline = false,
  onNavigate,
}: {
  inline?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const expanded = inline || open;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/movies?q=${encodeURIComponent(q)}` : "/movies");
    setOpen(false);
    onNavigate?.();
  };

  const field = (
    <input
      ref={inputRef}
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      placeholder="Cari judul film…"
      aria-label="Cari judul film"
      className="h-full w-full bg-transparent pr-3 text-sm text-white placeholder:text-fg-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
    />
  );

  if (inline) {
    return (
      <form role="search" onSubmit={submit} className="flex h-11 items-center gap-2 rounded-control border border-line bg-elevated px-3">
        <Search className="size-4 shrink-0 text-fg-muted" aria-hidden />
        {field}
      </form>
    );
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        "flex h-10 items-center rounded-control transition-colors",
        expanded && "border border-white/70 bg-black/70"
      )}
    >
      <button
        type={expanded ? "submit" : "button"}
        onClick={() => !expanded && setOpen(true)}
        aria-label={expanded ? "Cari" : "Buka pencarian"}
        className="grid size-10 shrink-0 place-items-center text-white transition hover:text-fg-secondary"
      >
        <Search className="size-5" aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="field"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-hidden"
          >
            {field}
          </motion.div>
        )}
      </AnimatePresence>
      {expanded && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup pencarian"
          className="mr-1 grid size-7 shrink-0 place-items-center rounded-full text-fg-muted hover:text-white"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
