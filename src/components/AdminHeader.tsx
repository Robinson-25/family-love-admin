"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Command,
  FolderKanban,
  LayoutDashboard,
  Newspaper,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { normalizeSearch } from "@/lib/dashboard";

const destinations = [
  {
    label: "Resumen del dashboard",
    description: "Métricas y actividad",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Proyectos",
    description: "Gestionar proyectos realizados",
    href: "/proyectos",
    icon: FolderKanban,
  },
  {
    label: "Noticias",
    description: "Gestionar las publicaciones",
    href: "/noticias",
    icon: Newspaper,
  },
  {
    label: "Voluntarios",
    description: "Consultar solicitudes",
    href: "/voluntarios",
    icon: Users,
  },
  {
    label: "Nuevo proyecto",
    description: "Compartir una nueva iniciativa",
    href: "/proyectos/nuevo",
    icon: Plus,
  },
  {
    label: "Nueva noticia",
    description: "Contar una nueva historia",
    href: "/noticias/nuevo",
    icon: Plus,
  },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const section = pathname.startsWith("/proyectos")
    ? "Proyectos"
    : pathname.startsWith("/noticias")
      ? "Noticias"
      : pathname.startsWith("/voluntarios")
        ? "Voluntarios"
        : "Resumen";
  const openSearch = () => {
    setQuery("");
    dialog.current?.showModal();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuery("");
        if (!dialog.current?.open) dialog.current?.showModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  const results = destinations.filter((item) =>
    normalizeSearch(`${item.label} ${item.description}`).includes(
      normalizeSearch(query),
    ),
  );

  return (
    <>
      <header className="admin-header">
        <nav
          aria-label="Ruta actual"
          className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs"
        >
          <Link
            href="/"
            className="hidden text-slate-400 hover:text-sky-600 sm:inline"
          >
            Mi espacio
          </Link>
          <ChevronRight
            size={13}
            className="hidden shrink-0 text-slate-300 sm:block"
          />
          <span className="font-semibold text-slate-700">{section}</span>
          {pathname.includes("/nuevo") && (
            <>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="text-slate-500">Crear</span>
            </>
          )}
          {pathname.includes("/editar") && (
            <>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="text-slate-500">Editar</span>
            </>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={openSearch}
            className="header-search"
            aria-label="Buscar secciones y acciones"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Ir a una sección...</span>
            <kbd className="hidden items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] sm:inline-flex">
              <Command size={10} /> K
            </kbd>
          </button>
          <span className="hidden h-5 w-px bg-slate-200 sm:block" />
          <span className="hidden items-center gap-2 text-[11px] font-medium text-slate-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">Espacio de gestión</span>
          </span>
        </div>
      </header>
      <dialog
        ref={dialog}
        className="search-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        aria-labelledby="search-title"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <Search size={20} className="text-sky-600" />
          <label
            htmlFor="navigation-search"
            id="search-title"
            className="sr-only"
          >
            Buscar secciones y acciones
          </label>
          <input
            id="navigation-search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="¿A dónde quieres ir?"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={() => dialog.current?.close()}
            className="icon-button"
            aria-label="Cerrar búsqueda"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-2">
          {results.map(({ label, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => dialog.current?.close()}
              className="flex items-center gap-3 rounded-xl p-3 hover:bg-sky-50"
            >
              <span className="rounded-lg bg-slate-100 p-2 text-slate-500">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  {label}
                </span>
                <span className="text-xs text-slate-500">{description}</span>
              </span>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>
          ))}
          {results.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-500">
              No encontramos una sección con ese nombre.
            </p>
          )}
        </div>
        <p className="hidden border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400 sm:block">
          Usa Tab para navegar y Enter para abrir. Esc para cerrar.
        </p>
      </dialog>
    </>
  );
}
