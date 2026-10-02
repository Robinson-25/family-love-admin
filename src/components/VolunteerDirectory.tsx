"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  Mail,
  MessageCircle,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  monthKey,
  normalizeSearch,
  shortDate,
  sortRecent,
  Volunteer,
} from "@/lib/dashboard";

export default function VolunteerDirectory({
  volunteers,
  error,
  today,
}: {
  volunteers: Volunteer[];
  error?: string;
  today: string;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [page, setPage] = useState(1);
  const thisMonth = monthKey(today);
  const monthly = volunteers.filter(
    (person) => monthKey(person.createdAt) === thisMonth,
  );
  const filtered = sortRecent(volunteers).filter(
    (person) =>
      normalizeSearch(
        `${person.nombre} ${person.email} ${person.telefono}`,
      ).includes(normalizeSearch(query)) &&
      (period === "all" || monthKey(person.createdAt) === thisMonth),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const refresh = () => startRefresh(() => router.refresh());

  return (
    <div className="fade-in" aria-busy={refreshing}>
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">El corazón de Family Love</p>
          <h1 className="page-title">Nuestra comunidad de voluntarios</h1>
          <p className="page-description">
            Conoce a las personas que quieren dedicar su tiempo a hacer la
            diferencia.
          </p>
        </div>
        <button
          className="button-secondary"
          disabled={refreshing}
          onClick={refresh}
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Solicitudes recibidas",
            value: volunteers.length,
            icon: Users,
            color: "bg-sky-50 text-sky-600",
          },
          {
            label: "Solicitudes de este mes",
            value: monthly.length,
            icon: CalendarDays,
            color: "bg-emerald-50 text-emerald-600",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div className="panel-card flex items-center gap-4 p-5" key={label}>
            <span className={`rounded-xl p-3 ${color}`}>
              <Icon size={22} strokeWidth={1.6} />
            </span>
            <div>
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {error ? "—" : value}
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-5">
          <HeartHandshake
            size={28}
            strokeWidth={1.5}
            className="shrink-0 text-sky-500"
          />
          <p className="text-xs leading-relaxed text-sky-800">
            Una persona con ganas de ayudar puede cambiar muchas vidas.
          </p>
        </div>
      </div>
      <div className="panel-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="section-title">Solicitudes de voluntariado</h2>
            <p className="section-description">
              Recibidas desde el formulario de la web
            </p>
          </div>
          <div className="volunteer-filters">
            <label className="field-search">
              <Search size={16} className="shrink-0" />
              <span className="sr-only">Buscar voluntarios</span>
              <input
                placeholder="Buscar por nombre, correo..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
              {query && (
                <button
                  aria-label="Limpiar búsqueda"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </label>
            <select
              aria-label="Filtrar solicitudes"
              className="filter-select"
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">Todas las fechas</option>
              <option value="month">Este mes</option>
            </select>
          </div>
        </div>
        {error ? (
          <div className="empty-state" role="alert">
            <span className="empty-state-icon">
              <AlertCircle size={27} />
            </span>
            <h3 className="section-title">No pudimos cargar las solicitudes</h3>
            <p className="page-description">{error}</p>
            <button
              className="button-secondary mt-5"
              onClick={refresh}
              disabled={refreshing}
            >
              Volver a intentar
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Users size={28} />
            </span>
            <h3 className="section-title">
              {volunteers.length
                ? "No encontramos resultados"
                : "Aquí empieza una nueva comunidad"}
            </h3>
            <p className="page-description">
              {volunteers.length
                ? "Prueba otro nombre o cambia el filtro de fechas."
                : "Las solicitudes de la web aparecerán aquí para que puedas conocer a cada persona."}
            </p>
            {volunteers.length > 0 && (
              <button
                className="button-secondary mt-4"
                onClick={() => {
                  setQuery("");
                  setPeriod("all");
                  setPage(1);
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <ul
              className="divide-y divide-slate-100 lg:hidden"
              aria-label="Tarjetas de solicitudes de voluntariado"
            >
              {visible.map((person) => (
                <li key={person.id} className="min-w-0 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="avatar !bg-sky-50 !text-sky-600"
                      aria-hidden="true"
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
                      <h3 className="text-base font-bold leading-snug text-slate-800">
                        {person.nombre}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {person.edad} años · {shortDate(person.createdAt)}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-semibold text-slate-500">
                        Correo electrónico
                      </dt>
                      <dd className="mt-1 [overflow-wrap:anywhere] text-slate-700">
                        {person.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-slate-500">
                        Teléfono
                      </dt>
                      <dd className="mt-1 [overflow-wrap:anywhere] text-slate-700">
                        {person.telefono || "No indicado"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-slate-500">
                        Motivación
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere] text-slate-600">
                        {person.motivacion || "Sin mensaje adicional"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                    <a
                      href={`mailto:${person.email}`}
                      className="button-secondary"
                      aria-label={`Enviar correo a ${person.nombre}`}
                    >
                      <Mail size={17} />
                      Correo
                    </a>
                    {person.telefono.replace(/\D/g, "") && (
                      <a
                        href={`https://wa.me/${person.telefono.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-secondary !border-emerald-100 !bg-emerald-50 !text-emerald-700"
                        aria-label={`Abrir WhatsApp de ${person.nombre}`}
                      >
                        <MessageCircle size={17} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Solicitudes de voluntariado, datos de contacto y motivación
                </caption>
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[9px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Voluntario
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold">
                      Contacto
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold">
                      Motivación
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold">
                      Fecha de solicitud
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((person) => (
                    <tr
                      key={person.id}
                      className="transition-colors hover:bg-sky-50/30"
                    >
                      <td className="min-w-[210px] px-5 py-5">
                        <div className="flex items-center gap-3">
                          <span className="avatar !bg-sky-50 !text-sky-600">
                            {person.nombre
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {person.nombre}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {person.edad} años
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <a
                          href={`mailto:${person.email}`}
                          className="text-[11px] text-slate-600 hover:text-sky-600"
                        >
                          {person.email}
                        </a>
                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {person.telefono}
                        </p>
                      </td>
                      <td className="min-w-[190px] max-w-xs px-4 py-5">
                        <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-500">
                          {person.motivacion || "Sin mensaje adicional"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-5 text-[11px] text-slate-500">
                        {shortDate(person.createdAt)}
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex gap-1">
                          <a
                            href={`mailto:${person.email}`}
                            className="icon-button hover:!bg-sky-50 hover:!text-sky-600"
                            aria-label={`Enviar correo a ${person.nombre}`}
                            title="Enviar correo"
                          >
                            <Mail size={16} />
                          </a>
                          {person.telefono.replace(/\D/g, "") && (
                            <a
                              href={`https://wa.me/${person.telefono.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-button hover:!bg-emerald-50 hover:!text-emerald-600"
                              aria-label={`Abrir WhatsApp de ${person.nombre}`}
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-[11px] text-slate-400">
              <p role="status">
                {filtered.length}{" "}
                {filtered.length === 1 ? "solicitud" : "solicitudes"}
              </p>
              <div className="flex items-center gap-3">
                <button
                  className="icon-button"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Página anterior"
                >
                  <ArrowLeft size={14} />
                </button>
                <span>
                  {currentPage} / {pages}
                </span>
                <button
                  className="icon-button"
                  disabled={currentPage === pages}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Página siguiente"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
