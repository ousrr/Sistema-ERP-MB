export type EstadoPlantillaCheque =
  | "ACTIVA"
  | "INACTIVA";

export type OrientacionPlantillaCheque =
  | "HORIZONTAL"
  | "VERTICAL";

export type CodigoCampoCheque =
  | "FECHA"
  | "BENEFICIARIO"
  | "MONTO_NUM"
  | "MONTO_LETRAS"
  | "CONCEPTO";

export type AlineacionCampoCheque =
  | "IZQUIERDA"
  | "CENTRO"
  | "DERECHA";

export type EstadoCampoCheque =
  | "ACTIVO"
  | "INACTIVO";


export interface PlantillaCheque {
  plantillaId: number;

  bancoId: number;
  codigoBanco: string;
  bancoNombre: string;

  tipoCuentaId: number | null;
  tipoCuentaCodigo: string | null;
  tipoCuentaNombre: string | null;

  nombre: string;

  tamanoPapel: string;

  orientacion:
    OrientacionPlantillaCheque;

  margenSuperiorMm: number;
  margenInferiorMm: number;
  margenIzquierdoMm: number;
  margenDerechoMm: number;

  archivoFondoId: number | null;

  estado:
    EstadoPlantillaCheque;
}


export interface CrearPlantillaChequeInput {
  bancoId: number;

  tipoCuentaId?:
    | number
    | null;

  nombre: string;

  tamanoPapel: string;

  orientacion:
    OrientacionPlantillaCheque;

  margenSuperiorMm: number;
  margenInferiorMm: number;
  margenIzquierdoMm: number;
  margenDerechoMm: number;

  archivoFondoId?:
    | number
    | null;

  estado:
    EstadoPlantillaCheque;
}


export interface ActualizarPlantillaChequeInput {
  bancoId: number;

  tipoCuentaId?:
    | number
    | null;

  nombre: string;

  tamanoPapel: string;

  orientacion:
    OrientacionPlantillaCheque;

  margenSuperiorMm: number;
  margenInferiorMm: number;
  margenIzquierdoMm: number;
  margenDerechoMm: number;

  archivoFondoId?:
    | number
    | null;
}


export interface CambiarEstadoPlantillaChequeInput {
  estado:
    EstadoPlantillaCheque;
}


export interface CampoPlantillaCheque {
  campoPlantillaId: number;

  plantillaId: number;

  codigoCampo:
    CodigoCampoCheque;

  posicionXMm: number;
  posicionYMm: number;

  anchoMm: number;
  altoMm: number;

  tamanoFuente: number;

  alineacion:
    AlineacionCampoCheque;

  estado:
    EstadoCampoCheque;
}


export interface CrearCampoPlantillaChequeInput {
  codigoCampo:
    CodigoCampoCheque;

  posicionXMm: number;
  posicionYMm: number;

  anchoMm: number;
  altoMm: number;

  tamanoFuente: number;

  alineacion:
    AlineacionCampoCheque;

  estado:
    EstadoCampoCheque;
}


export interface ActualizarCampoPlantillaChequeInput {
  codigoCampo:
    CodigoCampoCheque;

  posicionXMm: number;
  posicionYMm: number;

  anchoMm: number;
  altoMm: number;

  tamanoFuente: number;

  alineacion:
    AlineacionCampoCheque;

  estado:
    EstadoCampoCheque;
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