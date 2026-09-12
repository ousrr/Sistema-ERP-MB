import oracledb from "oracledb";

import { getOracleConnection } from "../../../config/oracle.js";

import type {
  ActualizarCuentaProveedorInput,
  CambiarEstadoCuentaProveedorInput,
  CrearCuentaProveedorInput,
  CuentaProveedor,
  CuentaProveedorVerificada,
  FiltrosCuentaProveedor,
} from "./cuentas-proveedor.types.js";

interface CuentaProveedorRow {
  CTA_PROVEEDOR_ID: string;
  PROVEEDOR_ID: number;
  BANCO_ID: number;
  CODIGO_BANCO: string;
  BANCO_NOMBRE: string;
  TIPO_CUENTA_ID: number;
  TIPO_CUENTA_CODIGO: string;
  TIPO_CUENTA_NOMBRE: string;
  MONEDA_ID: number;
  CUENTA_ANTERIOR_ID: string | null;
  TITULAR: string;
  NUMERO_CUENTA: string;
  CARTA_SOLICITUD_DOC_ID: string;
  CONSTANCIA_BANCO_DOC_ID: string;
  REPRESENTANTE_DOC_ID: string | null;
  MOTIVO_REGISTRO: string;
  FECHA_VIGENCIA: Date | null;
  ESTADO: CuentaProveedor["estado"];
  OBSERVACIONES: string | null;
  SOLICITADO_POR: number;
  SOLICITADO_EN: Date;
}

interface CuentaProveedorVerificadaRow {
  CTA_PROVEEDOR_ID: string;
  PROVEEDOR_ID: number;
  BANCO_ID: number;
  CODIGO_BANCO: string;
  BANCO_NOMBRE: string;
  TIPO_CUENTA_ID: number;
  TIPO_CUENTA_CODIGO: string;
  TIPO_CUENTA_NOMBRE: string;
  MONEDA_ID: number;
  TITULAR: string;
  NUMERO_CUENTA: string;
  FECHA_VIGENCIA: Date | null;
  ESTADO: string;
}

function mapCuentaProveedor(row: CuentaProveedorRow): CuentaProveedor {
  return {
    ctaProveedorId: row.CTA_PROVEEDOR_ID,
    proveedorId: row.PROVEEDOR_ID,
    bancoId: row.BANCO_ID,
    codigoBanco: row.CODIGO_BANCO,
    bancoNombre: row.BANCO_NOMBRE,
    tipoCuentaId: row.TIPO_CUENTA_ID,
    tipoCuentaCodigo: row.TIPO_CUENTA_CODIGO,
    tipoCuentaNombre: row.TIPO_CUENTA_NOMBRE,
    monedaId: row.MONEDA_ID,
    cuentaAnteriorId: row.CUENTA_ANTERIOR_ID,
    titular: row.TITULAR,
    numeroCuenta: row.NUMERO_CUENTA,
    cartaSolicitudDocId: row.CARTA_SOLICITUD_DOC_ID,
    constanciaBancoDocId: row.CONSTANCIA_BANCO_DOC_ID,
    representanteDocId: row.REPRESENTANTE_DOC_ID,
    motivoRegistro: row.MOTIVO_REGISTRO,
    fechaVigencia: row.FECHA_VIGENCIA,
    estado: row.ESTADO,
    observaciones: row.OBSERVACIONES,
    solicitadoPor: row.SOLICITADO_POR,
    solicitadoEn: row.SOLICITADO_EN,
  };
}

function mapCuentaProveedorVerificada(
  row: CuentaProveedorVerificadaRow
): CuentaProveedorVerificada {
  return {
    ctaProveedorId: row.CTA_PROVEEDOR_ID,
    proveedorId: row.PROVEEDOR_ID,
    bancoId: row.BANCO_ID,
    codigoBanco: row.CODIGO_BANCO,
    bancoNombre: row.BANCO_NOMBRE,
    tipoCuentaId: row.TIPO_CUENTA_ID,
    tipoCuentaCodigo: row.TIPO_CUENTA_CODIGO,
    tipoCuentaNombre: row.TIPO_CUENTA_NOMBRE,
    monedaId: row.MONEDA_ID,
    titular: row.TITULAR,
    numeroCuenta: row.NUMERO_CUENTA,
    fechaVigencia: row.FECHA_VIGENCIA,
    estado: "VERIFICADA",
  };
}

