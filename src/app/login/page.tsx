"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  HeartHandshake,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { SITE_URL } from "@/lib/api";

const ERRORES: Record<string, string> = {
  NoAdmin: "Tu cuenta no tiene permisos para entrar al panel.",
  AccessDenied: "Acceso denegado.",
  OAuthSignin: "No se pudo iniciar sesión con Google.",
  OAuthCallback: "No se pudo iniciar sesión con Google.",
  Configuration:
    "El acceso no está disponible en este momento. Contacta al administrador.",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const errorUrl = params.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const entrar = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result?.ok) {
        toast.error(
          result?.error || "No se pudo iniciar sesión. Inténtalo de nuevo.",
        );
        return;
      }
      const callback = new URL(
        params.get("callbackUrl") || "/",
        window.location.origin,
      );
      toast.success("¡Bienvenido a Family Love!");
      router.push(
        callback.origin === window.location.origin
          ? `${callback.pathname}${callback.search}`
          : "/",
      );
      router.refresh();
    } catch {
      toast.error("No se pudo conectar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#173e64] p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white p-2">
            <Image
              src="/logo-family-love.png"
              alt="Family Love"
              width={48}
              height={48}
              priority
            />
          </span>
          <span>
            <strong className="block text-xl tracking-tight">
              Family Love.
            </strong>
            <span className="text-[10px] uppercase tracking-[.2em] text-sky-200/70">
              Juntos hacemos más
            </span>
          </span>
        </div>
        <div className="relative z-10 my-auto py-16">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] tracking-wider text-sky-100">
            <Heart size={12} /> UN ESPACIO PARA TRANSFORMAR
          </span>
          <h1 className="max-w-lg text-5xl font-extrabold leading-[1.15] tracking-tight xl:text-[58px]">
            El cambio empieza
            <br />
            con <span className="text-[#9addf1]">nosotros.</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-sky-100/70">
            Detrás de cada proyecto hay una historia. Detrás de cada historia,
            personas como tú que hacen la diferencia.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sky-200">
              <HeartHandshake size={25} />
            </span>
            <p className="text-xs leading-relaxed text-sky-100/80">
              Conectamos personas.
              <br />
              <strong className="font-semibold text-white">
                Multiplicamos sonrisas.
              </strong>
            </p>
          </div>
        </div>
        <div
          className="hero-art !-bottom-32 !-right-32 !top-auto !h-[550px] !w-[550px] !translate-y-0 opacity-50"
          aria-hidden="true"
        >
          <span className="hero-orbit" />
          <span className="hero-orbit" />
          <span className="hero-orbit" />
          <Sparkles
            className="absolute left-28 top-24 text-sky-200"
            size={35}
          />
        </div>
        <p className="relative text-[10px] text-sky-200/50">
          Family Love · Pequeñas acciones, grandes cambios.
        </p>
      </section>

      <section className="login-panel flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:px-16">
        <a
          href={SITE_URL}
          className="inline-flex self-start items-center gap-2 text-xs text-slate-400 transition-colors hover:text-sky-600"
        >
          <ArrowLeft size={14} />
          Volver al sitio web
        </a>
        <div className="mx-auto my-auto w-full max-w-[360px] py-12">
          <Image
            src="/logo-family-love.png"
            alt="Family Love"
            width={72}
            height={72}
            className="mb-6 lg:hidden"
            priority
          />
          <span className="mb-6 inline-flex rounded-2xl border border-sky-100 bg-sky-50 p-3.5 text-sky-600">
            <LockKeyhole size={23} strokeWidth={1.7} />
          </span>
          <p className="page-eyebrow">Panel de administración</p>
          <h2 className="text-[30px] font-extrabold tracking-tight text-[#1b2e46]">
            Qué bueno tenerte aquí.
          </h2>
          <p className="mb-8 mt-3 text-sm leading-relaxed text-slate-400">
            Inicia sesión para seguir construyendo un mundo con más
            oportunidades.
          </p>
          {errorUrl && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600"
            >
              {ERRORES[errorUrl] ??
                "No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo."}
            </p>
          )}
          <form onSubmit={entrar} className="login-form space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold text-slate-700"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
                  size={17}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@familylove.org"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700"
                >
                  Contraseña
                </label>
                <a
                  href={`${SITE_URL}/recuperar-contrasena`}
                  className="text-[10px] font-semibold text-sky-600 hover:underline"
                >
                  ¿La olvidaste?
                </a>
              </div>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
                  size={17}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 py-3 pl-11 pr-11 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                  className="login-password-toggle icon-button absolute right-1.5 top-1.5"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="button-primary !mt-7 w-full !py-3.5 !text-sm"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : null}
              {loading ? "Iniciando sesión..." : "Entrar a mi espacio"}
              {!loading && <ArrowRight size={16} className="ml-1" />}
            </button>
          </form>
          {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
            <>
              <div className="my-5 flex items-center gap-3 text-[10px] text-slate-400">
                <span className="h-px flex-1 bg-slate-100" />o continúa con
                <span className="h-px flex-1 bg-slate-100" />
              </div>
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                disabled={loading}
                className="button-secondary w-full"
              >
                Entrar con Google
              </button>
            </>
          )}
          <p className="mt-7 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck size={14} />
            Acceso exclusivo para el equipo de Family Love
          </p>
        </div>
        <p className="text-center text-[10px] text-slate-400">
          Un poco de tu tiempo. Un gran impacto para alguien.
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white">
          <Loader2
            className="animate-spin text-sky-600"
            aria-label="Cargando"
          />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
