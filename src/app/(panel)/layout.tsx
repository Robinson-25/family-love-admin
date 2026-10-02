import SidebarAdmin from "@/components/SidebarAdmin";
import AdminHeader from "@/components/AdminHeader";
import { requireStaffSession } from "@/lib/session";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaffSession();

  return (
    <div className="admin-shell">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <SidebarAdmin
        nombre={session.user.name ?? ""}
        rol={session.user.role ?? ""}
      />
      <div className="admin-workspace">
        <AdminHeader />
        <main id="main-content" className="admin-main">
          {children}
        </main>
        <footer className="admin-footer">
          <span>Family Love · Cada acción cuenta.</span>
          <span>
            Hecho con propósito <span aria-hidden="true">♡</span>
          </span>
        </footer>
      </div>
    </div>
  );
}
