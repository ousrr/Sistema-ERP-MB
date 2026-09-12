export type EstadoChequera =
  | "BORRADOR"
  | "ACTIVA"
  | "AGOTADA"
  | "INACTIVA";

export interface Chequera {
  chequeraId: number;
  cuentaId: number;

  codigoCuenta: string;
  numeroCuenta: string;
  nombreInterno: string;

  bancoId: number;
  codigoBanco: string;
  bancoNombre: string;

  serie: string | null;
  numeroInicial: number;
  numeroFinal: number;

  /*
   * El backend maneja Date internamente,
   * pero al viajar por JSON llega al frontend
   * como texto ISO.
   */
  fechaRecepcion: string;

  custodioId: number;
  ubicacionFisica: string | null;
  documentoRecepcionId: number | null;

  estado: EstadoChequera;

  observaciones: string | null;
}

export interface CrearChequeraInput {
  cuentaId: number;
  serie?: string | null;

  numeroInicial: number;
  numeroFinal: number;

  fechaRecepcion: string;

  custodioId: number;

  ubicacionFisica?: string | null;
  documentoRecepcionId?: number | null;

  estado: EstadoChequera;

  observaciones?: string | null;
}

export interface ActualizarChequeraInput {
  cuentaId: number;
  serie?: string | null;

  numeroInicial: number;
  numeroFinal: number;

  fechaRecepcion: string;

  custodioId: number;

  ubicacionFisica?: string | null;
  documentoRecepcionId?: number | null;

  observaciones?: string | null;
}

export interface CambiarEstadoChequeraInput {
  estado: EstadoChequera;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  ok: false;
  message: string;
}