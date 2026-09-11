import type {
  ActualizarChequeraInput,
  ApiErrorResponse,
  ApiResponse,
  CambiarEstadoChequeraInput,
  Chequera,
  CrearChequeraInput,
} from "../types/chequera.types";

const CHEQUERAS_API_URL =
  "http://localhost:3000/api/bancos/chequeras";

async function procesarRespuesta<T>(
  response: Response
): Promise<T> {
  const body = (await response.json()) as
    | ApiResponse<T>
    | ApiErrorResponse;

  if (!response.ok || !body.ok) {
    throw new Error(
      body.message ||
        "Ocurrió un error al procesar la solicitud."
    );
  }

  return body.data;
}

export async function listarChequeras(): Promise<
  Chequera[]
> {
  const response = await fetch(
    CHEQUERAS_API_URL,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return procesarRespuesta<Chequera[]>(
    response
  );
}

export async function obtenerChequera(
  chequeraId: number
): Promise<Chequera> {
  const response = await fetch(
    `${CHEQUERAS_API_URL}/${chequeraId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return procesarRespuesta<Chequera>(
    response
  );
}

export async function crearChequera(
  input: CrearChequeraInput
): Promise<Chequera> {
  const response = await fetch(
    CHEQUERAS_API_URL,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  return procesarRespuesta<Chequera>(
    response
  );
}

export async function actualizarChequera(
  chequeraId: number,
  input: ActualizarChequeraInput
): Promise<Chequera> {
  const response = await fetch(
    `${CHEQUERAS_API_URL}/${chequeraId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  return procesarRespuesta<Chequera>(
    response
  );
}

export async function cambiarEstadoChequera(
  chequeraId: number,
  input: CambiarEstadoChequeraInput
): Promise<Chequera> {
  const response = await fetch(
    `${CHEQUERAS_API_URL}/${chequeraId}/estado`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  return procesarRespuesta<Chequera>(
    response
  );
}

export async function desactivarChequera(
  chequeraId: number
): Promise<Chequera> {
  const response = await fetch(
    `${CHEQUERAS_API_URL}/${chequeraId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return procesarRespuesta<Chequera>(
    response
  );
}