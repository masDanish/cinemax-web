import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gambar film belum ada di API. Sumber gambar eksternal (jika dipakai di Phase 3)
  // harus didaftarkan di sini. Untuk saat ini belum ada host yang diizinkan.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
