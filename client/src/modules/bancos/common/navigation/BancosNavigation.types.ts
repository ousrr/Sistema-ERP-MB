export type BancosSection =
  | "bancos"
  | "catalogos";


export interface BancosBreadcrumbItem {

  key:
    string;

  label:
    string;

  target?:
    BancosSection;
}


// =====================================================
// MODELO DE NAVEGACIÓN DE PERSONA 3
//
// Se mantiene dentro del módulo Bancos.
// No modifica la navegación global del ERP.
//
// Cuando el equipo integre todas sus ramas, este modelo
// puede revisarse y promoverse a shared si corresponde.
// =====================================================

export class BancosNavigationModel {

  static obtenerBreadcrumbs(
    seccion:
      BancosSection
  ): BancosBreadcrumbItem[] {

    if (
      seccion ===
        "catalogos"
    ) {

      return [
        {
          key:
            "configuracion",

          label:
            "Configuración y auditoría"
        },

        {
          key:
            "bancos",

          label:
            "Bancos",

          target:
            "bancos"
        },

        {
          key:
            "catalogos",

          label:
            "Catálogos"
        }
      ];
    }


    return [
      {
        key:
          "configuracion",

        label:
          "Configuración y auditoría"
      },

      {
        key:
          "catalogos",

        label:
          "Catálogos",

        target:
          "catalogos"
      },

      {
        key:
          "bancos",

        label:
          "Bancos"
      }
    ];
  }


  static puedeNavegar(
    item:
      BancosBreadcrumbItem,

    seccionActual:
      BancosSection
  ): item is BancosBreadcrumbItem & {
    target:
      BancosSection;
  } {

    return (
      item.target !==
        undefined &&
      item.target !==
        seccionActual
    );
  }
}
