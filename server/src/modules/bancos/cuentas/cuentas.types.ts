export type EstadoCuentaBancaria =
  | 'BORRADOR'
  | 'ACTIVA'
  | 'INACTIVA'
  | 'CERRADA';

export interface FiltrosCuentaBancaria {
  estado?: EstadoCuentaBancaria | null;
  bancoId?: number | null;
  monedaId?: number | null;
}

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
  fechaApertura: Date;

  usoPrincipal: string;

  permiteCobros: string;
  permitePagos: string;
  permiteCheques: string;
  permiteTransferencias: string;

  fechaCierre: Date | null;

  estado: EstadoCuentaBancaria;
  observaciones: string | null;

  creadoPor: number;
  creadoEn: Date;

  modificadoPor: number | null;
  modificadoEn: Date | null;
}

export type IndicadorSN = 'S' | 'N';

export type UsoPrincipalCuenta =
  | 'COBROS'
  | 'PAGOS'
  | 'AMBOS';

export interface CrearCuentaBancariaInput {
  empresaId: number;
  bancoId: number;
  monedaId: number;
  tipoCuentaId: number;
  responsableId: number;
  numeroCuenta: string;
  nombreInterno: string;
  saldoInicial: number;
  fechaApertura: Date;
  usoPrincipal: UsoPrincipalCuenta;
  permiteCobros: IndicadorSN;
  permitePagos: IndicadorSN;
  permiteCheques: IndicadorSN;
  permiteTransferencias: IndicadorSN;
  estado: EstadoCuentaBancaria;
  observaciones: string | null;
  creadoPor: number;
}

export interface ActualizarCuentaBancariaInput {
  cuentaId: number;
  empresaId: number;
  bancoId: number;
  monedaId: number;
  tipoCuentaId: number;
  responsableId: number;
  codigoCuenta: string;
  numeroCuenta: string;
  nombreInterno: string;
  saldoInicial: number;
  fechaApertura: Date;
  usoPrincipal: UsoPrincipalCuenta;
  permiteCobros: IndicadorSN;
  permitePagos: IndicadorSN;
  permiteCheques: IndicadorSN;
  permiteTransferencias: IndicadorSN;
  fechaCierre: Date | null;
  observaciones: string | null;
  modificadoPor: number;
}

export interface CambiarEstadoCuentaBancariaInput {
  cuentaId: number;
  estado: EstadoCuentaBancaria;
  modificadoPor: number;
}

export interface FiltrosCuentaBancariaActiva {
  bancoId?: number | null;
  monedaId?: number | null;
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

  estado: EstadoCuentaBancaria;
}
