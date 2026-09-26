import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { API_URL } from "./api";

// Solo pueden entrar al panel estos roles.
export const STAFF_ROLES = ["admin", "colaborator"];

type BackendSession = {
  user: { id: number; username: string; email: string; role: string; image: string | null };
  token: string;
};

async function postBackend(path: string, body: unknown): Promise<BackendSession> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "No se pudo iniciar sesión");
  return data as BackendSession;
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "email", type: "email" },
      password: { label: "password", type: "password" },
    },
    async authorize(credentials) {
      const { user, token } = await postBackend("/auth/login", {
        email: credentials?.email,
        password: credentials?.password,
      });
      if (!STAFF_ROLES.includes(user.role)) {
        throw new Error("Tu cuenta no tiene permisos de administrador");
      }
      return {
        id: String(user.id),
        name: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
        accessToken: token,
      };
    },
  }),
];

// Google es opcional en el panel: solo se activa si hay credenciales.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 horas
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!account.id_token) return false;
        try {
          const data = await postBackend("/auth/google", { idToken: account.id_token });
          if (!STAFF_ROLES.includes(data.user.role)) {
            return "/login?error=NoAdmin";
          }
          Object.assign(user, {
            id: String(data.user.id),
            name: data.user.username,
            role: data.user.role,
            accessToken: data.token,
          });
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
