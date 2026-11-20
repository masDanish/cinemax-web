"use client";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container } from "@/components/ui/section";
export default function RegisterPage(){return <Container navOffset className="max-w-lg py-16"><div className="rounded-card bg-surface p-7 sm:p-10"><p className="mb-2 text-sm font-semibold uppercase tracking-[.2em] text-primary">Mulai sekarang</p><h1 className="mb-2 text-3xl font-bold">Buat akun CINEMAX</h1><p className="mb-8 text-sm text-fg-secondary">Satu akun untuk semua reservasi film Anda.</p><Suspense fallback={<div className="h-64 animate-pulse bg-elevated"/>}><AuthForm mode="register"/></Suspense></div></Container>}
