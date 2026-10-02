import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import ProyectoForm from "../../_components/ProyectoForm";
import EditorLayout from "@/components/EditorLayout";

async function getProyecto(id: string) {
  const { data } = await apiFetch<{ proyecto: any }>(
    `/proyectos/${encodeURIComponent(id)}`,
  );
  const proyecto = data.proyecto;
  if (!proyecto) return null;
  return {
    id: proyecto.id,
    titulo: proyecto.titulo,
    fecha: proyecto.fecha,
    anio: String(proyecto.anio),
    resumen: proyecto.resumen,
    descripcion: proyecto.descripcion,
    imagen: proyecto.imagen,
    fotos: Array.isArray(proyecto.fotos) ? proyecto.fotos : [],
    video: proyecto.video || "",
    etiqueta: proyecto.etiqueta,
    emoji: proyecto.emoji,
  };
}

export default async function EditarProyectoPage({
  params,
}: {
  params: { id: string };
}) {
  const proyecto = await getProyecto(params.id);
  if (!proyecto) notFound();

  return (
    <EditorLayout type="proyectos" editing>
      <ProyectoForm inicial={proyecto} />
    </EditorLayout>
  );
}
