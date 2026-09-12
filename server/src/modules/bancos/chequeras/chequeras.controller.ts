import type {
  Request,
  Response,
} from "express";

import { chequerasService } from "./chequeras.service.js";

import type {
  ActualizarChequeraInput,
  CrearChequeraInput,
  EstadoChequera,
} from "./chequeras.types.js";

const ESTADOS_CHEQUERA: EstadoChequera[] = [
  "BORRADOR",
  "ACTIVA",
  "AGOTADA",
  "INACTIVA",
];

interface OracleError extends Error {
  code?: string;
  errorNum?: number;
}

/**
 * Convierte un valor recibido por JSON en número.
 */
function obtenerNumero(
  valor: unknown,
  nombre: string
): number {
  if (
    typeof valor !== "number" ||
    !Number.isFinite(valor)
  ) {
    throw new Error(
      `${nombre} debe ser un número válido.`
    );
  }

  return valor;
}

/**
 * Convierte parámetros de ruta como:
 *
 * /chequeras/:id
 * /chequeras/cuenta/:cuentaId
 *
 * Express 5 puede tiparlos como string | string[].
 */
function obtenerIdParametro(
  valor: string | string[] | undefined,
  nombre: string
): number {
  if (valor === undefined) {
    throw new Error(
      `${nombre} es obligatorio.`
    );
  }

  if (Array.isArray(valor)) {
    throw new Error(
      `${nombre} no es válido.`
    );
  }

  if (valor.trim() === "") {
    throw new Error(
      `${nombre} es obligatorio.`
    );
  }

  const numero = Number(valor);

  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {
    throw new Error(
      `${nombre} debe ser un número entero mayor que cero.`
    );
  }

  return numero;
}

/**
 * Convierte campos opcionales de texto.
 *
 * undefined, null o cadena vacía se convierten en null.
 */
function obtenerTextoOpcional(
  valor: unknown,
  nombre: string
): string | null {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return null;
  }

  if (typeof valor !== "string") {
    throw new Error(
      `${nombre} debe ser texto.`
    );
  }

  const texto = valor.trim();

  return texto === ""
    ? null
    : texto;
}

/**
 * Convierte la fecha recibida por HTTP a Date.
 */
function obtenerFecha(
  valor: unknown
): Date {
  if (
    typeof valor !== "string" &&
    !(valor instanceof Date)
  ) {
    throw new Error(
      "La fecha de recepción es obligatoria."
    );
  }

  const fecha =
    valor instanceof Date
      ? valor
      : new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    throw new Error(
      "La fecha de recepción no es válida."
    );
  }

  return fecha;
}

/**
 * Valida los estados admitidos por MB_CHEQUERA.
 */
function obtenerEstado(
  valor: unknown
): EstadoChequera {
  if (typeof valor !== "string") {
    throw new Error(
      "El estado debe ser BORRADOR, ACTIVA, AGOTADA o INACTIVA."
    );
  }

  const estado =
    valor.trim().toUpperCase();

  if (
    !ESTADOS_CHEQUERA.includes(
      estado as EstadoChequera
    )
  ) {
    throw new Error(
      "El estado debe ser BORRADOR, ACTIVA, AGOTADA o INACTIVA."
    );
  }

  return estado as EstadoChequera;
}

/**
 * Construye el objeto utilizado al crear una chequera.
 */
