import type { ApiErrorDetail } from "@/types/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isConflict() {
    return this.status === 409;
  }
}

/** Pesan cadangan jika backend tidak mengirim `error.message`. */
const FALLBACK_BY_STATUS: Record<number, string> = {
  400: "Data yang dikirim tidak valid.",
  401: "Sesi Anda berakhir. Silakan masuk kembali.",
  403: "Anda tidak memiliki akses ke halaman atau aksi ini.",
  404: "Data yang dicari tidak ditemukan.",
  409: "Terjadi konflik data. Muat ulang lalu coba lagi.",
  500: "Terjadi kesalahan pada server. Coba lagi beberapa saat.",
  502: "Server tidak dapat dihubungi. Coba lagi beberapa saat.",
};

export function fallbackMessage(status: number): string {
  return (
    FALLBACK_BY_STATUS[status] ??
    (status >= 500 ? FALLBACK_BY_STATUS[500] : "Terjadi kesalahan. Coba lagi.")
  );
}

/** Pesan siap tampil ke pengguna dari error apa pun. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "VALIDATION_ERROR" && error.details?.length) {
      return error.details.map((d) => d.message).join(". ");
    }
    return error.message || fallbackMessage(error.status);
  }
  if (error instanceof Error && error.message) return error.message;
  return "Terjadi kesalahan yang tidak diketahui.";
}

/** Peta field -> pesan, untuk ditampilkan di bawah input form saat VALIDATION_ERROR. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.details) return {};
  return Object.fromEntries(error.details.map((d) => [d.path, d.message]));
}
