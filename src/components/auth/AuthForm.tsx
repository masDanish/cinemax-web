"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema } from "@/lib/schemas";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getErrorMessage, getFieldErrors, ApiError } from "@/lib/errors";
import { toast } from "sonner";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const { login, register: signUp } = useAuth();
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  const form = useForm<any>({ resolver: zodResolver(isLogin ? loginSchema : registerSchema) as never, defaultValues: isLogin ? { email:"", password:"", remember:true } : { email:"", password:"", confirmPassword:"" } });
  const submit = async (values: any) => {
    setServerError(""); setFieldErrors({});
    try {
      if (isLogin) {
        const v = values;
        await login({ email:v.email, password:v.password, remember:v.remember });
      } else {
        const v = values;
        await signUp({ email:v.email, password:v.password, confirmPassword:v.confirmPassword });
      }
      toast.success(isLogin ? "Berhasil masuk." : "Akun berhasil dibuat.");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
      router.refresh();
    } catch (error) {
      const details = getFieldErrors(error);
      if (error instanceof ApiError && error.code === "EMAIL_TAKEN") {
        details.email = error.message || "Email sudah terdaftar.";
      }
      if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
        details.password = error.message || "Email atau kata sandi tidak sesuai.";
      }
      setServerError(error instanceof ApiError && ["EMAIL_TAKEN", "INVALID_CREDENTIALS", "VALIDATION_ERROR"].includes(error.code) ? "" : getErrorMessage(error));
      setFieldErrors(details);
      if (details.email) form.setError("email", { message:details.email });
      if (details.password) form.setError("password", { message:details.password });
    }
  };
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
    {serverError && <p role="alert" className="rounded-control bg-danger/10 px-4 py-3 text-sm text-danger">{serverError}</p>}
    <Input label="Alamat email" type="email" autoComplete="email" placeholder="nama@email.com" {...form.register("email")} error={form.formState.errors.email?.message || fieldErrors.email} />
    <Input label="Kata sandi" type="password" autoComplete={isLogin?"current-password":"new-password"} placeholder="Minimal 8 karakter" {...form.register("password")} error={form.formState.errors.password?.message || fieldErrors.password} />
    {!isLogin && <Input label="Konfirmasi kata sandi" type="password" autoComplete="new-password" {...form.register("confirmPassword")} error={form.formState.errors.confirmPassword?.message as string | undefined} />}
    {isLogin && <label className="flex items-center gap-2 text-sm text-fg-secondary"><input type="checkbox" className="accent-primary" {...form.register("remember")} /> Ingat saya</label>}
    <Button type="submit" fullWidth size="lg" loading={form.formState.isSubmitting}>{isLogin?"Masuk":"Buat akun"}</Button>
    <p className="text-center text-sm text-fg-secondary">{isLogin?"Belum punya akun?":"Sudah punya akun?"} <Link className="font-semibold text-white hover:text-primary" href={isLogin?"/register":"/login"}>{isLogin?"Daftar sekarang":"Masuk"}</Link></p>
  </form>;
}
