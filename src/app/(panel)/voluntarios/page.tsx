import VolunteerDirectory from "@/components/VolunteerDirectory";
import { apiFetch } from "@/lib/api";
import { Volunteer } from "@/lib/dashboard";
import { requireStaffSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function VoluntariosPage() {
  const session = await requireStaffSession();
  const { ok, data } = await apiFetch<{ voluntarios: Volunteer[] }>(
    "/voluntarios",
    { token: session.accessToken, signal: AbortSignal.timeout(10000) },
  );
  return (
    <VolunteerDirectory
      volunteers={ok ? (data.voluntarios ?? []) : []}
      error={
        ok ? undefined : data.error || "No se pudieron cargar las solicitudes."
      }
      today={new Date().toISOString()}
    />
  );
}