function bindNumber19(value: string | null): oracledb.BindParameter {
  return {
    dir: oracledb.BIND_IN,
    type: oracledb.STRING,
    val: value,
  };
}

export class CuentaProveedorRepository {
  async listar(
    filtros: FiltrosCuentaProveedor = {}
  ): Promise<CuentaProveedor[]> {
    const connection = await getOracleConnection();
    let resultSet: oracledb.ResultSet<CuentaProveedorRow> | undefined;

    try {
      const result = await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.LISTAR_CUENTAS_PROVEEDOR(
            p_proveedor_id => :p_proveedor_id,
            p_estado       => :p_estado,
            p_banco_id     => :p_banco_id,
            p_moneda_id    => :p_moneda_id,
            p_resultado    => :p_resultado
          );
        END;
        `,
        {
          p_proveedor_id: filtros.proveedorId ?? null,
          p_estado: filtros.estado ?? null,
          p_banco_id: filtros.bancoId ?? null,
          p_moneda_id: filtros.monedaId ?? null,
          p_resultado: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR,
          },
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const outBinds = result.outBinds as {
        p_resultado: oracledb.ResultSet<CuentaProveedorRow>;
      };

      resultSet = outBinds.p_resultado;
      return (await resultSet.getRows()).map(mapCuentaProveedor);
    } finally {
      try {
        if (resultSet) await resultSet.close();
      } finally {
        await connection.close();
      }
    }
  }

  async listarVerificadas(
    proveedorId: number
  ): Promise<CuentaProveedorVerificada[]> {
    const connection = await getOracleConnection();
    let resultSet: oracledb.ResultSet<CuentaProveedorVerificadaRow> | undefined;

    try {
      const result = await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.LISTAR_CUENTAS_PROV_VERIFICADAS(
            p_proveedor_id => :p_proveedor_id,
            p_resultado    => :p_resultado
          );
        END;
        `,
        {
          p_proveedor_id: proveedorId,
          p_resultado: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR,
          },
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const outBinds = result.outBinds as {
        p_resultado: oracledb.ResultSet<CuentaProveedorVerificadaRow>;
      };

      resultSet = outBinds.p_resultado;
      return (await resultSet.getRows()).map(mapCuentaProveedorVerificada);
    } finally {
      try {
        if (resultSet) await resultSet.close();
      } finally {
        await connection.close();
      }
    }
  }

  async obtenerPorId(
    ctaProveedorId: string
  ): Promise<CuentaProveedor | null> {
    const connection = await getOracleConnection();
    let resultSet: oracledb.ResultSet<CuentaProveedorRow> | undefined;

    try {
      const result = await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.OBTENER_CUENTA_PROVEEDOR(
            p_cta_proveedor_id => :p_cta_proveedor_id,
            p_resultado        => :p_resultado
          );
        END;
        `,
        {
          p_cta_proveedor_id: bindNumber19(ctaProveedorId),
          p_resultado: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR,
          },
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const outBinds = result.outBinds as {
        p_resultado: oracledb.ResultSet<CuentaProveedorRow>;
      };

      resultSet = outBinds.p_resultado;
      const row = (await resultSet.getRows(1))[0];
      return row ? mapCuentaProveedor(row) : null;
    } finally {
      try {
        if (resultSet) await resultSet.close();
      } finally {
        await connection.close();
      }
    }
  }

  async crear(
    input: CrearCuentaProveedorInput
  ): Promise<string> {
    const connection = await getOracleConnection();

    try {
      const result = await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.CREAR_CUENTA_PROVEEDOR(
            p_proveedor_id             => :p_proveedor_id,
            p_banco_id                 => :p_banco_id,
            p_tipo_cuenta_id           => :p_tipo_cuenta_id,
            p_moneda_id                => :p_moneda_id,
            p_cuenta_anterior_id       => :p_cuenta_anterior_id,
            p_titular                  => :p_titular,
            p_numero_cuenta            => :p_numero_cuenta,
            p_carta_solicitud_doc_id   => :p_carta_solicitud_doc_id,
            p_constancia_banco_doc_id  => :p_constancia_banco_doc_id,
            p_representante_doc_id     => :p_representante_doc_id,
            p_motivo_registro          => :p_motivo_registro,
            p_fecha_vigencia           => :p_fecha_vigencia,
            p_estado                   => :p_estado,
            p_observaciones            => :p_observaciones,
            p_solicitado_por           => :p_solicitado_por,
            p_cta_proveedor_id         => :p_cta_proveedor_id
          );
        END;
        `,
        {
          p_proveedor_id: input.proveedorId,
          p_banco_id: input.bancoId,
          p_tipo_cuenta_id: input.tipoCuentaId,
          p_moneda_id: input.monedaId,
          p_cuenta_anterior_id: bindNumber19(input.cuentaAnteriorId),
          p_titular: input.titular,
          p_numero_cuenta: input.numeroCuenta,
          p_carta_solicitud_doc_id: bindNumber19(input.cartaSolicitudDocId),
          p_constancia_banco_doc_id: bindNumber19(input.constanciaBancoDocId),
          p_representante_doc_id: bindNumber19(input.representanteDocId),
          p_motivo_registro: input.motivoRegistro,
          p_fecha_vigencia: {
            dir: oracledb.BIND_IN,
            type: oracledb.DATE,
            val: input.fechaVigencia,
          },
          p_estado: input.estado,
          p_observaciones: input.observaciones,
          p_solicitado_por: input.solicitadoPor,
          p_cta_proveedor_id: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 32,
          },
        }
      );

