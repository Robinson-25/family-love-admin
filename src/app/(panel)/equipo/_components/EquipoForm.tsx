"use client";

// ─── FORMULARIO DE UNA PERSONA DEL EQUIPO DIRECTIVO ─────────────────────────
// Sirve para agregar una persona nueva o editar una que ya existe.
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Save, UserRound } from "lucide-react";
import { apiFetch, mediaUrl } from "@/lib/api";
import SubirArchivo from "@/components/SubirArchivo";

export type PersonaData = {
  id?: number;
  nombre: string;
  cargo: string;
  imagen: string;
  bio: string;
};

const vacio: PersonaData = { nombre: "", cargo: "", imagen: "", bio: "" };
const MAX_BIO = 2000;

const campo =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-[#12284c] placeholder:font-medium placeholder:text-slate-400 focus:border-[#2251a3] focus:outline-none focus:ring-2 focus:ring-[#2251a3]/30 sm:text-sm";
const etiqueta = "mb-2 block text-sm font-bold text-[#12284c]";

export default function EquipoForm({ inicial }: { inicial?: PersonaData }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [datos, setDatos] = useState<PersonaData>(inicial || vacio);
  const [guardando, setGuardando] = useState(false);
  const esEdicion = !!inicial?.id;

  const actualizar = (clave: keyof PersonaData, valor: string) =>
    setDatos((previo) => ({ ...previo, [clave]: valor }));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datos.nombre.trim() || !datos.cargo.trim() || !datos.bio.trim()) {
      toast.error("Escribe el nombre, el cargo y la biografía");
      return;
    }
    if (!datos.imagen) {
      toast.error("Sube la foto de la persona");
      return;
    }

    setGuardando(true);
    try {
      const { ok, data } = await apiFetch(esEdicion ? `/equipo/${inicial!.id}` : "/equipo", {
        method: esEdicion ? "PUT" : "POST",
        token: session?.accessToken,
        body: {
          nombre: datos.nombre,
          cargo: datos.cargo,
          imagen: datos.imagen,
          bio: datos.bio,
        },
      });
      if (!ok) {
        toast.error(data.error || "No se pudo guardar");
        return;
      }
      toast.success(esEdicion ? "Cambios guardados" : "Persona agregada");
      router.push("/equipo");
      router.refresh();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="-m-4 min-h-screen bg-gradient-to-b from-[#2f67b3] to-[#4a8fd0] p-4 font-medium text-slate-700 md:-m-8 md:p-8">
      <button
        type="button"
        onClick={() => router.push("/equipo")}
        className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-white hover:bg-white/15"
      >
        <ArrowLeft size={17} />
        Volver al equipo
      </button>
      <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
        {esEdicion ? "Editar persona" : "Agregar persona"}
      </h1>
      <p className="mb-5 mt-1 text-sm font-semibold text-white/90 sm:mb-6">
        Lo que guardes aquí aparece en la página Quiénes Somos, en Nuestro Equipo Directivo.
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-6">
        {/* ── Datos ── */}
        <form
          onSubmit={guardar}
          className="overflow-hidden rounded-2xl bg-[#f3f8fd] shadow-[0_10px_24px_-14px_rgba(10,30,70,0.6)]"
        >
          <div className="flex min-h-12 items-center bg-[#1a3a6b] px-5 py-2.5">
            <h2 className="text-[15px] font-bold text-white">Datos de la persona</h2>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <label htmlFor="nombre" className={etiqueta}>
                Nombre <span className="text-red-600">*</span>
              </label>
              <input
                id="nombre"
                type="text"
                maxLength={120}
                value={datos.nombre}
                onChange={(e) => actualizar("nombre", e.target.value)}
                placeholder="Ej: Tania Trinidad"
                className={campo}
              />
            </div>

            <div>
              <label htmlFor="cargo" className={etiqueta}>
                Cargo <span className="text-red-600">*</span>
              </label>
              <input
                id="cargo"
                type="text"
                maxLength={160}
                value={datos.cargo}
                onChange={(e) => actualizar("cargo", e.target.value)}
                placeholder="Ej: Directora General - Fundadora"
                className={campo}
              />
              <p className="mt-1.5 text-[13px] text-slate-600">
                En la página se muestra en MAYÚSCULAS.
              </p>
            </div>

            <div>
              <SubirArchivo
                label="Foto *"
                tipo="imagen"
                valor={datos.imagen}
                onCambio={(url) => actualizar("imagen", url)}
              />
              <p className="mt-1.5 text-[13px] text-slate-600">
                Usa una foto vertical, de medio cuerpo y con la cara en la parte de arriba. Así
                queda igual que las demás.
              </p>
            </div>

            <div>
              <label htmlFor="bio" className={etiqueta}>
                Biografía <span className="text-red-600">*</span>
              </label>
              <textarea
                id="bio"
                rows={7}
                maxLength={MAX_BIO}
                value={datos.bio}
                onChange={(e) => actualizar("bio", e.target.value)}
                placeholder="Estudios, cargos, reconocimientos y voluntariados. Es lo que se lee al hacer clic en la foto."
                className={`${campo} font-medium leading-relaxed`}
              />
              <p className="mt-1.5 text-right text-[13px] tabular-nums text-slate-600">
                {datos.bio.length} de {MAX_BIO} letras
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/equipo")}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] px-6 text-sm font-bold text-white transition-colors hover:bg-[#2251a3] disabled:opacity-60"
              >
                {guardando ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                {esEdicion ? "Guardar cambios" : "Agregar persona"}
              </button>
            </div>
          </div>
        </form>

        {/* ── Así se verá en la página ── */}
        <aside className="lg:sticky lg:top-6">
          <p className="mb-2 text-sm font-bold text-white">Así se verá en la página</p>
          <div className="mx-auto max-w-[300px] overflow-hidden rounded-3xl border border-white/20 bg-[#0f2a5a] shadow-xl">
            <div className="relative h-[290px] bg-[#16305a]">
              {datos.imagen ? (
                <Image
                  src={mediaUrl(datos.imagen)}
                  alt=""
                  fill
                  sizes="300px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-white/50">
                  <UserRound size={56} strokeWidth={1.2} />
                  <span className="text-xs font-semibold">Aquí va la foto</span>
                </div>
              )}
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-base font-bold leading-tight text-white [overflow-wrap:anywhere]">
                {datos.nombre || "Nombre"}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase leading-snug text-[#73eafe] [overflow-wrap:anywhere]">
                {datos.cargo || "Cargo"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
