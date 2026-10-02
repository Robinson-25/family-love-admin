"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowUpRight,
  ChevronRight,
  FolderKanban,
  Globe,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SITE_URL } from "@/lib/api";

const links = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/voluntarios", label: "Voluntarios", icon: Users },
];

export default function SidebarAdmin({
  nombre,
  rol,
}: {
  nombre: string;
  rol: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    menu.current?.close();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) menu.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const navigation = (
    <>
      <p className="sidebar-label">Espacio de trabajo</p>
      <nav aria-label="Navegación principal" className="space-y-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => menu.current?.close()}
              aria-current={active ? "page" : undefined}
              className={`sidebar-link ${active ? "is-active" : ""}`}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={15} />}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 border-t border-slate-100 pt-6">
        <p className="sidebar-label">Family Love en línea</p>
        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className="sidebar-link"
        >
          <Globe size={19} strokeWidth={1.8} />
          <span className="flex-1">Visitar sitio web</span>
          <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="sidebar-mission">
        <span className="inline-flex rounded-xl bg-white p-2.5 text-sky-600 shadow-sm">
          <Heart size={20} />
        </span>
        <p className="mt-3 text-sm font-bold text-slate-800">
          Juntos hacemos más.
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          Cada historia que compartes inspira a alguien a ayudar.
        </p>
        <Link
          href="/noticias/nuevo"
          onClick={() => menu.current?.close()}
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-sky-700"
        >
          Comparte una historia <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="sidebar-profile">
        <span className="avatar">
          {(nombre || "FL").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-800">
            {nombre || "Equipo Family Love"}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {rol === "admin" ? "Administrador" : "Colaborador"}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="icon-button"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={17} />
        </button>
      </div>
    </>
  );

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <Link
          href="/"
          aria-label="Family Love, ir al resumen"
          className="flex items-center gap-3"
        >
          <Image
            src="/logo-family-love.png"
            alt=""
            width={52}
            height={52}
            priority
            className="object-contain"
          />
          <span>
            <strong className="block text-[17px] tracking-tight text-slate-900">
              Family Love<span className="text-sky-500">.</span>
            </strong>
            <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">
              Panel de gestión
            </span>
          </span>
        </Link>
        <button
          className="icon-button lg:hidden"
          onClick={() => {
            menu.current?.showModal();
            setOpen(true);
          }}
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <Menu size={20} />
        </button>
      </div>
      <div className="sidebar-body hidden lg:flex">{navigation}</div>
      <dialog
        ref={menu}
        id="mobile-navigation"
        className="mobile-menu"
        aria-labelledby="mobile-menu-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) menu.current?.close();
        }}
      >
        <div>
          <div className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2">
            <h2
              id="mobile-menu-title"
              className="text-base font-bold text-slate-800"
            >
              Tu espacio de trabajo
            </h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Cerrar menú"
              onClick={() => menu.current?.close()}
            >
              <X size={21} />
            </button>
          </div>
          <div className="sidebar-body flex">{navigation}</div>
        </div>
      </dialog>
    </aside>
  );
}
