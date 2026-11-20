import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

/** Layout halaman publik dan pengguna (admin punya layout sendiri di Phase 5). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
