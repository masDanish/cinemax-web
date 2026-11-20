import type { PaymentStatus, ReservationStatus } from "@/types/api";

export const BRAND = {
  name: "CINEMAX",
  tagline: "Your Next Movie Experience.",
} as const;

/** Sesuai aturan bisnis backend. */
export const MAX_SEATS_PER_RESERVATION = 6;
export const HOLD_MINUTES = 15;
/** Jam dan tanggal ditampilkan dalam zona waktu ini. */
export const DISPLAY_TIME_ZONE = "Asia/Jakarta";

export const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/movies", label: "Film" },
  { href: "/cinemas", label: "Bioskop" },
  { href: "/my-tickets", label: "Tiket Saya" },
] as const;

export const RESERVATION_STATUS: Record<
  ReservationStatus,
  { label: string; tone: "warning" | "success" | "muted" | "danger" }
> = {
  PENDING: { label: "Menunggu pembayaran", tone: "warning" },
  CONFIRMED: { label: "Terkonfirmasi", tone: "success" },
  CANCELLED: { label: "Dibatalkan", tone: "muted" },
  EXPIRED: { label: "Kedaluwarsa", tone: "danger" },
};

export const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; tone: "warning" | "success" | "muted" | "danger" }
> = {
  PENDING: { label: "Belum dibayar", tone: "warning" },
  PAID: { label: "Lunas", tone: "success" },
  FAILED: { label: "Gagal", tone: "danger" },
  REFUNDED: { label: "Dikembalikan", tone: "muted" },
};

/** Route yang butuh login / role ADMIN. Dipakai oleh proxy.ts dan navigasi. */
export const PROTECTED_PREFIXES = ["/booking", "/my-tickets", "/profile", "/checkout", "/payment"] as const;
export const ADMIN_PREFIX = "/admin";
