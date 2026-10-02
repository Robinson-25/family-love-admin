import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  Lightbulb,
  Send,
} from "lucide-react";

export default function EditorLayout({
  type,
  editing = false,
  children,
}: {
  type: "proyectos" | "noticias";
  editing?: boolean;
  children: React.ReactNode;
}) {
  const project = type === "proyectos";
  return (
    <div className="fade-in">
      <Link
        href={`/${type}`}
        className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-sky-600"
      >
        <ArrowLeft size={14} />
        Volver a {type}
      </Link>
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Comparte lo que nos mueve</p>
          <h1 className="page-title">
            {editing ? "Editar" : project ? "Nuevo" : "Nueva"}{" "}
            {project ? "proyecto" : "noticia"}
          </h1>
          <p className="page-description">
            {editing
              ? "Actualiza esta historia y guarda los cambios para que se reflejen en la web."
              : "Cuenta la historia, añade una imagen y compártela con nuestra comunidad."}
          </p>
        </div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_250px]">
        <div className="min-w-0">{children}</div>
        <aside className="space-y-5 xl:sticky xl:top-6">
          <div className="panel-card p-5">
            <span className="mb-4 inline-flex rounded-xl bg-amber-50 p-2.5 text-amber-500">
              <Lightbulb size={20} />
            </span>
            <h2 className="section-title">Una historia que conecta</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Los pequeños detalles hacen que nuestra comunidad se sienta parte
              de cada iniciativa.
            </p>
            <ul className="mt-5 space-y-4 text-[11px] leading-relaxed text-slate-500">
              <li className="flex gap-2.5">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-sky-500"
                  size={16}
                />
                Elige un título claro que transmita lo más importante.
              </li>
              <li className="flex gap-2.5">
                <ImageIcon className="mt-0.5 shrink-0 text-sky-500" size={16} />
                Usa una fotografía que cuente la historia por sí misma.
              </li>
              <li className="flex gap-2.5">
                <Send className="mt-0.5 shrink-0 text-sky-500" size={16} />
                Revisa el texto y la fecha antes de publicar.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
            <p className="text-xs font-bold text-sky-800">
              De tu espacio a nuestra web
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-sky-700/80">
              Al {editing ? "guardar los cambios" : "publicar"}, el contenido se
              actualizará automáticamente en el sitio de Family Love.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