function obtenerCrearInput(
  body: unknown
): CrearChequeraInput {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new Error(
      "El cuerpo de la solicitud no es válido."
    );
  }

  const data =
    body as Record<string, unknown>;

  return {
    cuentaId: obtenerNumero(
      data.cuentaId,
      "La cuenta bancaria"
    ),

    serie: obtenerTextoOpcional(
      data.serie,
      "La serie"
    ),

    numeroInicial: obtenerNumero(
      data.numeroInicial,
      "El número inicial"
    ),

    numeroFinal: obtenerNumero(
      data.numeroFinal,
      "El número final"
    ),

    fechaRecepcion: obtenerFecha(
      data.fechaRecepcion
    ),

    custodioId: obtenerNumero(
      data.custodioId,
      "El custodio"
    ),

    ubicacionFisica:
      obtenerTextoOpcional(
        data.ubicacionFisica,
        "La ubicación física"
      ),

    documentoRecepcionId:
      data.documentoRecepcionId === undefined ||
      data.documentoRecepcionId === null
        ? null
        : obtenerNumero(
            data.documentoRecepcionId,
            "El documento de recepción"
          ),

    estado: obtenerEstado(
      data.estado
    ),

    observaciones:
      obtenerTextoOpcional(
        data.observaciones,
        "Las observaciones"
      ),
  };
}

/**
 * Construye el objeto utilizado al actualizar una chequera.
 *
 * El estado no se actualiza aquí porque tiene
 * su propia operación CAMBIAR_ESTADO.
 */
function obtenerActualizarInput(
  body: unknown
): ActualizarChequeraInput {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new Error(
      "El cuerpo de la solicitud no es válido."
    );
  }

  const data =
    body as Record<string, unknown>;

  return {
    cuentaId: obtenerNumero(
      data.cuentaId,
      "La cuenta bancaria"
    ),

    serie: obtenerTextoOpcional(
      data.serie,
      "La serie"
    ),

    numeroInicial: obtenerNumero(
      data.numeroInicial,
      "El número inicial"
    ),

    numeroFinal: obtenerNumero(
      data.numeroFinal,
      "El número final"
    ),

    fechaRecepcion: obtenerFecha(
      data.fechaRecepcion
    ),

    custodioId: obtenerNumero(
      data.custodioId,
      "El custodio"
    ),

    ubicacionFisica:
      obtenerTextoOpcional(
        data.ubicacionFisica,
        "La ubicación física"
      ),

    documentoRecepcionId:
      data.documentoRecepcionId === undefined ||
      data.documentoRecepcionId === null
        ? null
        : obtenerNumero(
            data.documentoRecepcionId,
            "El documento de recepción"
          ),

    observaciones:
      obtenerTextoOpcional(
        data.observaciones,
        "Las observaciones"
      ),
  };
}

/**
 * Extrae únicamente el mensaje funcional de Oracle.
 *
 * Ejemplo recibido:
 *
 * ORA-20009: La chequera indicada no existe.
 * ORA-06512: en "ERP_BANCOS.PKG_MB_CHEQUERAS", línea 265
 *
 * Resultado:
 *
 * La chequera indicada no existe.
 */
function obtenerMensajeOracle(
  error: Error
): string {
  const primeraLinea =
    error.message
      .split(/\r?\n/)[0]
      ?.trim();

  if (!primeraLinea) {
    return "No fue posible procesar la operación.";
  }

  return primeraLinea.replace(
    /^ORA-\d+:\s*/,
    ""
  );
}

/**
 * Convierte errores internos a respuestas HTTP.
 *
 * No expone:
 * - esquema Oracle
 * - nombre del Package
 * - líneas PL/SQL
 * - stack trace
 */
