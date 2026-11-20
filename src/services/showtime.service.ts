import type { ApiClient } from "@/lib/api";
import type {
  Showtime,
  ShowtimeInput,
  ShowtimeListItem,
  ShowtimeListQuery,
  SeatMap,
} from "@/types/api";

export function createShowtimeService(client: ApiClient) {
  return {
    /**
     * GET /api/showtimes?movieId&theaterId&from&to (publik; tanpa pagination).
     * Tanpa `from`, backend hanya mengembalikan jadwal yang belum mulai.
     */
    list: (query: ShowtimeListQuery = {}) =>
      client.get<ShowtimeListItem[]>("/showtimes", { query: { ...query } }),
    /** POST /api/showtimes (ADMIN). 409 SHOWTIME_CONFLICT jika bentrok di studio yang sama. */
    create: (input: ShowtimeInput) => client.post<Showtime>("/showtimes", input),
    /** GET /api/showtimes/:id/seats (publik). Backend adalah sumber kebenaran status kursi. */
    seats: (showtimeId: string) =>
      client.get<SeatMap>(`/showtimes/${encodeURIComponent(showtimeId)}/seats`),
  };
}
