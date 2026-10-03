"use client";

// ─── INICIO DEL PANEL (DASHBOARD) ───────────────────────────────────────────
// Resumen con números y gráficos. Se adapta a celular, tablet y computadora.
// Los gráficos están hechos con HTML/SVG (no se instaló ninguna librería).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  ChevronRight,
  FolderKanban,
  HeartHandshake,
  Newspaper,
  PenLine,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  DashboardData,
  getMonthlyActivity,
  getMonthlyCounts,
  monthKey,
  shortDate,
} from "@/lib/dashboard";
import ContentThumbnail from "@/components/ContentThumbnail";

// Un color fijo por cada tipo de dato (se repite igual en todos los gráficos).
// Están elegidos para distinguirse bien sobre las tarjetas claras.
const COLOR = {
  proyectos: "#2251a3",
  noticias: "#c97a10",
  voluntarios: "#0f9aa8",
};

const numero = (value: number | null) =>
  value == null ? "—" : new Intl.NumberFormat("es-PE").format(value);

// Redondea el tope del eje para que las marcas sean números enteros
const tope = (max: number) => Math.max(4, Math.ceil(max / 4) * 4);

const RANGOS_EDAD = [
  { label: "16–20", min: 16, max: 20 },
  { label: "21–25", min: 21, max: 25 },
  { label: "26–30", min: 26, max: 30 },
  { label: "31–35", min: 31, max: 35 },
];

