import type {
  ActualizarCatalogoData,
  CrearCatalogoData,
  EstadoCatalogo,
  NaturalezaCatalogo,
  ValorSiNo
} from "../models/CatalogoBancario.js";

import {
  CatalogoValidationError
} from "./CatalogoValidationError.js";


export class CatalogoRules {

  // =====================================================
  // LONGITUD REAL PARA ORACLE
  // =====================================================

  private static obtenerLongitudBytes(
    valor: string
  ): number {

    return Buffer.byteLength(
      valor,
      "utf8"
    );
  }


  private static superaLimiteBytes(
    valor: string,
    limite: number
  ): boolean {

    return (
      this.obtenerLongitudBytes(
        valor
      ) > limite
    );
  }


  // =====================================================
  // NORMALIZACIÓN
  // =====================================================

  static normalizarGrupo(
    valor: string | null | undefined
  ): string {

    return (valor ?? "")
      .trim()
      .toUpperCase();
  }


  static normalizarCodigo(
    valor: string | null | undefined
  ): string {

    return (valor ?? "")
      .trim()
      .toUpperCase();
  }


  static normalizarNombre(
    valor: string | null | undefined
  ): string {

    return (valor ?? "")
      .trim()
      .replace(
        /\s{2,}/g,
        " "
      );
  }


  static normalizarDescripcion(
    valor: string | null | undefined
  ): string | null {

    if (
      valor === null ||
      valor === undefined ||
      valor.trim() === ""
    ) {

      return null;
    }


    return valor.trim();
  }


  static normalizarAplicaA(
    valor: string | null | undefined
  ): string | null {

    if (
      valor === null ||
      valor === undefined ||
      valor.trim() === ""
    ) {

      return null;
    }


    return valor
      .trim()
      .toUpperCase();
  }


  static normalizarNaturaleza(
    valor: string | null | undefined
  ): NaturalezaCatalogo {

    if (
      valor === null ||
      valor === undefined ||
      valor.trim() === ""
    ) {

      return null;
    }


    const naturaleza =
      valor
        .trim()
        .toUpperCase();


    if (
      naturaleza !== "D" &&
      naturaleza !== "C"
    ) {

      throw new CatalogoValidationError(
        "La naturaleza debe ser D, C o quedar vacía."
      );
    }


    return naturaleza;
  }


  // =====================================================
  // VALIDACIONES
  // =====================================================

  static validarCatalogoId(
    catalogoId: number
  ): void {

    if (
      !Number.isInteger(
        catalogoId
      ) ||
      catalogoId <= 0
    ) {

      throw new CatalogoValidationError(
        "El ID del catálogo debe ser un número entero mayor que cero.",
        "CATALOGO_ID_INVALIDO"
      );
    }
  }


  static validarGrupo(
    grupo: string
  ): void {

    if (!grupo) {

      throw new CatalogoValidationError(
        "El grupo del catálogo es obligatorio."
      );
    }


    if (
      this.superaLimiteBytes(
        grupo,
        30
      )
    ) {

      throw new CatalogoValidationError(
        "El grupo del catálogo supera el tamaño permitido de 30 bytes."
      );
    }
  }


  static validarCodigo(
    codigo: string
  ): void {

    if (!codigo) {

      throw new CatalogoValidationError(
        "El código del catálogo es obligatorio."
      );
    }


    if (
      this.superaLimiteBytes(
        codigo,
        30
      )
    ) {

      throw new CatalogoValidationError(
        "El código del catálogo supera el tamaño permitido de 30 bytes."
      );
    }
  }


  static validarNombre(
    nombre: string
  ): void {

    if (!nombre) {

      throw new CatalogoValidationError(
        "El nombre del catálogo es obligatorio."
      );
    }


    if (
      this.superaLimiteBytes(
        nombre,
        80
      )
    ) {

      throw new CatalogoValidationError(
        "El nombre es demasiado largo para guardarse. Reduzca ligeramente el texto, especialmente si contiene tildes o caracteres especiales.",
        "CATALOGO_NOMBRE_DEMASIADO_LARGO"
      );
    }
  }


  static validarDescripcion(
    descripcion: string | null
  ): void {

    if (
      descripcion !== null &&
      this.superaLimiteBytes(
        descripcion,
        250
      )
    ) {

      throw new CatalogoValidationError(
        "La descripción es demasiado larga para guardarse. Reduzca ligeramente el texto.",
        "CATALOGO_DESCRIPCION_DEMASIADO_LARGA"
      );
    }
  }


