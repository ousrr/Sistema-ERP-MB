import oracledb from "oracledb";

import { getOracleConnection } from "../../../config/oracle.js";

import type {
  ActualizarCampoPlantillaChequeInput,
  ActualizarPlantillaChequeInput,
  CampoPlantillaCheque,
  CrearCampoPlantillaChequeInput,
  CrearPlantillaChequeInput,
  EstadoPlantillaCheque,
  PlantillaCheque,
} from "./plantillas-cheque.types.js";

interface OraclePlantillaChequeRow {
  PLANTILLA_ID: number;

  BANCO_ID: number;
  CODIGO_BANCO: string;
  BANCO_NOMBRE: string;

  TIPO_CUENTA_ID: number | null;
  TIPO_CUENTA_CODIGO: string | null;
  TIPO_CUENTA_NOMBRE: string | null;

  NOMBRE: string;
  TAMANO_PAPEL: string;
  ORIENTACION: PlantillaCheque["orientacion"];

  MARGEN_SUPERIOR_MM: number;
  MARGEN_INFERIOR_MM: number;
  MARGEN_IZQUIERDO_MM: number;
  MARGEN_DERECHO_MM: number;

  ARCHIVO_FONDO_ID: number | null;

  ESTADO: EstadoPlantillaCheque;
}

interface OracleCampoPlantillaChequeRow {
  CAMPO_PLANTILLA_ID: number;
  PLANTILLA_ID: number;

  CODIGO_CAMPO: CampoPlantillaCheque["codigoCampo"];

  POSICION_X_MM: number;
  POSICION_Y_MM: number;

  ANCHO_MM: number;
  ALTO_MM: number;

  TAMANO_FUENTE: number;

  ALINEACION: CampoPlantillaCheque["alineacion"];
  ESTADO: CampoPlantillaCheque["estado"];
}

interface OracleErrorConCodigo extends Error {
  code?: string;
}

function mapPlantilla(
  row: OraclePlantillaChequeRow
): PlantillaCheque {
  return {
    plantillaId: row.PLANTILLA_ID,

    bancoId: row.BANCO_ID,
    codigoBanco: row.CODIGO_BANCO,
    bancoNombre: row.BANCO_NOMBRE,

    tipoCuentaId: row.TIPO_CUENTA_ID,
    tipoCuentaCodigo:
      row.TIPO_CUENTA_CODIGO,
    tipoCuentaNombre:
      row.TIPO_CUENTA_NOMBRE,

    nombre: row.NOMBRE,
    tamanoPapel: row.TAMANO_PAPEL,
    orientacion: row.ORIENTACION,

    margenSuperiorMm:
      row.MARGEN_SUPERIOR_MM,
    margenInferiorMm:
      row.MARGEN_INFERIOR_MM,
    margenIzquierdoMm:
      row.MARGEN_IZQUIERDO_MM,
    margenDerechoMm:
      row.MARGEN_DERECHO_MM,

    archivoFondoId:
      row.ARCHIVO_FONDO_ID,

    estado: row.ESTADO,
  };
}

function mapCampo(
  row: OracleCampoPlantillaChequeRow
): CampoPlantillaCheque {
  return {
    campoPlantillaId:
      row.CAMPO_PLANTILLA_ID,

    plantillaId:
      row.PLANTILLA_ID,

    codigoCampo:
      row.CODIGO_CAMPO,

    posicionXMm:
      row.POSICION_X_MM,

    posicionYMm:
      row.POSICION_Y_MM,

    anchoMm:
      row.ANCHO_MM,

    altoMm:
      row.ALTO_MM,

    tamanoFuente:
      row.TAMANO_FUENTE,

    alineacion:
      row.ALINEACION,

    estado:
      row.ESTADO,
  };
}

/**
 * En nuestro entorno node-oracledb 7.0.1,
 * algunos REF CURSOR consumidos pueden lanzar
 * NJS-018 al intentar cerrarlos.
 *
 * Solo se ignora ese error durante la limpieza.
 */
