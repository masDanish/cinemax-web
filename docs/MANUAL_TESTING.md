# Catatan Implementasi dan Checklist Uji Manual

Frontend CINEMAX untuk Movie Reservation API. **Phase 1–5 selesai pada sisi implementasi frontend**: analisis kontrak, setup, design system, komponen UI, halaman publik, autentikasi, booking, checkout, verifikasi pembayaran, tiket, dan profil.

> Backend tidak disertakan di repository ini. Integrasi mengikuti kontrak pada [`docs/BACKEND_ANALYSIS.md`](docs/BACKEND_ANALYSIS.md). Pengujian end-to-end memerlukan backend dan Stripe webhook asli.

## Menjalankan aplikasi

1. Jalankan backend pada `http://localhost:3000`.
2. Pada file `.env` backend, atur:
   ```env
   APP_URL="http://localhost:3001"
   ```
   Stripe harus mengarahkan pengguna kembali ke frontend.
3. Pada folder frontend, pastikan `.env.local` berisi:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   ```
4. Instal dependency dan jalankan:
   ```bash
   npm install
   npm run dev
   ```
5. Frontend berjalan di `http://localhost:3001`.
6. Untuk pembayaran Stripe lokal, jalankan:
   ```bash
   stripe listen --events checkout.session.completed --forward-to localhost:3000/api/payments/webhook
   ```
   Pastikan Stripe CLI dikonfigurasi dengan akun test yang sesuai. Backend harus memiliki secret Stripe test dan webhook secret yang cocok.

## Halaman Phase 4

### Publik
- `/` — hero film dari API, Now Showing berdasarkan jadwal mendatang, New Releases berdasarkan `createdAt`, genre dari seluruh halaman katalog, lokasi bioskop, dan jadwal mendatang.
- `/movies` — pencarian `q`, filter genre, pagination backend, dan query state pada URL.
- `/movies/[id]` — informasi film, poster/backdrop generatif, genre, durasi, serta jadwal per tanggal dan bioskop.
- `/cinemas` — daftar bioskop, kota, studio, kapasitas kursi, dan jadwal yang tersedia.
- `/login` dan `/register` — React Hook Form, Zod, pesan validasi backend, remember me, serta dukungan `?next=`.

### Pengguna
- `/booking/[showtimeId]` — peta kursi live dari API, maksimal enam kursi, dan pembuatan reservasi.
- `/checkout/[reservationId]` — detail reservasi, countdown `expiresAt`, pembayaran Stripe, dan pembatalan.
- `/payment/success` — polling status reservasi sampai backend mengonfirmasi `CONFIRMED` dan `PAID`, atau polling mencapai batas waktu.
- `/payment/cancel` — status reservasi setelah pengguna membatalkan alur Stripe.
- `/my-tickets` — riwayat reservasi, filter status, detail kursi, dan pembatalan.
- `/profile` — email, role, tanggal bergabung hanya jika tersedia, dan riwayat reservasi.

Halaman admin Phase 5 tersedia di `/admin/*`; lihat bagian Administrasi di bawah.

## Alur booking dan pembayaran

1. Pengguna masuk, memilih film, jadwal, lalu kursi yang tersedia.
2. Frontend mengirim `POST /api/reservations` dengan `showtimeId` dan `seatIds`.
3. Backend mengunci kursi untuk reservasi PENDING sampai `expiresAt` (kontrak backend menyebut 15 menit).
4. Checkout membuat Stripe Checkout Session melalui `POST /api/payments/checkout`.
5. Pengguna membayar di Stripe. Redirect kembali ke `/payment/success` bukan bukti pembayaran.
6. Halaman success melakukan polling `GET /api/reservations/:id`. Pembayaran baru dinyatakan berhasil jika status reservasi `CONFIRMED` dan pembayaran `PAID`.
7. Reservasi dapat dibatalkan melalui `DELETE /api/reservations/:id`. Refund ditangani backend jika berlaku.

## Batasan kontrak backend

