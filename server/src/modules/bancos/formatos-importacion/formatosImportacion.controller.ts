import type {
  Request,
  Response,
} from 'express';

import {
  listarFormatosService,
  listarFormatosActivosPorBancoService,
  obtenerFormatoService,
  crearFormatoService,
  actualizarFormatoService,
  cambiarEstadoFormatoService,
  listarMapeosService,
  crearMapeoService,
  actualizarMapeoService,
  eliminarMapeoService,
} from './formatosImportacion.service.js';

/* =========================================================
   FORMATOS DE IMPORTACIÓN
   ========================================================= */

export async function listarFormatosController(
  req: Request,
  res: Response
) {
  try {
    const formatos =
      await listarFormatosService();

    return res.status(200).json({
      success: true,
      data: formatos,
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   LISTAR FORMATOS ACTIVOS POR BANCO
   ========================================================= */

export async function listarFormatosActivosPorBancoController(
  req: Request,
  res: Response
) {
  try {
    const bancoId =
      Number(req.query.bancoId);

    const formatos =
      await listarFormatosActivosPorBancoService(
        bancoId
      );

    return res.status(200).json({
      success: true,
      data: formatos,
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   OBTENER FORMATO
   ========================================================= */

export async function obtenerFormatoController(
  req: Request,
  res: Response
) {
  try {
    const formatoId =
      Number(req.params.id);

    const formato =
      await obtenerFormatoService(
        formatoId
      );

    return res.status(200).json({
      success: true,
      data: formato,
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   CREAR FORMATO
   ========================================================= */

export async function crearFormatoController(
  req: Request,
  res: Response
) {
  try {
    const nuevoId =
      await crearFormatoService({
        bancoId:
          Number(req.body.bancoId),

        nombre:
          String(req.body.nombre ?? ''),

        version:
          Number(req.body.version),

        tipoArchivo:
          String(
            req.body.tipoArchivo ?? ''
          ),

        delimitador:
          req.body.delimitador ?? null,

        formatoFecha:
          String(
            req.body.formatoFecha ?? ''
          ),

        filaEncabezado:
          Number(
            req.body.filaEncabezado
          ),

        archivoEjemploId:
          Number(
            req.body.archivoEjemploId
          ),

        estado:
          String(req.body.estado ?? ''),
      });

    const formatoCreado =
      await obtenerFormatoService(
        nuevoId
      );

    return res.status(201).json({
      success: true,
      message:
        'Formato de importación creado correctamente.',
      data: formatoCreado,
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   ACTUALIZAR FORMATO
   ========================================================= */

export async function actualizarFormatoController(
  req: Request,
  res: Response
) {
  try {
    const formatoId =
      Number(req.params.id);

    const formato =
      await actualizarFormatoService({
        formatoId,

        bancoId:
          Number(req.body.bancoId),

        nombre:
          String(req.body.nombre ?? ''),

        version:
          Number(req.body.version),

        tipoArchivo:
          String(
            req.body.tipoArchivo ?? ''
          ),

        delimitador:
          req.body.delimitador ?? null,

        formatoFecha:
          String(
            req.body.formatoFecha ?? ''
          ),

        filaEncabezado:
          Number(
            req.body.filaEncabezado
          ),

        archivoEjemploId:
          Number(
            req.body.archivoEjemploId
          ),
      });

    return res.status(200).json({
      success: true,
      message:
        'Formato de importación actualizado correctamente.',
      data: formato,
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   CAMBIAR ESTADO DEL FORMATO
   ========================================================= */

export async function cambiarEstadoFormatoController(
  req: Request,
  res: Response
) {
  try {
    const formatoId =
      Number(req.params.id);

    const estado =
      String(req.body.estado ?? '');

    const formato =
      await cambiarEstadoFormatoService(
        formatoId,
        estado
      );

    return res.status(200).json({
      success: true,
      message:
        'Estado del formato actualizado correctamente.',
      data: formato,
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   MAPEO DE COLUMNAS
   ========================================================= */

/* =========================================================
   LISTAR MAPEOS
   ========================================================= */

export async function listarMapeosController(
  req: Request,
  res: Response
) {
  try {
    const formatoId =
      Number(req.params.id);

    const mapeos =
      await listarMapeosService(
        formatoId
      );

    return res.status(200).json({
      success: true,
      data: mapeos,
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   CREAR MAPEO
   ========================================================= */

export async function crearMapeoController(
  req: Request,
  res: Response
) {
  try {
    const formatoId =
      Number(req.params.id);

    const nuevoMapeoId =
      await crearMapeoService({
        formatoId,

        campoSistema:
          String(
            req.body.campoSistema ?? ''
          ),

        nombreColumna:
          req.body.nombreColumna == null
            ? null
            : String(
                req.body.nombreColumna
              ),

        numeroColumna:
          req.body.numeroColumna == null ||
          req.body.numeroColumna === ''
            ? null
            : Number(
                req.body.numeroColumna
              ),

        esObligatorio:
          String(
            req.body.esObligatorio ??
              ''
          ),

        formatoValor:
          req.body.formatoValor == null
            ? null
            : String(
                req.body.formatoValor
              ),
      });

    return res.status(201).json({
      success: true,
      message:
        'Mapeo creado correctamente.',
      data: {
        mapeoId: nuevoMapeoId,
      },
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   ACTUALIZAR MAPEO
   ========================================================= */

export async function actualizarMapeoController(
  req: Request,
  res: Response
) {
  try {
    const mapeoId =
      Number(req.params.mapeoId);

    await actualizarMapeoService({
      mapeoId,

      campoSistema:
        String(
          req.body.campoSistema ?? ''
        ),

      nombreColumna:
        req.body.nombreColumna == null
          ? null
          : String(
              req.body.nombreColumna
            ),

      numeroColumna:
        req.body.numeroColumna == null ||
        req.body.numeroColumna === ''
          ? null
          : Number(
              req.body.numeroColumna
            ),

      esObligatorio:
        String(
          req.body.esObligatorio ??
            ''
        ),

      formatoValor:
        req.body.formatoValor == null
          ? null
          : String(
              req.body.formatoValor
            ),
    });

    return res.status(200).json({
      success: true,
      message:
        'Mapeo actualizado correctamente.',
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   ELIMINAR MAPEO
   ========================================================= */

export async function eliminarMapeoController(
  req: Request,
  res: Response
) {
  try {
    const mapeoId =
      Number(req.params.mapeoId);

    await eliminarMapeoService(
      mapeoId
    );

    return res.status(200).json({
      success: true,
      message:
        'Mapeo eliminado correctamente.',
    });
  } catch (error) {
    return responderError(res, error);
  }
}

/* =========================================================
   MANEJO SEGURO DE ERRORES
   ========================================================= */

type ErrorSeguro = {
  status: number;
  message: string;
};

/*
 * Traduce errores internos de Oracle
 * a mensajes entendibles para el usuario.
 *
 * El mensaje técnico original NO se envía al frontend.
 */
function traducirErrorOracle(
  mensaje: string
): ErrorSeguro | null {
  /*
   * ORA-02291
   * Foreign Key:
   * el registro padre no existe.
   */
  if (
    mensaje.includes(
      'ORA-02291'
    )
  ) {
    /*
     * Caso específico encontrado en
     * archivoEjemploId.
     */
    if (
      mensaje.includes(
        'MB_FK_FIB_ARCHIVO'
      )
    ) {
      return {
        status: 400,
        message:
          'El archivo de ejemplo seleccionado no existe o ya no está disponible. Selecciona un archivo válido.',
      };
    }

    return {
      status: 400,
      message:
        'Uno de los datos seleccionados ya no existe o no es válido. Verifica la información e intenta nuevamente.',
    };
  }

  /*
   * ORA-00001
   * Restricción UNIQUE.
   */
  if (
    mensaje.includes(
      'ORA-00001'
    )
  ) {
    return {
      status: 409,
      message:
        'Ya existe un registro con esos datos. Verifica la información antes de continuar.',
    };
  }

  /*
   * ORA-02290
   * CHECK constraint.
   */
  if (
    mensaje.includes(
      'ORA-02290'
    )
  ) {
    return {
      status: 400,
      message:
        'Uno de los valores ingresados no cumple con las reglas permitidas. Revisa los datos e intenta nuevamente.',
    };
  }

  /*
   * ORA-01400
   * Intento de guardar NULL en un
   * campo obligatorio.
   */
  if (
    mensaje.includes(
      'ORA-01400'
    )
  ) {
    return {
      status: 400,
      message:
        'Falta completar un dato obligatorio. Revisa los campos marcados e intenta nuevamente.',
    };
  }

  /*
   * ORA-12899
   * Valor demasiado largo para
   * una columna.
   */
  if (
    mensaje.includes(
      'ORA-12899'
    )
  ) {
    return {
      status: 400,
      message:
        'Uno de los datos ingresados supera la longitud permitida. Reduce el contenido e intenta nuevamente.',
    };
  }

  /*
   * ORA-02292
   * No se puede eliminar un registro
   * porque existen registros hijos.
   */
  if (
    mensaje.includes(
      'ORA-02292'
    )
  ) {
    return {
      status: 409,
      message:
        'No es posible realizar esta operación porque el registro está siendo utilizado por otros datos del sistema.',
    };
  }

  /*
   * ORA-01722
   * Conversión numérica inválida.
   */
  if (
    mensaje.includes(
      'ORA-01722'
    )
  ) {
    return {
      status: 400,
      message:
        'Uno de los valores numéricos ingresados no es válido.',
    };
  }

  /*
   * ORA-06502
   * Error de valor/conversión PL/SQL.
   */
  if (
    mensaje.includes(
      'ORA-06502'
    )
  ) {
    return {
      status: 400,
      message:
        'Uno de los datos ingresados tiene un formato incorrecto.',
    };
  }

  /*
   * Si contiene ORA- pero no conocemos
   * todavía el código específico,
   * ocultamos completamente el detalle.
   */
  if (
    mensaje.includes('ORA-')
  ) {
    return {
      status: 500,
      message:
        'No fue posible completar la operación debido a un problema interno. Intenta nuevamente.',
    };
  }

  return null;
}

/*
 * Identifica errores generados por
 * nuestras propias validaciones del Service.
 */
function traducirErrorAplicacion(
  mensaje: string
): ErrorSeguro | null {
  const mensajeMinusculas =
    mensaje.toLowerCase();

  /*
   * Registro solicitado no encontrado.
   */
  if (
    mensajeMinusculas.includes(
      'no existe un formato'
    ) ||
    mensajeMinusculas.includes(
      'no existe el formato'
    )
  ) {
    return {
      status: 404,
      message: mensaje,
    };
  }

  /*
   * Duplicados detectados por
   * nuestras reglas de negocio.
   */
  if (
    mensajeMinusculas.includes(
      'ya está configurado'
    ) ||
    mensajeMinusculas.includes(
      'ya existe'
    )
  ) {
    return {
      status: 409,
      message: mensaje,
    };
  }

  /*
   * Mensajes de validación definidos
   * por nuestro Service.
   *
   * Estos mensajes sí son seguros para
   * mostrarlos al usuario.
   */
  const patronesValidacion = [
    'debe ser',
    'debe indicar',
    'debe seleccionar',
    'es obligatorio',
    'es inválido',
    'inválido',
    'inválida',
    'no puede superar',
    'contiene caracteres no permitidos',
    'solo puede contener',
    'únicamente puede',
    'valores permitidos',
    'debe contener al menos',
  ];

  const esValidacion =
    patronesValidacion.some(
      (patron) =>
        mensajeMinusculas.includes(
          patron
        )
    );

  if (esValidacion) {
    return {
      status: 400,
      message: mensaje,
    };
  }

  return null;
}

/* =========================================================
   RESPUESTA DE ERROR
   ========================================================= */

function responderError(
  res: Response,
  error: unknown
) {
  /*
   * Registramos el error completo únicamente
   * en el backend.
   *
   * Esto permite investigar el problema sin
   * exponer detalles internos al usuario.
   */
  console.error(
    '[FormatosImportacion] Error:',
    error
  );

  if (!(error instanceof Error)) {
    return res.status(500).json({
      success: false,
      message:
        'Ocurrió un error inesperado. Intenta nuevamente.',
    });
  }

  const mensajeOriginal =
    error.message;

  /*
   * Primero comprobamos errores Oracle.
   */
  const errorOracle =
    traducirErrorOracle(
      mensajeOriginal
    );

  if (errorOracle) {
    return res
      .status(errorOracle.status)
      .json({
        success: false,
        message:
          errorOracle.message,
      });
  }

  /*
   * Luego comprobamos errores generados
   * por nuestras validaciones/reglas.
   */
  const errorAplicacion =
    traducirErrorAplicacion(
      mensajeOriginal
    );

  if (errorAplicacion) {
    return res
      .status(errorAplicacion.status)
      .json({
        success: false,
        message:
          errorAplicacion.message,
      });
  }

  /*
   * Cualquier error desconocido queda oculto.
   *
   * Nunca enviamos stack trace, SQL,
   * nombres de tablas, paquetes o detalles
   * internos al frontend.
   */
  return res.status(500).json({
    success: false,
    message:
      'No fue posible completar la operación. Intenta nuevamente.',
  });
}