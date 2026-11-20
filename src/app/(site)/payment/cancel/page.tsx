"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PaymentVerification } from "@/components/booking/PaymentVerification";
function Content(){const id=useSearchParams().get("reservationId");return id?<PaymentVerification reservationId={id} mode="cancel"/>:<p className="pt-32 text-center text-fg-secondary">Kode reservasi tidak ditemukan pada URL.</p>}
export default function Page(){return <Suspense fallback={<div className="h-96 animate-pulse bg-surface"/>}><Content/></Suspense>}
