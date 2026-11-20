/** Service untuk Server Components (frontend server -> backend langsung). */
import { serverApi } from "@/lib/api.server";
import { createMovieService } from "./movie.service";
import { createReportService } from "./report.service";
import { createReservationService } from "./reservation.service";
import { createShowtimeService } from "./showtime.service";
import { createTheaterService } from "./theater.service";

export const serverMovies = createMovieService(serverApi);
export const serverTheaters = createTheaterService(serverApi);
export const serverShowtimes = createShowtimeService(serverApi);
export const serverReservations = createReservationService(serverApi);
export const serverReports = createReportService(serverApi);
