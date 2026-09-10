import type {
  ActualizarBancoData,
  CrearBancoData
} from "../models/Banco.js";

import {
  BancoValidationError
} from "./BancoValidationError.js";


export class BancoRules {

  // =====================================================
  // NORMALIZACION
  // =====================================================

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
      .replace(/\s{2,}/g, " ");
  }


  static normalizarBicSwift(
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


  // =====================================================
  // VALIDACION
  // CODIGO / SIGLA
  // =====================================================

  static validarCodigo(
    valor: string
  ): void {

    if (!valor) {

      throw new BancoValidationError(
        "El código / sigla del banco es obligatorio."
      );
    }


    if (
      valor.length < 2 ||
      valor.length > 10
    ) {

      throw new BancoValidationError(
        "El código / sigla debe tener entre 2 y 10 caracteres."
      );
    }


    if (
      !/^[A-Z0-9]+$/.test(
        valor
      )
    ) {

      throw new BancoValidationError(
        "El código / sigla solo puede contener letras y números."
      );
    }


    if (
      !/[A-Z]/.test(
        valor
      )
    ) {

      throw new BancoValidationError(
        "El código / sigla debe contener al menos una letra."
      );
    }
  }


  // =====================================================
  // VALIDACION
  // NOMBRE
  // =====================================================

  static validarNombre(
    valor: string
  ): void {

    if (!valor) {

      throw new BancoValidationError(
        "El nombre del banco es obligatorio."
      );
    }


    if (
      valor.length < 3
    ) {

      throw new BancoValidationError(
        "El nombre del banco debe tener al menos 3 caracteres."
      );
    }


    if (
      valor.length > 100
    ) {

      throw new BancoValidationError(
        "El nombre del banco no puede superar los 100 caracteres."
      );
    }


    /*
      \p{L} acepta letras Unicode.

      Esto permite correctamente:
      Á É Í Ó Ú
      á é í ó ú
      Ñ ñ
      Ü ü

      y evita depender de listas de caracteres
      que pueden dañarse por problemas de codificación.
    */
    const formatoNombre =
      /^[\p{L}0-9 .,&'()-]+$/u;


    if (
      !formatoNombre.test(
        valor
      )
    ) {

      throw new BancoValidationError(
        "El nombre del banco contiene caracteres no permitidos."
      );
    }


    /*
      El nombre debe contener al menos una letra.
    */
    if (
      !/\p{L}/u.test(
        valor
      )
    ) {

      throw new BancoValidationError(
        "El nombre del banco debe contener letras."
      );
    }
  }


  // =====================================================
  // VALIDACION
  // BIC / SWIFT
  // =====================================================

  static validarBicSwift(
    valor: string | null
  ): void {

    /*
      BIC / SWIFT puede almacenarse como NULL.

      Si existe un valor, debe respetar
      la estructura BIC / SWIFT.
    */
    if (
      valor === null
    ) {
      return;
    }


    const formatoBic =
      /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;


    if (
      !formatoBic.test(
        valor
      )
    ) {

      throw new BancoValidationError(
        "El BIC / SWIFT debe tener un formato correcto de 8 u 11 caracteres."
      );
    }
  }


  // =====================================================
  // PREPARAR CREACION
  // =====================================================

  static prepararCreacion(
    datos: CrearBancoData
  ): CrearBancoData {

    const codigoBanco =
      this.normalizarCodigo(
        datos.codigoBanco
      );


    const nombre =
      this.normalizarNombre(
        datos.nombre
      );


    const bicSwift =
      this.normalizarBicSwift(
        datos.bicSwift
      );


    this.validarCodigo(
      codigoBanco
    );


    this.validarNombre(
      nombre
    );


    this.validarBicSwift(
      bicSwift
    );


    return {
      codigoBanco,
      nombre,
      bicSwift,

      creadoPor:
        datos.creadoPor
    };
  }


  // =====================================================
  // PREPARAR ACTUALIZACION
  // =====================================================

  static prepararActualizacion(
    datos: ActualizarBancoData
  ): ActualizarBancoData {

    const codigoBanco =
      this.normalizarCodigo(
        datos.codigoBanco
      );


    const nombre =
      this.normalizarNombre(
        datos.nombre
      );


    const bicSwift =
      this.normalizarBicSwift(
        datos.bicSwift
      );


    this.validarCodigo(
      codigoBanco
    );


    this.validarNombre(
      nombre
    );


    this.validarBicSwift(
      bicSwift
    );


    return {
      codigoBanco,
      nombre,
      bicSwift
    };
  }
}