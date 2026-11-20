import type { ApiClient } from "@/lib/api";
import type {
  CancelReservationResponse,
  Reservation,
  ReservationInput,
} from "@/types/api";

export function createReservationService(client: ApiClient) {
  return {
    /** POST /api/reservations (login). 409 SEAT_TAKEN jika kursi sudah diambil. */
    create: (input: ReservationInput) => client.post<Reservation>("/reservations", input),
    /** GET /api/reservations (login): hanya milik user sendiri, termasuk untuk ADMIN. */
    list: () => client.get<Reservation[]>("/reservations"),
    /** GET /api/reservations/:id (login). Admin boleh membuka reservasi siapa pun. */
    get: (id: string) => client.get<Reservation>(`/reservations/${encodeURIComponent(id)}`),
    /** DELETE /api/reservations/:id (login). Refund otomatis jika sudah dibayar. */
    cancel: (id: string) =>
      client.delete<CancelReservationResponse>(`/reservations/${encodeURIComponent(id)}`),
  };
}
