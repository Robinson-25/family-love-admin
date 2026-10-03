import Dashboard from "@/components/Dashboard";
import { apiFetch } from "@/lib/api";
import {
  ContentItem,
  DashboardData,
  sortRecent,
  Volunteer,
} from "@/lib/dashboard";
import { requireStaffSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PanelAdminPage() {
  const session = await requireStaffSession();
  const request = () => ({
    token: session.accessToken,
    signal: AbortSignal.timeout(10000),
  });
  const [stats, projects, news, volunteers] = await Promise.all([
    apiFetch<{
      proyectos: number;
      noticias: number;
      voluntarios: number;
      usuarios: number;
    }>("/stats", request()),
    apiFetch<{ proyectos: ContentItem[] }>("/proyectos", request()),
    apiFetch<{ noticias: ContentItem[] }>("/noticias", request()),
    apiFetch<{ voluntarios: Volunteer[] }>("/voluntarios", request()),
  ]);
  const projectItems = projects.ok ? (projects.data.proyectos ?? []) : [];
  const newsItems = news.ok ? (news.data.noticias ?? []) : [];
  const volunteerItems = volunteers.ok
    ? (volunteers.data.voluntarios ?? [])
    : [];
  const data: DashboardData = {
    nombre: session.user.name || "equipo",
    today: new Date().toISOString(),
    counts: {
      proyectos: stats.ok
        ? stats.data.proyectos
        : projects.ok
          ? projectItems.length
          : null,
      noticias: stats.ok
        ? stats.data.noticias
        : news.ok
          ? newsItems.length
          : null,
      voluntarios: stats.ok
        ? stats.data.voluntarios
        : volunteers.ok
          ? volunteerItems.length
          : null,
      usuarios: stats.ok ? stats.data.usuarios : null,
    },
    publications: sortRecent([
      ...projectItems.map((item) => ({ ...item, tipo: "proyectos" as const })),
      ...newsItems.map((item) => ({ ...item, tipo: "noticias" as const })),
    ]).map(({ id, titulo, fecha, imagen, createdAt, tipo, etiqueta }) => ({
      id,
      titulo,
      fecha,
      imagen,
      createdAt,
      tipo,
      etiqueta,
    })),
    volunteers: sortRecent(volunteerItems)
      .slice(0, 4)
      .map(({ id, nombre, createdAt }) => ({ id, nombre, createdAt })),
    applications: volunteerItems.map(({ createdAt, edad }) => ({
      createdAt,
      edad,
    })),
    unavailable: [
      !stats.ok && "estadísticas",
      !projects.ok && "proyectos",
      !news.ok && "noticias",
      !volunteers.ok && "voluntarios",
    ].filter((value): value is string => Boolean(value)),
  };
  return <Dashboard data={data} />;
}
