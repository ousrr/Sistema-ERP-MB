import oracledb from 'oracledb';

import { getOracleConnection } from '../../../config/oracle.js';

import type {
  CuentaBancariaActiva,
  FiltrosCuentaBancariaActiva,
  ActualizarCuentaBancariaInput,
  CambiarEstadoCuentaBancariaInput,
  CuentaBancaria,
  CrearCuentaBancariaInput,
  EstadoCuentaBancaria,
  FiltrosCuentaBancaria
} from './cuentas.types.js';


interface CuentaBancariaRow {
  CUENTA_ID: number;
  EMPRESA_ID: number;

  BANCO_ID: number;
  CODIGO_BANCO: string;
  BANCO_NOMBRE: string;

  MONEDA_ID: number;

  TIPO_CUENTA_ID: number;
  TIPO_CUENTA_CODIGO: string;
  TIPO_CUENTA_NOMBRE: string;

  RESPONSABLE_ID: number;

  CODIGO_CUENTA: string;
  NUMERO_CUENTA: string;
  NOMBRE_INTERNO: string;

  SALDO_INICIAL: number;
  FECHA_APERTURA: Date;

  USO_PRINCIPAL: string;

  PERMITE_COBROS: string;
  PERMITE_PAGOS: string;
  PERMITE_CHEQUES: string;
  PERMITE_TRANSFERENCIAS: string;

  FECHA_CIERRE: Date | null;

  ESTADO: EstadoCuentaBancaria;
  OBSERVACIONES: string | null;

  CREADO_POR: number;
  CREADO_EN: Date;

  MODIFICADO_POR: number | null;
  MODIFICADO_EN: Date | null;
}

interface CuentaBancariaActivaRow {
  CUENTA_ID: number;
  BANCO_ID: number;
  CODIGO_BANCO: string;
  BANCO_NOMBRE: string;
  MONEDA_ID: number;
  TIPO_CUENTA_ID: number;
  TIPO_CUENTA_CODIGO: string;
  TIPO_CUENTA_NOMBRE: string;
  CODIGO_CUENTA: string;
  NUMERO_CUENTA: string;
  NOMBRE_INTERNO: string;
  USO_PRINCIPAL: string;
  PERMITE_COBROS: string;
  PERMITE_PAGOS: string;
  PERMITE_CHEQUES: string;
  PERMITE_TRANSFERENCIAS: string;
  ESTADO: string;
}


function mapCuentaBancaria(row: CuentaBancariaRow): CuentaBancaria {
  return {
    cuentaId: row.CUENTA_ID,
    empresaId: row.EMPRESA_ID,

    bancoId: row.BANCO_ID,
    codigoBanco: row.CODIGO_BANCO,
    bancoNombre: row.BANCO_NOMBRE,

    monedaId: row.MONEDA_ID,

    tipoCuentaId: row.TIPO_CUENTA_ID,
    tipoCuentaCodigo: row.TIPO_CUENTA_CODIGO,
    tipoCuentaNombre: row.TIPO_CUENTA_NOMBRE,

    responsableId: row.RESPONSABLE_ID,

    codigoCuenta: row.CODIGO_CUENTA,
    numeroCuenta: row.NUMERO_CUENTA,
    nombreInterno: row.NOMBRE_INTERNO,

    saldoInicial: row.SALDO_INICIAL,
    fechaApertura: row.FECHA_APERTURA,

    usoPrincipal: row.USO_PRINCIPAL,

    permiteCobros: row.PERMITE_COBROS,
    permitePagos: row.PERMITE_PAGOS,
    permiteCheques: row.PERMITE_CHEQUES,
    permiteTransferencias: row.PERMITE_TRANSFERENCIAS,

    fechaCierre: row.FECHA_CIERRE,

    estado: row.ESTADO,
    observaciones: row.OBSERVACIONES,

    creadoPor: row.CREADO_POR,
    creadoEn: row.CREADO_EN,

    modificadoPor: row.MODIFICADO_POR,
    modificadoEn: row.MODIFICADO_EN
  };
}


export class CuentaBancariaRepository {

