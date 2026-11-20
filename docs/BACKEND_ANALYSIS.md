# Analisis Backend (Phase 1)

Sumber: `movie-reservation-api-main.zip` (Next.js 16.4.6, Prisma 7, PostgreSQL, jose JWT, Stripe, Zod 4).
Semua poin di bawah dibaca langsung dari `prisma/schema.prisma`, `src/modules/*`, `src/lib/*`, dan `src/app/api/*`. Backend tidak diubah.

## 1. Alur autentikasi

- `POST /api/auth/register` body `{ email, password }` (password 8–72 karakter) → `201 { user: {id,email,role,createdAt}, token }`. Role selalu `USER`. Admin hanya dari seed.
- `POST /api/auth/login` body `{ email, password }` → `200 { user: {id,email,role}, token }` (tanpa `createdAt`).
- Token: JWT HS256, 7 hari, payload `{ sub, role, iat, exp }` (tanpa email). Dikirim sebagai `Authorization: Bearer <token>`.
- Tidak ada: logout, refresh token, `/me`, ubah profil.
- Akun demo (seed): `admin@example.com / Admin123!`, `user@example.com / User12345!`.

## 2. Format error

```json
{ "error": { "code": "SEAT_TAKEN", "message": "…", "details": [{ "path": "seatIds", "message": "…" }] } }
```

`details` hanya untuk `VALIDATION_ERROR`. Kode yang ada: `VALIDATION_ERROR` 400, `INVALID_JSON` 400, `INVALID_TIME` 400, `INVALID_SEATS` 400, `SHOWTIME_STARTED` 400, `UNAUTHORIZED` 401, `INVALID_CREDENTIALS` 401, `FORBIDDEN` 403, `NOT_FOUND` / `MOVIE_NOT_FOUND` / `AUDITORIUM_NOT_FOUND` 404, `EMAIL_TAKEN` / `DUPLICATE` / `IN_USE` / `SEAT_TAKEN` / `INVALID_STATUS` / `SHOWTIME_CONFLICT` 409, `STRIPE_ERROR` 502, `INTERNAL_ERROR` / `STRIPE_NOT_CONFIGURED` 500.
Pengecualian: `/api/payments/webhook` membalas `{ "error": "string" }` (hanya dipanggil Stripe, bukan frontend). `DELETE /api/movies/:id` membalas `204` tanpa body.

## 3. Endpoint → halaman frontend

