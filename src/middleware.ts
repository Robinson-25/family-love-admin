import { withAuth } from "next-auth/middleware";

const STAFF_ROLES = ["admin", "colaborator"];

// Todo el panel exige sesión con rol admin/colaborador, excepto /login.
export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token }) => !!token && STAFF_ROLES.includes(String(token.role)),
  },
});

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|logo-family-love.png).*)"],
};
