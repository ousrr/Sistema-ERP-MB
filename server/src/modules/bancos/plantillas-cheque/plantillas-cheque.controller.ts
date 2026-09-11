import type {
  Request,
  Response,
} from "express";

import { plantillasChequeService } from "./plantillas-cheque.service.js";

import type {
  ActualizarCampoPlantillaChequeInput,
  ActualizarPlantillaChequeInput,
  AlineacionCampoCheque,
  CodigoCampoCheque,
  CrearCampoPlantillaChequeInput,
  CrearPlantillaChequeInput,
  EstadoCampoCheque,
  EstadoPlantillaCheque,
  OrientacionPlantillaCheque,
} from "./plantillas-cheque.types.js";

const ESTADOS_PLANTILLA: EstadoPlantillaCheque[] = [
  "ACTIVA",
  "INACTIVA",
];

const ORIENTACIONES: OrientacionPlantillaCheque[] = [
  "HORIZONTAL",
  "VERTICAL",
];

const CODIGOS_CAMPO: CodigoCampoCheque[] = [
  "FECHA",
  "BENEFICIARIO",
  "MONTO_NUM",
  "MONTO_LETRAS",
  "CONCEPTO",
];

const ALINEACIONES: AlineacionCampoCheque[] = [
  "IZQUIERDA",
  "CENTRO",
  "DERECHA",
];

const ESTADOS_CAMPO: EstadoCampoCheque[] = [
  "ACTIVO",
  "INACTIVO",
];

interface OracleError extends Error {
  code?: string;
  errorNum?: number;
}

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

function obtenerIdOpcional(
  valor: unknown,
  nombre: string
): number | null {
  if (
    valor === undefined ||
    valor === null
  ) {
    return null;
  }

  const numero =
    obtenerNumero(valor, nombre);

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

function obtenerTextoObligatorio(
  valor: unknown,
  nombre: string
): string {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    throw new Error(
      `${nombre} es obligatorio.`
    );
  }

  return valor.trim();
}

function obtenerEstadoPlantilla(
  valor: unknown
): EstadoPlantillaCheque {
  if (typeof valor !== "string") {
    throw new Error(
      "El estado de la plantilla debe ser ACTIVA o INACTIVA."
    );
  }

  const estado =
    valor.trim().toUpperCase();

  if (
    !ESTADOS_PLANTILLA.includes(
      estado as EstadoPlantillaCheque
    )
  ) {
    throw new Error(
      "El estado de la plantilla debe ser ACTIVA o INACTIVA."
    );
  }

  return estado as EstadoPlantillaCheque;
}

function obtenerOrientacion(
  valor: unknown
): OrientacionPlantillaCheque {
  if (typeof valor !== "string") {
    throw new Error(
      "La orientación debe ser HORIZONTAL o VERTICAL."
    );
  }

  const orientacion =
    valor.trim().toUpperCase();

  if (
    !ORIENTACIONES.includes(
      orientacion as OrientacionPlantillaCheque
    )
  ) {
    throw new Error(
      "La orientación debe ser HORIZONTAL o VERTICAL."
    );
  }

  return orientacion as OrientacionPlantillaCheque;
}

function obtenerCodigoCampo(
  valor: unknown
): CodigoCampoCheque {
  if (typeof valor !== "string") {
    throw new Error(
      "El código del campo no es válido."
    );
  }

  const codigo =
    valor.trim().toUpperCase();

  if (
    !CODIGOS_CAMPO.includes(
      codigo as CodigoCampoCheque
    )
  ) {
    throw new Error(
      "El código del campo debe ser FECHA, BENEFICIARIO, MONTO_NUM, MONTO_LETRAS o CONCEPTO."
    );
  }

  return codigo as CodigoCampoCheque;
}

function obtenerAlineacion(
  valor: unknown
): AlineacionCampoCheque {
  if (typeof valor !== "string") {
    throw new Error(
      "La alineación del campo no es válida."
    );
  }

  const alineacion =
    valor.trim().toUpperCase();

  if (
    !ALINEACIONES.includes(
      alineacion as AlineacionCampoCheque
    )
  ) {
    throw new Error(
      "La alineación debe ser IZQUIERDA, CENTRO o DERECHA."
    );
  }

  return alineacion as AlineacionCampoCheque;
}

function obtenerEstadoCampo(
  valor: unknown
): EstadoCampoCheque {
  if (typeof valor !== "string") {
    throw new Error(
      "El estado del campo debe ser ACTIVO o INACTIVO."
    );
  }

  const estado =
    valor.trim().toUpperCase();

  if (
    !ESTADOS_CAMPO.includes(
      estado as EstadoCampoCheque
    )
  ) {
    throw new Error(
      "El estado del campo debe ser ACTIVO o INACTIVO."
    );
  }

  return estado as EstadoCampoCheque;
}

