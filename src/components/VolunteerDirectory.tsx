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

  // Estilos repetidos (mismo aspecto que el Inicio del panel)
  const tarjeta =
    "overflow-hidden rounded-2xl bg-[#f3f8fd] shadow-[0_10px_24px_-14px_rgba(10,30,70,0.6)]";
  const botonAzul =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] px-4 text-sm font-bold text-white transition-colors hover:bg-[#2251a3] disabled:opacity-60";
  const botonCorreo =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#2251a3]/30 bg-white px-3 text-[13px] font-bold text-[#1a3a6b] transition-colors hover:bg-[#1a3a6b] hover:text-white";
  const botonWhatsApp =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 text-[13px] font-bold text-emerald-800 transition-colors hover:bg-emerald-600 hover:text-white";
  const botonPagina =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-[#1a3a6b] transition-colors hover:bg-[#1a3a6b] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#1a3a6b]";

  const iniciales = (nombre: string) =>
    nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  // Enlace de WhatsApp: a los celulares de 9 dígitos se les agrega el código de Perú (51)
  const whatsapp = (telefono: string) => {
    const digitos = telefono.replace(/\D/g, "");
    if (!digitos) return null;
    return `https://wa.me/${digitos.length === 9 ? `51${digitos}` : digitos}`;
  };
  const avatar =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0f9aa8]/15 text-sm font-bold text-[#0b5f68]";

  return (
    <div
      className="-m-4 min-h-screen bg-gradient-to-b from-[#2f67b3] to-[#4a8fd0] p-4 font-medium text-slate-700 lining-nums md:-m-8 md:p-8"
      aria-busy={refreshing}
    >
      {/* ── Título ── */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Voluntarios
          </h1>
          <p className="mt-1 text-sm font-semibold text-white/90">
            Personas que enviaron su solicitud desde la página web
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#1a3a6b] shadow-sm transition-colors hover:bg-[#73eafe] disabled:opacity-60 sm:w-auto"
          disabled={refreshing}
          onClick={refresh}
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* ── Números ── */}
      <dl className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 xl:max-w-2xl">
        {[
          {
            label: "Solicitudes recibidas",
            value: volunteers.length,
            icon: Users,
            color: "#2251a3",
          },
          {
            label: "Solicitudes de este mes",
            value: monthly.length,
            icon: CalendarDays,
            color: "#0f9aa8",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            style={{ borderTopColor: color }}
            className={`${tarjeta} border-t-4 p-4 sm:p-5`}
          >
            <dt className="flex items-center gap-2.5 text-[13px] font-bold text-slate-700">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: color }}
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0 leading-tight">{label}</span>
            </dt>
            <dd className="mt-3 text-3xl font-extrabold text-[#12284c] sm:text-4xl">
              {error ? "—" : value}
            </dd>
          </div>
        ))}
      </dl>

      {/* ── Lista de solicitudes ── */}
      <section className={tarjeta}>
        <div className="flex min-h-12 items-center bg-[#1a3a6b] px-5 py-2.5">
          <h2 className="text-[15px] font-bold text-white">
            Solicitudes de voluntariado
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 sm:p-5">
          <label className="flex min-h-11 min-w-0 flex-1 basis-full items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 text-slate-500 focus-within:border-[#2251a3] sm:basis-60">
            <Search size={18} className="shrink-0" />
            <span className="sr-only">Buscar voluntarios</span>
            <input
              placeholder="Buscar por nombre, correo o teléfono..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="w-full min-w-0 bg-transparent text-base font-semibold text-[#12284c] outline-none placeholder:font-medium placeholder:text-slate-500 sm:text-sm"
            />
            {query && (
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100"
                aria-label="Limpiar búsqueda"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
              >
                <X size={16} />
              </button>
            )}
          </label>
          <select
            aria-label="Filtrar solicitudes"
            className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-[#2251a3] focus:outline-none sm:flex-none"
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

        {error ? (
          <div className="flex flex-col items-center px-5 py-12 text-center" role="alert">
            <span className="mb-4 rounded-2xl bg-amber-100 p-4 text-amber-700">
              <AlertCircle size={28} />
            </span>
            <h3 className="text-lg font-bold text-[#12284c]">
              No se pudieron cargar las solicitudes
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">{error}</p>
            <button
              type="button"
              className={`${botonAzul} mt-5`}
              onClick={refresh}
              disabled={refreshing}
            >
              Volver a intentar
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <span className="mb-4 rounded-2xl bg-[#2251a3]/10 p-4 text-[#2251a3]">
              <HeartHandshake size={30} />
            </span>
            <h3 className="text-lg font-bold text-[#12284c]">
              {volunteers.length
                ? "No se encontraron resultados"
                : "Aún no hay solicitudes"}
            </h3>
            <p className="mt-2 max-w-md text-sm font-semibold text-slate-600">
              {volunteers.length
                ? "Prueba otro nombre o cambia el filtro de fechas."
                : "Cuando alguien llene el formulario de voluntariado en la web, aparecerá aquí."}
            </p>
            {volunteers.length > 0 && (
              <button
                type="button"
                className={`${botonAzul} mt-5`}
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
            {/* Celular y tablet: una tarjeta por persona */}
            <ul
              className="grid gap-px bg-slate-200 md:grid-cols-2 xl:hidden"
              aria-label="Solicitudes de voluntariado"
            >
              {visible.map((person) => (
                <li key={person.id} className="flex min-w-0 flex-col bg-[#f3f8fd] p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <span className={avatar} aria-hidden="true">
                      {iniciales(person.nombre)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold leading-snug text-[#12284c] [overflow-wrap:anywhere]">
                        {person.nombre}
                      </h3>
                      <p className="mt-0.5 text-[13px] font-semibold text-slate-600">
                        {person.edad} años, {shortDate(person.createdAt)}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-bold text-slate-600">Correo</dt>
                      <dd className="mt-0.5 font-semibold text-[#12284c] [overflow-wrap:anywhere]">
                        {person.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold text-slate-600">Teléfono</dt>
                      <dd className="mt-0.5 font-semibold text-[#12284c]">
                        {person.telefono || "No indicado"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold text-slate-600">Motivación</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                        {person.motivacion || "Sin mensaje"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <a
                      href={`mailto:${person.email}`}
                      className={`${botonCorreo} flex-1`}
                    >
                      <Mail size={16} />
                      Correo
                    </a>
                    {whatsapp(person.telefono) && (
                      <a
                        href={whatsapp(person.telefono)!}
                        target="_blank"
                        rel="noreferrer"
                        className={`${botonWhatsApp} flex-1`}
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Computadora: tabla */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Solicitudes de voluntariado, datos de contacto y motivación
                </caption>
                <thead className="bg-[#2251a3]/10 text-[13px] text-[#1a3a6b]">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-bold">Persona</th>
                    <th scope="col" className="px-4 py-3 font-bold">Contacto</th>
                    <th scope="col" className="px-4 py-3 font-bold">Motivación</th>
                    <th scope="col" className="px-4 py-3 font-bold">Fecha</th>
                    <th scope="col" className="px-5 py-3 font-bold">Escribirle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visible.map((person) => (
                    <tr key={person.id} className="align-top transition-colors hover:bg-white">
                      <td className="min-w-[200px] px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={avatar} aria-hidden="true">
                            {iniciales(person.nombre)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-[#12284c]">{person.nombre}</p>
                            <p className="mt-0.5 text-[13px] font-semibold text-slate-600">
                              {person.edad} años
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#12284c] [overflow-wrap:anywhere]">
                          {person.email}
                        </p>
                        <p className="mt-0.5 text-[13px] font-semibold text-slate-600">
                          {person.telefono || "Sin teléfono"}
                        </p>
                      </td>
                      <td className="min-w-[220px] max-w-md px-4 py-4">
                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                          {person.motivacion || "Sin mensaje"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[13px] font-semibold text-slate-700">
                        {shortDate(person.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <a href={`mailto:${person.email}`} className={botonCorreo}>
                            <Mail size={16} />
                            Correo
                          </a>
                          {whatsapp(person.telefono) && (
                            <a
                              href={whatsapp(person.telefono)!}
                              target="_blank"
                              rel="noreferrer"
                              className={botonWhatsApp}
                            >
                              <MessageCircle size={16} />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700 sm:justify-between">
              <p role="status" className="w-full text-center sm:w-auto sm:text-left">
                {filtered.length}{" "}
                {filtered.length === 1 ? "solicitud" : "solicitudes"}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={botonPagina}
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Página anterior"
                >
                  <ArrowLeft size={17} />
                </button>
                <span>
                  Página {currentPage} de {pages}
                </span>
                <button
                  type="button"
                  className={botonPagina}
                  disabled={currentPage === pages}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Página siguiente"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
