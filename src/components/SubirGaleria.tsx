"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Loader2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { apiFetch, mediaUrl } from "@/lib/api";
import { comprimirImagen, pesoEnMB, PESO_MAXIMO_IMAGEN } from "@/lib/comprimir";

type Props = {
  label: string;
  valores: string[];
  onCambio: (urls: string[]) => void;
};

export default function SubirGaleria({ label, valores, onCambio }: Props) {
  const { data: session } = useSession();
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const manejarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const original = e.target.files?.[0];
    if (!original) return;

    setSubiendo(true);
    try {
      // Las fotos pesadas se reducen solas antes de subir
      const file = await comprimirImagen(original);
      if (file.size > PESO_MAXIMO_IMAGEN) {
        toast.error(`La foto pesa ${pesoEnMB(file.size)} MB y el máximo es 10 MB. Usa una más liviana.`);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const { ok, data } = await apiFetch<{ url: string }>("/uploads", {
        method: "POST",
        body: formData,
        token: session?.accessToken,
      });

      if (!ok) {
        toast.error(data.error || "Error al subir la imagen");
        return;
      }

      onCambio([...valores, data.url]);
      toast.success("Foto agregada");
    } catch (error) {
      toast.error("Error al subir la imagen. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const eliminarFoto = (index: number) => {
    onCambio(valores.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-3">
        {valores.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
            <Image src={mediaUrl(url)} alt={`Foto ${i + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => eliminarFoto(i)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2251a3] hover:bg-gray-50 transition-colors">
          {subiendo ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#2251a3]" />
          ) : (
            <Plus className="w-6 h-6 text-gray-400" />
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={manejarArchivo}
            disabled={subiendo}
          />
        </label>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Puedes agregar varias fotos, una por una. La primera foto agregada arriba en
        &quot;Imagen principal&quot; es la que se ve en la tarjeta del listado.
      </p>
    </div>
  );
}