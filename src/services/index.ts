/** Service untuk client component (browser -> /api/proxy -> backend). */
import { bffApi, browserApi } from "@/lib/api";
import { createAuthService } from "./auth.service";
import { createMovieService } from "./movie.service";
import { createPaymentService } from "./payment.service";
import { createReportService } from "./report.service";
import { createReservationService } from "./reservation.service";
import { createShowtimeService } from "./showtime.service";
import { createTheaterService } from "./theater.service";

export const authService = createAuthService(bffApi);
export const movieService = createMovieService(browserApi);
export const theaterService = createTheaterService(browserApi);
export const showtimeService = createShowtimeService(browserApi);
export const reservationService = createReservationService(browserApi);
export const paymentService = createPaymentService(browserApi);
export const reportService = createReportService(browserApi);
