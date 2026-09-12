import type {
  ActualizarCampoPlantillaChequeInput,
  ActualizarPlantillaChequeInput,
  ApiErrorResponse,
  ApiResponse,
  CambiarEstadoPlantillaChequeInput,
  CampoPlantillaCheque,
  CrearCampoPlantillaChequeInput,
  CrearPlantillaChequeInput,
  PlantillaCheque,
} from "../types/plantilla-cheque.types";

const PLANTILLAS_API_URL =
  "/api/v1/bancos/plantillas-cheque";


async function procesarRespuesta<T>(
  response: Response
): Promise<T> {
  let body:
    | ApiResponse<T>
    | ApiErrorResponse;

  try {
    body = (await response.json()) as
      | ApiResponse<T>
      | ApiErrorResponse;
  } catch {
    throw new Error(
      "El servidor devolvió una respuesta no válida."
    );
  }

  if (
    !response.ok ||
    !body.ok
  ) {
    throw new Error(
      body.message ||
        "Ocurrió un error al procesar la solicitud."
    );
  }

  return body.data;
}


/*
 * =========================================================
 * PLANTILLAS
 * =========================================================
 */


/*
 * GET
 * /api/bancos/plantillas-cheque
 */
export async function listarPlantillasCheque(): Promise<
  PlantillaCheque[]
> {
  const response = await fetch(
    PLANTILLAS_API_URL,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return procesarRespuesta<
    PlantillaCheque[]
  >(response);
}


/*
 * GET
 * /api/bancos/plantillas-cheque/banco/:bancoId
 */
export async function listarPlantillasPorBanco(
  bancoId: number
): Promise<PlantillaCheque[]> {
  const response = await fetch(
    `${PLANTILLAS_API_URL}/banco/${bancoId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return procesarRespuesta<
    PlantillaCheque[]
  >(response);
}


/*
 * GET
 * /api/bancos/plantillas-cheque/:id
 */
export async function obtenerPlantillaCheque(
  plantillaId: number
): Promise<PlantillaCheque> {
  const response = await fetch(
    `${PLANTILLAS_API_URL}/${plantillaId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return procesarRespuesta<
    PlantillaCheque
  >(response);
}


/*
 * POST
 * /api/bancos/plantillas-cheque
 */
export async function crearPlantillaCheque(
  input: CrearPlantillaChequeInput
): Promise<PlantillaCheque> {
  const response = await fetch(
    PLANTILLAS_API_URL,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        input
      ),
    }
  );

  return procesarRespuesta<
    PlantillaCheque
  >(response);
}


/*
 * PUT
 * /api/bancos/plantillas-cheque/:id
 */
export async function actualizarPlantillaCheque(
  plantillaId: number,
  input: ActualizarPlantillaChequeInput
): Promise<PlantillaCheque> {
  const response = await fetch(
    `${PLANTILLAS_API_URL}/${plantillaId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        input
      ),
    }
  );

  return procesarRespuesta<
    PlantillaCheque
  >(response);
}


/*
 * PATCH
 * /api/bancos/plantillas-cheque/:id/estado
 */
export async function cambiarEstadoPlantillaCheque(
  plantillaId: number,
  input: CambiarEstadoPlantillaChequeInput
): Promise<PlantillaCheque> {
  const response = await fetch(
    `${PLANTILLAS_API_URL}/${plantillaId}/estado`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        input
      ),
    }
  );

  return procesarRespuesta<
    PlantillaCheque
  >(response);
}


/*
 * DELETE lógico
 * /api/bancos/plantillas-cheque/:id
 */
export async function desactivarPlantillaCheque(
  plantillaId: number
): Promise<PlantillaCheque> {
  const response = await fetch(
    `${PLANTILLAS_API_URL}/${plantillaId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return procesarRespuesta<
    PlantillaCheque
  >(response);
}


/*
 * =========================================================
 * CAMPOS DE LA PLANTILLA
 * =========================================================
 */


/*
 * GET
 * /api/bancos/plantillas-cheque/:id/campos
 */
export async function listarCamposPlantillaCheque(
  plantillaId: number
): Promise<CampoPlantillaCheque[]> {
  const response = await fetch(
    `${PLANTILLAS_API_URL}/${plantillaId}/campos`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return procesarRespuesta<
    CampoPlantillaCheque[]
  >(response);
}


/*
 * POST
 * /api/bancos/plantillas-cheque/:id/campos
 */
export async function crearCampoPlantillaCheque(
  plantillaId: number,
  input: CrearCampoPlantillaChequeInput
): Promise<
  CampoPlantillaCheque[]
> {
  const response = await fetch(
    `${PLANTILLAS_API_URL}/${plantillaId}/campos`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        input
      ),
    }
  );

  return procesarRespuesta<
    CampoPlantillaCheque[]
  >(response);
}


/*
 * PUT
 * /api/bancos/plantillas-cheque/:id/campos/:campoId
 */
export async function actualizarCampoPlantillaCheque(
  plantillaId: number,
  campoPlantillaId: number,
  input: ActualizarCampoPlantillaChequeInput
): Promise<
  CampoPlantillaCheque[]
> {
  const response = await fetch(
    `${PLANTILLAS_API_URL}/${plantillaId}/campos/${campoPlantillaId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        input
      ),
    }
  );

  return procesarRespuesta<
    CampoPlantillaCheque[]
  >(response);
}


/*
 * DELETE lógico
 * /api/bancos/plantillas-cheque/:id/campos/:campoId
 */
export async function eliminarCampoPlantillaCheque(
  plantillaId: number,
  campoPlantillaId: number
): Promise<
  CampoPlantillaCheque[]
> {
  const response = await fetch(
    `${PLANTILLAS_API_URL}/${plantillaId}/campos/${campoPlantillaId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return procesarRespuesta<
    CampoPlantillaCheque[]
  >(response);
}