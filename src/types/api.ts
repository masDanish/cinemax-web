/**
 * Tipe respons backend Movie Reservation API.
 * Diturunkan langsung dari prisma/schema.prisma dan src/modules/* di backend.
 * Semua tanggal datang sebagai string ISO-8601 (hasil serialisasi JSON).
 */

export type Role = "USER" | "ADMIN";
export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type SeatStatus = "AVAILABLE" | "TAKEN";

/* ----------------------------- Error ----------------------------- */

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** Hanya ada pada VALIDATION_ERROR (Zod). */
    details?: ApiErrorDetail[];
  };
}

/* ------------------------------ Auth ------------------------------ */

export interface User {
  id: string;
  email: string;
  role: Role;
  /** Hanya dikembalikan oleh register. Login tidak mengirim createdAt. */
  createdAt?: string;
}

/** Respons asli backend untuk register & login. Token tidak pernah sampai ke browser. */
export interface BackendAuthResponse {
  user: User;
  token: string;
}

/** Respons BFF frontend (/api/auth/*): token disimpan di httpOnly cookie. */
export interface SessionResponse {
  user: User | null;
}

export interface LoginInput {
  email: string;
  password: string;
  /** Hanya dipakai frontend untuk menentukan masa hidup cookie. */
  remember?: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
}

/* ------------------------------ Movies ----------------------------- */

export interface Genre {
  id: string;
  name: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
  genres: Genre[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MovieListResponse {
  items: Movie[];
  meta: PageMeta;
}

export interface MovieListQuery {
  genre?: string;
  q?: string;
  page?: number;
  /** 1 sampai 50, default backend 10. */
  limit?: number;
}

export interface MovieInput {
  title: string;
  description?: string;
  /** Integer 1 sampai 600. */
  durationMinutes: number;
  genres: string[];
}

export type MovieUpdateInput = Partial<MovieInput>;

/* ------------------------------ Theaters --------------------------- */

export interface Theater {
  id: string;
  name: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditoriumSummary {
  id: string;
  name: string;
  _count: { seats: number };
}

export interface TheaterWithAuditoriums extends Theater {
  auditoriums: AuditoriumSummary[];
}

export interface TheaterInput {
  name: string;
  city: string;
}

export interface AuditoriumInput {
  name: string;
  /** 1 sampai 26 (baris A..Z). */
  rows: number;
  /** 1 sampai 40. */
  seatsPerRow: number;
}

export interface AuditoriumCreated {
  id: string;
  theaterId: string;
  name: string;
  totalSeats: number;
}

/* ----------------------------- Showtimes --------------------------- */

/** Baris tabel Showtime apa adanya (POST /api/showtimes mengembalikan ini). */
export interface Showtime {
  id: string;
  movieId: string;
  auditoriumId: string;
  startsAt: string;
  /** Harga per kursi, integer (Rupiah). */
  price: number;
  createdAt: string;
}

/** GET /api/showtimes (hanya jadwal mulai dari `from`, default sekarang). */
export interface ShowtimeListItem extends Showtime {
  movie: { id: string; title: string; durationMinutes: number };
  auditorium: {
    id: string;
    name: string;
    theater: { id: string; name: string; city: string };
  };
}

/** Jadwal di dalam GET /api/movies/:id (hanya yang belum mulai). */
export interface MovieShowtime extends Showtime {
  auditorium: { id: string; name: string; theater: Theater };
}

export interface MovieDetail extends Movie {
  showtimes: MovieShowtime[];
}

export interface ShowtimeListQuery {
  movieId?: string;
  theaterId?: string;
  /** ISO string atau YYYY-MM-DD. Default backend: sekarang. */
  from?: string;
  to?: string;
}

export interface ShowtimeInput {
  movieId: string;
  auditoriumId: string;
  /** ISO string. Harus di masa depan. */
  startsAt: string;
  price: number;
}

/* ------------------------------ Seats ------------------------------ */

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export interface SeatMap {
  showtimeId: string;
  /** Hanya judul film (bukan id). */
  movie: string;
  startsAt: string;
  price: number;
  summary: { total: number; taken: number; available: number };
  seats: Seat[];
}

/* ---------------------------- Reservations ------------------------- */

export interface ReservationTicket {
  id: string;
  reservationId: string;
  showtimeId: string;
  seatId: string;
  /** Snapshot harga saat dipesan. */
  price: number;
  seat: { row: string; number: number };
}

export interface Reservation {
  id: string;
  userId: string;
  showtimeId: string;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  showtime: {
    startsAt: string;
    price: number;
    movie: { id: string; title: string };
    auditorium: { name: string; theater: { name: string; city: string } };
  };
  /** Kosong ([]) untuk reservasi CANCELLED dan EXPIRED: backend menghapus tiketnya. */
  tickets: ReservationTicket[];
  /** null jika checkout belum pernah dimulai. */
  payment: { status: PaymentStatus } | null;
}

export interface ReservationInput {
  showtimeId: string;
  /** 1 sampai 6 id kursi, tanpa duplikat. */
  seatIds: string[];
}

export interface CancelReservationResponse {
  id: string;
  status: "CANCELLED";
  refunded: boolean;
}

/* ------------------------------ Payments --------------------------- */

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

/* ------------------------------ Reports ---------------------------- */

export interface ReportShowtime {
  showtimeId: string;
  movie: string;
  auditorium: string;
  startsAt: string;
  capacity: number;
  sold: number;
  /** 0 sampai 100, satu desimal. */
  occupancyPercent: number;
}

export interface Report {
  totalRevenue: number;
  totalTicketsSold: number;
  showtimes: ReportShowtime[];
}

export interface ReportQuery {
  from?: string;
  to?: string;
}
