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

  return (
    <div className="fade-in">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">
            {isProject ? "Acciones que transforman" : "Historias que inspiran"}
          </p>
          <h1 className="page-title">
            {isProject ? "Nuestros proyectos" : "Noticias e historias"}
          </h1>
          <p className="page-description">
            {isProject
              ? "Cada iniciativa cuenta. Organiza y comparte el impacto de Family Love."
              : "Dale voz a nuestra comunidad y mantén al día a quienes nos acompañan."}
          </p>
        </div>
        <Link href={`/${type}/nuevo`} className="button-primary">
          <Plus size={16} />
          {isProject ? "Nuevo proyecto" : "Nueva noticia"}
        </Link>
      </div>

      <div className="panel-card mb-6 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-xl p-3 ${isProject ? "bg-sky-50 text-sky-600" : "bg-violet-50 text-violet-500"}`}
          >
            <Icon size={22} strokeWidth={1.6} />
          </span>
          <div>
            <p className="text-xs text-slate-500">
              {isProject ? "Proyectos publicados" : "Noticias publicadas"}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
              {loading || error ? "—" : items.length.toLocaleString("es-PE")}
            </p>
          </div>
        </div>
        <p className="max-w-xs text-xs leading-relaxed text-slate-400">
          {isProject
            ? "Detrás de cada proyecto hay personas, esfuerzo y una historia que merece ser contada."
            : "Una historia compartida puede ser el primer paso para que alguien se una a nuestra misión."}
        </p>
      </div>

      <div className="content-toolbar mb-5">
        <label className="field-search">
          <Search size={17} className="shrink-0" />
          <span className="sr-only">Buscar {type}</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={`Buscar ${type}...`}
          />
          {query && (
            <button
              className="shrink-0"
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
        {isProject && (
          <select
            aria-label="Filtrar por año"
            className="filter-select"
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
          className="filter-select"
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
          className="flex rounded-xl border border-slate-200 bg-white p-1"
          role="group"
          aria-label="Vista de publicaciones"
        >
          <button
            onClick={() => setView("grid")}
            className={`icon-button !h-8 !w-8 ${view === "grid" ? "!bg-sky-50 !text-sky-600" : ""}`}
            aria-label="Vista de tarjetas"
            aria-pressed={view === "grid"}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`icon-button !h-8 !w-8 ${view === "list" ? "!bg-sky-50 !text-sky-600" : ""}`}
            aria-label="Vista de lista"
            aria-pressed={view === "list"}
          >
            <List size={17} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="status">
          <span className="sr-only">Cargando {type}...</span>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="panel-card h-80 motion-safe:animate-pulse"
            >
              <div className="h-44 bg-slate-200/70" />
              <div className="m-5 h-4 w-3/4 rounded bg-slate-100" />
              <div className="m-5 h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="panel-card empty-state" role="alert">
          <span className="empty-state-icon">
            <AlertCircle size={28} />
          </span>
          <h2 className="section-title">No pudimos cargar el contenido</h2>
          <p className="page-description">{error}</p>
          <button className="button-secondary mt-5" onClick={() => void load()}>
            <RefreshCw size={15} />
            Volver a intentar
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="panel-card empty-state">
          <span className="empty-state-icon">
            <Icon size={30} />
          </span>
          <h2 className="section-title">
            {items.length === 0
              ? "Todo empieza con una historia"
              : "No encontramos resultados"}
          </h2>
          <p className="page-description">
            {items.length === 0
              ? `Comparte ${isProject ? "el primer proyecto" : "la primera noticia"} de Family Love.`
              : "Prueba con otra búsqueda o cambia los filtros."}
          </p>
          {items.length === 0 ? (
            <Link href={`/${type}/nuevo`} className="button-primary mt-5">
              <Plus size={15} />
              {isProject ? "Crear proyecto" : "Crear noticia"}
            </Link>
          ) : (
            <button
              onClick={() => {
                setQuery("");
                setYear("todos");
                setPage(1);
              }}
              className="button-secondary mt-5"
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
                : "space-y-3"
            }
          >
            {visible.map((item) => (
              <article
                key={item.id}
                className={`content-card panel-card ${view === "list" ? "flex flex-col sm:flex-row" : "flex flex-col"}`}
              >
                <Link
                  href={`/${type}/${item.id}/editar`}
                  className={`relative block overflow-hidden ${view === "list" ? "sm:w-44 sm:shrink-0" : ""}`}
                  aria-label={`Editar ${item.titulo}`}
                >
                  <ContentThumbnail
                    src={item.imagen}
                    title=""
                    className={`w-full ${view === "list" ? "h-40 sm:h-full sm:min-h-[176px]" : "h-44"}`}
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw"
                  />
                  {item.anio && (
                    <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm">
                      {item.anio}
                    </span>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
                      <CalendarDays size={12} />
                      {item.fecha}
                    </span>
                    <span className="status-badge">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      Publicado
                    </span>
                  </div>
                  <Link
                    href={`/${type}/${item.id}/editar`}
                    className="hover:text-sky-700"
                  >
                    <h2 className="line-clamp-2 text-sm font-bold leading-relaxed text-slate-800">
                      {item.titulo}
                    </h2>
                  </Link>
                  {item.resumen && (
                    <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                      {item.resumen}
                    </p>
                  )}
                  {item.etiqueta && (
                    <span className="mt-3 self-start rounded-md bg-sky-50 px-2 py-1 text-[9px] font-semibold text-sky-700">
                      {item.etiqueta}
                    </span>
                  )}
                  <div className="mt-auto flex items-center gap-2 pt-5">
                    <Link
                      href={`/${type}/${item.id}/editar`}
                      className="button-secondary flex-1 !min-h-9 !rounded-lg !py-2 !text-[11px]"
                    >
                      <Pencil size={13} />
                      Editar {singular}
                    </Link>
                    <button
                      onClick={() => void remove(item)}
                      disabled={deleting !== null}
                      className="icon-button !text-slate-400 hover:!bg-red-50 hover:!text-red-600"
                      aria-label={`Eliminar ${item.titulo}`}
                      title={`Eliminar ${singular}`}
                    >
                      {deleting === item.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="pagination mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <p role="status">
              Mostrando {(currentPage - 1) * 9 + 1}–
              {Math.min(currentPage * 9, sorted.length)} de {sorted.length}{" "}
              {type}
            </p>
            <div className="flex items-center gap-3">
              <button
                className="icon-button border border-slate-200 bg-white"
                aria-label="Página anterior"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ArrowLeft size={14} />
              </button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="icon-button border border-slate-200 bg-white"
                aria-label="Página siguiente"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