| Endpoint | Akses | Request | Response | Dipakai di |
|---|---|---|---|---|
| `POST /api/auth/register` | Publik | `{email,password}` | `{user,token}` | `/register` |
| `POST /api/auth/login` | Publik | `{email,password}` | `{user,token}` | `/login` |
| `GET /api/movies` | Publik | `?genre&q&page&limit(≤50, default 10)` | `{items: Movie[], meta:{page,limit,total,totalPages}}` | `/`, `/movies`, `/admin/movies` |
| `GET /api/movies/:id` | Publik | – | `Movie` + `genres` + `showtimes[]` (hanya yang belum mulai, dengan `auditorium.theater`) | `/movies/[id]` |
| `POST /api/movies` | Admin | `{title, description?, durationMinutes(1–600), genres: string[]}` | `Movie` (201) | `/admin/movies` |
| `PATCH /api/movies/:id` | Admin | sebagian dari body di atas (`genres` mengganti semua genre) | `Movie` | `/admin/movies` |
| `DELETE /api/movies/:id` | Admin | – | 204; 409 `IN_USE` jika masih punya jadwal | `/admin/movies` |
| `GET /api/showtimes` | Publik | `?movieId&theaterId&from&to` | `Showtime[]` + `movie{id,title,durationMinutes}` + `auditorium{id,name,theater{id,name,city}}`; tanpa pagination | `/`, `/movies/[id]`, `/cinemas`, `/booking/[id]`, `/admin/showtimes` |
| `POST /api/showtimes` | Admin | `{movieId, auditoriumId, startsAt, price}` | `Showtime` (201); 409 `SHOWTIME_CONFLICT` | `/admin/showtimes` |
| `GET /api/showtimes/:id/seats` | Publik | – | `{showtimeId, movie(judul), startsAt, price, summary{total,taken,available}, seats[{id,row,number,status}]}` | `/booking/[id]` |
| `GET /api/theaters` | Publik | – | `Theater[]` + `auditoriums[{id,name,_count:{seats}}]` | `/cinemas`, `/admin/cinemas` |
| `POST /api/theaters` | Admin | `{name, city}` | `Theater` (201) | `/admin/cinemas` |
| `POST /api/theaters/:id/auditoriums` | Admin | `{name, rows(1–26), seatsPerRow(1–40)}` | `{id,theaterId,name,totalSeats}` (201) | `/admin/cinemas` |
| `POST /api/reservations` | Login | `{showtimeId, seatIds(1–6, unik)}` | `Reservation` (201); 409 `SEAT_TAKEN` | `/booking/[id]` |
| `GET /api/reservations` | Login | – | `Reservation[]` milik sendiri | `/my-tickets`, `/profile` |
| `GET /api/reservations/:id` | Login | – | `Reservation` (admin boleh semua) | `/checkout/[id]`, `/payment/*` |
| `DELETE /api/reservations/:id` | Login | – | `{id, status:"CANCELLED", refunded}` | `/my-tickets`, `/checkout/[id]` |
| `POST /api/payments/checkout` | Login (pemilik) | `{reservationId}` | `{checkoutUrl, sessionId}` | `/checkout/[id]` |
| `POST /api/payments/webhook` | Stripe | raw body + `stripe-signature` | `{received:true}` | Tidak dipakai frontend |
| `GET /api/reports` | Admin | `?from&to` | `{totalRevenue, totalTicketsSold, showtimes[{showtimeId,movie,auditorium,startsAt,capacity,sold,occupancyPercent}]}` | `/admin` |

`Reservation` = `{id,userId,showtimeId,status,expiresAt,createdAt,updatedAt, showtime{startsAt,price,movie{id,title},auditorium{name,theater{name,city}}}, tickets[{id,seatId,price,seat{row,number}}], payment: {status}|null}`.

## 4. Aturan bisnis yang memengaruhi UI

- Maks 6 kursi per reservasi; kursi ditahan 15 menit (`expiresAt`). Kedaluwarsa diproses **malas** (saat ada request yang membaca reservasi/kursi), bukan lewat job terjadwal. Memanggil ulang `GET /reservations/:id` atau `GET /showtimes/:id/seats` saat timer habis akan memicu perubahan status ke `EXPIRED`.
- `UNIQUE(showtimeId, seatId)` menjadi penjaga double-booking. Kursi yang ditahan reservasi `PENDING` sudah tampil `TAKEN` di peta kursi, termasuk kursi milik pengguna sendiri.
- Tidak bisa memesan / membatalkan jadwal yang sudah dimulai (400 `SHOWTIME_STARTED`).
- Reservasi `CONFIRMED` hanya setelah webhook Stripe `checkout.session.completed` diproses. Status sukses dicek lewat `GET /reservations/:id` (`status === "CONFIRMED"` dan `payment.status === "PAID"`).
- Membatalkan reservasi yang sudah dibayar memicu refund otomatis.
- Harga = integer Rupiah. Stripe menerima `unitPrice × 100` dengan mata uang `STRIPE_CURRENCY` (default `idr`).

## 5. Keterbatasan API dan solusi di frontend

