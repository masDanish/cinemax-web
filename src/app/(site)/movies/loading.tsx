"use client";
import { Container } from "@/components/ui/section";
import { MovieGridSkeleton } from "@/components/movies/MovieSkeletons";
export default function Loading(){return <Container navOffset className="space-y-8 py-10"><div className="h-10 w-64 animate-pulse rounded bg-surface"/><div className="h-12 max-w-xl animate-pulse rounded-full bg-surface"/><MovieGridSkeleton/></Container>}
