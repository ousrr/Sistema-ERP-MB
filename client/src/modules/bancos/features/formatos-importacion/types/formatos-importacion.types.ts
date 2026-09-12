export type EstadoFormato = "ACTIVO" | "INACTIVO";

export interface FormatoImportacion {
  formatoId: number;
  bancoId: number;
  banco: string;
  nombre: string;
  version: number;
  tipoArchivo: string;
  delimitador: string | null;
  formatoFecha: string | null;
  filaEncabezado: number;
  archivoEjemploId: number | null;
  estado: EstadoFormato;
}

export type MapeoFormato = {
  mapeoId: number;
  formatoId: number;
  campoSistema: string;
  nombreColumna: string | null;
  numeroColumna: number | null;
  esObligatorio: "S" | "N";
  formatoValor: string | null;
};

export interface CrearFormatoImportacion {
  bancoId: number;
  nombre: string;
  version: number;
  tipoArchivo: string;
  delimitador: string;
  formatoFecha: string;
  filaEncabezado: number;
  archivoEjemploId: number | null;
  estado: EstadoFormato;
}

export interface CrearMapeoFormato {
  campoSistema: string;
  nombreColumna: string;
  numeroColumna: number | null;
  esObligatorio: "S" | "N";
  formatoValor: string;
}