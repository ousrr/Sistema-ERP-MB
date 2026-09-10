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


export class CatalogoBancario {

  constructor(
    public catalogoId: number,
    public grupo: string,
    public codigo: string,
    public nombre: string,
    public descripcion: string | null,
    public aplicaA: string | null,
    public naturaleza: NaturalezaCatalogo,
    public requiereComentario: ValorSiNo,
    public requiereEvidencia: ValorSiNo,
    public permiteReversion: ValorSiNo,
    public estado: EstadoCatalogo
  ) {}


  estaActivo():
    boolean {

    return this.estado ===
      "ACTIVO";
  }
}


export interface CrearCatalogoData {

  grupo: string;

  codigo: string;

  nombre: string;

  descripcion: string | null;

  aplicaA: string | null;

  naturaleza: NaturalezaCatalogo;

  requiereComentario:
    ValorSiNo;

  requiereEvidencia:
    ValorSiNo;

  permiteReversion:
    ValorSiNo;

  estado:
    EstadoCatalogo;
}


export interface ActualizarCatalogoData {

  nombre: string;

  descripcion: string | null;

  aplicaA: string | null;

  naturaleza: NaturalezaCatalogo;

  requiereComentario:
    ValorSiNo;

  requiereEvidencia:
    ValorSiNo;

  permiteReversion:
    ValorSiNo;
}


export interface CatalogoOpcion {

  catalogoId: number;

  codigo: string;

  nombre: string;

  descripcion: string | null;

  naturaleza:
    NaturalezaCatalogo;
}