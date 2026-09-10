import oracledb from "oracledb";

import {
  getOracleConnection
} from "../../../../config/oracle.js";

import {
  Banco,
  type EstadoBanco,
  type CrearBancoData,
  type ActualizarBancoData
} from "../models/Banco.js";

import type {
  IBancoRepository
} from "./IBancoRepository.js";

import {
  BancoConflictError
} from "../rules/BancoConflictError.js";

import {
  BancoNotFoundError
} from "../rules/BancoNotFoundError.js";

import {
  OracleErrorClassifier
} from "../../common/oracle/OracleErrorClassifier.js";


export class OracleBancoRepository
  implements IBancoRepository {


  // =====================================================
  // LISTAR
  // =====================================================

  async listar():
    Promise<Banco[]> {

    const connection =
      await getOracleConnection();

    try {

      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_BANCOS.LISTAR(
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
          100
        );


      await cursor.close();


      return rows.map(
        (row: any) =>
          new Banco(
            row[0],
            row[1],
            row[2],
            row[3],
            row[4],
            row[5],
            row[6]
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
    bancoId: number
  ): Promise<Banco | null> {

    const connection =
      await getOracleConnection();

    try {

      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_BANCOS.OBTENER(
              :bancoId,
              :resultado
            );
          END;
          `,
          {
            bancoId,

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


      return new Banco(
        row[0],
        row[1],
        row[2],
        row[3],
        row[4],
        row[5],
        row[6]
      );

    } finally {

      await connection.close();
    }
  }


  // =====================================================
  // CREAR
  // =====================================================

  async crear(
    datos: CrearBancoData
  ): Promise<number> {

    const connection =
      await getOracleConnection();

    try {

      const result =
        await connection.execute(
          `
          BEGIN
            PKG_MB_BANCOS.CREAR(
              :codigoBanco,
              :nombre,
              :bicSwift,
              :creadoPor,
              :bancoId
            );
          END;
          `,
          {
            codigoBanco:
              datos.codigoBanco,

            nombre:
              datos.nombre,

            bicSwift:
              datos.bicSwift,

            creadoPor:
              datos.creadoPor,

            bancoId: {
              dir:
                oracledb.BIND_OUT,

              type:
                oracledb.NUMBER
            }
          }
        );


      const outBinds =
        result.outBinds as {
          bancoId: number;
        };


      await connection.commit();


      return outBinds.bancoId;

    } catch (error) {

      await connection.rollback();


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20023
        ) ||
        OracleErrorClassifier.esRestriccionUnicaDe(
          error,
          "MB_UQ_BANCO_CODIGO"
        )
      ) {

        throw BancoConflictError.codigoDuplicado(
          datos.codigoBanco
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
    bancoId: number,
    datos: ActualizarBancoData
  ): Promise<void> {

    const connection =
      await getOracleConnection();

    try {

      await connection.execute(
        `
        BEGIN
          PKG_MB_BANCOS.ACTUALIZAR(
            :bancoId,
            :codigoBanco,
            :nombre,
            :bicSwift
          );
        END;
        `,
        {
          bancoId,

          codigoBanco:
            datos.codigoBanco,

          nombre:
            datos.nombre,

          bicSwift:
            datos.bicSwift
        }
      );


      await connection.commit();

    } catch (error) {

      await connection.rollback();


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20021
        )
      ) {

        throw new BancoNotFoundError(
          bancoId
        );
      }


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20023
        ) ||
        OracleErrorClassifier.esRestriccionUnicaDe(
          error,
          "MB_UQ_BANCO_CODIGO"
        )
      ) {

        throw BancoConflictError.codigoDuplicado(
          datos.codigoBanco
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
    bancoId: number,
    estado: EstadoBanco
  ): Promise<void> {

    const connection =
      await getOracleConnection();

    try {

      await connection.execute(
        `
        BEGIN
          PKG_MB_BANCOS.CAMBIAR_ESTADO(
            :bancoId,
            :estado
          );
        END;
        `,
        {
          bancoId,
          estado
        }
      );


      await connection.commit();

    } catch (error) {

      await connection.rollback();


      if (
        OracleErrorClassifier.esCodigoOracle(
          error,
          20021
        )
      ) {

        throw new BancoNotFoundError(
          bancoId
        );
      }


      throw error;

    } finally {

      await connection.close();
    }
  }
}