import oracledb from "oracledb";

import { getOracleConnection } from "../../../config/oracle.js";

import type {
  ActualizarChequeraInput,
  Chequera,
  CrearChequeraInput,
  EstadoChequera,
} from "./chequeras.types.js";

interface OracleChequeraRow {
  CHEQUERA_ID: number;
  CUENTA_ID: number;

  CODIGO_CUENTA: string;
  NUMERO_CUENTA: string;
  NOMBRE_INTERNO: string;

  BANCO_ID: number;
  CODIGO_BANCO: string;
  BANCO_NOMBRE: string;

  SERIE: string | null;
  NUMERO_INICIAL: number;
  NUMERO_FINAL: number;
  FECHA_RECEPCION: Date;
  CUSTODIO_ID: number;
  UBICACION_FISICA: string | null;
  DOCUMENTO_RECEPCION_ID: number | null;
  ESTADO: EstadoChequera;
  OBSERVACIONES: string | null;
}

interface OracleErrorConCodigo extends Error {
  code?: string;
}

/**
 * Convierte la fila que devuelve Oracle
 * al formato utilizado por el backend.
 */
function mapChequera(
  row: OracleChequeraRow
): Chequera {
  return {
    chequeraId: row.CHEQUERA_ID,
    cuentaId: row.CUENTA_ID,

    codigoCuenta: row.CODIGO_CUENTA,
    numeroCuenta: row.NUMERO_CUENTA,
    nombreInterno: row.NOMBRE_INTERNO,

    bancoId: row.BANCO_ID,
    codigoBanco: row.CODIGO_BANCO,
    bancoNombre: row.BANCO_NOMBRE,

    serie: row.SERIE,
    numeroInicial: row.NUMERO_INICIAL,
    numeroFinal: row.NUMERO_FINAL,
    fechaRecepcion: row.FECHA_RECEPCION,
    custodioId: row.CUSTODIO_ID,
    ubicacionFisica: row.UBICACION_FISICA,
    documentoRecepcionId:
      row.DOCUMENTO_RECEPCION_ID,
    estado: row.ESTADO,
    observaciones: row.OBSERVACIONES,
  };
}

/**
 * Cierra el ResultSet.
 *
 * En nuestro entorno node-oracledb 7.0.1 está
 * devolviendo NJS-018 al intentar cerrar algunos
 * REF CURSOR que ya fueron consumidos.
 *
 * Solo se ignora NJS-018 durante la limpieza.
 * Cualquier otro error continúa propagándose.
 */
async function cerrarCursor(
  resultSet: oracledb.ResultSet<OracleChequeraRow>
): Promise<void> {
  try {
    await resultSet.close();
  } catch (error) {
    const oracleError =
      error as OracleErrorConCodigo;

    if (oracleError.code !== "NJS-018") {
      throw error;
    }
  }
}

/**
 * Lee completamente un SYS_REFCURSOR.
 */
async function leerCursor(
  resultSet: oracledb.ResultSet<OracleChequeraRow>
): Promise<Chequera[]> {
  try {
    /*
     * getRows() sin parámetro obtiene todas
     * las filas restantes del ResultSet.
     */
    const rows = await resultSet.getRows();

    return rows.map(mapChequera);
  } finally {
    await cerrarCursor(resultSet);
  }
}