async function cerrarCursor<T>(
  resultSet: oracledb.ResultSet<T>
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

async function leerCursorPlantillas(
  resultSet:
    oracledb.ResultSet<OraclePlantillaChequeRow>
): Promise<PlantillaCheque[]> {
  try {
    const rows =
      await resultSet.getRows();

    return rows.map(mapPlantilla);
  } finally {
    await cerrarCursor(resultSet);
  }
}

async function leerCursorCampos(
  resultSet:
    oracledb.ResultSet<OracleCampoPlantillaChequeRow>
): Promise<CampoPlantillaCheque[]> {
  try {
    const rows =
      await resultSet.getRows();

    return rows.map(mapCampo);
  } finally {
    await cerrarCursor(resultSet);
  }
}

export class PlantillasChequeRepository {
  /**
   * LISTAR
   */
  async listar(): Promise<PlantillaCheque[]> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_PLANTILLAS_CHEQUE.LISTAR(
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
            oracledb.ResultSet<OraclePlantillaChequeRow>;
        };

      return await leerCursorPlantillas(
        outBinds.p_resultado
      );
    } finally {
      await connection.close();
    }
  }

  /**
   * LISTAR_POR_BANCO
   */
  async listarPorBanco(
    bancoId: number
  ): Promise<PlantillaCheque[]> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_PLANTILLAS_CHEQUE.LISTAR_POR_BANCO(
              p_banco_id  => :p_banco_id,
              p_resultado => :p_resultado
            );
          END;
          `,
          {
            p_banco_id:
              bancoId,

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
            oracledb.ResultSet<OraclePlantillaChequeRow>;
        };

      return await leerCursorPlantillas(
        outBinds.p_resultado
      );
    } finally {
      await connection.close();
    }
  }

  /**
   * OBTENER
   */
  async obtener(
    plantillaId: number
  ): Promise<PlantillaCheque> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_PLANTILLAS_CHEQUE.OBTENER(
              p_plantilla_id => :p_plantilla_id,
              p_resultado    => :p_resultado
            );
          END;
          `,
          {
            p_plantilla_id:
              plantillaId,

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
            oracledb.ResultSet<OraclePlantillaChequeRow>;
        };

      const registros =
        await leerCursorPlantillas(
          outBinds.p_resultado
        );

      const plantilla =
        registros[0];

      if (!plantilla) {
        throw new Error(
          `No se recibió información para la plantilla ${plantillaId}.`
        );
      }

      return plantilla;
    } finally {
      await connection.close();
    }
  }

  /**
   * CREAR
   */
  async crear(
    input: CrearPlantillaChequeInput
  ): Promise<number> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_PLANTILLAS_CHEQUE.CREAR(
              p_banco_id
                => :p_banco_id,

              p_tipo_cuenta_id
                => :p_tipo_cuenta_id,

              p_nombre
                => :p_nombre,

              p_tamano_papel
                => :p_tamano_papel,

              p_orientacion
                => :p_orientacion,

              p_margen_superior_mm
                => :p_margen_superior_mm,

              p_margen_inferior_mm
                => :p_margen_inferior_mm,

              p_margen_izquierdo_mm
                => :p_margen_izquierdo_mm,

              p_margen_derecho_mm
                => :p_margen_derecho_mm,

              p_archivo_fondo_id
                => :p_archivo_fondo_id,

              p_estado
                => :p_estado,

              p_plantilla_id
                => :p_plantilla_id
            );
          END;
          `,
          {
            p_banco_id:
              input.bancoId,

            p_tipo_cuenta_id:
              input.tipoCuentaId ?? null,

            p_nombre:
              input.nombre,

            p_tamano_papel:
              input.tamanoPapel,

            p_orientacion:
              input.orientacion,

            p_margen_superior_mm:
              input.margenSuperiorMm,

            p_margen_inferior_mm:
              input.margenInferiorMm,

            p_margen_izquierdo_mm:
              input.margenIzquierdoMm,

            p_margen_derecho_mm:
              input.margenDerechoMm,

            p_archivo_fondo_id:
              input.archivoFondoId ?? null,

            p_estado:
              input.estado,

            p_plantilla_id: {
              dir: oracledb.BIND_OUT,
              type: oracledb.NUMBER,
            },
          }
        );

      const outBinds =
        result.outBinds as {
          p_plantilla_id: number;
        };

      await connection.commit();

      return outBinds.p_plantilla_id;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /**
   * ACTUALIZAR
   */
  async actualizar(
    plantillaId: number,
    input: ActualizarPlantillaChequeInput
  ): Promise<void> {
    const connection =
      await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_PLANTILLAS_CHEQUE.ACTUALIZAR(
            p_plantilla_id
              => :p_plantilla_id,

            p_banco_id
              => :p_banco_id,

            p_tipo_cuenta_id
              => :p_tipo_cuenta_id,

            p_nombre
              => :p_nombre,

            p_tamano_papel
              => :p_tamano_papel,

            p_orientacion
              => :p_orientacion,

            p_margen_superior_mm
              => :p_margen_superior_mm,

            p_margen_inferior_mm
              => :p_margen_inferior_mm,

            p_margen_izquierdo_mm
              => :p_margen_izquierdo_mm,

            p_margen_derecho_mm
              => :p_margen_derecho_mm,

            p_archivo_fondo_id
              => :p_archivo_fondo_id
          );
        END;
        `,
        {
          p_plantilla_id:
            plantillaId,

          p_banco_id:
            input.bancoId,

          p_tipo_cuenta_id:
            input.tipoCuentaId ?? null,

          p_nombre:
            input.nombre,

          p_tamano_papel:
            input.tamanoPapel,

          p_orientacion:
            input.orientacion,

          p_margen_superior_mm:
            input.margenSuperiorMm,

          p_margen_inferior_mm:
            input.margenInferiorMm,

          p_margen_izquierdo_mm:
            input.margenIzquierdoMm,

          p_margen_derecho_mm:
            input.margenDerechoMm,

          p_archivo_fondo_id:
            input.archivoFondoId ?? null,
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
   * CAMBIAR_ESTADO
   */
  async cambiarEstado(
    plantillaId: number,
    estado: EstadoPlantillaCheque
  ): Promise<void> {
    const connection =
      await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_PLANTILLAS_CHEQUE.CAMBIAR_ESTADO(
            p_plantilla_id => :p_plantilla_id,
            p_estado       => :p_estado
          );
        END;
        `,
        {
          p_plantilla_id:
            plantillaId,

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
   * DESACTIVAR
   *
   * Eliminación lógica.
   */
  async desactivar(
    plantillaId: number
  ): Promise<void> {
    const connection =
      await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_PLANTILLAS_CHEQUE.DESACTIVAR(
            p_plantilla_id => :p_plantilla_id
          );
        END;
        `,
        {
          p_plantilla_id:
            plantillaId,
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
   * LISTAR_CAMPOS
   */
  async listarCampos(
    plantillaId: number
  ): Promise<CampoPlantillaCheque[]> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_PLANTILLAS_CHEQUE.LISTAR_CAMPOS(
              p_plantilla_id => :p_plantilla_id,
              p_resultado    => :p_resultado
            );
          END;
          `,
          {
            p_plantilla_id:
              plantillaId,

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
            oracledb.ResultSet<OracleCampoPlantillaChequeRow>;
        };

      return await leerCursorCampos(
        outBinds.p_resultado
      );
    } finally {
      await connection.close();
    }
  }

  /**
   * CREAR_CAMPO
   */
  async crearCampo(
    plantillaId: number,
    input: CrearCampoPlantillaChequeInput
  ): Promise<number> {
    const connection =
      await getOracleConnection();

    try {
      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_PLANTILLAS_CHEQUE.CREAR_CAMPO(
              p_plantilla_id
                => :p_plantilla_id,

              p_codigo_campo
                => :p_codigo_campo,

              p_posicion_x_mm
                => :p_posicion_x_mm,

              p_posicion_y_mm
                => :p_posicion_y_mm,

              p_ancho_mm
                => :p_ancho_mm,

              p_alto_mm
                => :p_alto_mm,

              p_tamano_fuente
                => :p_tamano_fuente,

              p_alineacion
                => :p_alineacion,

              p_estado
                => :p_estado,

              p_campo_plantilla_id
                => :p_campo_plantilla_id
            );
          END;
          `,
          {
            p_plantilla_id:
              plantillaId,

            p_codigo_campo:
              input.codigoCampo,

            p_posicion_x_mm:
              input.posicionXMm,

            p_posicion_y_mm:
              input.posicionYMm,

            p_ancho_mm:
              input.anchoMm,

            p_alto_mm:
              input.altoMm,

            p_tamano_fuente:
              input.tamanoFuente,

            p_alineacion:
              input.alineacion,

            p_estado:
              input.estado,

            p_campo_plantilla_id: {
              dir: oracledb.BIND_OUT,
              type: oracledb.NUMBER,
            },
          }
        );

      const outBinds =
        result.outBinds as {
          p_campo_plantilla_id: number;
        };

      await connection.commit();

      return outBinds.p_campo_plantilla_id;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /**
   * ACTUALIZAR_CAMPO
   */
  async actualizarCampo(
    campoPlantillaId: number,
    input: ActualizarCampoPlantillaChequeInput
  ): Promise<void> {
    const connection =
      await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_PLANTILLAS_CHEQUE.ACTUALIZAR_CAMPO(
            p_campo_plantilla_id
              => :p_campo_plantilla_id,

            p_codigo_campo
              => :p_codigo_campo,

            p_posicion_x_mm
              => :p_posicion_x_mm,

            p_posicion_y_mm
              => :p_posicion_y_mm,

            p_ancho_mm
              => :p_ancho_mm,

            p_alto_mm
              => :p_alto_mm,

            p_tamano_fuente
              => :p_tamano_fuente,

            p_alineacion
              => :p_alineacion,

            p_estado
              => :p_estado
          );
        END;
        `,
        {
          p_campo_plantilla_id:
            campoPlantillaId,

          p_codigo_campo:
            input.codigoCampo,

          p_posicion_x_mm:
            input.posicionXMm,

          p_posicion_y_mm:
            input.posicionYMm,

          p_ancho_mm:
            input.anchoMm,

          p_alto_mm:
            input.altoMm,

          p_tamano_fuente:
            input.tamanoFuente,

          p_alineacion:
            input.alineacion,

          p_estado:
            input.estado,
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
   * ELIMINAR_CAMPO
   *
   * También es eliminación lógica:
   * ESTADO = INACTIVO.
   */
  async eliminarCampo(
    campoPlantillaId: number
  ): Promise<void> {
    const connection =
      await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_PLANTILLAS_CHEQUE.ELIMINAR_CAMPO(
            p_campo_plantilla_id
              => :p_campo_plantilla_id
          );
        END;
        `,
        {
          p_campo_plantilla_id:
            campoPlantillaId,
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

export const plantillasChequeRepository =
  new PlantillasChequeRepository();