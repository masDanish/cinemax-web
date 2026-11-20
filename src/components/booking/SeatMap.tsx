"use client";
import { motion } from "framer-motion";
import type { Seat } from "@/types/api";
import { seatLabel } from "@/lib/utils";
export function SeatMap({seats,selected,onToggle}:{seats:Seat[];selected:string[];onToggle:(id:string)=>void}){
 const rows=[...new Set(seats.map(s=>s.row))].sort();
 return <div className="overflow-x-auto rounded-card bg-surface p-4 sm:p-6"><div className="mx-auto mb-10 h-2 min-w-[420px] max-w-xl rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent shadow-[0_8px_30px_rgba(255,255,255,.16)]"/><p className="mb-8 text-center text-[10px] uppercase tracking-[.5em] text-fg-muted">Layar</p><div className="mx-auto w-fit min-w-[420px] space-y-2">{rows.map(row=><div key={row} className="flex items-center justify-center gap-2"><span className="w-5 text-xs text-fg-muted">{row}</span>{seats.filter(s=>s.row===row).sort((a,b)=>a.number-b.number).map(seat=>{const active=selected.includes(seat.id),taken=seat.status==="TAKEN";return <motion.button key={seat.id} whileTap={!taken?{scale:.88}:undefined} type="button" disabled={taken} onClick={()=>onToggle(seat.id)} aria-pressed={active} aria-label={`Kursi ${seatLabel(seat)}${taken?", terisi":""}`} className={`grid size-8 place-items-center rounded-t-lg rounded-b-sm text-[10px] font-semibold transition sm:size-9 ${taken?"cursor-not-allowed bg-seat-taken/50 text-white/40":active?"bg-primary text-white shadow-lg shadow-primary/30":"bg-seat-available text-white hover:bg-white/30"}`}>{seat.number}</motion.button>})}<span className="w-5 text-xs text-fg-muted">{row}</span></div>)}</div></div>
}
