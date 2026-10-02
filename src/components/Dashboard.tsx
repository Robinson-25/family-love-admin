"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  FileText,
  FolderKanban,
  Heart,
  HeartHandshake,
  Newspaper,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { DashboardData, getMonthlyActivity, shortDate } from "@/lib/dashboard";
import ContentThumbnail from "@/components/ContentThumbnail";

const formatCount = (value: number | null) =>
  value == null ? "—" : new Intl.NumberFormat("es-PE").format(value);

export default function Dashboard({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [months, setMonths] = useState(6);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [filter, setFilter] = useState("todos");
  const { counts, publications, volunteers, unavailable } = data;
  const activity = getMonthlyActivity(publications, data.today, months);
  const selectedActivity = activity.find((item) => item.key === selectedMonth);
  const chartUnavailable =
    unavailable.includes("proyectos") || unavailable.includes("noticias");
  const chartTotal = activity.reduce(
    (sum, item) => sum + item.proyectos + item.noticias,
    0,
  );
  const chartMax = Math.max(
    4,
    ...activity.map((item) => Math.max(item.proyectos, item.noticias)),
  );
  const chartCeiling = Math.ceil(chartMax / 4) * 4;
  const total =
    counts.proyectos != null && counts.noticias != null
      ? counts.proyectos + counts.noticias
      : null;
  const percent = total ? (counts.proyectos! / total) * 100 : 0;
  const recent = publications
    .filter((item) => filter === "todos" || item.tipo === filter)
    .slice(0, 4);
  const currentDate = new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(new Date(data.today));
  const metrics = [
    {
      label: "Proyectos realizados",
      value: counts.proyectos,
      icon: FolderKanban,
      theme: "bg-sky-50 text-sky-600",
      note: "Iniciativas que dejan huella",
      href: "/proyectos",
    },
    {
      label: "Noticias publicadas",
      value: counts.noticias,
      icon: Newspaper,
      theme: "bg-violet-50 text-violet-500",
      note: "Historias que nos conectan",
      href: "/noticias",
    },
    {
      label: "Solicitudes de voluntariado",
      value: counts.voluntarios,
      icon: HeartHandshake,
      theme: "bg-emerald-50 text-emerald-600",
      note: "Personas que quieren sumar",
      href: "/voluntarios",
    },
    {
      label: "Nuestra comunidad",
      value: counts.usuarios,
      icon: Users,
      theme: "bg-amber-50 text-amber-600",
      note: "Usuarios registrados en el sitio",
      href: null,
    },
  ];

  return (
    <div className="fade-in space-y-6" aria-busy={refreshing}>
      <div className="page-heading !mb-0">
        <div>
          <p className="page-eyebrow">Tu impacto, en un solo lugar</p>
          <h1 className="page-title">
            Hola, {data.nombre.split(" ")[0]}{" "}
            <span className="font-normal" aria-hidden="true">
              ✦
            </span>
          </h1>
          <p className="page-description">
            Un nuevo día para hacer cosas que importan.
          </p>
        </div>
        <div className="dashboard-date flex items-center gap-2 pt-1">
          <span className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-500">
            <CalendarDays size={15} className="text-slate-400" />
            {currentDate}
          </span>
          <button
            className="button-secondary !px-3"
            aria-label="Actualizar dashboard"
            title="Actualizar dashboard"
            disabled={refreshing}
            onClick={() => startRefresh(() => router.refresh())}
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {unavailable.length > 0 && (
        <div role="alert" className="error-notice">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>
            No pudimos cargar: {unavailable.join(", ")}. Puedes actualizar el
            dashboard para volver a intentarlo.
          </p>
        </div>
      )}

      <section className="welcome-banner px-6 py-7 md:px-8 md:py-8">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-medium tracking-wide text-sky-100">
            <Heart size={10} /> HECHO CON AMOR, PARA LOS DEMÁS
          </span>
          <h2 className="mt-4 text-[26px] font-extrabold leading-[1.2] tracking-tight text-white md:text-[32px]">
            Pequeñas acciones.
            <br />
            <span className="text-[#9addf1]">Grandes cambios.</span>
          </h2>
          <p className="mt-3 max-w-md text-[11px] leading-relaxed text-sky-100/70 md:text-xs">
            Dale vida a una nueva iniciativa o comparte las historias que hacen
            de Family Love una familia.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/proyectos/nuevo"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2.5 text-[11px] font-bold text-[#174d77] transition-colors hover:bg-sky-100"
            >
              <Plus size={15} /> Crear proyecto
            </Link>
            <Link
              href="/noticias/nuevo"
              className="inline-flex items-center gap-1.5 py-2 text-[11px] font-semibold text-white hover:text-sky-200"
            >
              Escribir noticia <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-label="Resumen de métricas"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5"
      >
        {metrics.map(({ label, value, icon: Icon, theme, note, href }) => {
          const content = (
            <>
              <div className="flex items-center justify-between">
                <span className={`rounded-xl p-2.5 ${theme}`}>
                  <Icon size={19} strokeWidth={1.7} />
                </span>
                {href && <ArrowUpRight size={15} className="text-slate-300" />}
              </div>
              <p className="metric-label mt-4 text-[10px] font-medium text-slate-500 sm:text-xs">
                {label}
              </p>
              <p className="metric-value mt-1.5 text-[30px] font-bold leading-none tracking-tight text-[#213852]">
                {formatCount(value)}
              </p>
              <p className="metric-note mt-3 border-t border-slate-100 pt-3 text-[9px] leading-relaxed text-slate-400 sm:text-[10px]">
                {note}
              </p>
            </>
          );
          return href ? (
            <Link
              key={label}
              href={href}
              className="metric-card panel-card p-4 md:p-5"
            >
              {content}
            </Link>
          ) : (
            <div key={label} className="metric-card panel-card p-4 md:p-5">
              {content}
            </div>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <section className="panel-card">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Nuestro impacto en el tiempo</h2>
              <p className="section-description">
                Proyectos y noticias según su fecha de publicación
              </p>
            </div>
            <select
              aria-label="Periodo del gráfico"
              value={months}
              onChange={(event) => setMonths(Number(event.target.value))}
              className="chart-period filter-select sm:!min-h-8 sm:!rounded-lg sm:!text-[11px]"
            >
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Últimos 12 meses</option>
            </select>
          </div>
          <div className="px-5 pb-5 pt-4 md:px-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-slate-400">
                <strong className="mr-1 text-xl font-bold text-slate-800">
                  {chartUnavailable ? "—" : chartTotal}
                </strong>{" "}
                publicaciones en este periodo
              </p>
              <div className="flex gap-3 text-[9px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-sm bg-[#1686c7]" />
                  Proyectos
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-sm bg-[#8fd2ed]" />
                  Noticias
                </span>
              </div>
            </div>
            {chartUnavailable ? (
              <div className="empty-state h-[185px]">
                <AlertCircle className="mb-3 text-slate-300" size={27} />
                <p className="text-xs text-slate-500">
                  El gráfico estará disponible cuando se carguen los datos.
                </p>
              </div>
            ) : (
              <div>
                {months === 12 && (
                  <p className="mb-2 text-xs text-slate-500 sm:hidden">
                    Desliza el gráfico para ver todos los meses.
                  </p>
                )}
                <div
                  className="activity-scroll"
                  role="region"
                  aria-label="Gráfico de publicaciones por mes, desplazable horizontalmente"
                  tabIndex={0}
                >
                  <div className="activity-plot relative" data-months={months}>
                    <div className="relative h-[164px] pl-7">
                      {[4, 3, 2, 1, 0].map((tick) => (
                        <div
                          key={tick}
                          className="absolute left-0 right-0 flex items-center gap-2"
                          style={{ top: `${100 - tick * 25}%` }}
                        >
                          <span className="w-5 text-right text-[9px] text-slate-400">
                            {(chartCeiling * tick) / 4}
                          </span>
                          <span className="flex-1 border-t border-dashed border-slate-100" />
                        </div>
                      ))}
                      <div className="relative flex h-full items-end justify-around gap-1">
                        {activity.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            className="chart-column group relative flex h-full min-w-0 flex-1 items-end justify-center gap-1"
                            onClick={() => setSelectedMonth(item.key)}
                            aria-pressed={selectedMonth === item.key}
                            aria-label={`${item.fullLabel}: ${item.proyectos} proyectos, ${item.noticias} noticias`}
                          >
                            <div
                              className="chart-bar w-[25%] max-w-6 rounded-t-[4px] bg-[#1686c7] transition-[height] duration-300"
                              style={{
                                height: `${(item.proyectos / chartCeiling) * 100}%`,
                              }}
                            />
                            <div
                              className="chart-bar w-[25%] max-w-6 rounded-t-[4px] bg-[#8fd2ed] transition-[height] duration-300"
                              style={{
                                height: `${(item.noticias / chartCeiling) * 100}%`,
                              }}
                            />
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-[9px] text-white group-hover:block group-focus:block">
                              {item.proyectos} proyectos · {item.noticias}{" "}
                              noticias
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex pl-7" aria-hidden="true">
                      {activity.map((item) => (
                        <span
                          key={item.key}
                          className="chart-month flex-1 text-center text-[9px] capitalize text-slate-400"
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p
                  className="mt-3 min-h-9 text-xs leading-relaxed text-slate-500"
                  role="status"
                >
                  {selectedActivity
                    ? `${selectedActivity.fullLabel}: ${selectedActivity.proyectos} proyectos y ${selectedActivity.noticias} noticias.`
                    : "Toca un mes para ver sus publicaciones."}
                </p>
                <div className="sr-only">
                  <table>
                    <caption>Publicaciones por mes</caption>
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Proyectos</th>
                        <th>Noticias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((item) => (
                        <tr key={item.key}>
                          <th>{item.fullLabel}</th>
                          <td>{item.proyectos}</td>
                          <td>{item.noticias}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {chartTotal === 0 && (
                  <p className="mt-3 text-center text-[10px] text-slate-400">
                    Aún no hay publicaciones en este periodo.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Lo que compartimos</h2>
              <p className="section-description">
                Todo el contenido de nuestra web
              </p>
            </div>
            <FileText size={17} className="text-slate-300" />
          </div>
          <div className="px-6 pb-5 pt-5">
            <div
              className="relative mx-auto flex h-[150px] w-[150px] items-center justify-center rounded-full"
              role="img"
              aria-label={
                total === null
                  ? "Contenido no disponible"
                  : `${counts.proyectos} proyectos y ${counts.noticias} noticias`
              }
              style={{
                background: total
                  ? `conic-gradient(#1686c7 0% ${percent}%, #8fd2ed ${percent}% 100%)`
                  : "#edf2f7",
              }}
            >
              <div className="flex h-[123px] w-[123px] flex-col items-center justify-center rounded-full bg-white">
                <span className="text-[30px] font-bold tracking-tight text-slate-800">
                  {formatCount(total)}
                </span>
                <span className="mt-0.5 text-[10px] text-slate-400">
                  publicaciones
                </span>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <Link
                href="/proyectos"
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-[#1686c7]" />
                  Proyectos
                </span>
                <span className="font-bold text-slate-700">
                  {formatCount(counts.proyectos)}
                  <ChevronRight
                    className="ml-2 inline text-slate-300"
                    size={12}
                  />
                </span>
              </Link>
              <Link
                href="/noticias"
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-[#8fd2ed]" />
                  Noticias
                </span>
                <span className="font-bold text-slate-700">
                  {formatCount(counts.noticias)}
                  <ChevronRight
                    className="ml-2 inline text-slate-300"
                    size={12}
                  />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <section className="panel-card">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Últimas publicaciones</h2>
              <p className="section-description">
                Las historias que estamos construyendo
              </p>
            </div>
            <ArrowDown size={16} className="text-slate-300" />
          </div>
          <div
            className="mx-5 mt-4 flex gap-5 border-b border-slate-100 md:mx-6"
            role="group"
            aria-label="Filtrar publicaciones"
          >
            {[
              { key: "todos", label: "Todo" },
              { key: "proyectos", label: "Proyectos" },
              { key: "noticias", label: "Noticias" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                aria-pressed={filter === tab.key}
                className={`min-h-11 border-b-2 px-1 pb-3 text-sm transition-colors sm:text-[11px] ${filter === tab.key ? "border-sky-500 font-bold text-sky-700" : "border-transparent font-medium text-slate-400 hover:text-slate-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="divide-y divide-slate-100 px-5 md:px-6">
            {recent.map((item) => (
              <Link
                href={`/${item.tipo}/${item.id}/editar`}
                key={`${item.tipo}-${item.id}`}
                className="group flex items-center gap-3 py-4"
              >
                <ContentThumbnail
                  src={item.imagen}
                  title=""
                  className="h-12 w-14 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 break-words text-sm font-semibold text-slate-700 group-hover:text-sky-700 sm:line-clamp-1 sm:text-xs">
                    {item.titulo}
                  </p>
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    {item.tipo === "proyectos" ? "Proyecto" : "Noticia"}
                    <span className="px-1.5">·</span>
                    {shortDate(item.createdAt)}
                  </p>
                </div>
                <span className="status-badge hidden sm:inline-flex">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Publicado
                </span>
                <ChevronRight size={14} className="text-slate-300" />
              </Link>
            ))}
            {recent.length === 0 && (
              <div className="empty-state">
                <Newspaper size={28} className="mb-3 text-sky-200" />
                <p className="text-xs text-slate-500">
                  {chartUnavailable
                    ? "No se pudieron cargar las publicaciones."
                    : "Tu próxima historia empieza aquí."}
                </p>
                {!chartUnavailable && (
                  <Link
                    href={
                      filter === "noticias"
                        ? "/noticias/nuevo"
                        : "/proyectos/nuevo"
                    }
                    className="text-link mt-3"
                  >
                    Crear una publicación <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 md:px-6">
            <Link href="/proyectos" className="text-link">
              Ver proyectos <ArrowRight size={12} />
            </Link>
            <Link href="/noticias" className="text-link">
              Ver noticias <ArrowRight size={12} />
            </Link>
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Personas que suman</h2>
              <p className="section-description">
                Últimas solicitudes de voluntariado
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <HeartHandshake size={17} />
            </span>
          </div>
          <div className="divide-y divide-slate-100 px-5 md:px-6">
            {volunteers.map((person, index) => (
              <Link
                href="/voluntarios"
                key={person.id}
                className="group flex items-center gap-3 py-4"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${["bg-sky-50 text-sky-600", "bg-orange-50 text-orange-500", "bg-violet-50 text-violet-500", "bg-emerald-50 text-emerald-600"][index % 4]}`}
                >
                  {person.nombre
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-700 group-hover:text-sky-700">
                    {person.nombre}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {shortDate(person.createdAt)}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
              </Link>
            ))}
            {volunteers.length === 0 && (
              <div className="empty-state">
                <Users size={28} className="mb-3 text-emerald-200" />
                <p className="text-xs leading-relaxed text-slate-500">
                  {unavailable.includes("voluntarios")
                    ? "No se pudieron cargar las solicitudes."
                    : "Las nuevas solicitudes aparecerán aquí. Cada persona puede hacer la diferencia."}
                </p>
              </div>
            )}
          </div>
          <Link
            href="/voluntarios"
            className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/50 py-3.5 text-[11px] font-bold text-sky-700 hover:bg-sky-50"
          >
            Ver voluntarios <ArrowRight size={13} />
          </Link>
        </section>
      </div>
    </div>
  );
}
