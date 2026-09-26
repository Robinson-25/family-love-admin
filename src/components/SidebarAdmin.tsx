"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, FolderKanban, Newspaper, Users, Globe, LogOut } from "lucide-react";
import { SITE_URL } from "@/lib/api";

const links = [
  { href: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/proyectos", label: "Proyectos Realizados", icon: FolderKanban },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/voluntarios", label: "Voluntarios", icon: Users },
];

export default function SidebarAdmin({ nombre, rol }: { nombre: string; rol: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-[#1a3a6b] lg:min-h-screen lg:sticky lg:top-0 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-white font-extrabold text-lg">Panel de Administración</h1>
        <p className="text-white/50 text-xs mt-1">
          {nombre} · {rol === "admin" ? "Administrador" : "Colaborador"}
        </p>
      </div>
      <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
        {links.map((link) => {
          const activo = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                activo ? "bg-white text-[#1a3a6b]" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap text-white/60 hover:bg-white/10 mt-2 lg:mt-4 lg:border-t lg:border-white/10 lg:pt-4"
        >
          <Globe className="w-4 h-4" />
          Ver el sitio web
        </a>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap text-white/60 hover:bg-white/10 text-left"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}