export class ChequerasRepository {
  /**
   * Obtiene todas las chequeras.
   */
  async listar(): Promise<Chequera[]> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_CHEQUERAS.LISTAR(
              p_resultado => :p_resultado
            );
          END;
          `,
          {
            p_resultado: {
              dir: oracledb.BIND_OUT,
              type: oracledb.CURSOR,
            },
          },
          {
            outFormat:
              oracledb.OUT_FORMAT_OBJECT,
          }
        );

      const outBinds =
        result.outBinds as {
          p_resultado:
            oracledb.ResultSet<OracleChequeraRow>;
        };

      return await leerCursor(
        outBinds.p_resultado
      );
    } finally {
      await connection.close();
    }
  }

  /**
   * Obtiene las chequeras pertenecientes
   * a una cuenta bancaria.
   */
  async listarPorCuenta(
    cuentaId: number
  ): Promise<Chequera[]> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_CHEQUERAS.LISTAR_POR_CUENTA(
              p_cuenta_id => :p_cuenta_id,
              p_resultado => :p_resultado
            );
          END;
          `,
          {
            p_cuenta_id: cuentaId,

            p_resultado: {
              dir: oracledb.BIND_OUT,
              type: oracledb.CURSOR,
            },
          },
          {
            outFormat:
              oracledb.OUT_FORMAT_OBJECT,
          }
        );

      const outBinds =
        result.outBinds as {
          p_resultado:
            oracledb.ResultSet<OracleChequeraRow>;
        };

      return await leerCursor(
        outBinds.p_resultado
      );
    } finally {
      await connection.close();
    }
  }

  /**
   * Obtiene una chequera por su ID.
   */
  async obtener(
    chequeraId: number
  ): Promise<Chequera> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_CHEQUERAS.OBTENER(
              p_chequera_id => :p_chequera_id,
              p_resultado   => :p_resultado
            );
          END;
          `,
          {
            p_chequera_id: chequeraId,

            p_resultado: {
              dir: oracledb.BIND_OUT,
              type: oracledb.CURSOR,
            },
          },
          {
            outFormat:
              oracledb.OUT_FORMAT_OBJECT,
          }
        );

      const outBinds =
        result.outBinds as {
          p_resultado:
            oracledb.ResultSet<OracleChequeraRow>;
        };

      const registros =
        await leerCursor(
          outBinds.p_resultado
        );

      const chequera = registros[0];

      if (!chequera) {
        throw new Error(
          `No se recibió información para la chequera ${chequeraId}.`
        );
      }

      return chequera;
    } finally {
      await connection.close();
    }
  }

  /**
   * Crea una nueva chequera.
   *
   * El Package no realiza COMMIT.
   * La transacción se controla aquí.
   */
  async crear(
    input: CrearChequeraInput
  ): Promise<number> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_CHEQUERAS.CREAR(
              p_cuenta_id
                => :p_cuenta_id,

              p_serie
                => :p_serie,

              p_numero_inicial
                => :p_numero_inicial,

              p_numero_final
                => :p_numero_final,

              p_fecha_recepcion
                => :p_fecha_recepcion,

              p_custodio_id
                => :p_custodio_id,

              p_ubicacion_fisica
                => :p_ubicacion_fisica,

              p_documento_recepcion_id
                => :p_documento_recepcion_id,

              p_estado
                => :p_estado,

              p_observaciones
                => :p_observaciones,

              p_chequera_id
                => :p_chequera_id
            );
          END;
          `,
          {
            p_cuenta_id:
              input.cuentaId,

            p_serie:
              input.serie ?? null,

            p_numero_inicial:
              input.numeroInicial,

            p_numero_final:
              input.numeroFinal,

            p_fecha_recepcion:
              input.fechaRecepcion,

            p_custodio_id:
              input.custodioId,

            p_ubicacion_fisica:
              input.ubicacionFisica ?? null,

            p_documento_recepcion_id:
              input.documentoRecepcionId ??
              null,

            p_estado:
              input.estado,

            p_observaciones:
              input.observaciones ?? null,

            p_chequera_id: {
              dir: oracledb.BIND_OUT,
              type: oracledb.NUMBER,
            },
          }
        );

      const outBinds =
        result.outBinds as {
          p_chequera_id: number;
        };

      await connection.commit();

      return outBinds.p_chequera_id;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /**
   * Actualiza una chequera existente.
   */
  async actualizar(
    chequeraId: number,
    input: ActualizarChequeraInput
  ): Promise<void> {
    const connection =
      await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_CHEQUERAS.ACTUALIZAR(
            p_chequera_id
              => :p_chequera_id,

            p_cuenta_id
              => :p_cuenta_id,

            p_serie
              => :p_serie,

            p_numero_inicial
              => :p_numero_inicial,

            p_numero_final
              => :p_numero_final,

            p_fecha_recepcion
              => :p_fecha_recepcion,

            p_custodio_id
              => :p_custodio_id,

            p_ubicacion_fisica
              => :p_ubicacion_fisica,

            p_documento_recepcion_id
              => :p_documento_recepcion_id,

            p_observaciones
              => :p_observaciones
          );
        END;
        `,
        {
          p_chequera_id:
            chequeraId,

          p_cuenta_id:
            input.cuentaId,

          p_serie:
            input.serie ?? null,

          p_numero_inicial:
            input.numeroInicial,

          p_numero_final:
            input.numeroFinal,

          p_fecha_recepcion:
            input.fechaRecepcion,

          p_custodio_id:
            input.custodioId,

          p_ubicacion_fisica:
            input.ubicacionFisica ?? null,

          p_documento_recepcion_id:
            input.documentoRecepcionId ??
            null,

          p_observaciones:
            input.observaciones ?? null,
        }
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /**
   * Cambia el estado de una chequera.
   */
  async cambiarEstado(
    chequeraId: number,
    estado: EstadoChequera
  ): Promise<void> {
    const connection =
      await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_CHEQUERAS.CAMBIAR_ESTADO(
            p_chequera_id
              => :p_chequera_id,

            p_estado
              => :p_estado
          );
        END;
        `,
        {
          p_chequera_id:
            chequeraId,

          p_estado:
            estado,
        }
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /**
   * Eliminación lógica.
   *
   * PKG_MB_CHEQUERAS.DESACTIVAR
   * cambia ESTADO a INACTIVA.
   */
  async desactivar(
    chequeraId: number
  ): Promise<void> {
    const connection =
      await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_CHEQUERAS.DESACTIVAR(
            p_chequera_id
              => :p_chequera_id
          );
        END;
        `,
        {
          p_chequera_id:
            chequeraId,
        }
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }
}

export const chequerasRepository =
  new ChequerasRepository();