export type EstadoLista =
  | "ACTIVO"
  | "INACTIVO";


export type EstadoListaFiltro =
  | "TODOS"
  | EstadoLista;


export type OrdenAlfabetico =
  | "SIN_ORDEN"
  | "AZ"
  | "ZA";


export interface ListFilterConfig<T> {

  estado:
    EstadoListaFiltro;

  orden:
    OrdenAlfabetico;

  obtenerEstado:
    (
      item:
        T
    ) => EstadoLista;

  obtenerTextoOrden:
    (
      item:
        T
    ) => string;
}


export class ListFilterRules {

  // =====================================================
  // APLICAR FILTRO + ORDEN
  //
  // Reutilizable por Bancos, Catálogos, Cuentas,
  // Chequeras y otras features del módulo Bancos.
  // =====================================================

  static aplicar<T>(
    items:
      readonly T[],

    config:
      ListFilterConfig<T>
  ): T[] {

    const filtrados =
      config.estado ===
        "TODOS"

        ? [
            ...items
          ]

        : items.filter(
            (
              item
            ) =>
              config.obtenerEstado(
                item
              ) ===
                config.estado
          );


    if (
      config.orden ===
        "SIN_ORDEN"
    ) {

      return filtrados;
    }


    const comparador =
      new Intl.Collator(
        "es",
        {
          sensitivity:
            "base",

          numeric:
            true
        }
      );


    const multiplicador =
      config.orden ===
        "AZ"
        ? 1
        : -1;


    return filtrados.sort(
      (
        itemA,
        itemB
      ) => {

        const textoA =
          config.obtenerTextoOrden(
            itemA
          );


        const textoB =
          config.obtenerTextoOrden(
            itemB
          );


        return (
          comparador.compare(
            textoA,
            textoB
          ) *
          multiplicador
        );
      }
    );
  }


  // =====================================================
  // SABER SI EL USUARIO CAMBIÓ EL FILTRO BASE
  // =====================================================

  static tieneFiltroActivo(
    estado:
      EstadoListaFiltro,

    orden:
      OrdenAlfabetico
  ): boolean {

    return (
      estado !==
        "TODOS" ||
      orden !==
        "AZ"
    );
  }
}