| # | Keterbatasan | Solusi frontend (tanpa mengarang kemampuan backend) |
|---|---|---|
| 1 | **Tidak ada CORS** di backend. Browser di origin lain akan diblokir. | BFF proxy `/api/proxy/*` di frontend; browser hanya bicara ke origin frontend. |
| 2 | Backend dan frontend sama-sama default ke port 3000, dan Stripe me-redirect ke `APP_URL` milik **backend**. | Frontend dijalankan di **port 3001**. Di `.env` backend set `APP_URL=http://localhost:3001` (konfigurasi, bukan kode). |
| 3 | Tidak ada `/me`, logout, refresh token; JWT tidak memuat email. | Sesi dari httpOnly cookie. Email disimpan di cookie `cinemax_user` dari respons login/register. Logout = hapus cookie (token lama tetap valid sampai ≤7 hari, batasan backend). |
| 4 | **`createdAt` user hanya ada di respons register**, tidak di login. | `/profile` menampilkan "Anggota sejak" hanya jika datanya ada; selain itu disembunyikan (bukan diisi tebakan). |
| 5 | Film **tanpa poster/backdrop/trailer**. | Lapisan visual terpisah di frontend (Phase 3): poster generatif deterministik dari id film. Tombol "Watch Trailer" tidak ditampilkan. |
| 6 | **Tidak ada data trending/populer**. | Tidak dipalsukan. Pengganti jujur: "Now Showing" (film yang punya jadwal), "New Releases" (urut `createdAt`), "A–Z". |
| 7 | **Tidak ada endpoint daftar genre**. | Genre dikumpulkan dari daftar film (`limit=50`, dipaginasi sampai habis). |
| 8 | **Tidak ada `GET /showtimes/:id`**; peta kursi hanya berisi judul film. | Halaman booking mengambil info lengkap dari `GET /showtimes?movieId=…` (movieId dibawa di query string) atau dari `GET /movies/:id`. |
| 9 | `GET /showtimes` tanpa pagination dan hanya jadwal yang belum mulai. | Selalu difilter (`movieId`/`theaterId`/rentang tanggal). Tidak ada pagination palsu. |
| 10 | `GET /reservations` hanya milik user sendiri, bahkan untuk ADMIN. | `/admin/reservations`: daftar reservasi admin sendiri + pencarian detail berdasarkan ID (`GET /reservations/:id` boleh untuk admin). Tidak ada daftar global. |
| 11 | Tiket **dihapus** saat reservasi `CANCELLED`/`EXPIRED` (`tickets: []`). | Kursi tidak ditampilkan untuk status tersebut; UI menampilkan info film/jadwal saja. |
| 12 | `/reports` tidak memuat pendapatan per jadwal, hanya `sold` dan `occupancyPercent`. | Grafik per jadwal memakai tiket terjual dan okupansi. Pendapatan per jadwal tidak dikarang. Total pendapatan berasal dari `totalRevenue`. |
| 13 | `from`/`to` bertipe tanggal: `2026-12-31` dibaca sebagai 00:00 UTC. | Frontend mengirim ISO penuh awal/akhir hari (lihat `dayRangeIso`). |
| 14 | Checkout hanya untuk pemilik reservasi (admin tidak bisa membayar milik orang lain). | Tombol Pay Now hanya di halaman checkout milik sendiri. |
| 15 | Tidak ada endpoint verifikasi tiket. | Tidak ada QR code; tiket ditampilkan sebagai detail reservasi dengan kode reservasi. |
| 16 | "Remember me" tidak ada di backend. | Diimplementasikan di frontend: cookie persisten (sampai token habis) vs cookie sesi. |
| 17 | Notifikasi: tidak ada data/endpoint. | Ikon notifikasi tidak ditampilkan (sesuai instruksi "jika tersedia datanya"). |

## 6. Catatan keamanan

- JWT di httpOnly cookie (`SameSite=Lax`, `Secure` di production), tidak pernah ada di body respons maupun `localStorage`.
- Proxy memakai allowlist (`movies`, `showtimes`, `theaters`, `reservations`, `payments/checkout`, `reports`); `auth/*` dan `payments/webhook` tidak bisa dilewatkan. Request mutasi dicek `Origin`.
- `proxy.ts` hanya pengaman UX (cookie ada, belum kedaluwarsa, role). Frontend tidak memegang `JWT_SECRET`, jadi tidak memverifikasi tanda tangan. Otorisasi sebenarnya = backend (401/403).
- Tidak ada secret Stripe di frontend. Pembayaran dianggap sukses hanya jika backend melaporkan `CONFIRMED`.
