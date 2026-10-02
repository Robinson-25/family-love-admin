import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import NoticiaForm from "../../_components/NoticiaForm";
import EditorLayout from "@/components/EditorLayout";

async function getNoticia(id: string) {
  const { data } = await apiFetch<{ noticia: any }>(
    `/noticias/${encodeURIComponent(id)}`,
  );
  const noticia = data.noticia;
  if (!noticia) return null;
  return {
    id: noticia.id,
    titulo: noticia.titulo,
    resumen: noticia.resumen,
    contenido: noticia.contenido,
    imagen: noticia.imagen,
    video: noticia.video || "",
    fecha: noticia.fecha,
  };
}

export default async function EditarNoticiaPage({
  params,
}: {
  params: { id: string };
}) {
  const noticia = await getNoticia(params.id);
  if (!noticia) notFound();

  return (
    <EditorLayout type="noticias" editing>
      <NoticiaForm inicial={noticia} />
    </EditorLayout>
  );
}
