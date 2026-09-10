import type {
  EstadoCatalogo,
  NaturalezaCatalogo
} from "../types/CatalogoBancario";


export type CatalogoGrupoIcono =
  | "cuenta"
  | "operacion"
  | "movimiento"
  | "documento"
  | "pago"
  | "generico";


export type CatalogoBadgeTone =
  | "success"
  | "danger"
  | "info"
  | "warning"
  | "neutral";


export interface CatalogoGrupoVisual {
  etiqueta: string;
  icono: CatalogoGrupoIcono;
  orden: number;
}


export interface CatalogoFormularioVisual {
  etiquetaGrupo: string;

  descripcion: string;

  ejemploCodigo: string;

  ejemploNombre: string;

  ejemploDescripcion: string;

  ejemploAplicaA: string;

  ayudaNaturaleza: string;
}


export interface CatalogoBadgeVisual {
  etiqueta: string;
  tono: CatalogoBadgeTone;
}


export class CatalogoPresentation {

  static formatearGrupo(
    grupo: string
  ): string {

    return grupo
      .toLowerCase()
      .split("_")
      .map(
        (
          palabra
        ) =>
          palabra.charAt(0).toUpperCase() +
          palabra.slice(1)
      )
      .join(" ");
  }


  static obtenerGrupoVisual(
    grupo: string
  ): CatalogoGrupoVisual {

    const normalizado =
      grupo
        .trim()
        .toUpperCase();


    switch (
      normalizado
    ) {

      case "TIPO_CUENTA":

        return {
          etiqueta:
            "Tipo de cuenta",

          icono:
            "cuenta",

          orden:
            1
        };


      case "TIPO_OPERACION":

        return {
          etiqueta:
            "Tipo de operación",

          icono:
            "operacion",

          orden:
            2
        };


      case "TIPO_MOVIMIENTO":

        return {
          etiqueta:
            "Tipo de movimiento",

          icono:
            "movimiento",

          orden:
            3
        };


      case "TIPO_DOCUMENTO":

        return {
          etiqueta:
            "Tipo de documento",

          icono:
            "documento",

          orden:
            4
        };


      case "MEDIO_PAGO":

        return {
          etiqueta:
            "Medio de pago",

          icono:
            "pago",

          orden:
            5
        };


      default:

        return {
          etiqueta:
            this.formatearGrupo(
              grupo
            ),

          icono:
            "generico",

          orden:
            999
        };
    }
  }