- API film tidak mengirim poster, backdrop, atau trailer. Visual poster/backdrop adalah dekorasi generatif deterministik di frontend, bukan aset resmi film.
- Tidak ada endpoint trending/populer, genre khusus, notifikasi, verifikasi tiket/QR, atau daftar reservasi global.
- Tidak ada `GET /showtimes/:id`; informasi jadwal diperoleh dari daftar showtimes atau detail film.
- Backend tidak memiliki `/me`, logout, maupun refresh token. Logout frontend menghapus cookie; JWT stateless lama tetap berlaku sampai kedaluwarsa.
- `createdAt` user hanya tersedia pada respons register. Halaman profil menyembunyikan tanggal bergabung jika data tidak ada.
- Status kursi, reservasi, pembayaran, dan kedaluwarsa selalu mengikuti backend.
- Reservasi CANCELLED/EXPIRED dapat memiliki `tickets: []`; frontend tidak menampilkan kursi yang sudah dihapus.
- Backend harus memproses Stripe webhook sebelum frontend menyatakan pembayaran berhasil.

## Arsitektur

```text
Browser -> /api/proxy/* -> Backend /api/* (Bearer dari httpOnly cookie)
Browser -> /api/auth/*  -> Route handler sesi frontend
Server Components -> serverApi -> Backend langsung
```

Service client: `authService`, `movieService`, `theaterService`, `showtimeService`, `reservationService`, `paymentService`, dan `reportService`.

Service server: `serverMovies`, `serverShowtimes`, `serverTheaters`, `serverReservations`, dan `serverReports`.

JWT disimpan dalam cookie `httpOnly`, `SameSite=Lax`, dan `Secure` pada production. Token tidak disimpan di localStorage dan tidak dikirim ke browser sebagai response body.

## Checklist uji manual dengan backend asli

Akun seed backend (gunakan hanya pada lingkungan development):
- Admin: `admin@example.com` / `Admin123!`
- User: `user@example.com` / `User12345!`

### Autentikasi
- [ ] Daftar dengan email baru dan password valid.
- [ ] Coba daftar dengan email yang sudah digunakan; pastikan error tampil di field email.
- [ ] Login dengan akun user seed.
- [ ] Login dengan kredensial salah; pastikan pesan backend ditampilkan.
- [ ] Uji remember me dicentang dan tidak dicentang.
- [ ] Logout, lalu pastikan halaman terproteksi mengarahkan ke login.
- [ ] Uji URL `/login?next=/my-tickets` dan pastikan redirect kembali setelah login.

### Film dan bioskop
- [ ] Buka beranda dan pastikan data berasal dari API.
- [ ] Pastikan Now Showing hanya memuat film dengan jadwal mendatang.
- [ ] Pastikan New Releases diurutkan berdasarkan `createdAt`.
- [ ] Cari film, filter genre, pindah halaman, lalu refresh URL.
- [ ] Buka detail film dan cek jadwal per tanggal/bioskop.
- [ ] Buka bioskop dan cek studio, jumlah kursi, serta jadwal.

### Booking, checkout, dan pembayaran
- [ ] Login dengan akun user.
- [ ] Pilih jadwal dan buka peta kursi.
- [ ] Pilih 1–6 kursi; pastikan kursi TAKEN tidak bisa dipilih.
- [ ] Coba memilih kursi ketujuh; UI harus menolak.
- [ ] Lanjutkan dan pastikan reservasi dibuat di backend.
- [ ] Cek ringkasan dan countdown `expiresAt`.
- [ ] Jalankan checkout Stripe dalam mode test.
- [ ] Pastikan Stripe CLI meneruskan webhook ke backend port 3000.
- [ ] Kembali ke `/payment/success`; pastikan UI menunggu konfirmasi webhook.
- [ ] Pastikan sukses hanya ketika backend mengembalikan `CONFIRMED` + `PAID`.
- [ ] Uji pembayaran dibatalkan dan pastikan status tidak diklaim lunas.
- [ ] Uji pembatalan reservasi PENDING.
- [ ] Uji expiry: tunggu hingga `expiresAt`, lalu muat ulang detail reservasi atau peta kursi agar backend memproses expiry secara lazy.
- [ ] Pastikan reservasi EXPIRED tidak menampilkan kursi yang sudah dihapus.
- [ ] Buka Tiket Saya dan Profil; cocokkan status dengan backend.
- [ ] Uji konflik `SEAT_TAKEN` dengan dua sesi/browser yang memesan kursi sama.


## Halaman Administrasi (Phase 5)

Seluruh halaman admin menggunakan layout terpisah dari Navbar/Footer publik. Guard server memeriksa sesi dan role `ADMIN`; proxy tetap menjadi pengaman UX dan backend tetap otoritas final (401/403).

