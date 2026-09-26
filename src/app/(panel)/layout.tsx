import SidebarAdmin from "@/components/SidebarAdmin";
import { requireStaffSession } from "@/lib/session";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffSession();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      <SidebarAdmin nombre={session.user.name ?? ""} rol={session.user.role ?? ""} />
      <main className="flex-1 p-4 md:p-8 w-full">{children}</main>
    </div>
  );
}
