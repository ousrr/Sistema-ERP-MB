export type EstadoCatalogo =
  | "ACTIVO"
  | "INACTIVO";


export type NaturalezaCatalogo =
  | "D"
  | "C"
  | null;


export type ValorSiNo =
  | "S"
  | "N";


// =====================================================
// RESPUESTA COMPLETA DEL BACKEND
// =====================================================

export interface CatalogoResponse {

  catalogoId: number;

  grupo: string;

  codigo: string;

  nombre: string;

  descripcion: string | null;

  aplicaA: string | null;

  naturaleza: NaturalezaCatalogo;

  requiereComentario: ValorSiNo;

  requiereEvidencia: ValorSiNo;

  permiteReversion: ValorSiNo;

  estado: EstadoCatalogo;
}


// =====================================================
// OPCIÓN PARA SELECTORES REUTILIZABLES
// =====================================================

export interface CatalogoOpcionResponse {

  catalogoId: number;

  codigo: string;

  nombre: string;

  descripcion: string | null;

  naturaleza: NaturalezaCatalogo;
}


// =====================================================
// DATOS DEL FORMULARIO
// =====================================================

export interface CatalogoFormData {

  grupo: string;

  codigo: string;

  nombre: string;

  descripcion: string;

  aplicaA: string;

  naturaleza: NaturalezaCatalogo;

  requiereComentario: ValorSiNo;

  requiereEvidencia: ValorSiNo;

  permiteReversion: ValorSiNo;
}


// =====================================================
// CREAR
//
// catalogoId NO se envía.
// Oracle lo genera automáticamente.
// =====================================================

export interface CrearCatalogoRequest {

  grupo: string;

  codigo: string;

  nombre: string;

  descripcion: string | null;

  aplicaA: string | null;

  naturaleza: NaturalezaCatalogo;

  requiereComentario: ValorSiNo;

  requiereEvidencia: ValorSiNo;

  permiteReversion: ValorSiNo;

  estado?: EstadoCatalogo;
}


export interface CrearCatalogoResponse {

  message: string;

  catalogoId: number;
}


// =====================================================
// ACTUALIZAR
//
// grupo y codigo no se modifican.
// estado tiene su propia operación.
// =====================================================

export interface ActualizarCatalogoRequest {

  nombre: string;

  descripcion: string | null;

  aplicaA: string | null;

  naturaleza: NaturalezaCatalogo;

  requiereComentario: ValorSiNo;

  requiereEvidencia: ValorSiNo;

  permiteReversion: ValorSiNo;
}


// =====================================================
// CAMBIAR ESTADO
// =====================================================

export interface CambiarEstadoCatalogoRequest {

  estado: EstadoCatalogo;
}


export interface MensajeResponse {

  message: string;
}