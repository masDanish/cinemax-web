import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MovieCardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("aspect-2/3 w-full", className)} />;
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      aria-busy
      aria-label="Memuat daftar film"
    >
      {Array.from({ length: count }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MovieCarouselSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-busy aria-label="Memuat film" className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }, (_, i) => (
          <MovieCardSkeleton key={i} className="w-[140px] shrink-0 sm:w-[170px] lg:w-[200px]" />
        ))}
      </div>
    </div>
  );
}

export function MovieHeroSkeleton() {
  return (
    <div aria-busy aria-label="Memuat film pilihan" className="relative h-[78svh] min-h-[520px] bg-surface">
      <div className="absolute bottom-16 left-4 w-full max-w-xl space-y-4 sm:left-6 lg:left-12">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    </div>
  );
}
