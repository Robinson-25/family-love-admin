export type ContentItem = {
  id: number;
  titulo: string;
  fecha: string;
  imagen: string;
  resumen?: string;
  createdAt?: string;
  anio?: number;
  etiqueta?: string;
};

export type Publication = ContentItem & { tipo: "proyectos" | "noticias" };

export type Volunteer = {
  id: number;
  nombre: string;
  edad: number;
  email: string;
  telefono: string;
  motivacion: string | null;
  createdAt: string;
};

export type DashboardData = {
  nombre: string;
  today: string;
  counts: {
    proyectos: number | null;
    noticias: number | null;
    voluntarios: number | null;
    usuarios: number | null;
  };
  publications: Publication[];
  volunteers: Pick<Volunteer, "id" | "nombre" | "createdAt">[];
  unavailable: string[];
};

export function monthKey(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

export function getMonthlyActivity(
  publications: Publication[],
  today: string,
  months: number,
) {
  const current = monthKey(today)!;
  const [year, month] = current.split("-").map(Number);
  const buckets = Array.from({ length: months }, (_, index) => {
    const date = new Date(Date.UTC(year, month - months + index, 15));
    return {
      key: monthKey(date.toISOString())!,
      label: new Intl.DateTimeFormat("es-PE", {
        month: "short",
        timeZone: "America/Lima",
      })
        .format(date)
        .replace(".", ""),
      fullLabel: new Intl.DateTimeFormat("es-PE", {
        month: "long",
        year: "numeric",
        timeZone: "America/Lima",
      }).format(date),
      proyectos: 0,
      noticias: 0,
    };
  });
  for (const publication of publications) {
    if (!publication.createdAt) continue;
    const bucket = buckets.find(
      (entry) => entry.key === monthKey(publication.createdAt!),
    );
    if (bucket) bucket[publication.tipo] += 1;
  }
  return buckets;
}

export function sortRecent<T extends { createdAt?: string }>(items: T[]): T[] {
  const timestamp = (value?: string) =>
    value ? new Date(value).getTime() || 0 : 0;
  return [...items].sort(
    (a, b) => timestamp(b.createdAt) - timestamp(a.createdAt),
  );
}

export function shortDate(value?: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(new Date(value));
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}
