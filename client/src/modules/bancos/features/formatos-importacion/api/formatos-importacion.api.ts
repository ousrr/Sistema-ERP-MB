import type {
  CrearFormatoImportacion,
  CrearMapeoFormato,
  FormatoImportacion,
  MapeoFormato,
  EstadoFormato,
} from "../types/formatos-importacion.types";

const API_BASE =
  "/api/v1/bancos/formatos-importacion";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export async function listarFormatos(): Promise<FormatoImportacion[]> {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    throw new Error("No se pudieron cargar los formatos.");
  }

  const result: ApiResponse<FormatoImportacion[]> =
    await response.json();

  return result.data;
}

export async function listarFormatosActivosPorBanco(
  bancoId: number
): Promise<FormatoImportacion[]> {
  const response = await fetch(
    `${API_BASE}/activos?bancoId=${bancoId}`
  );

  if (!response.ok) {
    throw new Error(
      "No se pudieron cargar los formatos activos del banco."
    );
  }

  const result: ApiResponse<FormatoImportacion[]> =
    await response.json();

  return result.data;
}

export async function obtenerFormato(
  formatoId: number
): Promise<FormatoImportacion> {
  const response = await fetch(`${API_BASE}/${formatoId}`);

  if (!response.ok) {
    throw new Error("No se pudo obtener el formato.");
  }

  const result: ApiResponse<FormatoImportacion> =
    await response.json();

  return result.data;
}

export async function crearFormato(
  input: CrearFormatoImportacion
): Promise<FormatoImportacion> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ?? "No se pudo crear el formato."
    );
  }

  const result: ApiResponse<FormatoImportacion> =
    await response.json();

  return result.data;
}

export async function actualizarFormato(
  formatoId: number,
  input: CrearFormatoImportacion
): Promise<FormatoImportacion> {
  const response = await fetch(
    `${API_BASE}/${formatoId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ?? "No se pudo actualizar el formato."
    );
  }

  const result: ApiResponse<FormatoImportacion> =
    await response.json();

  return result.data;
}

export async function cambiarEstadoFormato(
  formatoId: number,
  estado: EstadoFormato
): Promise<FormatoImportacion> {
  const response = await fetch(
    `${API_BASE}/${formatoId}/estado`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado }),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ?? "No se pudo cambiar el estado."
    );
  }

  const result: ApiResponse<FormatoImportacion> =
    await response.json();

  return result.data;
}

export async function listarMapeos(
  formatoId: number
): Promise<MapeoFormato[]> {
  const response = await fetch(
    `${API_BASE}/${formatoId}/mapeos`
  );

  if (!response.ok) {
    throw new Error(
      "No se pudieron cargar los mapeos."
    );
  }

  const result: ApiResponse<MapeoFormato[]> =
    await response.json();

  return result.data;
}

export async function crearMapeo(
  formatoId: number,
  input: CrearMapeoFormato
): Promise<number> {
  const response = await fetch(
    `${API_BASE}/${formatoId}/mapeos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ?? "No se pudo crear el mapeo."
    );
  }

  const result: ApiResponse<{ mapeoId: number }> =
    await response.json();

  return result.data.mapeoId;
}

export async function actualizarMapeo(
  mapeoId: number,
  input: CrearMapeoFormato
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/mapeos/${mapeoId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ?? "No se pudo actualizar el mapeo."
    );
  }
}

export async function eliminarMapeo(
  mapeoId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/mapeos/${mapeoId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ?? "No se pudo eliminar el mapeo."
    );
  }
}