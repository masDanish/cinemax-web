import type { ApiClient } from "@/lib/api";
import type {
  AuditoriumCreated,
  AuditoriumInput,
  Theater,
  TheaterInput,
  TheaterWithAuditoriums,
} from "@/types/api";

export function createTheaterService(client: ApiClient) {
  return {
    /** GET /api/theaters (publik; tanpa pagination) */
    list: () => client.get<TheaterWithAuditoriums[]>("/theaters"),
    /** POST /api/theaters (ADMIN) */
    create: (input: TheaterInput) => client.post<Theater>("/theaters", input),
    /** POST /api/theaters/:id/auditoriums (ADMIN). Kursi dibuat otomatis oleh backend. */
    createAuditorium: (theaterId: string, input: AuditoriumInput) =>
      client.post<AuditoriumCreated>(
        `/theaters/${encodeURIComponent(theaterId)}/auditoriums`,
        input
      ),
  };
}