  static obtenerFormularioVisual(
    grupo: string
  ): CatalogoFormularioVisual {

    const normalizado =
      grupo
        .trim()
        .toUpperCase();


    switch (
      normalizado
    ) {

      case "TIPO_CUENTA":

        return {
          etiquetaGrupo:
            "tipo de cuenta",

          descripcion:
            "Registra una opción de cuenta que podrá seleccionarse posteriormente en los procesos bancarios.",

          ejemploCodigo:
            "Ej. MONETARIA",

          ejemploNombre:
            "Ej. Cuenta Monetaria",

          ejemploDescripcion:
            "Ej. Cuenta utilizada para operaciones bancarias transaccionales.",

          ejemploAplicaA:
            "Ej. CUENTA_BANCARIA",

          ayudaNaturaleza:
            "Normalmente puede dejarse en “No aplica” si este tipo de cuenta no necesita clasificarse como Débito o Crédito."
        };


      case "TIPO_OPERACION":

        return {
          etiquetaGrupo:
            "tipo de operación",

          descripcion:
            "Registra una clase de operación que podrá utilizarse en los movimientos y procesos bancarios.",

          ejemploCodigo:
            "Ej. TRANSFERENCIA",

          ejemploNombre:
            "Ej. Transferencia",

          ejemploDescripcion:
            "Ej. Operación bancaria realizada mediante transferencia.",

          ejemploAplicaA:
            "Ej. OPERACION_BANCARIA",

          ayudaNaturaleza:
            "Si esta operación no necesita clasificarse contablemente como Débito o Crédito, deje “No aplica”."
        };


      case "TIPO_MOVIMIENTO":

        return {
          etiquetaGrupo:
            "tipo de movimiento",

          descripcion:
            "Registra una clasificación para los movimientos bancarios. Este grupo sí necesita indicar su naturaleza.",

          ejemploCodigo:
            "Ej. DEBITO",

          ejemploNombre:
            "Ej. Débito",

          ejemploDescripcion:
            "Ej. Movimiento bancario clasificado como débito.",

          ejemploAplicaA:
            "Ej. MOVIMIENTO_BANCARIO",

          ayudaNaturaleza:
            "Obligatorio para los tipos de movimiento. Seleccione Débito o Crédito según la clasificación que corresponda."
        };


      case "TIPO_DOCUMENTO":

        return {
          etiquetaGrupo:
            "tipo de documento",

          descripcion:
            "Registra un documento bancario que podrá reutilizarse en diferentes operaciones del módulo.",

          ejemploCodigo:
            "Ej. NOTA_DEBITO",

          ejemploNombre:
            "Ej. Nota de Débito Bancaria",

          ejemploDescripcion:
            "Ej. Documento utilizado para registrar un débito bancario.",

          ejemploAplicaA:
            "Ej. DOCUMENTO_BANCARIO",

          ayudaNaturaleza:
            "Un documento no siempre representa directamente un Débito o Crédito. Si no corresponde, deje “No aplica”."
        };


      case "MEDIO_PAGO":

        return {
          etiquetaGrupo:
            "medio de pago",

          descripcion:
            "Registra una forma mediante la cual podrán ejecutarse los pagos bancarios.",

          ejemploCodigo:
            "Ej. CHEQUE",

          ejemploNombre:
            "Ej. Cheque",

          ejemploDescripcion:
            "Ej. Pago ejecutado mediante cheque bancario.",

          ejemploAplicaA:
            "Ej. PAGO_BANCARIO",

          ayudaNaturaleza:
            "El medio de pago normalmente no necesita naturaleza contable. Puede dejar “No aplica”."
        };


      default:

        return {
          etiquetaGrupo:
            this.formatearGrupo(
              grupo
            ).toLowerCase(),

          descripcion:
            "Registra un nuevo valor reutilizable para este grupo del catálogo bancario.",

          ejemploCodigo:
            "Ej. CODIGO",

          ejemploNombre:
            "Ej. Nombre del registro",

          ejemploDescripcion:
            "Ej. Descripción funcional del registro.",

          ejemploAplicaA:
            "Ej. PROCESO_BANCARIO",

          ayudaNaturaleza:
            "Si este valor no necesita clasificarse como Débito o Crédito, deje “No aplica”."
        };
    }
  }


  static compararGrupos(
    grupoA: string,
    grupoB: string
  ): number {

    const visualA =
      this.obtenerGrupoVisual(
        grupoA
      );


    const visualB =
      this.obtenerGrupoVisual(
        grupoB
      );


    if (
      visualA.orden !==
      visualB.orden
    ) {

      return (
        visualA.orden -
        visualB.orden
      );
    }


    return visualA.etiqueta.localeCompare(
      visualB.etiqueta,
      "es"
    );
  }


  static obtenerNaturalezaVisual(
    naturaleza:
      NaturalezaCatalogo
  ): CatalogoBadgeVisual {

    switch (
      naturaleza
    ) {

      case "D":

        return {
          etiqueta:
            "Débito",

          tono:
            "info"
        };


      case "C":

        return {
          etiqueta:
            "Crédito",

          tono:
            "warning"
        };


      default:

        return {
          etiqueta:
            "No aplica",

          tono:
            "neutral"
        };
    }
  }


  static obtenerEstadoVisual(
    estado:
      EstadoCatalogo
  ): CatalogoBadgeVisual {

    if (
      estado === "ACTIVO"
    ) {

      return {
        etiqueta:
          "Activo",

        tono:
          "success"
      };
    }


    return {
      etiqueta:
        "Inactivo",

      tono:
        "danger"
    };
  }
}