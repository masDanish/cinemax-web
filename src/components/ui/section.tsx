import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Lebar konten standar. `navOffset` memberi ruang untuk navbar yang fixed. */
export function Container({
  className,
  navOffset = false,
  children,
}: {
  className?: string;
  navOffset?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12",
        navOffset && "pt-24 sm:pt-28",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  href,
  hrefLabel = "Lihat semua",
  className,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-0.5 text-sm text-fg-secondary transition hover:text-white"
        >
          {hrefLabel}
          <ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
