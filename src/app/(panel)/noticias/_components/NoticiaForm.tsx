"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { Loader2, Save } from "lucide-react";
import SubirArchivo from "@/components/SubirArchivo";

export type NoticiaData = {
  id?: number;
  titulo: string;
  resumen: string;
  contenido: string;
  imagen: string;
  video: string;
  fecha: string;
};

const vacio: NoticiaData = {
  titulo: "",
  resumen: "",
  contenido: "",
  imagen: "",
  video: "",
  fecha: "",
};

export default function NoticiaForm({ inicial }: { inicial?: NoticiaData }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [datos, setDatos] = useState<NoticiaData>(inicial || vacio);
  const [guardando, setGuardando] = useState(false);

  const esEdicion = !!inicial?.id;

  const actualizar = (campo: keyof NoticiaData, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !datos.titulo ||
      !datos.resumen ||
      !datos.contenido ||
      !datos.imagen ||
      !datos.fecha
    ) {
      toast.error("Completa todos los campos obligatorios y sube la imagen");
      return;
    }

    setGuardando(true);
    try {
      const url = esEdicion ? `/noticias/${inicial!.id}` : "/noticias";
      const method = esEdicion ? "PUT" : "POST";

      const { ok, data } = await apiFetch(url, {
        method,
        token: session?.accessToken,
        body: datos,
      });

      if (!ok) {
        toast.error(data.error || "Ocurrió un error al guardar");
        return;
      }

      toast.success(esEdicion ? "Noticia actualizada" : "Noticia publicada");
      router.push("/noticias");
      router.refresh();
    } catch (error) {
      toast.error("Ocurrió un error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form
      onSubmit={guardar}
      className="editor-form panel-card p-5 md:p-7 space-y-6"
    >
      <div>
        <label
          htmlFor="titulo"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Título de la noticia <span className="text-red-500">*</span>
        </label>
        <input
          id="titulo"
          type="text"
          value={datos.titulo}
          onChange={(e) => actualizar("titulo", e.target.value)}
          placeholder="Ej: Family Love inaugura nuevo programa de apoyo"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2251a3]"
        />
      </div>

      <div>
        <label
          htmlFor="fecha"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Fecha (como se muestra en la web){" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          id="fecha"
          type="text"
          value={datos.fecha}
          onChange={(e) => actualizar("fecha", e.target.value)}
          placeholder="Ej: 20 agosto 2026"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2251a3]"
        />
      </div>

      <div>
        <label
          htmlFor="resumen"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Resumen corto (aparece en la tarjeta del listado){" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="resumen"
          value={datos.resumen}
          onChange={(e) => actualizar("resumen", e.target.value)}
          rows={2}
          placeholder="Un resumen breve de 1 a 2 líneas..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2251a3]"
        />
      </div>

      <div>
        <label
          htmlFor="contenido"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Contenido completo de la noticia{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contenido"
          value={datos.contenido}
          onChange={(e) => actualizar("contenido", e.target.value)}
          rows={8}
          placeholder="Escribe la noticia completa..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2251a3]"
        />
      </div>

      <SubirArchivo
        label="Imagen principal *"
        tipo="imagen"
        valor={datos.imagen}
        onCambio={(url) => actualizar("imagen", url)}
      />

      <SubirArchivo
        label="Video (opcional)"
        tipo="video"
        valor={datos.video}
        onCambio={(url) => actualizar("video", url)}
      />

      <div className="editor-actions flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push("/noticias")}
          className="button-secondary"
        >
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className="button-primary">
          {guardando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {esEdicion ? "Guardar cambios" : "Publicar noticia"}
        </button>
      </div>
    </form>
  );
}