function obtenerCrearPlantillaInput(
  body: unknown
): CrearPlantillaChequeInput {
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
    bancoId: obtenerNumero(
      data.bancoId,
      "El banco"
    ),

    tipoCuentaId: obtenerIdOpcional(
      data.tipoCuentaId,
      "El tipo de cuenta"
    ),

    nombre: obtenerTextoObligatorio(
      data.nombre,
      "El nombre"
    ),

    tamanoPapel: obtenerTextoObligatorio(
      data.tamanoPapel,
      "El tamaño de papel"
    ),

    orientacion: obtenerOrientacion(
      data.orientacion
    ),

    margenSuperiorMm: obtenerNumero(
      data.margenSuperiorMm,
      "El margen superior"
    ),

    margenInferiorMm: obtenerNumero(
      data.margenInferiorMm,
      "El margen inferior"
    ),

    margenIzquierdoMm: obtenerNumero(
      data.margenIzquierdoMm,
      "El margen izquierdo"
    ),

    margenDerechoMm: obtenerNumero(
      data.margenDerechoMm,
      "El margen derecho"
    ),

    archivoFondoId: obtenerIdOpcional(
      data.archivoFondoId,
      "El archivo de fondo"
    ),

    estado: obtenerEstadoPlantilla(
      data.estado
    ),
  };
}

function obtenerActualizarPlantillaInput(
  body: unknown
): ActualizarPlantillaChequeInput {
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
    bancoId: obtenerNumero(
      data.bancoId,
      "El banco"
    ),

    tipoCuentaId: obtenerIdOpcional(
      data.tipoCuentaId,
      "El tipo de cuenta"
    ),

    nombre: obtenerTextoObligatorio(
      data.nombre,
      "El nombre"
    ),

    tamanoPapel: obtenerTextoObligatorio(
      data.tamanoPapel,
      "El tamaño de papel"
    ),

    orientacion: obtenerOrientacion(
      data.orientacion
    ),

    margenSuperiorMm: obtenerNumero(
      data.margenSuperiorMm,
      "El margen superior"
    ),

    margenInferiorMm: obtenerNumero(
      data.margenInferiorMm,
      "El margen inferior"
    ),

    margenIzquierdoMm: obtenerNumero(
      data.margenIzquierdoMm,
      "El margen izquierdo"
    ),

    margenDerechoMm: obtenerNumero(
      data.margenDerechoMm,
      "El margen derecho"
    ),

    archivoFondoId: obtenerIdOpcional(
      data.archivoFondoId,
      "El archivo de fondo"
    ),
  };
}

function obtenerCrearCampoInput(
  body: unknown
): CrearCampoPlantillaChequeInput {
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
    codigoCampo: obtenerCodigoCampo(
      data.codigoCampo
    ),

    posicionXMm: obtenerNumero(
      data.posicionXMm,
      "La posición X"
    ),

    posicionYMm: obtenerNumero(
      data.posicionYMm,
      "La posición Y"
    ),

    anchoMm: obtenerNumero(
      data.anchoMm,
      "El ancho"
    ),

    altoMm: obtenerNumero(
      data.altoMm,
      "El alto"
    ),

    tamanoFuente: obtenerNumero(
      data.tamanoFuente,
      "El tamaño de fuente"
    ),

    alineacion: obtenerAlineacion(
      data.alineacion
    ),

    estado: obtenerEstadoCampo(
      data.estado
    ),
  };
}

function obtenerActualizarCampoInput(
  body: unknown
): ActualizarCampoPlantillaChequeInput {
  return obtenerCrearCampoInput(body);
}

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

  /*
   * Errores de recurso inexistente del Package:
   *
   * 20116 = plantilla inexistente en OBTENER
   * 20118 = plantilla inexistente en ACTUALIZAR
   * 20120 = plantilla inexistente en CAMBIAR_ESTADO
   * 20121 = plantilla inexistente en LISTAR_CAMPOS
   * 20122 = plantilla inexistente en CREAR_CAMPO
   * 20124 = campo inexistente en ACTUALIZAR_CAMPO
   * 20126 = campo inexistente en ELIMINAR_CAMPO
   */
  const erroresNoEncontrado = new Set([
    20116,
    20118,
    20120,
    20121,
    20122,
    20124,
    20126,
  ]);

  if (
    typeof oracleError.errorNum === "number" &&
    erroresNoEncontrado.has(
      oracleError.errorNum
    )
  ) {
    res.status(404).json({
      ok: false,
      message:
        obtenerMensajeOracle(error),
    });

    return;
  }

  /*
   * Errores funcionales controlados
   * por PKG_MB_PLANTILLAS_CHEQUE.
   */
  if (
    typeof oracleError.errorNum === "number" &&
    oracleError.errorNum >= 20101 &&
    oracleError.errorNum <= 20199
  ) {
    res.status(400).json({
      ok: false,
      message:
        obtenerMensajeOracle(error),
    });

    return;
  }

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

  /*
   * Validaciones del Controller o Service.
   */
  if (!oracleError.code) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });

    return;
  }

  console.error(
    "Error inesperado en PlantillasChequeController:",
    error
  );

  res.status(500).json({
    ok: false,
    message:
      "Ocurrió un error interno al procesar la solicitud.",
  });
}