  async listar(
    filtros: FiltrosCuentaBancaria = {}
  ): Promise<CuentaBancaria[]> {

    const connection = await getOracleConnection();

    try {
      const result = await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.LISTAR_CUENTAS(
            p_estado    => :p_estado,
            p_banco_id  => :p_banco_id,
            p_moneda_id => :p_moneda_id,
            p_resultado => :p_resultado
          );
        END;
        `,
        {
          p_estado: {
            dir: oracledb.BIND_IN,
            type: oracledb.STRING,
            val: filtros.estado ?? null
          },

          p_banco_id: {
            dir: oracledb.BIND_IN,
            type: oracledb.NUMBER,
            val: filtros.bancoId ?? null
          },

          p_moneda_id: {
            dir: oracledb.BIND_IN,
            type: oracledb.NUMBER,
            val: filtros.monedaId ?? null
          },

          p_resultado: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
          }
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT
        }
      );

      const outBinds = result.outBinds as
        | {
            p_resultado: oracledb.ResultSet<CuentaBancariaRow>;
          }
        | undefined;

      const resultSet = outBinds?.p_resultado;

      if (!resultSet) {
        throw new Error(
          'PKG_MB_CUENTAS.LISTAR_CUENTAS no devolviÃ³ un cursor.'
        );
      }

      try {
        const rows: CuentaBancariaRow[] = [];

        while (true) {
          const batch = await resultSet.getRows(100);

          if (batch.length === 0) {
            break;
          }

          rows.push(...batch);
        }

        return rows.map(mapCuentaBancaria);
      } finally {
        await resultSet.close();
      }

    } finally {
      await connection.close();
    }
  }

  async obtenerPorId(
    cuentaId: number
  ): Promise<CuentaBancaria> {

    const connection = await getOracleConnection();

    try {
      const result = await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.OBTENER_CUENTA(
            p_cuenta_id => :p_cuenta_id,
            p_resultado => :p_resultado
          );
        END;
        `,
        {
          p_cuenta_id: {
            dir: oracledb.BIND_IN,
            type: oracledb.NUMBER,
            val: cuentaId
          },

          p_resultado: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
          }
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT
        }
      );

      const outBinds = result.outBinds as
        | {
            p_resultado: oracledb.ResultSet<CuentaBancariaRow>;
          }
        | undefined;

      const resultSet = outBinds?.p_resultado;

      if (!resultSet) {
        throw new Error(
          'PKG_MB_CUENTAS.OBTENER_CUENTA no devolviÃ³ un cursor.'
        );
      }

