import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, STAFF_ROLES } from "./auth";

// Para páginas del servidor: devuelve la sesión o manda al login.
export async function requireStaffSession() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !STAFF_ROLES.includes(session.user.role ?? "")) {
    redirect("/login");
  }
  return session;
}
