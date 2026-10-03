"use client";

// ─── EQUIPO DIRECTIVO: lista para agregar, editar, ordenar y eliminar ───────
// El orden de esta lista es el mismo orden en que aparecen en la página web.
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Contact,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { apiFetch, mediaUrl } from "@/lib/api";

type Persona = {
  id: number;
  nombre: string;
  cargo: string;
  imagen: string;
  bio: string;
};

const tarjeta =
  "overflow-hidden rounded-2xl bg-[#f3f8fd] shadow-[0_10px_24px_-14px_rgba(10,30,70,0.6)]";
const botonAzul =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] px-4 text-sm font-bold text-white transition-colors hover:bg-[#2251a3]";
const botonMover =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-[#1a3a6b] transition-colors hover:bg-[#1a3a6b] hover:text-white disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#1a3a6b]";

export default function EquipoManager() {
  const { data: session } = useSession();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState<number | null>(null);

  const cargar = useCallback(async (mostrarCarga = true) => {
    if (mostrarCarga) setCargando(true);
    setError("");
    const resultado = await apiFetch<{ equipo: Persona[] }>("/equipo", {
      signal: AbortSignal.timeout(10000),
    });
    if (resultado.ok) setPersonas(resultado.data.equipo ?? []);
    else setError(resultado.data.error || "No se pudo cargar el equipo.");
    setCargando(false);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const mover = async (persona: Persona, direccion: "arriba" | "abajo") => {
    setOcupado(persona.id);
    const resultado = await apiFetch(`/equipo/${persona.id}/mover`, {
      method: "POST",
      token: session?.accessToken,
      body: { direccion },
    });
    if (!resultado.ok) toast.error(resultado.data.error || "No se pudo cambiar el orden");
    await cargar(false);
    setOcupado(null);
  };

  const eliminar = async (persona: Persona) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar a esta persona?",
      text: `${persona.nombre} dejará de aparecer en la página web. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });
    if (!confirmacion.isConfirmed) return;
    setOcupado(persona.id);
    const resultado = await apiFetch(`/equipo/${persona.id}`, {
      method: "DELETE",
      token: session?.accessToken,
    });
    if (resultado.ok) {
      toast.success("Persona eliminada");
      setPersonas((previas) => previas.filter((p) => p.id !== persona.id));
    } else {
      toast.error(resultado.data.error || "No se pudo eliminar");
    }
    setOcupado(null);
  };

  return (
    <div className="-m-4 min-h-screen bg-gradient-to-b from-[#2f67b3] to-[#4a8fd0] p-4 font-medium text-slate-700 lining-nums md:-m-8 md:p-8">
      {/* ── Título y botón principal ── */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Equipo directivo</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/90">
            <Contact size={17} className="shrink-0" />
            {cargando || error
              ? "Cargando…"
              : `${personas.length} ${personas.length === 1 ? "persona" : "personas"} en la página Quiénes Somos`}
          </p>
        </div>
        <Link
          href="/equipo/nuevo"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#1a3a6b] shadow-sm transition-colors hover:bg-[#73eafe] sm:w-auto"
        >
          <Plus size={17} />
          Agregar persona
        </Link>
      </div>

      {cargando ? (
        <div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          role="status"
        >
          <span className="sr-only">Cargando el equipo...</span>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`${tarjeta} h-96 motion-safe:animate-pulse`}>
              <div className="h-60 bg-slate-300/60" />
              <div className="m-5 h-4 w-3/4 rounded bg-slate-300/60" />
              <div className="m-5 h-3 w-1/2 rounded bg-slate-300/60" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={`${tarjeta} flex flex-col items-center px-5 py-12 text-center`} role="alert">
          <span className="mb-4 rounded-2xl bg-amber-100 p-4 text-amber-700">
            <AlertCircle size={28} />
          </span>
          <h2 className="text-lg font-bold text-[#12284c]">No se pudo cargar el equipo</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">{error}</p>
          <button type="button" className={`${botonAzul} mt-5`} onClick={() => void cargar()}>
            <RefreshCw size={16} />
            Volver a intentar
          </button>
        </div>
      ) : personas.length === 0 ? (
        <div className={`${tarjeta} flex flex-col items-center px-5 py-12 text-center`}>
          <span className="mb-4 rounded-2xl bg-[#2251a3]/10 p-4 text-[#2251a3]">
            <Contact size={30} />
          </span>
          <h2 className="text-lg font-bold text-[#12284c]">Aún no hay personas en el equipo</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Agrega a la primera persona con su foto, su cargo y su biografía.
          </p>
          <Link href="/equipo/nuevo" className={`${botonAzul} mt-5`}>
            <Plus size={16} />
            Agregar persona
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold text-white">
            Aparecen en la página en este mismo orden. Usa las flechas de cada tarjeta para mover
            a una persona antes o después.
          </p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {personas.map((persona, i) => (
              <li key={persona.id} className={`${tarjeta} flex flex-col`}>
                <div className="relative h-72 bg-[#16305a]">
                  <Image
                    src={mediaUrl(persona.imagen)}
                    alt=""
                    fill
                    sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover object-top"
                  />
                  <span className="absolute left-3 top-3 rounded-lg bg-[#1a3a6b] px-2.5 py-1 text-xs font-bold text-white shadow">
                    Puesto {i + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h2 className="text-base font-bold leading-snug text-[#12284c] [overflow-wrap:anywhere]">
                    {persona.nombre}
                  </h2>
                  <p className="mt-1 text-[13px] font-bold uppercase leading-snug text-[#2251a3] [overflow-wrap:anywhere]">
                    {persona.cargo}
                  </p>
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-slate-600">
                    {persona.bio}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    <Link href={`/equipo/${persona.id}/editar`} className={`${botonAzul} flex-1`}>
                      <Pencil size={15} />
                      Editar
                    </Link>
                    <button
                      type="button"
                      className={botonMover}
                      disabled={i === 0 || ocupado !== null}
                      onClick={() => void mover(persona, "arriba")}
                      aria-label={`Mover a ${persona.nombre} un puesto antes`}
                      title="Mover un puesto antes"
                    >
                      {ocupado === persona.id ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <ArrowLeft size={17} />
                      )}
                    </button>
                    <button
                      type="button"
                      className={botonMover}
                      disabled={i === personas.length - 1 || ocupado !== null}
                      onClick={() => void mover(persona, "abajo")}
                      aria-label={`Mover a ${persona.nombre} un puesto después`}
                      title="Mover un puesto después"
                    >
                      <ArrowRight size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void eliminar(persona)}
                      disabled={ocupado !== null}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                      aria-label={`Eliminar a ${persona.nombre}`}
                      title="Eliminar"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
