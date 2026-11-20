import type { ApiClient } from "@/lib/api";
import type {
  Movie,
  MovieDetail,
  MovieInput,
  MovieListQuery,
  MovieListResponse,
  MovieUpdateInput,
} from "@/types/api";

export function createMovieService(client: ApiClient) {
  return {
    /** GET /api/movies?genre&q&page&limit (publik, limit maks 50) */
    list: (query: MovieListQuery = {}) =>
      client.get<MovieListResponse>("/movies", { query: { ...query } }),
    /** GET /api/movies/:id (publik; showtimes hanya yang belum mulai) */
    get: (id: string) => client.get<MovieDetail>(`/movies/${encodeURIComponent(id)}`),
    /** POST /api/movies (ADMIN) */
    create: (input: MovieInput) => client.post<Movie>("/movies", input),
    /** PATCH /api/movies/:id (ADMIN). `genres` mengganti seluruh genre film. */
    update: (id: string, input: MovieUpdateInput) =>
      client.patch<Movie>(`/movies/${encodeURIComponent(id)}`, input),
    /** DELETE /api/movies/:id (ADMIN). 409 IN_USE jika film masih punya jadwal. */
    remove: (id: string) => client.delete<void>(`/movies/${encodeURIComponent(id)}`),
  };
}
