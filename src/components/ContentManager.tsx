"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FolderKanban,
  LayoutGrid,
  List,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";
import { ContentItem, normalizeSearch, sortRecent } from "@/lib/dashboard";
import ContentThumbnail from "@/components/ContentThumbnail";

export default function ContentManager({
  type,
}: {
  type: "proyectos" | "noticias";
}) {
  const isProject = type === "proyectos";
  const singular = isProject ? "proyecto" : "noticia";
  const Icon = isProject ? FolderKanban : Newspaper;
  const { data: session } = useSession();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("todos");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      const result = await apiFetch<
        Partial<Record<"proyectos" | "noticias", ContentItem[]>>
      >(`/${type}`, { signal: signal ?? AbortSignal.timeout(10000) });
      if (signal?.aborted) return;
      if (result.ok) setItems(result.data[type] ?? []);
      else
        setError(
          result.data.error ||
            `No se pudieron cargar ${isProject ? "los proyectos" : "las noticias"}.`,
        );
      setLoading(false);
    },
    [type, isProject],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
      setLoading(false);
      setError("La solicitud está tardando demasiado. Vuelve a intentarlo.");
    }, 10000);
    void load(controller.signal).finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [load]);

  const remove = async (item: ContentItem) => {
    const confirmation = await Swal.fire({
      title: `¿Eliminar ${singular}?`,
      text: `Se eliminará "${item.titulo}" de la página web. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });
    if (!confirmation.isConfirmed) return;
    setDeleting(item.id);
    try {
      const result = await apiFetch(`/${type}/${item.id}`, {
        method: "DELETE",
        token: session?.accessToken,
      });
      if (!result.ok) {
        toast.error(
          result.data.error ||
            `No se pudo eliminar ${isProject ? "el proyecto" : "la noticia"}`,
        );
        return;
      }
      setItems((previous) => previous.filter((entry) => entry.id !== item.id));
      toast.success(isProject ? "Proyecto eliminado" : "Noticia eliminada");
    } finally {
      setDeleting(null);
    }
  };

  const years = Array.from(
    new Set(
      items
        .map((item) => item.anio)
        .filter((value): value is number => typeof value === "number"),
    ),
  ).sort((a, b) => b - a);
  const filtered = items.filter(
    (item) =>
      normalizeSearch(
        `${item.titulo} ${item.etiqueta || ""} ${item.resumen || ""}`,
      ).includes(normalizeSearch(query)) &&
      (year === "todos" || String(item.anio) === year),
  );
  const sorted =
    sort === "title"
      ? [...filtered].sort((a, b) => a.titulo.localeCompare(b.titulo, "es"))
      : sortRecent(filtered);
  if (sort === "oldest") sorted.reverse();
  const totalPages = Math.max(1, Math.ceil(sorted.length / 9));
  const currentPage = Math.min(page, totalPages);
  const visible = sorted.slice((currentPage - 1) * 9, currentPage * 9);

  // Estilos repetidos (mismo aspecto que el Inicio del panel)
  const tarjeta =
    "overflow-hidden rounded-2xl bg-[#f3f8fd] shadow-[0_10px_24px_-14px_rgba(10,30,70,0.6)]";
  const botonClaro =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#1a3a6b] shadow-sm transition-colors hover:bg-[#73eafe]";
  const botonAzul =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] px-4 text-sm font-bold text-white transition-colors hover:bg-[#2251a3]";
  const selector =
    "min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-[#2251a3] focus:outline-none";
  const botonVista = (activo: boolean) =>
    `inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
      activo ? "bg-[#1a3a6b] text-white" : "text-slate-600 hover:bg-slate-200"
    }`;
  const botonPagina =
    "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1a3a6b] transition-colors hover:bg-[#73eafe] disabled:opacity-50 disabled:hover:bg-white";

  return (
    <div className="-m-4 min-h-screen bg-gradient-to-b from-[#2f67b3] to-[#4a8fd0] p-4 font-medium text-slate-700 lining-nums md:-m-8 md:p-8">
      {/* ── Título y botón principal ── */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            {isProject ? "Proyectos realizados" : "Noticias"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/90">
            <Icon size={17} className="shrink-0" />
            {loading || error
              ? "Cargando…"
              : `${items.length.toLocaleString("es-PE")} ${
                  isProject
                    ? items.length === 1
                      ? "proyecto publicado"
                      : "proyectos publicados"
                    : items.length === 1
                      ? "noticia publicada"
                      : "noticias publicadas"
                }`}
          </p>
        </div>
        <Link href={`/${type}/nuevo`} className={`${botonClaro} w-full sm:w-auto`}>
          <Plus size={17} />
          {isProject ? "Nuevo proyecto" : "Nueva noticia"}
        </Link>
      </div>

      {/* ── Buscador y filtros ── */}
      <div className={`${tarjeta} mb-5 flex flex-wrap items-center gap-3 p-3 sm:mb-6 sm:p-4`}>
        <label className="flex min-h-11 min-w-0 flex-1 basis-full items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 text-slate-500 focus-within:border-[#2251a3] sm:basis-60">
          <Search size={18} className="shrink-0" />
          <span className="sr-only">Buscar {type}</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={`Buscar ${type}...`}
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
        {isProject && (
          <select
            aria-label="Filtrar por año"
            className={`${selector} flex-1 sm:flex-none`}
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setPage(1);
            }}
          >
            <option value="todos">Todos los años</option>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        )}
        <select
          aria-label="Ordenar publicaciones"
          className={`${selector} flex-1 sm:flex-none`}
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            setPage(1);
          }}
        >
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguas</option>
          <option value="title">Título: A a Z</option>
        </select>
        <div
          className="flex gap-1 rounded-xl border border-slate-300 bg-white p-1"
          role="group"
          aria-label="Vista de publicaciones"
        >
          <button
            type="button"
            onClick={() => setView("grid")}
            className={botonVista(view === "grid")}
            aria-label="Vista de tarjetas"
            aria-pressed={view === "grid"}
          >
            <LayoutGrid size={17} />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={botonVista(view === "list")}
            aria-label="Vista de lista"
            aria-pressed={view === "list"}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="status">
          <span className="sr-only">Cargando {type}...</span>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className={`${tarjeta} h-80 motion-safe:animate-pulse`}>
              <div className="h-44 bg-slate-300/60" />
              <div className="m-5 h-4 w-3/4 rounded bg-slate-300/60" />
              <div className="m-5 h-3 w-1/2 rounded bg-slate-300/60" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          className={`${tarjeta} flex flex-col items-center px-5 py-12 text-center`}
          role="alert"
        >
          <span className="mb-4 rounded-2xl bg-amber-100 p-4 text-amber-700">
            <AlertCircle size={28} />
          </span>
          <h2 className="text-lg font-bold text-[#12284c]">
            No se pudo cargar el contenido
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">{error}</p>
          <button type="button" className={`${botonAzul} mt-5`} onClick={() => void load()}>
            <RefreshCw size={16} />
            Volver a intentar
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className={`${tarjeta} flex flex-col items-center px-5 py-12 text-center`}>
          <span className="mb-4 rounded-2xl bg-[#2251a3]/10 p-4 text-[#2251a3]">
            <Icon size={30} />
          </span>
          <h2 className="text-lg font-bold text-[#12284c]">
            {items.length === 0
              ? isProject
                ? "Aún no hay proyectos"
                : "Aún no hay noticias"
              : "No se encontraron resultados"}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {items.length === 0
              ? `Publica ${isProject ? "el primer proyecto" : "la primera noticia"} de Family Love.`
              : "Prueba con otra búsqueda o cambia los filtros."}
          </p>
          {items.length === 0 ? (
            <Link href={`/${type}/nuevo`} className={`${botonAzul} mt-5`}>
              <Plus size={16} />
              {isProject ? "Nuevo proyecto" : "Nueva noticia"}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setYear("todos");
                setPage(1);
              }}
              className={`${botonAzul} mt-5`}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            className={
              view === "grid"
                ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                : "space-y-4"
            }
          >
            {visible.map((item) => (
              <article
                key={item.id}
                className={`content-card ${tarjeta} ${view === "list" ? "flex flex-col sm:flex-row" : "flex flex-col"}`}
              >
                <Link
                  href={`/${type}/${item.id}/editar`}
                  className={`relative block overflow-hidden ${view === "list" ? "sm:w-52 sm:shrink-0" : ""}`}
                  aria-label={`Editar ${item.titulo}`}
                >
                  <ContentThumbnail
                    src={item.imagen}
                    title=""
                    className={`w-full ${view === "list" ? "h-44 sm:h-full sm:min-h-[176px]" : "h-48"}`}
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw"
                  />
                  {item.anio && (
                    <span className="absolute left-3 top-3 rounded-lg bg-[#1a3a6b] px-2.5 py-1 text-xs font-bold text-white shadow">
                      {item.anio}
                    </span>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <CalendarDays size={14} />
                      {item.fecha}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Publicado
                    </span>
                  </div>
                  <Link href={`/${type}/${item.id}/editar`} className="group">
                    <h2 className="line-clamp-2 text-base font-bold leading-snug text-[#12284c] group-hover:text-[#2251a3]">
                      {item.titulo}
                    </h2>
                  </Link>
                  {item.resumen && (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-600">
                      {item.resumen}
                    </p>
                  )}
                  {item.etiqueta && (
                    <span className="mt-3 self-start rounded-lg bg-[#2251a3]/10 px-2.5 py-1 text-xs font-bold text-[#1a3a6b]">
                      {item.etiqueta}
                    </span>
                  )}
                  <div className="mt-auto flex items-center gap-2 pt-5">
                    <Link
                      href={`/${type}/${item.id}/editar`}
                      className={`${botonAzul} flex-1 ${view === "list" ? "sm:flex-none" : ""}`}
                    >
                      <Pencil size={15} />
                      Editar {singular}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void remove(item)}
                      disabled={deleting !== null}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                      aria-label={`Eliminar ${item.titulo}`}
                      title={`Eliminar ${singular}`}
                    >
                      {deleting === item.id ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-white sm:justify-between">
            <p role="status" className="w-full text-center sm:w-auto sm:text-left">
              Mostrando {(currentPage - 1) * 9 + 1}–
              {Math.min(currentPage * 9, sorted.length)} de {sorted.length}{" "}
              {type}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={botonPagina}
                aria-label="Página anterior"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ArrowLeft size={17} />
              </button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                className={botonPagina}
                aria-label="Página siguiente"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
