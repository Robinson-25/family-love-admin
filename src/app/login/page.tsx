"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { SITE_URL } from "@/lib/api";

const ERRORES: Record<string, string> = {
  NoAdmin: "Tu cuenta no tiene permisos de administrador",
  AccessDenied: "Acceso denegado",
  OAuthSignin: "No se pudo iniciar sesión con Google",
  OAuthCallback: "No se pudo iniciar sesión con Google",
  Configuration: "Falta configurar NEXTAUTH_SECRET en el archivo .env.local del panel",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const errorUrl = params.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Escribe tu correo y contraseña");
      return;
    }
    setCargando(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setCargando(false);
    if (res?.ok) {
      toast.success("Bienvenido 👋");
      router.push(params.get("callbackUrl") || "/");
      router.refresh();
    } else {
      toast.error(res?.error || "No se pudo iniciar sesión");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a3a6b] via-[#2251a3] to-[#73eafe] p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo-family-love.png" alt="Family Love" width={72} height={72} />
          <h1 className="mt-3 text-xl font-extrabold text-gray-900">Panel de Administración</h1>
          <p className="text-sm text-gray-500">Family Love</p>
        </div>

        {errorUrl && (
          <p className="mb-4 text-sm bg-red-50 text-red-600 rounded-xl px-4 py-3">
            {ERRORES[errorUrl] ?? decodeURIComponent(errorUrl)}
          </p>
        )}

        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2251a3]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={verPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-4 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2251a3]"
              />
              {/* Botón para mostrar u ocultar la contraseña */}
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={verPassword}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-gray-400 hover:text-[#2251a3] rounded-r-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2251a3]"
              >
                {verPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] hover:bg-[#2251a3] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Entrar
          </button>
        </form>

        <a
          href={`${SITE_URL}/recuperar-contrasena`}
          className="mt-4 block text-center text-sm text-[#2251a3] hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>

        {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="mt-3 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
          >
            Entrar con Google
          </button>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}