function responderError(
  res: Response,
  error: unknown
): void {
  if (!(error instanceof Error)) {
    res.status(500).json({
      ok: false,
      message:
        "Ocurrió un error interno inesperado.",
    });

    return;
  }

  const oracleError =
    error as OracleError;

  /**
   * ORA-20009:
   * PKG_MB_CHEQUERAS informa que
   * la chequera solicitada no existe.
   */
  if (
    oracleError.code === "ORA-20009" ||
    oracleError.errorNum === 20009
  ) {
    res.status(404).json({
      ok: false,
      message:
        "La chequera indicada no existe.",
    });

    return;
  }

  /**
   * Errores funcionales controlados
   * por los Packages Oracle.
   */
  if (
    typeof oracleError.errorNum === "number" &&
    oracleError.errorNum >= 20000 &&
    oracleError.errorNum <= 20999
  ) {
    res.status(400).json({
      ok: false,
      message:
        obtenerMensajeOracle(error),
    });

    return;
  }

  /**
   * Algunos errores Oracle pueden traer
   * code pero no errorNum.
   */
  if (
    typeof oracleError.code === "string" &&
    /^ORA-20\d{3}$/.test(
      oracleError.code
    )
  ) {
    res.status(400).json({
      ok: false,
      message:
        obtenerMensajeOracle(error),
    });

    return;
  }

  /**
   * Errores producidos por las validaciones
   * del Controller o Service.
   */
  if (!oracleError.code) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });

    return;
  }

  /**
   * Error técnico no controlado.
   *
   * El detalle se muestra únicamente
   * en la consola del servidor.
   */
  console.error(
    "Error inesperado en ChequerasController:",
    error
  );

  res.status(500).json({
    ok: false,
    message:
      "Ocurrió un error interno al procesar la solicitud.",
  });
}

export class ChequerasController {
  /**
   * GET /api/bancos/chequeras
   */
  async listar(
    _req: Request,
    res: Response
  ): Promise<void> {
    try {
      const chequeras =
        await chequerasService.listar();

      res.status(200).json({
        ok: true,
        data: chequeras,
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  /**
   * GET /api/bancos/chequeras/cuenta/:cuentaId
   */
  async listarPorCuenta(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const cuentaId =
        obtenerIdParametro(
          req.params.cuentaId,
          "La cuenta bancaria"
        );

      const chequeras =
        await chequerasService.listarPorCuenta(
          cuentaId
        );

      res.status(200).json({
        ok: true,
        data: chequeras,
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  /**
   * GET /api/bancos/chequeras/:id
   */
  async obtener(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const chequeraId =
        obtenerIdParametro(
          req.params.id,
          "La chequera"
        );

      const chequera =
        await chequerasService.obtener(
          chequeraId
        );

      res.status(200).json({
        ok: true,
        data: chequera,
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  /**
   * POST /api/bancos/chequeras
   */
  async crear(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const input =
        obtenerCrearInput(req.body);

      const chequera =
        await chequerasService.crear(
          input
        );

      res.status(201).json({
        ok: true,
        data: chequera,
        message:
          "Chequera creada correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  /**
   * PUT /api/bancos/chequeras/:id
   */
  async actualizar(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const chequeraId =
        obtenerIdParametro(
          req.params.id,
          "La chequera"
        );

      const input =
        obtenerActualizarInput(
          req.body
        );

      const chequera =
        await chequerasService.actualizar(
          chequeraId,
          input
        );

      res.status(200).json({
        ok: true,
        data: chequera,
        message:
          "Chequera actualizada correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  /**
   * PATCH /api/bancos/chequeras/:id/estado
   */
  async cambiarEstado(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const chequeraId =
        obtenerIdParametro(
          req.params.id,
          "La chequera"
        );

      if (
        typeof req.body !== "object" ||
        req.body === null ||
        Array.isArray(req.body)
      ) {
        throw new Error(
          "El cuerpo de la solicitud no es válido."
        );
      }

      const body =
        req.body as Record<
          string,
          unknown
        >;

      const estado =
        obtenerEstado(body.estado);

      const chequera =
        await chequerasService.cambiarEstado(
          chequeraId,
          estado
        );

      res.status(200).json({
        ok: true,
        data: chequera,
        message:
          "Estado de la chequera actualizado correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  /**
   * DELETE /api/bancos/chequeras/:id
   *
   * Es una eliminación lógica.
   */
  async desactivar(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const chequeraId =
        obtenerIdParametro(
          req.params.id,
          "La chequera"
        );

      const chequera =
        await chequerasService.desactivar(
          chequeraId
        );

      res.status(200).json({
        ok: true,
        data: chequera,
        message:
          "Chequera desactivada correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }
}

export const chequerasController =
  new ChequerasController();