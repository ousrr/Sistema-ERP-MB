export type EstadoCuentaBancaria =
  | "BORRADOR"
  | "ACTIVA"
  | "INACTIVA"
  | "CERRADA";


export type UsoPrincipalCuenta =
  | "COBROS"
  | "PAGOS"
  | "AMBOS";


export type IndicadorSN =
  | "S"
  | "N";


export interface CuentaBancaria {
  cuentaId: number;

  empresaId: number;

  bancoId: number;
  codigoBanco: string;
  bancoNombre: string;

  monedaId: number;

  tipoCuentaId: number;
  tipoCuentaCodigo: string;
  tipoCuentaNombre: string;

  responsableId: number;

  codigoCuenta: string;
  numeroCuenta: string;
  nombreInterno: string;

  saldoInicial: number;

  fechaApertura: string;

  usoPrincipal: UsoPrincipalCuenta;

  permiteCobros: IndicadorSN;
  permitePagos: IndicadorSN;
  permiteCheques: IndicadorSN;
  permiteTransferencias: IndicadorSN;

  fechaCierre: string | null;

  estado: EstadoCuentaBancaria;

  observaciones: string | null;

  creadoPor: number;
  creadoEn: string;

  modificadoPor: number | null;
  modificadoEn: string | null;
}


export interface CuentaBancariaActiva {
  cuentaId: number;

  bancoId: number;
  codigoBanco: string;
  bancoNombre: string;

  monedaId: number;

  tipoCuentaId: number;
  tipoCuentaCodigo: string;
  tipoCuentaNombre: string;

  codigoCuenta: string;
  numeroCuenta: string;
  nombreInterno: string;

  usoPrincipal: UsoPrincipalCuenta;

  permiteCobros: IndicadorSN;
  permitePagos: IndicadorSN;
  permiteCheques: IndicadorSN;
  permiteTransferencias: IndicadorSN;

  estado: "ACTIVA";
}


export interface FiltrosCuentaBancaria {
  estado?: EstadoCuentaBancaria | null;
  bancoId?: number | null;
  monedaId?: number | null;
}


export interface FiltrosCuentaBancariaActiva {
  bancoId?: number | null;
  monedaId?: number | null;
}


export interface CrearCuentaBancariaInput {
  empresaId: number;

  bancoId: number;
  monedaId: number;
  tipoCuentaId: number;
  responsableId: number;

  numeroCuenta: string;
  nombreInterno: string;

  saldoInicial: number;

  fechaApertura: string;

  usoPrincipal: UsoPrincipalCuenta;

  permiteCobros: IndicadorSN;
  permitePagos: IndicadorSN;
  permiteCheques: IndicadorSN;
  permiteTransferencias: IndicadorSN;

  estado: EstadoCuentaBancaria;

  observaciones: string | null;

}


export interface ActualizarCuentaBancariaInput {
  empresaId: number;

  bancoId: number;
  monedaId: number;
  tipoCuentaId: number;
  responsableId: number;

  codigoCuenta: string;
  numeroCuenta: string;
  nombreInterno: string;

  saldoInicial: number;

  fechaApertura: string;

  usoPrincipal: UsoPrincipalCuenta;

  permiteCobros: IndicadorSN;
  permitePagos: IndicadorSN;
  permiteCheques: IndicadorSN;
  permiteTransferencias: IndicadorSN;

  fechaCierre: string | null;

  observaciones: string | null;

}


export interface CambiarEstadoCuentaBancariaInput {
  estado: EstadoCuentaBancaria;
}


export interface ApiDataResponse<T> {
  ok: true;
  data: T;
}


export interface ApiMessageResponse {
  ok: true;
  message: string;
}


export interface ApiErrorResponse {
  ok: false;
  message: string;
}