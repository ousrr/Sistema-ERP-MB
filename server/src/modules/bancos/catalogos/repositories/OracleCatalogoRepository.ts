import oracledb from "oracledb";

import {
  getOracleConnection
} from "../../../../config/oracle.js";

import {
  CatalogoBancario
} from "../models/CatalogoBancario.js";

import type {
  CatalogoOpcion,
  EstadoCatalogo,
  CrearCatalogoData,
  ActualizarCatalogoData
} from "../models/CatalogoBancario.js";

import type {
  ICatalogoRepository
} from "./ICatalogoRepository.js";

import {
  OracleErrorClassifier
} from "../../common/oracle/OracleErrorClassifier.js";

import {
  CatalogoConflictError
} from "../rules/CatalogoConflictError.js";

import {
  CatalogoNotFoundError
} from "../rules/CatalogoNotFoundError.js";

import {
  CatalogoValidationError
} from "../rules/CatalogoValidationError.js";


export class OracleCatalogoRepository
  implements ICatalogoRepository {


  // =====================================================
  // LISTAR
  // =====================================================

  async listar():
    Promise<CatalogoBancario[]> {

    const connection =
      await getOracleConnection();

    try {

      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_CATALOGOS.LISTAR(
              :resultado
            );
          END;
          `,
          {
            resultado: {
              dir:
                oracledb.BIND_OUT,

              type:
                oracledb.CURSOR
            }
          }
        );


      const outBinds =
        result.outBinds as {
          resultado:
            oracledb.ResultSet<any>;
        };


      const cursor =
        outBinds.resultado;


      const rows =
        await cursor.getRows(
          200
        );


      await cursor.close();


      return rows.map(
        (row: any) =>
          new CatalogoBancario(
            row[0],
            row[1],
            row[2],
            row[3],
            row[4],
            row[5],
            row[6],
            row[7],
            row[8],
            row[9],
            row[10]
          )
      );

    } finally {

      await connection.close();
    }
  }


  // =====================================================
  // OBTENER POR ID
  // =====================================================

  async obtenerPorId(
    catalogoId: number
  ): Promise<CatalogoBancario | null> {

    const connection =
      await getOracleConnection();

    try {

      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_CATALOGOS.OBTENER(
              :catalogoId,
              :resultado
            );
          END;
          `,
          {
            catalogoId,

            resultado: {
              dir:
                oracledb.BIND_OUT,

              type:
                oracledb.CURSOR
            }
          }
        );


      const outBinds =
        result.outBinds as {
          resultado:
            oracledb.ResultSet<any>;
        };


      const cursor =
        outBinds.resultado;


      const rows =
        await cursor.getRows(
          1
        );


      await cursor.close();


      if (
        rows.length === 0
      ) {
        return null;
      }


      const row: any =
        rows[0];


      return new CatalogoBancario(
        row[0],
        row[1],
        row[2],
        row[3],
        row[4],
        row[5],
        row[6],
        row[7],
        row[8],
        row[9],
        row[10]
      );

    } finally {

      await connection.close();
    }
  }


  // =====================================================
  // LISTAR POR GRUPO
  // =====================================================

  async listarPorGrupo(
    grupo: string
  ): Promise<CatalogoOpcion[]> {

    const connection =
      await getOracleConnection();

    try {

      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_CATALOGOS.LISTAR_POR_GRUPO(
              :grupo,
              :resultado
            );
          END;
          `,
          {
            grupo,

            resultado: {
              dir:
                oracledb.BIND_OUT,

              type:
                oracledb.CURSOR
            }
          }
        );


      const outBinds =
        result.outBinds as {
          resultado:
            oracledb.ResultSet<any>;
        };


      const cursor =
        outBinds.resultado;


      const rows =
        await cursor.getRows(
          200
        );


      await cursor.close();


      return rows.map(
        (row: any) => ({
          catalogoId:
            row[0],

          codigo:
            row[1],

          nombre:
            row[2],

          descripcion:
            row[3],

          naturaleza:
            row[4]
        })
      );

    } finally {

      await connection.close();
    }
  }


  // =====================================================
  // CREAR
  // =====================================================

  async crear(
    datos: CrearCatalogoData
  ): Promise<number> {

    const connection =
      await getOracleConnection();

    try {

      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_CATALOGOS.CREAR(
              :grupo,
              :codigo,
              :nombre,
              :descripcion,
              :aplicaA,
              :naturaleza,
              :requiereComentario,
              :requiereEvidencia,
              :permiteReversion,
              :estado,
              :catalogoId
            );
          END;
          `,
          {
            grupo:
              datos.grupo,

            codigo:
              datos.codigo,

            nombre:
              datos.nombre,

            descripcion:
              datos.descripcion,

            aplicaA:
              datos.aplicaA,

            naturaleza:
              datos.naturaleza,

            requiereComentario:
              datos.requiereComentario,

            requiereEvidencia:
              datos.requiereEvidencia,

            permiteReversion:
              datos.permiteReversion,

            estado:
              datos.estado,

            catalogoId: {
              dir:
                oracledb.BIND_OUT,

              type:
                oracledb.NUMBER
            }
          }
        );


      await connection.commit();


      const outBinds =
        result.outBinds as {
          catalogoId: number;
        };


      return outBinds.catalogoId;

    } catch (error) {

      await connection.rollback();


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20031
        ) ||
        OracleErrorClassifier.esRestriccionUnicaDe(
          error,
          "MB_UQ_CATALOGO_GRUPO_CODIGO"
        )
      ) {

        throw CatalogoConflictError
          .grupoCodigoDuplicado(
            datos.grupo,
            datos.codigo
          );
      }


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20033
        )
      ) {

        throw new CatalogoValidationError(
          "El estado debe ser ACTIVO o INACTIVO.",
          "CATALOGO_ESTADO_INVALIDO"
        );
      }


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20034
        )
      ) {

        throw new CatalogoValidationError(
          "Los indicadores deben ser S o N.",
          "CATALOGO_INDICADORES_INVALIDOS"
        );
      }


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20035
        )
      ) {

        throw new CatalogoValidationError(
          "La naturaleza debe ser D, C o nula.",
          "CATALOGO_NATURALEZA_INVALIDA"
        );
      }


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20036
        )
      ) {

        throw new CatalogoValidationError(
          "Los catálogos del grupo TIPO_MOVIMIENTO requieren naturaleza D o C.",
          "CATALOGO_TIPO_MOVIMIENTO_REQUIERE_NATURALEZA"
        );
      }


      throw error;

    } finally {

      await connection.close();
    }
  }


  // =====================================================
  // ACTUALIZAR
  // =====================================================

  async actualizar(
    catalogoId: number,
    datos: ActualizarCatalogoData
  ): Promise<void> {

    const connection =
      await getOracleConnection();

    try {

      await connection.execute(
        `
        BEGIN
          PKG_MB_CATALOGOS.ACTUALIZAR(
            :catalogoId,
            :nombre,
            :descripcion,
            :aplicaA,
            :naturaleza,
            :requiereComentario,
            :requiereEvidencia,
            :permiteReversion
          );
        END;
        `,
        {
          catalogoId,

          nombre:
            datos.nombre,

          descripcion:
            datos.descripcion,

          aplicaA:
            datos.aplicaA,

          naturaleza:
            datos.naturaleza,

          requiereComentario:
            datos.requiereComentario,

          requiereEvidencia:
            datos.requiereEvidencia,

          permiteReversion:
            datos.permiteReversion
        }
      );


      await connection.commit();

    } catch (error) {

      await connection.rollback();


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20032
        )
      ) {

        throw new CatalogoNotFoundError(
          catalogoId
        );
      }


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20034
        )
      ) {

        throw new CatalogoValidationError(
          "Los indicadores deben ser S o N.",
          "CATALOGO_INDICADORES_INVALIDOS"
        );
      }


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20035
        )
      ) {

        throw new CatalogoValidationError(
          "La naturaleza debe ser D, C o nula.",
          "CATALOGO_NATURALEZA_INVALIDA"
        );
      }


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20036
        )
      ) {

        throw new CatalogoValidationError(
          "Los catálogos del grupo TIPO_MOVIMIENTO requieren naturaleza D o C.",
          "CATALOGO_TIPO_MOVIMIENTO_REQUIERE_NATURALEZA"
        );
      }


      throw error;

    } finally {

      await connection.close();
    }
  }


  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  async cambiarEstado(
    catalogoId: number,
    estado: EstadoCatalogo
  ): Promise<void> {

    const connection =
      await getOracleConnection();

    try {

      await connection.execute(
        `
        BEGIN
          PKG_MB_CATALOGOS.CAMBIAR_ESTADO(
            :catalogoId,
            :estado
          );
        END;
        `,
        {
          catalogoId,
          estado
        }
      );


      await connection.commit();

    } catch (error) {

      await connection.rollback();


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20032
        )
      ) {

        throw new CatalogoNotFoundError(
          catalogoId
        );
      }


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20033
        )
      ) {

        throw new CatalogoValidationError(
          "El estado debe ser ACTIVO o INACTIVO.",
          "CATALOGO_ESTADO_INVALIDO"
        );
      }


      throw error;

    } finally {

      await connection.close();
    }
  }
}