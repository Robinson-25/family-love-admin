// Cliente para hablar con el backend Express.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(
  /\/$/,
  ""
);
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Options = Omit<RequestInit, "body"> & {
  token?: string;
  body?: unknown;
};

export type ApiResult<T> = { ok: boolean; status: number; data: T & { error?: string } };

// Hace la petición y agrega "Authorization: Bearer <token>" automáticamente.
// Nunca lanza excepción: revisa `ok` y `data.error`.
export async function apiFetch<T = any>(path: string, opts: Options = {}): Promise<ApiResult<T>> {
  const { token, body, headers, ...rest } = opts;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  try {
    const res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      ...rest,
      headers: {
        ...(isForm || body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "No se pudo conectar con el servidor" } as T & { error?: string },
    };
  }
}
