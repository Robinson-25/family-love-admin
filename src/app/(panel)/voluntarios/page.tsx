import { apiFetch } from "@/lib/api";
import { requireStaffSession } from "@/lib/session";

type Voluntario = {
  id: number;
  nombre: string;
  edad: number;
  email: string;
  telefono: string;
  motivacion: string | null;
  createdAt: string;
};

export const dynamic = "force-dynamic";

export default async function VoluntariosPage() {
  const session = await requireStaffSession();
  const { ok, data } = await apiFetch<{ voluntarios: Voluntario[] }>("/voluntarios", {
    token: session.accessToken,
  });
  const voluntarios = data.voluntarios ?? [];

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-gray-900">Voluntarios</h2>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Personas que llenaron el formulario de voluntariado en la web.
      </p>

      {!ok ? (
        <div className="bg-red-50 text-red-600 rounded-2xl p-6">
          {data.error || "No se pudieron cargar los voluntarios"}
        </div>
      ) : voluntarios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          Todavía no hay solicitudes de voluntariado.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-bold">Nombre</th>
                <th className="px-4 py-3 font-bold">Edad</th>
                <th className="px-4 py-3 font-bold">Correo</th>
                <th className="px-4 py-3 font-bold">Teléfono</th>
                <th className="px-4 py-3 font-bold">Motivación</th>
                <th className="px-4 py-3 font-bold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {voluntarios.map((v) => (
                <tr key={v.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 font-semibold text-gray-900">{v.nombre}</td>
                  <td className="px-4 py-3">{v.edad}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${v.email}`} className="text-[#2251a3] hover:underline">
                      {v.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://wa.me/${v.telefono.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2251a3] hover:underline"
                    >
                      {v.telefono}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">{v.motivacion || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(v.createdAt).toLocaleDateString("es-PE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