function Tarjeta({
  titulo,
  descripcion,
  children,
  className = "",
  accion,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
  className?: string;
  accion?: React.ReactNode;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#f3f8fd] shadow-[0_10px_24px_-14px_rgba(10,30,70,0.6)] ${className}`}
    >
      {/* Franja azul con el título */}
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 bg-[#1a3a6b] px-5 py-2.5">
        <h2 className="text-[15px] font-bold text-white">{titulo}</h2>
        {accion}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {descripcion && (
          <p className="mb-4 text-[13px] font-semibold leading-snug text-slate-600">
            {descripcion}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

function Vacio({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex flex-1 items-center justify-center rounded-xl bg-slate-200/60 px-4 py-10 text-center text-[13px] font-semibold text-slate-600">
      {children}
    </p>
  );
}

function Leyenda({ items }: { items: { color: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap mb-3 gap-x-4 gap-y-1 text-[13px] font-semibold text-slate-700">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

// Globo que aparece al pasar el mouse o tocar una barra
function Globo({
  children,
  lado = "centro",
}: {
  children: React.ReactNode;
  lado?: "izq" | "centro" | "der";
}) {
  const posicion =
    lado === "izq"
      ? "left-0"
      : lado === "der"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";
  return (
    <span
      className={`pointer-events-none absolute top-0 z-10 hidden w-max rounded-lg bg-[#12284c] px-3 py-2 text-left text-xs font-medium leading-relaxed text-white shadow-xl group-hover:block group-focus-visible:block ${posicion}`}
    >
      {children}
    </span>
  );
}

const lado = (index: number, total: number) =>
  index === 0 ? "izq" : index === total - 1 ? "der" : "centro";

// Líneas horizontales y números del eje
function Eje({ max }: { max: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col justify-between"
      aria-hidden="true"
    >
      {[4, 3, 2, 1, 0].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">
            {(max / 4) * step}
          </span>
          <span className="h-px flex-1 bg-slate-300/70" />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [months, setMonths] = useState(6);
  const [filter, setFilter] = useState<"todos" | "proyectos" | "noticias">(
    "todos",
  );
  const { counts, publications, volunteers, unavailable } = data;
  const applications = data.applications ?? [];
  const thisMonth = monthKey(data.today);
  const delMes = (dates: (string | undefined)[]) =>
    dates.filter((value) => value && monthKey(value) === thisMonth).length;

  // ── Datos para los gráficos ──
  const activity = getMonthlyActivity(publications, data.today, months);
  const activityMax = tope(
    Math.max(...activity.map((m) => Math.max(m.proyectos, m.noticias))),
  );
  const activityTotal = activity.reduce(
    (sum, m) => sum + m.proyectos + m.noticias,
    0,
  );

  const requests = getMonthlyCounts(
    applications.map((item) => item.createdAt),
    data.today,
    months,
  );
  const requestsMax = tope(Math.max(...requests.map((m) => m.total)));
  const requestsTotal = requests.reduce((sum, m) => sum + m.total, 0);
  const punto = (index: number, total: number) => ({
    x: ((index + 0.5) / requests.length) * 100,
    y: 100 - (total / requestsMax) * 100,
  });
  const linea = requests
    .map((m, i) => {
      const { x, y } = punto(i, m.total);
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  const totalContenido =
    counts.proyectos != null && counts.noticias != null
      ? counts.proyectos + counts.noticias
      : null;
  const parteProyectos = totalContenido
    ? (counts.proyectos! / totalContenido) * 100
    : 0;

  const porCategoria = new Map<string, number>();
  for (const item of publications) {
    if (item.tipo !== "proyectos") continue;
    const nombre = item.etiqueta?.trim() || "Sin categoría";
    porCategoria.set(nombre, (porCategoria.get(nombre) ?? 0) + 1);
  }
  const ordenadas = Array.from(porCategoria.entries()).sort((a, b) => b[1] - a[1]);
  const categorias = ordenadas.slice(0, 5);
  const otras = ordenadas.slice(5).reduce((sum, [, value]) => sum + value, 0);
  if (otras > 0) categorias.push(["Otras", otras]);
  const categoriaMax = Math.max(1, ...categorias.map(([, value]) => value));

  const edades = RANGOS_EDAD.map((rango) => ({
    label: rango.label,
    total: applications.filter(
      (item) => item.edad >= rango.min && item.edad <= rango.max,
    ).length,
  }));
  const fueraDeRango = applications.length - edades.reduce((s, e) => s + e.total, 0);
  if (fueraDeRango > 0) edades.push({ label: "Otra edad", total: fueraDeRango });
  const edadMax = tope(Math.max(...edades.map((e) => e.total)));

  const recientes = publications
    .filter((item) => filter === "todos" || item.tipo === filter)
    .slice(0, 5);

  const fechaLarga = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(new Date(data.today));

  const novedad = (cantidad: number, uno: string, varios: string) =>
    cantidad === 0
      ? "Sin novedades este mes"
      : `+${cantidad} ${cantidad === 1 ? uno : varios} este mes`;

  const indicadores = [
    {
      label: "Proyectos",
      value: counts.proyectos,
      icon: FolderKanban,
      nota: novedad(
        delMes(publications.filter((p) => p.tipo === "proyectos").map((p) => p.createdAt)),
        "nuevo",
        "nuevos",
      ),
      href: "/proyectos",
      color: COLOR.proyectos,
    },
    {
      label: "Noticias",
      value: counts.noticias,
      icon: Newspaper,
      nota: novedad(
        delMes(publications.filter((p) => p.tipo === "noticias").map((p) => p.createdAt)),
        "nueva",
        "nuevas",
      ),
      href: "/noticias",
      color: COLOR.noticias,
    },
    {
      label: "Solicitudes de voluntariado",
      value: counts.voluntarios,
      icon: HeartHandshake,
      nota: novedad(
        delMes(applications.map((item) => item.createdAt)),
        "nueva",
        "nuevas",
      ),
      href: "/voluntarios",
      color: COLOR.voluntarios,
    },
    {
      label: "Usuarios registrados",
      value: counts.usuarios,
      icon: Users,
      nota: "Cuentas creadas en la web",
      href: null,
      color: "#1a3a6b",
    },
  ];

  const periodo = (
    <div
      role="group"
      aria-label="Periodo de los gráficos"
      className="inline-flex rounded-xl border border-white/50 bg-white/10 p-1 text-[13px] font-bold"
    >
      {[6, 12].map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={months === value}
          onClick={() => setMonths(value)}
          className={`rounded-lg px-3 py-1.5 transition-colors ${
            months === value
              ? "bg-white text-[#1a3a6b]"
              : "text-white hover:bg-white/15"
          }`}
        >
          {value} meses
        </button>
      ))}
    </div>
  );

  return (
    <div
      className="-m-4 min-h-screen space-y-5 bg-gradient-to-b from-[#2f67b3] to-[#4a8fd0] p-4 font-medium text-slate-700 lining-nums sm:space-y-6 md:-m-8 md:p-8"
      aria-busy={refreshing}
    >
      {/* ── Saludo y acciones ── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Hola, {data.nombre.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm font-semibold text-white/90 first-letter:uppercase">
            {fechaLarga}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Link
            href="/proyectos/nuevo"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#1a3a6b] shadow-sm transition-colors hover:bg-[#73eafe] sm:flex-none"
          >
            <Plus size={17} /> Crear proyecto
          </Link>
          <Link
            href="/noticias/nuevo"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/10 px-4 text-sm font-bold text-white transition-colors hover:bg-white/25 sm:flex-none"
          >
            <PenLine size={16} /> Escribir noticia
          </Link>
          <button
            type="button"
            aria-label="Actualizar datos"
            title="Actualizar datos"
            disabled={refreshing}
            onClick={() => startRefresh(() => router.refresh())}
            className="inline-flex min-h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/10 text-white transition-colors hover:bg-white/25 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {unavailable.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>
            No se pudo cargar: {unavailable.join(", ")}. Revisa que el servidor
            esté encendido y pulsa actualizar.
          </p>
        </div>
      )}

      {/* ── Números principales ── */}
      <section
        aria-label="Resumen"
        className="text-[#12284c]"
      >
        <dl className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {indicadores.map(({ label, value, icon: Icon, nota, href, color }) => {
            const contenido = (
              <>
                <dt className="flex items-center gap-2.5 text-[13px] font-bold text-slate-700">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: color }}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 leading-tight">{label}</span>
                </dt>
                <dd className="mt-3">
                  <span className="block text-3xl font-extrabold sm:text-4xl">
                    {numero(value)}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-slate-600 sm:text-[13px]">
                    {nota}
                  </span>
                </dd>
              </>
            );
            return href ? (
              <Link
                key={label}
                href={href}
                style={{ borderTopColor: color }}
                className="rounded-2xl border-t-4 bg-[#f3f8fd] p-4 shadow-[0_10px_24px_-14px_rgba(10,30,70,0.6)] sm:p-5 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                {contenido}
              </Link>
            ) : (
              <div
                key={label}
                style={{ borderTopColor: color }}
                className="rounded-2xl border-t-4 bg-[#f3f8fd] p-4 shadow-[0_10px_24px_-14px_rgba(10,30,70,0.6)] sm:p-5"
              >
                {contenido}
              </div>
            );
          })}
        </dl>
      </section>

      {/* ── Periodo (aplica a los dos gráficos por mes) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <h2 className="text-lg font-extrabold text-white">
          Cómo vamos
        </h2>
        {periodo}
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
        {/* Publicaciones por mes */}
        <Tarjeta
          className="lg:col-span-2"
          titulo="Publicaciones por mes"
          descripcion={`${activityTotal} en los últimos ${months} meses, según la fecha en que se subieron`}
        >
          <Leyenda
            items={[
              { color: COLOR.proyectos, label: "Proyectos" },
              { color: COLOR.noticias, label: "Noticias" },
            ]}
          />
          {activityTotal === 0 ? (
            <Vacio>Todavía no hay publicaciones en este periodo.</Vacio>
          ) : (
            <div className="overflow-x-auto">
              <div className={months === 12 ? "min-w-[560px]" : "min-w-[300px]"}>
                <div className="relative h-48 sm:h-56">
                  <Eje max={activityMax} />
                  <div className="absolute inset-y-[9px] left-8 right-0 flex">
                    {activity.map((m, i) => (
                      <button
                        key={m.key}
                        type="button"
                        aria-label={`${m.fullLabel}: ${m.proyectos} proyectos y ${m.noticias} noticias`}
                        className="group relative flex h-full flex-1 items-end justify-center gap-0.5 rounded-md hover:bg-slate-300/40 focus-visible:bg-slate-300/40 focus-visible:outline-none"
                      >
                        <span
                          className="w-[30%] max-w-6 rounded-t"
                          style={{
                            height: `${(m.proyectos / activityMax) * 100}%`,
                            background: COLOR.proyectos,
                          }}
                        />
                        <span
                          className="w-[30%] max-w-6 rounded-t"
                          style={{
                            height: `${(m.noticias / activityMax) * 100}%`,
                            background: COLOR.noticias,
                          }}
                        />
                        <Globo lado={lado(i, activity.length)}>
                          <strong className="block first-letter:uppercase">{m.fullLabel}</strong>
                          Proyectos: {m.proyectos}
                          <br />
                          Noticias: {m.noticias}
                        </Globo>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ml-8 mt-2 flex text-[13px] font-semibold capitalize text-slate-600">
                  {activity.map((m) => (
                    <span key={m.key} className="flex-1 text-center">
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Tarjeta>

        {/* Contenido de la web */}
        <Tarjeta titulo="Contenido de la web" descripcion="Todo lo publicado hasta hoy">
          {!totalContenido ? (
            <Vacio>Aún no hay contenido publicado.</Vacio>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row lg:flex-col">
              <div className="relative h-40 w-40 shrink-0">
                <svg
                  viewBox="0 0 42 42"
                  className="h-full w-full -rotate-90"
                  role="img"
                  aria-label={`${counts.proyectos} proyectos y ${counts.noticias} noticias`}
                >
                  <circle cx="21" cy="21" r="15.915" fill="none" stroke="#d7e3f1" strokeWidth="5" />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="none"
                    stroke={COLOR.proyectos}
                    strokeWidth="5"
                    strokeDasharray={`${Math.max(parteProyectos - 1, 0)} ${100 - Math.max(parteProyectos - 1, 0)}`}
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="none"
                    stroke={COLOR.noticias}
                    strokeWidth="5"
                    strokeDasharray={`${Math.max(99 - parteProyectos, 0)} ${100 - Math.max(99 - parteProyectos, 0)}`}
                    strokeDashoffset={-parteProyectos}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-[#12284c]">
                    {numero(totalContenido)}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">publicaciones</span>
                </div>
              </div>
              <ul className="w-full max-w-[240px] space-y-1 text-sm">
                {[
                  { label: "Proyectos", value: counts.proyectos!, color: COLOR.proyectos, href: "/proyectos" },
                  { label: "Noticias", value: counts.noticias!, color: COLOR.noticias, href: "/noticias" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 font-semibold text-slate-700 hover:bg-white"
                    >
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
                      <span className="flex-1">{item.label}</span>
                      <strong className="text-[#12284c]">{item.value}</strong>
                      <span className="w-10 text-right text-xs font-semibold tabular-nums text-slate-600">
                        {Math.round((item.value / totalContenido) * 100)}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Tarjeta>
      </div>

      <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Solicitudes de voluntariado por mes */}
        <Tarjeta
          titulo="Solicitudes de voluntariado"
          descripcion={`${requestsTotal} recibidas en los últimos ${months} meses`}
        >
          {requestsTotal === 0 ? (
            <Vacio>No llegaron solicitudes en este periodo.</Vacio>
          ) : (
            <div className="flex flex-1 flex-col overflow-x-auto">
              <div className={`flex flex-1 flex-col ${months === 12 ? "min-w-[460px]" : "min-w-[260px]"}`}>
                <div className="relative min-h-44 flex-1">
                  <Eje max={requestsMax} />
                  <div className="absolute inset-y-[9px] left-8 right-0">
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 h-full w-full overflow-visible"
                      aria-hidden="true"
                    >
                      <path
                        d={`${linea} L${punto(requests.length - 1, 0).x} 100 L${punto(0, 0).x} 100 Z`}
                        fill={COLOR.voluntarios}
                        fillOpacity="0.14"
                      />
                      <path
                        d={linea}
                        fill="none"
                        stroke={COLOR.voluntarios}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    <div className="absolute inset-0 flex">
                      {requests.map((m, i) => (
                        <button
                          key={m.key}
                          type="button"
                          aria-label={`${m.fullLabel}: ${m.total} solicitudes`}
                          className="group relative h-full flex-1 focus-visible:outline-none"
                        >
                          <span
                            className="absolute left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full ring-2 ring-[#f3f8fd] transition-transform group-hover:scale-150 group-focus-visible:scale-150"
                            style={{
                              bottom: `${(m.total / requestsMax) * 100}%`,
                              background: COLOR.voluntarios,
                            }}
                          />
                          <Globo lado={lado(i, requests.length)}>
                            <strong className="block first-letter:uppercase">{m.fullLabel}</strong>
                            Solicitudes: {m.total}
                          </Globo>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ml-8 mt-2 flex text-[13px] font-semibold capitalize text-slate-600">
                  {requests.map((m) => (
                    <span key={m.key} className="flex-1 text-center">
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Tarjeta>

        {/* Edad de quienes postulan */}
        <Tarjeta
          titulo="Edad de quienes postulan"
          descripcion="Solicitudes de voluntariado por rango de edad"
        >
          {applications.length === 0 ? (
            <Vacio>Aún no hay solicitudes de voluntariado.</Vacio>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="relative min-h-44 flex-1">
                <Eje max={edadMax} />
                <div className="absolute inset-y-[9px] left-8 right-0 flex">
                  {edades.map((rango) => (
                    <button
                      key={rango.label}
                      type="button"
                      aria-label={`${rango.label} años: ${rango.total} solicitudes`}
                      className="group relative flex h-full flex-1 items-end justify-center rounded-md hover:bg-slate-300/40 focus-visible:bg-slate-300/40 focus-visible:outline-none"
                    >
                      <span
                        className="relative w-1/2 max-w-6 rounded-t"
                        style={{
                          height: `${(rango.total / edadMax) * 100}%`,
                          background: COLOR.voluntarios,
                        }}
                      >
                        {rango.total > 0 && (
                          <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-xs font-bold text-[#12284c]">
                            {rango.total}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="ml-8 mt-2 flex text-[13px] font-semibold text-slate-600">
                {edades.map((rango) => (
                  <span key={rango.label} className="flex-1 text-center">
                    {rango.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Tarjeta>

        {/* Proyectos por categoría */}
        <Tarjeta
          className="md:col-span-2 xl:col-span-1"
          titulo="Proyectos por categoría"
          descripcion="Según la etiqueta de cada proyecto"
        >
          {categorias.length === 0 ? (
            <Vacio>Aún no hay proyectos publicados.</Vacio>
          ) : (
            <ul className="space-y-3">
              {categorias.map(([nombre, value]) => (
                <li key={nombre}>
                  <p className="mb-1 truncate text-[13px] font-semibold text-slate-700" title={nombre}>
                    {nombre}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 rounded-r"
                      style={{
                        width: `calc(${(value / categoriaMax) * 100}% - 28px)`,
                        minWidth: 6,
                        background: COLOR.proyectos,
                      }}
                    />
                    <span className="text-xs font-bold tabular-nums text-[#12284c]">
                      {value}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
        {/* Últimas publicaciones */}
        <Tarjeta
          className="lg:col-span-2"
          titulo="Últimas publicaciones"
          accion={
            <div role="group" aria-label="Filtrar publicaciones" className="flex gap-1 text-[13px] font-semibold">
              {(
                [
                  ["todos", "Todo"],
                  ["proyectos", "Proyectos"],
                  ["noticias", "Noticias"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    filter === value
                      ? "bg-white text-[#1a3a6b]"
                      : "text-white/90 hover:bg-white/15"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        >
          {recientes.length === 0 ? (
            <Vacio>Aquí aparecerá lo último que publiques.</Vacio>
          ) : (
            <ul className="-my-1 divide-y divide-slate-200">
              {recientes.map((item) => (
                <li key={`${item.tipo}-${item.id}`}>
                  <Link
                    href={`/${item.tipo}/${item.id}/editar`}
                    className="group flex items-center gap-3 rounded-xl py-3 sm:gap-4"
                  >
                    <ContentThumbnail
                      src={item.imagen}
                      title={item.titulo}
                      className="h-14 w-14 rounded-xl sm:h-14 sm:w-20"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-[#12284c] group-hover:text-[#2251a3]">
                        {item.titulo}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-sm"
                            style={{ background: COLOR[item.tipo] }}
                          />
                          {item.tipo === "proyectos" ? "Proyecto" : "Noticia"}
                        </span>
                        <span>{shortDate(item.createdAt)}</span>
                      </p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-slate-400 group-hover:text-[#2251a3]" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        {/* Últimas solicitudes */}
        <Tarjeta
          titulo="Últimas solicitudes"
          descripcion="Personas que quieren ser voluntarias"
        >
          {volunteers.length === 0 ? (
            <Vacio>Aún no hay solicitudes de voluntariado.</Vacio>
          ) : (
            <>
              <ul className="-my-1 flex-1 divide-y divide-slate-200">
                {volunteers.map((person) => (
                  <li key={person.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f9aa8]/15 text-xs font-bold text-[#0b5f68]">
                      {person.nombre
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#12284c]">
                        {person.nombre}
                      </p>
                      <p className="text-xs font-semibold text-slate-600">
                        {shortDate(person.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/voluntarios"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1a3a6b] text-sm font-bold text-white transition-colors hover:bg-[#2251a3]"
              >
                Ver todas las solicitudes
              </Link>
            </>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
