import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DISPLAY_TIME_ZONE } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Harga di database adalah integer Rupiah. */
export function formatCurrency(amount: number) {
  return rupiah.format(amount);
}

export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: DISPLAY_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: DISPLAY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(iso))
    .replace(".", ":");
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

/** 135 -> "2j 15m" */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}j` : `${h}j ${m}m`;
}

export function seatLabel(seat: { row: string; number: number }) {
  return `${seat.row}${seat.number}`;
}

export function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

/** Total bayar reservasi = jumlah harga tiket (snapshot). */
export function reservationTotal(tickets: { price: number }[]) {
  return sum(tickets.map((t) => t.price));
}

/** Tanggal YYYY-MM-DD (zona waktu tampilan) -> awal / akhir hari dalam ISO UTC. */
export function dayRangeIso(dateYmd: string) {
  const offset = "+07:00"; // Asia/Jakarta tidak memakai DST
  return {
    from: new Date(`${dateYmd}T00:00:00.000${offset}`).toISOString(),
    to: new Date(`${dateYmd}T23:59:59.999${offset}`).toISOString(),
  };
}