- `/admin` — laporan revenue dan tiket, rata-rata okupansi aritmetika dari seluruh `showtimes[].occupancyPercent`, grafik tiket terjual dan okupansi per jadwal, tabel performa, serta filter tanggal. Rentang laporan mengacu pada `startsAt`.
- `/admin/movies` — pencarian `q`, pagination backend, tambah/edit/hapus film, dan genre berbentuk chip. Hapus film yang masih memiliki jadwal ditolak backend dengan `409 IN_USE`.
- `/admin/cinemas` — daftar bioskop, studio, dan jumlah kursi; tambah bioskop serta studio dengan pratinjau denah. Pembuatan kursi dilakukan otomatis oleh backend.
- `/admin/showtimes` — daftar jadwal sejak `2000-01-01`, filter film/bioskop/tanggal, dan tambah jadwal. Input waktu admin ditafsirkan sebagai Asia/Jakarta lalu dikonversi ke ISO. Konflik studio ditampilkan sebagai `SHOWTIME_CONFLICT`.
- `/admin/reservations` — daftar reservasi milik akun admin sendiri dan pencarian detail berdasarkan ID. Tidak ada daftar reservasi global dan tidak ada tombol bayar.

### Batasan API admin

- Tidak ada PATCH/DELETE untuk bioskop, studio, dan jadwal; UI tidak menyediakan aksi tersebut.
- Tidak ada daftar reservasi global. `GET /reservations` hanya mengembalikan milik user yang login, termasuk admin; admin dapat mencari detail siapa pun dengan `GET /reservations/:id`.
- Laporan tidak menyediakan revenue per jadwal. Grafik jadwal hanya menggunakan `sold` dan `occupancyPercent`; revenue hanya ditampilkan sebagai total `totalRevenue`.
- API tidak menyediakan katalog genre atau poster resmi. Genre film berasal dari data film, dan visual poster tetap dekorasi frontend.
- Proxy allowlist dan pemeriksaan Origin tidak diubah.

### Checklist uji manual admin

Gunakan akun seed development: `admin@example.com` / `Admin123!`. Akun user biasa: `user@example.com` / `User12345!`.

- [ ] Login sebagai user biasa, buka `/admin`; pastikan ditolak/diarahkan keluar.
- [ ] Login sebagai admin; buka `/admin` dan pastikan laporan asli tampil.
- [ ] Uji filter tanggal awal/akhir, reset filter, refresh, serta navigasi back/forward.
- [ ] Cocokkan total revenue dan tiket dengan backend; rata-rata okupansi harus sama dengan rata-rata aritmetika jadwal yang dikembalikan.
- [ ] Tambah film dengan beberapa genre, lalu edit judul/deskripsi/durasi/genre.
- [ ] Cari film dan uji pagination API.
- [ ] Hapus film tanpa jadwal; pastikan hilang dari daftar.
- [ ] Coba hapus film yang masih memiliki jadwal; pastikan backend membalas 409 `IN_USE` dan UI menjelaskan penyebabnya.
- [ ] Tambah bioskop dan pastikan tampil setelah refresh.
- [ ] Tambah studio; uji pratinjau jumlah baris, kursi per baris, dan total kursi.
- [ ] Pastikan jumlah kursi studio setelah dibuat sama dengan `totalSeats`/`_count.seats` backend.
- [ ] Tambah jadwal dengan waktu masa depan dan harga Rupiah; cocokkan waktu WIB di backend.
- [ ] Buat jadwal bentrok di studio yang sama; pastikan 409 `SHOWTIME_CONFLICT` ditampilkan.
- [ ] Uji waktu lampau/format tidak valid; pastikan `INVALID_TIME` atau validasi backend tampil.
- [ ] Filter jadwal berdasarkan film, bioskop, dan tanggal.
- [ ] Buka Reservasi; pahami bahwa daftar hanya milik admin sendiri.
- [ ] Cari ID reservasi milik user lain; pastikan detail dapat dibuka.
- [ ] Cari ID yang tidak ada; pastikan pesan 404 ditampilkan.
- [ ] Uji akses admin dengan sesi kedaluwarsa dan respons backend 401/403.


## Pemeriksaan kode

Jalankan setelah `npm install`:

```bash
npm run typecheck
npm run lint
npm run build
```

Backend tidak dijalankan oleh project frontend ini, sehingga checklist manual di atas tetap diperlukan untuk validasi integrasi end-to-end.