  static validarAplicaA(
    aplicaA: string | null
  ): void {

    if (
      aplicaA !== null &&
      this.superaLimiteBytes(
        aplicaA,
        30
      )
    ) {

      throw new CatalogoValidationError(
        "El campo aplica a supera el tamaño permitido de 30 bytes."
      );
    }
  }


  static validarNaturaleza(
    grupo: string,
    naturaleza: NaturalezaCatalogo
  ): void {

    if (
      grupo === "TIPO_MOVIMIENTO" &&
      naturaleza === null
    ) {

      throw new CatalogoValidationError(
        "La naturaleza es obligatoria para el grupo TIPO_MOVIMIENTO.",
        "CATALOGO_NATURALEZA_REQUERIDA"
      );
    }
  }


  static validarValorSiNo(
    valor: ValorSiNo,
    campo: string
  ): void {

    if (
      valor !== "S" &&
      valor !== "N"
    ) {

      throw new CatalogoValidationError(
        `El campo ${campo} debe contener S o N.`
      );
    }
  }


  static validarEstado(
    estado: EstadoCatalogo
  ): void {

    if (
      estado !== "ACTIVO" &&
      estado !== "INACTIVO"
    ) {

      throw new CatalogoValidationError(
        "El estado debe ser ACTIVO o INACTIVO.",
        "CATALOGO_ESTADO_INVALIDO"
      );
    }
  }


  // =====================================================
  // PREPARAR CREACIÓN
  // =====================================================

  static prepararCreacion(
    datos: CrearCatalogoData
  ): CrearCatalogoData {

    const grupo =
      this.normalizarGrupo(
        datos.grupo
      );


    const codigo =
      this.normalizarCodigo(
        datos.codigo
      );


    const nombre =
      this.normalizarNombre(
        datos.nombre
      );


    const descripcion =
      this.normalizarDescripcion(
        datos.descripcion
      );


    const aplicaA =
      this.normalizarAplicaA(
        datos.aplicaA
      );


    const naturaleza =
      this.normalizarNaturaleza(
        datos.naturaleza
      );


    this.validarGrupo(
      grupo
    );


    this.validarCodigo(
      codigo
    );


    this.validarNombre(
      nombre
    );


    this.validarDescripcion(
      descripcion
    );


    this.validarAplicaA(
      aplicaA
    );


    this.validarNaturaleza(
      grupo,
      naturaleza
    );


    this.validarValorSiNo(
      datos.requiereComentario,
      "requiereComentario"
    );


    this.validarValorSiNo(
      datos.requiereEvidencia,
      "requiereEvidencia"
    );


    this.validarValorSiNo(
      datos.permiteReversion,
      "permiteReversion"
    );


    this.validarEstado(
      datos.estado
    );


    return {
      grupo,
      codigo,
      nombre,
      descripcion,
      aplicaA,
      naturaleza,

      requiereComentario:
        datos.requiereComentario,

      requiereEvidencia:
        datos.requiereEvidencia,

      permiteReversion:
        datos.permiteReversion,

      estado:
        datos.estado
    };
  }


  // =====================================================
  // PREPARAR ACTUALIZACIÓN
  // =====================================================

  static prepararActualizacion(
    grupoActual: string,
    datos: ActualizarCatalogoData
  ): ActualizarCatalogoData {

    const grupo =
      this.normalizarGrupo(
        grupoActual
      );


    const nombre =
      this.normalizarNombre(
        datos.nombre
      );


    const descripcion =
      this.normalizarDescripcion(
        datos.descripcion
      );


    const aplicaA =
      this.normalizarAplicaA(
        datos.aplicaA
      );


    const naturaleza =
      this.normalizarNaturaleza(
        datos.naturaleza
      );


    this.validarGrupo(
      grupo
    );


    this.validarNombre(
      nombre
    );


    this.validarDescripcion(
      descripcion
    );


    this.validarAplicaA(
      aplicaA
    );


    this.validarNaturaleza(
      grupo,
      naturaleza
    );


    this.validarValorSiNo(
      datos.requiereComentario,
      "requiereComentario"
    );


    this.validarValorSiNo(
      datos.requiereEvidencia,
      "requiereEvidencia"
    );


    this.validarValorSiNo(
      datos.permiteReversion,
      "permiteReversion"
    );


    return {
      nombre,
      descripcion,
      aplicaA,
      naturaleza,

      requiereComentario:
        datos.requiereComentario,

      requiereEvidencia:
        datos.requiereEvidencia,

      permiteReversion:
        datos.permiteReversion
    };
  }
}