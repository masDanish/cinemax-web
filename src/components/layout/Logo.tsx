import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <Link
      href="/"
      aria-label="CINEMAX, ke beranda"
      className={cn("inline-flex items-center gap-2 font-display tracking-wider", className)}
    >
      <Clapperboard
        className={cn("text-primary", size === "lg" ? "size-8" : "size-6")}
        strokeWidth={2.25}
        aria-hidden
      />
      <span className={cn("leading-none text-white", size === "lg" ? "text-4xl" : "text-[1.7rem]")}>
        CINE<span className="text-primary">MAX</span>
      </span>
    </Link>
  );
}
