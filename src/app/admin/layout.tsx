import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fadmin");
  if (session.user.role !== "ADMIN") redirect("/?forbidden=1");
  return <div className="min-h-dvh bg-bg text-fg">
    <AdminSidebar />
    <div className="min-h-dvh lg:pl-64">
      <main className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 lg:pt-24">{children}</main>
    </div>
  </div>;
}