      try {
        const rows = await resultSet.getRows(1);
        const row = rows[0];

        if (!row) {
          throw new Error(
            'PKG_MB_CUENTAS.OBTENER_CUENTA no devolviÃ³ la cuenta solicitada.'
          );
        }

        return mapCuentaBancaria(row);

      } finally {
        await resultSet.close();
      }

    } finally {
      await connection.close();
    }
  }

  async crear(
    input: CrearCuentaBancariaInput
  ): Promise<number> {

    const connection = await getOracleConnection();

    try {
      const result = await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.CREAR_CUENTA(
            p_empresa_id             => :p_empresa_id,
            p_banco_id               => :p_banco_id,
            p_moneda_id              => :p_moneda_id,
            p_tipo_cuenta_id         => :p_tipo_cuenta_id,
            p_responsable_id         => :p_responsable_id,
            p_numero_cuenta          => :p_numero_cuenta,
            p_nombre_interno         => :p_nombre_interno,
            p_saldo_inicial          => :p_saldo_inicial,
            p_fecha_apertura         => :p_fecha_apertura,
            p_uso_principal          => :p_uso_principal,
            p_permite_cobros         => :p_permite_cobros,
            p_permite_pagos          => :p_permite_pagos,
            p_permite_cheques        => :p_permite_cheques,
            p_permite_transferencias => :p_permite_transferencias,
            p_estado                 => :p_estado,
            p_observaciones          => :p_observaciones,
            p_creado_por             => :p_creado_por,
            p_cuenta_id              => :p_cuenta_id
          );
        END;
        `,
        {
          p_empresa_id: input.empresaId,
          p_banco_id: input.bancoId,
          p_moneda_id: input.monedaId,
          p_tipo_cuenta_id: input.tipoCuentaId,
          p_responsable_id: input.responsableId,
          p_numero_cuenta: input.numeroCuenta,
          p_nombre_interno: input.nombreInterno,
          p_saldo_inicial: input.saldoInicial,
          p_fecha_apertura: input.fechaApertura,
          p_uso_principal: input.usoPrincipal,
          p_permite_cobros: input.permiteCobros,
          p_permite_pagos: input.permitePagos,
          p_permite_cheques: input.permiteCheques,
          p_permite_transferencias: input.permiteTransferencias,
          p_estado: input.estado,
          p_observaciones: input.observaciones,
          p_creado_por: input.creadoPor,

          p_cuenta_id: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
          }
        }
      );

      const outBinds = result.outBinds as
        | {
            p_cuenta_id: number;
          }
        | undefined;

      const cuentaId =
        outBinds?.p_cuenta_id;

      if (
        typeof cuentaId !== 'number' ||
        !Number.isInteger(cuentaId) ||
        cuentaId <= 0
      ) {
        throw new Error(
          'PKG_MB_CUENTAS.CREAR_CUENTA no devolvió un identificador válido.'
        );
      }

      await connection.commit();

      return cuentaId;

    } catch (error) {
      await connection.rollback();
      throw error;

    } finally {
      await connection.close();
    }
  }

  async actualizar(
    input: ActualizarCuentaBancariaInput
  ): Promise<void> {
    const connection = await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.ACTUALIZAR_CUENTA(
            p_cuenta_id              => :p_cuenta_id,
            p_empresa_id             => :p_empresa_id,
            p_banco_id               => :p_banco_id,
            p_moneda_id              => :p_moneda_id,
            p_tipo_cuenta_id         => :p_tipo_cuenta_id,
            p_responsable_id         => :p_responsable_id,
            p_codigo_cuenta          => :p_codigo_cuenta,
            p_numero_cuenta          => :p_numero_cuenta,
            p_nombre_interno         => :p_nombre_interno,
            p_saldo_inicial          => :p_saldo_inicial,
            p_fecha_apertura         => :p_fecha_apertura,
            p_uso_principal          => :p_uso_principal,
            p_permite_cobros         => :p_permite_cobros,
            p_permite_pagos          => :p_permite_pagos,
            p_permite_cheques        => :p_permite_cheques,
            p_permite_transferencias => :p_permite_transferencias,
            p_fecha_cierre           => :p_fecha_cierre,
            p_observaciones          => :p_observaciones,
            p_modificado_por         => :p_modificado_por
          );
        END;
        `,
        {
          p_cuenta_id: input.cuentaId,
          p_empresa_id: input.empresaId,
          p_banco_id: input.bancoId,
          p_moneda_id: input.monedaId,
          p_tipo_cuenta_id: input.tipoCuentaId,
          p_responsable_id: input.responsableId,
          p_codigo_cuenta: input.codigoCuenta,
          p_numero_cuenta: input.numeroCuenta,
          p_nombre_interno: input.nombreInterno,
          p_saldo_inicial: input.saldoInicial,
          p_fecha_apertura: input.fechaApertura,
          p_uso_principal: input.usoPrincipal,
          p_permite_cobros: input.permiteCobros,
          p_permite_pagos: input.permitePagos,
          p_permite_cheques: input.permiteCheques,
          p_permite_transferencias: input.permiteTransferencias,
          p_fecha_cierre: {
            dir: oracledb.BIND_IN,
            type: oracledb.DATE,
            val: input.fechaCierre
          },
          p_observaciones: input.observaciones,
          p_modificado_por: input.modificadoPor
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

  async cambiarEstado(
    input: CambiarEstadoCuentaBancariaInput
  ): Promise<void> {
    const connection = await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.CAMBIAR_ESTADO_CUENTA(
            p_cuenta_id      => :p_cuenta_id,
            p_estado         => :p_estado,
            p_modificado_por => :p_modificado_por
          );
        END;
        `,
        {
          p_cuenta_id: input.cuentaId,
          p_estado: input.estado,
          p_modificado_por: input.modificadoPor
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

  async listarActivas(
    filtros: FiltrosCuentaBancariaActiva = {}
  ): Promise<CuentaBancariaActiva[]> {
    const connection = await getOracleConnection();

    let resultSet:
      | oracledb.ResultSet<CuentaBancariaActivaRow>
      | undefined;

    try {
      const result = await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.LISTAR_CUENTAS_ACTIVAS(
            p_banco_id  => :p_banco_id,
            p_moneda_id => :p_moneda_id,
            p_resultado => :p_resultado
          );
        END;
        `,
        {
          p_banco_id: filtros.bancoId ?? null,
          p_moneda_id: filtros.monedaId ?? null,

          p_resultado: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
          }
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT
        }
      );

      const outBinds = result.outBinds as {
        p_resultado: oracledb.ResultSet<CuentaBancariaActivaRow>;
      };

      resultSet = outBinds.p_resultado;

      const rows = await resultSet.getRows();

      return rows.map((row) => ({
        cuentaId: row.CUENTA_ID,

        bancoId: row.BANCO_ID,
        codigoBanco: row.CODIGO_BANCO,
        bancoNombre: row.BANCO_NOMBRE,

        monedaId: row.MONEDA_ID,

        tipoCuentaId: row.TIPO_CUENTA_ID,
        tipoCuentaCodigo: row.TIPO_CUENTA_CODIGO,
        tipoCuentaNombre: row.TIPO_CUENTA_NOMBRE,

        codigoCuenta: row.CODIGO_CUENTA,
        numeroCuenta: row.NUMERO_CUENTA,
        nombreInterno: row.NOMBRE_INTERNO,

        usoPrincipal:
          row.USO_PRINCIPAL as CuentaBancariaActiva['usoPrincipal'],

        permiteCobros:
          row.PERMITE_COBROS as CuentaBancariaActiva['permiteCobros'],

        permitePagos:
          row.PERMITE_PAGOS as CuentaBancariaActiva['permitePagos'],

        permiteCheques:
          row.PERMITE_CHEQUES as CuentaBancariaActiva['permiteCheques'],

        permiteTransferencias:
          row.PERMITE_TRANSFERENCIAS as CuentaBancariaActiva['permiteTransferencias'],

        estado:
          row.ESTADO as CuentaBancariaActiva['estado']
      }));
    } finally {
      if (resultSet) {
        await resultSet.close();
      }

      await connection.close();
    }
  }
}