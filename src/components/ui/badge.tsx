import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { PAYMENT_STATUS, RESERVATION_STATUS } from "@/lib/constants";
import type { PaymentStatus, ReservationStatus } from "@/types/api";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "muted";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-white/10 text-fg",
  primary: "bg-primary/15 text-primary ring-1 ring-primary/40",
  success: "bg-success/15 text-success ring-1 ring-success/30",
  warning: "bg-warning/15 text-warning ring-1 ring-warning/30",
  danger: "bg-danger/15 text-danger ring-1 ring-danger/30",
  muted: "bg-white/5 text-fg-secondary ring-1 ring-line",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { label, tone } = RESERVATION_STATUS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, tone } = PAYMENT_STATUS[status];
  return <Badge tone={tone}>{label}</Badge>;
}