      const outBinds = result.outBinds as
        | { p_cta_proveedor_id?: string }
        | undefined;

      const ctaProveedorId = outBinds?.p_cta_proveedor_id?.trim();

      if (!ctaProveedorId) {
        throw new Error(
          "PKG_MB_CUENTAS.CREAR_CUENTA_PROVEEDOR no devolvió un identificador válido."
        );
      }

      await connection.commit();
      return ctaProveedorId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  async actualizar(
    input: ActualizarCuentaProveedorInput
  ): Promise<void> {
    const connection = await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.ACTUALIZAR_CUENTA_PROVEEDOR(
            p_cta_proveedor_id         => :p_cta_proveedor_id,
            p_proveedor_id             => :p_proveedor_id,
            p_banco_id                 => :p_banco_id,
            p_tipo_cuenta_id           => :p_tipo_cuenta_id,
            p_moneda_id                => :p_moneda_id,
            p_cuenta_anterior_id       => :p_cuenta_anterior_id,
            p_titular                  => :p_titular,
            p_numero_cuenta            => :p_numero_cuenta,
            p_carta_solicitud_doc_id   => :p_carta_solicitud_doc_id,
            p_constancia_banco_doc_id  => :p_constancia_banco_doc_id,
            p_representante_doc_id     => :p_representante_doc_id,
            p_motivo_registro          => :p_motivo_registro,
            p_fecha_vigencia           => :p_fecha_vigencia,
            p_observaciones            => :p_observaciones
          );
        END;
        `,
        {
          p_cta_proveedor_id: bindNumber19(input.ctaProveedorId),
          p_proveedor_id: input.proveedorId,
          p_banco_id: input.bancoId,
          p_tipo_cuenta_id: input.tipoCuentaId,
          p_moneda_id: input.monedaId,
          p_cuenta_anterior_id: bindNumber19(input.cuentaAnteriorId),
          p_titular: input.titular,
          p_numero_cuenta: input.numeroCuenta,
          p_carta_solicitud_doc_id: bindNumber19(input.cartaSolicitudDocId),
          p_constancia_banco_doc_id: bindNumber19(input.constanciaBancoDocId),
          p_representante_doc_id: bindNumber19(input.representanteDocId),
          p_motivo_registro: input.motivoRegistro,
          p_fecha_vigencia: {
            dir: oracledb.BIND_IN,
            type: oracledb.DATE,
            val: input.fechaVigencia,
          },
          p_observaciones: input.observaciones,
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
    input: CambiarEstadoCuentaProveedorInput
  ): Promise<void> {
    const connection = await getOracleConnection();

    try {
      await connection.execute(
        `
        BEGIN
          PKG_MB_CUENTAS.CAMBIAR_ESTADO_CUENTA_PROVEEDOR(
            p_cta_proveedor_id => :p_cta_proveedor_id,
            p_estado           => :p_estado
          );
        END;
        `,
        {
          p_cta_proveedor_id: bindNumber19(input.ctaProveedorId),
          p_estado: input.estado,
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
