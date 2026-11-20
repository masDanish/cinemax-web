import { Suspense } from "react";
import { serverMovies } from "@/services/server";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { MovieFilters } from "@/components/movies/MovieFilters";
import { Pagination } from "@/components/ui/pagination";
import { Container, SectionHeading } from "@/components/ui/section";
import { ErrorState } from "@/components/ui/state";
import type { Movie } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";

export default async function MoviesPage({searchParams}:{searchParams:Promise<{q?:string;genre?:string;page?:string}>}) {
 const sp=await searchParams, page=Math.max(1,Number.parseInt(sp.page||"1",10)||1), q=sp.q||"", genre=sp.genre||"";
 let data: {items:Movie[];meta:{page:number;totalPages:number;total:number}}, genres:string[]=[];
 let error="";
 try {
   const result = await serverMovies.list({q,genre,page,limit:18});
   data=result;
   const first = await serverMovies.list({page:1,limit:50});
   const pages = await Promise.all(Array.from({length:Math.max(0,first.meta.totalPages-1)},(_,i)=>serverMovies.list({page:i+2,limit:50})));
   const allMovies = [...first.items,...pages.flatMap(v=>v.items)];
   genres=[...new Set(allMovies.flatMap(m=>m.genres.map(g=>g.name)))].sort((a,b)=>a.localeCompare(b));
 } catch(e){error=getErrorMessage(e); data={items:[],meta:{page,totalPages:0,total:0}};}
 const hrefFor=(p:number)=>{const x=new URLSearchParams();if(q)x.set("q",q);if(genre)x.set("genre",genre);x.set("page",String(p));return `/movies?${x}`};
 return <Container navOffset className="space-y-8 py-10"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[.2em] text-primary">Katalog CINEMAX</p><SectionHeading title="Jelajahi Film"/></div><Suspense fallback={<div className="h-28 animate-pulse bg-surface"/>}><MovieFilters genres={genres}/></Suspense>{error?<ErrorState title="Film tidak dapat dimuat" description={error}/>:<><div className="flex justify-between text-sm text-fg-muted"><span>{data.meta.total} film ditemukan</span><span>Halaman {data.meta.page} dari {data.meta.totalPages||1}</span></div><MovieGrid movies={data.items}/><Pagination page={data.meta.page} totalPages={data.meta.totalPages} hrefFor={hrefFor}/></>}</Container>;
}
