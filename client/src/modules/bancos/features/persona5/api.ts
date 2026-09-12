import type { Catalogs, Row } from "./types";

const base = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_API_URL ?? "";
async function request<T>(key: string, path = "", method = "GET", data?: Row, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(base + "/api/v1/bancos/" + key + path, {
      method, signal, headers: { "Content-Type": "application/json" },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("No se pudo conectar con la API. Compruebe que el servidor esté iniciado.");
  }
  let body: { ok: boolean; message?: string; data: T };
  try { body = await response.json(); }
  catch { throw new Error("La API no devolvió una respuesta JSON válida."); }
  if (!response.ok || !body.ok) throw new Error(body.message ?? "No se pudo completar la operación.");
  return body.data;
}
export const configApi = (key: string) => ({
  list: (signal?: AbortSignal) => request<Row[]>(key, "", "GET", undefined, signal),
  catalogs: (signal?: AbortSignal) => request<Catalogs>(key, "/catalogos", "GET", undefined, signal),
  save: (data: Row, id?: string) => request<Row>(key, id ? "/" + encodeURIComponent(id) : "", id ? "PUT" : "POST", data),
  state: (id: string, estado: string) => request<Row>(key, "/" + encodeURIComponent(id) + "/estado", "PATCH", { estado }),
  resolve: (data: Row) => request<Row | null>(key, "/resolver", "POST", data),
});

