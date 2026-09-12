export type EstadoCuentaProveedor =
  | "PENDIENTE"
  | "EN_REVISION"
  | "VERIFICADA"
  | "RECHAZADA"
  | "BLOQUEADA"
  | "INACTIVA";

export interface FiltrosCuentaProveedor {
  proveedorId?: number | null;
  estado?: EstadoCuentaProveedor | null;
  bancoId?: number | null;
  monedaId?: number | null;
}

export interface CuentaProveedor {
  ctaProveedorId: string;
  proveedorId: number;
  bancoId: number;
  codigoBanco: string;
  bancoNombre: string;
  tipoCuentaId: number;
  tipoCuentaCodigo: string;
  tipoCuentaNombre: string;
  monedaId: number;
  cuentaAnteriorId: string | null;
  titular: string;
  numeroCuenta: string;
  cartaSolicitudDocId: string;
  constanciaBancoDocId: string;
  representanteDocId: string | null;
  motivoRegistro: string;
  fechaVigencia: Date | null;
  estado: EstadoCuentaProveedor;
  observaciones: string | null;
  solicitadoPor: number;
  solicitadoEn: Date;
}

export interface CrearCuentaProveedorInput {
  proveedorId: number;
  bancoId: number;
  tipoCuentaId: number;
  monedaId: number;
  cuentaAnteriorId: string | null;
  titular: string;
  numeroCuenta: string;
  cartaSolicitudDocId: string;
  constanciaBancoDocId: string;
  representanteDocId: string | null;
  motivoRegistro: string;
  fechaVigencia: Date | null;
  estado: EstadoCuentaProveedor;
  observaciones: string | null;
  solicitadoPor: number;
}

export interface ActualizarCuentaProveedorInput {
  ctaProveedorId: string;
  proveedorId: number;
  bancoId: number;
  tipoCuentaId: number;
  monedaId: number;
  cuentaAnteriorId: string | null;
  titular: string;
  numeroCuenta: string;
  cartaSolicitudDocId: string;
  constanciaBancoDocId: string;
  representanteDocId: string | null;
  motivoRegistro: string;
  fechaVigencia: Date | null;
  observaciones: string | null;
}

export interface CambiarEstadoCuentaProveedorInput {
  ctaProveedorId: string;
  estado: EstadoCuentaProveedor;
}

export interface CuentaProveedorVerificada {
  ctaProveedorId: string;
  proveedorId: number;
  bancoId: number;
  codigoBanco: string;
  bancoNombre: string;
  tipoCuentaId: number;
  tipoCuentaCodigo: string;
  tipoCuentaNombre: string;
  monedaId: number;
  titular: string;
  numeroCuenta: string;
  fechaVigencia: Date | null;
  estado: "VERIFICADA";
}