export class PlantillasChequeController {
  async listar(
    _req: Request,
    res: Response
  ): Promise<void> {
    try {
      const plantillas =
        await plantillasChequeService.listar();

      res.status(200).json({
        ok: true,
        data: plantillas,
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async listarPorBanco(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const bancoId =
        obtenerIdParametro(
          req.params.bancoId,
          "El banco"
        );

      const plantillas =
        await plantillasChequeService.listarPorBanco(
          bancoId
        );

      res.status(200).json({
        ok: true,
        data: plantillas,
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async obtener(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const plantillaId =
        obtenerIdParametro(
          req.params.id,
          "La plantilla"
        );

      const plantilla =
        await plantillasChequeService.obtener(
          plantillaId
        );

      res.status(200).json({
        ok: true,
        data: plantilla,
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async crear(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const input =
        obtenerCrearPlantillaInput(
          req.body
        );

      const plantilla =
        await plantillasChequeService.crear(
          input
        );

      res.status(201).json({
        ok: true,
        data: plantilla,
        message:
          "Plantilla de cheque creada correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async actualizar(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const plantillaId =
        obtenerIdParametro(
          req.params.id,
          "La plantilla"
        );

      const input =
        obtenerActualizarPlantillaInput(
          req.body
        );

      const plantilla =
        await plantillasChequeService.actualizar(
          plantillaId,
          input
        );

      res.status(200).json({
        ok: true,
        data: plantilla,
        message:
          "Plantilla de cheque actualizada correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async cambiarEstado(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const plantillaId =
        obtenerIdParametro(
          req.params.id,
          "La plantilla"
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
        obtenerEstadoPlantilla(
          body.estado
        );

      const plantilla =
        await plantillasChequeService.cambiarEstado(
          plantillaId,
          estado
        );

      res.status(200).json({
        ok: true,
        data: plantilla,
        message:
          "Estado de la plantilla actualizado correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async desactivar(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const plantillaId =
        obtenerIdParametro(
          req.params.id,
          "La plantilla"
        );

      const plantilla =
        await plantillasChequeService.desactivar(
          plantillaId
        );

      res.status(200).json({
        ok: true,
        data: plantilla,
        message:
          "Plantilla de cheque desactivada correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async listarCampos(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const plantillaId =
        obtenerIdParametro(
          req.params.id,
          "La plantilla"
        );

      const campos =
        await plantillasChequeService.listarCampos(
          plantillaId
        );

      res.status(200).json({
        ok: true,
        data: campos,
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async crearCampo(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const plantillaId =
        obtenerIdParametro(
          req.params.id,
          "La plantilla"
        );

      const input =
        obtenerCrearCampoInput(
          req.body
        );

      const campos =
        await plantillasChequeService.crearCampo(
          plantillaId,
          input
        );

      res.status(201).json({
        ok: true,
        data: campos,
        message:
          "Campo de plantilla creado correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async actualizarCampo(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const plantillaId =
        obtenerIdParametro(
          req.params.id,
          "La plantilla"
        );

      const campoPlantillaId =
        obtenerIdParametro(
          req.params.campoId,
          "El campo de plantilla"
        );

      const input =
        obtenerActualizarCampoInput(
          req.body
        );

      const campos =
        await plantillasChequeService.actualizarCampo(
          plantillaId,
          campoPlantillaId,
          input
        );

      res.status(200).json({
        ok: true,
        data: campos,
        message:
          "Campo de plantilla actualizado correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }

  async eliminarCampo(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const plantillaId =
        obtenerIdParametro(
          req.params.id,
          "La plantilla"
        );

      const campoPlantillaId =
        obtenerIdParametro(
          req.params.campoId,
          "El campo de plantilla"
        );

      const campos =
        await plantillasChequeService.eliminarCampo(
          plantillaId,
          campoPlantillaId
        );

      res.status(200).json({
        ok: true,
        data: campos,
        message:
          "Campo de plantilla desactivado correctamente.",
      });
    } catch (error) {
      responderError(res, error);
    }
  }
}

export const plantillasChequeController =
  new PlantillasChequeController();