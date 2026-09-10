import type {
  CatalogoFormData,
  CatalogoResponse,
  NaturalezaCatalogo,
  ValorSiNo
} from "../types/CatalogoBancario";


export type CatalogoFormErrors =
  Partial<
    Record<
      keyof CatalogoFormData,
      string
    >
  >;


export class CatalogoFieldRules {

  // =====================================================
  // IDENTIFICADORES INTERNOS
  // =====================================================

  private static normalizarIdentificador(
    valor: string,
    maxLength: number
  ): string {

    return valor
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^A-Z0-9]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      )
      .replace(
        /_{2,}/g,
        "_"
      )
      .slice(
        0,
        maxLength
      );
  }


  static normalizarGrupo(
    valor: string
  ): string {

    return this.normalizarIdentificador(
      valor,
      30
    );
  }


  static normalizarCodigo(
    valor: string
  ): string {

    return this.normalizarIdentificador(
      valor,
      30
    );
  }


  static normalizarAplicaA(
    valor: string
  ): string {

    return this.normalizarIdentificador(
      valor,
      30
    );
  }


  // =====================================================
  // UBICACIÓN TÉCNICA DEL CATÁLOGO
  //
  // El usuario NO debe escribir este valor.
  // Se determina automáticamente a partir del grupo.
  // =====================================================

  static obtenerAplicaA(
    grupo: string,
    valorActual = ""
  ): string {

    const normalizado =
      this.normalizarGrupo(
        grupo
      );


    switch (
      normalizado
    ) {

      case "TIPO_CUENTA":

        return "CUENTA_BANCARIA";


      case "TIPO_OPERACION":

        return "OPERACION_BANCARIA";


      case "TIPO_MOVIMIENTO":

        return "MOVIMIENTO_BANCARIO";


      case "TIPO_DOCUMENTO":

        return "DOCUMENTO_BANCARIO";


      case "MEDIO_PAGO":

        return "PAGO_BANCARIO";


      default:

        /*
          Para futuros grupos genéricos no conocidos,
          conservamos el valor existente si lo hubiera.
        */
        return this.normalizarAplicaA(
          valorActual
        );
    }
  }


  // =====================================================
  // TEXTO VISIBLE
  // =====================================================

  static normalizarNombre(
    valor: string
  ): string {

    return valor
      .replace(
        /^\s+/,
        ""
      )
      .replace(
        /\s{2,}/g,
        " "
      )
      .slice(
        0,
        80
      );
  }


  static normalizarDescripcion(
    valor: string
  ): string {

    return valor
      .replace(
        /^\s+/,
        ""
      )
      .replace(
        /\s{2,}/g,
        " "
      )
      .slice(
        0,
        250
      );
  }


  // =====================================================
  // VALIDACIONES BÁSICAS
  // =====================================================

  static validarGrupo(
    valor: string
  ): string | undefined {

    const limpio =
      valor.trim();


    if (!limpio) {

      return "El grupo es obligatorio.";
    }


    if (
      limpio.length > 30
    ) {

      return "El grupo no puede superar los 30 caracteres.";
    }


    if (
      !/^[A-Z0-9_]+$/.test(
        limpio
      )
    ) {

      return "El grupo contiene un formato interno no válido.";
    }


    return undefined;
  }


  static validarCodigo(
    valor: string
  ): string | undefined {

    const limpio =
      valor.trim();


    if (!limpio) {

      return "El código es obligatorio.";
    }


    if (
      limpio.length > 30
    ) {

      return "El código no puede superar los 30 caracteres.";
    }


    if (
      !/^[A-Z0-9_]+$/.test(
        limpio
      )
    ) {

      return "El código debe usar letras, números y guion bajo.";
    }


    return undefined;
  }


  static validarNombre(
    valor: string
  ): string | undefined {

    const limpio =
      valor.trim();


    if (!limpio) {

      return "El nombre es obligatorio.";
    }


    if (
      limpio.length > 80
    ) {

      return "El nombre no puede superar los 80 caracteres.";
    }


    return undefined;
  }


  static validarDescripcion(
    valor: string
  ): string | undefined {

    if (
      valor.trim().length > 250
    ) {

      return "La descripción no puede superar los 250 caracteres.";
    }


    return undefined;
  }


  static validarAplicaA(
    valor: string
  ): string | undefined {

    const limpio =
      valor.trim();


    if (
      limpio.length > 30
    ) {

      return "La ubicación técnica no puede superar los 30 caracteres.";
    }


    if (
      limpio &&
      !/^[A-Z0-9_]+$/.test(
        limpio
      )
    ) {

      return "La ubicación técnica contiene un formato no válido.";
    }


    return undefined;
  }


  static validarNaturaleza(
    grupo: string,
    naturaleza:
      NaturalezaCatalogo
  ): string | undefined {

    if (
      naturaleza !== null &&
      naturaleza !== "D" &&
      naturaleza !== "C"
    ) {

      return "Seleccione Débito, Crédito o No aplica.";
    }


    if (
      this.normalizarGrupo(
        grupo
      ) ===
        "TIPO_MOVIMIENTO" &&
      naturaleza === null
    ) {

      return "Seleccione Débito o Crédito para este tipo de movimiento.";
    }


    return undefined;
  }


  static validarValorSiNo(
    valor:
      ValorSiNo,
    campo:
      string
  ): string | undefined {

    if (
      valor !== "S" &&
      valor !== "N"
    ) {

      return `${campo} debe ser Sí o No.`;
    }


    return undefined;
  }


  // =====================================================
  // VALIDACIÓN DE DUPLICADOS
  //
  // Revisa la combinación grupo + código.
  // No reemplaza la validación del backend.
  // Solo permite avisar al usuario antes de confirmar.
  // =====================================================

  static validarCodigoDuplicado(
    grupo: string,
    codigo: string,
    catalogos:
      CatalogoResponse[],
    catalogoIdExcluir?:
      number
  ): string | undefined {

    const grupoNormalizado =
      this.normalizarGrupo(
        grupo
      );


    const codigoNormalizado =
      this.normalizarCodigo(
        codigo
      );


    if (
      !grupoNormalizado ||
      !codigoNormalizado
    ) {

      return undefined;
    }


    const duplicado =
      catalogos.some(
        (
          catalogo
        ) => {

          /*
            Cuando se use esta regla durante una edición,
            se puede excluir el mismo registro.
          */
          if (
            catalogoIdExcluir !== undefined &&
            catalogo.catalogoId ===
              catalogoIdExcluir
          ) {

            return false;
          }


          const grupoExistente =
            this.normalizarGrupo(
              catalogo.grupo
            );


          const codigoExistente =
            this.normalizarCodigo(
              catalogo.codigo
            );


          return (
            grupoExistente ===
              grupoNormalizado &&
            codigoExistente ===
              codigoNormalizado
          );
        }
      );


    if (!duplicado) {

      return undefined;
    }


    return (
      `Ya existe un registro con el código ${codigoNormalizado} ` +
      "dentro de este tipo de catálogo. " +
      "Cambie el código o edite el registro existente."
    );
  }


  // =====================================================
  // VALIDACIÓN COMPLETA
  // =====================================================

  static validarFormulario(
    datos:
      CatalogoFormData
  ): CatalogoFormErrors {

    const errores:
      CatalogoFormErrors = {};


    errores.grupo =
      this.validarGrupo(
        datos.grupo
      );


    errores.codigo =
      this.validarCodigo(
        datos.codigo
      );


    errores.nombre =
      this.validarNombre(
        datos.nombre
      );


    errores.descripcion =
      this.validarDescripcion(
        datos.descripcion
      );


    errores.aplicaA =
      this.validarAplicaA(
        datos.aplicaA
      );


    errores.naturaleza =
      this.validarNaturaleza(
        datos.grupo,
        datos.naturaleza
      );


    errores.requiereComentario =
      this.validarValorSiNo(
        datos.requiereComentario,
        "Requiere comentario"
      );


    errores.requiereEvidencia =
      this.validarValorSiNo(
        datos.requiereEvidencia,
        "Requiere evidencia"
      );


    errores.permiteReversion =
      this.validarValorSiNo(
        datos.permiteReversion,
        "Permite reversión"
      );


    Object.keys(
      errores
    ).forEach(
      (
        clave
      ) => {

        const campo =
          clave as keyof CatalogoFormData;


        if (
          !errores[campo]
        ) {

          delete errores[
            campo
          ];
        }
      }
    );


    return errores;
  }


  // =====================================================
  // DATOS FINALES
  //
  // Aquí se asigna aplicaA automáticamente.
  // =====================================================

  static prepararDatos(
    datos:
      CatalogoFormData
  ): CatalogoFormData {

    const grupo =
      this.normalizarGrupo(
        datos.grupo
      );


    return {

      grupo,

      codigo:
        this.normalizarCodigo(
          datos.codigo
        ),

      nombre:
        datos.nombre
          .trim()
          .replace(
            /\s{2,}/g,
            " "
          ),

      descripcion:
        datos.descripcion
          .trim()
          .replace(
            /\s{2,}/g,
            " "
          ),

      aplicaA:
        this.obtenerAplicaA(
          grupo,
          datos.aplicaA
        ),

      naturaleza:
        datos.naturaleza,

      requiereComentario:
        datos.requiereComentario,

      requiereEvidencia:
        datos.requiereEvidencia,

      permiteReversion:
        datos.permiteReversion
    };
  }
}