import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import EquipoForm from "../../_components/EquipoForm";

export default async function EditarPersonaPage({ params }: { params: { id: string } }) {
  const { data } = await apiFetch<{ persona: any }>(`/equipo/${encodeURIComponent(params.id)}`);
  const persona = data.persona;
  if (!persona) notFound();

  return (
    <EquipoForm
      inicial={{
        id: persona.id,
        nombre: persona.nombre,
        cargo: persona.cargo,
        imagen: persona.imagen,
        bio: persona.bio,
      }}
    />
  );
}
