/**
 * Skema validasi form. Aturannya mengikuti Zod di backend
 * (src/modules/*.schema.ts) supaya error terdeteksi sebelum request dikirim.
 * Backend tetap menjadi validator utama.
 */
import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email wajib diisi")
  .pipe(z.email("Format email tidak valid"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password wajib diisi"),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email,
    // backend: min 8, max 72 (batas bcrypt)
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(72, "Password maksimal 72 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export const movieSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  description: z.string().max(2000).optional(),
  durationMinutes: z.number().int().positive().max(600, "Maksimal 600 menit"),
  genres: z.array(z.string().trim().min(1).max(50)),
});

export const theaterSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  city: z.string().trim().min(1, "Kota wajib diisi").max(100),
});

export const auditoriumSchema = z.object({
  name: z.string().trim().min(1, "Nama studio wajib diisi").max(100),
  rows: z.number().int().min(1).max(26, "Maksimal 26 baris (A-Z)"),
  seatsPerRow: z.number().int().min(1).max(40, "Maksimal 40 kursi per baris"),
});

export const showtimeSchema = z.object({
  movieId: z.string().min(1, "Pilih film"),
  auditoriumId: z.string().min(1, "Pilih studio"),
  startsAt: z.string().min(1, "Waktu tayang wajib diisi"),
  price: z.number().int().positive("Harga harus lebih dari 0"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
