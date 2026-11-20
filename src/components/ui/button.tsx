import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "light" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  light: "bg-white text-black hover:bg-white/80",
  secondary: "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25",
  outline: "border border-line text-fg hover:bg-elevated",
  ghost: "text-fg-secondary hover:bg-white/10 hover:text-white",
  danger: "bg-danger text-white hover:bg-danger/80",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children?: ReactNode;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, CommonProps {
  /** Menampilkan spinner dan menonaktifkan tombol. */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export interface ButtonLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    CommonProps {
  href: string;
}

export function ButtonLink({
  href,
  variant,
  size,
  fullWidth,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonStyles({ variant, size, fullWidth, className })} {...props}>
      {children}
    </Link>
  );
}
