import {
  EvaluacionCampo
} from "./EvaluacionCampo";


export class BancoFieldRules {

  // =====================================================
  // NORMALIZACIÓN
  // =====================================================

  static normalizarCodigo(
    valor: string
  ): string {

    return valor
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
  }


  static normalizarNombre(
    valor: string
  ): string {

    return valor
      .replace(
        /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,&'()-]/g,
        ""
      )
      .replace(/^\s+/, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, 100);
  }


  static normalizarBicSwift(
    valor: string
  ): string {

    return valor
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 11);
  }


  // =====================================================
  // VALIDACIÓN OBJETIVA
  // =====================================================

  static validarCodigo(
    valor: string
  ): string | undefined {

    const limpio = valor.trim();

    if (!limpio) {
      return "El código / sigla del banco es obligatorio.";
    }

    if (
      limpio.length < 2 ||
      limpio.length > 10
    ) {
      return "El código / sigla debe tener entre 2 y 10 caracteres.";
    }

    if (!/^[A-Z0-9]+$/.test(limpio)) {
      return "Use únicamente letras y números.";
    }

    if (!/[A-Z]/.test(limpio)) {
      return "El código / sigla debe contener al menos una letra.";
    }

    return undefined;
  }


  static validarNombre(
    valor: string
  ): string | undefined {

    const limpio = valor.trim();

    if (!limpio) {
      return "El nombre del banco es obligatorio.";
    }

    if (limpio.length < 3) {
      return "El nombre debe tener al menos 3 caracteres.";
    }

    if (limpio.length > 100) {
      return "El nombre no puede superar los 100 caracteres.";
    }

    if (
      !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,&'()-]+$/.test(
        limpio
      )
    ) {
      return "El nombre contiene caracteres no permitidos.";
    }

    if (
      !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(
        limpio
      )
    ) {
      return "El nombre debe contener letras.";
    }

    return undefined;
  }


  static validarBicSwift(
    valor: string,
    omitirBicSwift: boolean
  ): string | undefined {

    if (omitirBicSwift) {
      return undefined;
    }

    const limpio = valor.trim();

    if (!limpio) {
      return "Ingrese el BIC / SWIFT o marque la opción para no registrarlo.";
    }

    const formatoBic =
      /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

    if (!formatoBic.test(limpio)) {
      return "El BIC / SWIFT debe tener 8 u 11 caracteres y respetar el formato.";
    }

    return undefined;
  }


  // =====================================================
  // MÉTODOS AUXILIARES PARA DETECTAR DATOS SOSPECHOSOS
  // =====================================================

  private static obtenerSoloLetras(
    valor: string
  ): string {

    return valor
      .toUpperCase()
      .replace(
        /[^A-ZÁÉÍÓÚÜÑ]/g,
        ""
      );
  }


  private static contarCaracteresUnicos(
    valor: string
  ): number {

    return new Set(
      valor.split("")
    ).size;
  }


  private static contieneFragmentoRepetido(
    valor: string
  ): boolean {

    const limpio =
      valor
        .toUpperCase()
        .replace(
          /[^A-Z0-9]/g,
          ""
        );

    /*
      Buscamos fragmentos de 2, 3 y 4 caracteres
      que aparezcan al menos tres veces.
    */
    for (
      let tamanio = 2;
      tamanio <= 4;
      tamanio++
    ) {

      const conteos =
        new Map<string, number>();

      for (
        let i = 0;
        i <= limpio.length - tamanio;
        i++
      ) {

        const fragmento =
          limpio.substring(
            i,
            i + tamanio
          );

        const cantidad =
          (conteos.get(fragmento) ?? 0) + 1;

        conteos.set(
          fragmento,
          cantidad
        );

        if (cantidad >= 3) {
          return true;
        }
      }
    }

    return false;
  }


  // =====================================================
  // EVALUACIÓN DEL CÓDIGO / SIGLA
  // =====================================================

  static evaluarCodigo(
    valor: string
  ): EvaluacionCampo {

    const limpio =
      valor.trim().toUpperCase();

    if (
      this.validarCodigo(
        limpio
      )
    ) {
      return EvaluacionCampo.correcto();
    }

    const advertencias: string[] =
      [];


    if (
      /(.)\1{3,}/.test(
        limpio
      )
    ) {
      advertencias.push(
        "El código / sigla contiene demasiados caracteres repetidos."
      );
    }


    const patronesPrueba = [
      "ASDF",
      "QWER",
      "ZXCV",
      "TEST",
      "PRUEBA",
      "1234"
    ];

    if (
      patronesPrueba.some(
        (patron) =>
          limpio.includes(patron)
      )
    ) {
      advertencias.push(
        "El código / sigla parece contener información utilizada para pruebas."
      );
    }


    if (
      limpio.length >= 5 &&
      this.contarCaracteresUnicos(
        limpio
      ) <= 2
    ) {
      advertencias.push(
        "El código / sigla presenta una repetición de caracteres poco habitual."
      );
    }


    if (
      advertencias.length > 0
    ) {
      return EvaluacionCampo.advertencia(
        ...advertencias
      );
    }

    return EvaluacionCampo.correcto();
  }


  // =====================================================
  // EVALUACIÓN DEL NOMBRE
  // =====================================================

  static evaluarNombre(
    valor: string
  ): EvaluacionCampo {

    const limpio =
      valor.trim();

    if (
      this.validarNombre(
        limpio
      )
    ) {
      return EvaluacionCampo.correcto();
    }

    const advertencias: string[] =
      [];

    const mayuscula =
      limpio.toUpperCase();

    const soloLetras =
      this.obtenerSoloLetras(
        limpio
      );


    // -----------------------------------------------------
    // CARACTERES REPETIDOS
    // -----------------------------------------------------

    if (
      /(.)\1{3,}/i.test(
        limpio
      )
    ) {
      advertencias.push(
        "El nombre contiene demasiados caracteres repetidos."
      );
    }


    // -----------------------------------------------------
    // TEXTO TÍPICO DE PRUEBA
    // -----------------------------------------------------

    const patronesPrueba = [
      "ASDF",
      "QWER",
      "ZXCV",
      "TEST",
      "PRUEBA",
      "1234"
    ];

    if (
      patronesPrueba.some(
        (patron) =>
          mayuscula.includes(
            patron
          )
      )
    ) {
      advertencias.push(
        "El nombre parece contener texto utilizado normalmente para pruebas."
      );
    }


    // -----------------------------------------------------
    // FRAGMENTOS REPETITIVOS
    //
    // Detecta casos como:
    // ASDADSADSADSASD...
    // ABCABCABC...
    // -----------------------------------------------------

    if (
      soloLetras.length >= 10 &&
      this.contieneFragmentoRepetido(
        soloLetras
      )
    ) {
      advertencias.push(
        "El nombre contiene un patrón de letras repetitivo poco habitual."
      );
    }


    // -----------------------------------------------------
    // MUCHA LONGITUD CON MUY POCA VARIEDAD DE LETRAS
    //
    // ASDADSADSADS...
    // tiene muchas letras pero prácticamente usa A, S y D.
    // -----------------------------------------------------

    const caracteresUnicos =
      this.contarCaracteresUnicos(
        soloLetras
      );

    if (
      soloLetras.length >= 12 &&
      caracteresUnicos <= 4
    ) {
      advertencias.push(
        "El nombre utiliza muy poca variedad de letras para su longitud. Revise que no sea texto ingresado al azar."
      );
    }


    // -----------------------------------------------------
    // MUCHAS CONSONANTES SEGUIDAS
    // -----------------------------------------------------

    if (
      /[BCDFGHJKLMNPQRSTVWXYZÑ]{6,}/i.test(
        limpio
      )
    ) {
      advertencias.push(
        "El nombre presenta una combinación de letras poco habitual."
      );
    }


    // -----------------------------------------------------
    // PALABRA MUY LARGA CON POCAS VOCALES
    // -----------------------------------------------------

    const palabras =
      limpio
        .split(/\s+/)
        .filter(Boolean);


    const palabraSospechosa =
      palabras.some(
        (palabra) => {

          const letras =
            this.obtenerSoloLetras(
              palabra
            );

          if (
            letras.length < 14
          ) {
            return false;
          }

          const vocales =
            letras.match(
              /[AEIOUÁÉÍÓÚÜ]/g
            )?.length ?? 0;

          const proporcion =
            vocales /
            letras.length;

          return (
            proporcion < 0.22
          );
        }
      );


    if (
      palabraSospechosa
    ) {
      advertencias.push(
        "Una palabra del nombre parece poco habitual. Verifique que esté escrita correctamente."
      );
    }


    /*
      Quitamos mensajes duplicados.
    */
    const advertenciasUnicas =
      Array.from(
        new Set(
          advertencias
        )
      );


    if (
      advertenciasUnicas.length > 0
    ) {
      return EvaluacionCampo.advertencia(
        ...advertenciasUnicas
      );
    }


    return EvaluacionCampo.correcto();
  }


  // =====================================================
  // EVALUACIÓN DEL BIC / SWIFT
  // =====================================================

  static evaluarBicSwift(
    valor: string,
    omitirBicSwift: boolean
  ): EvaluacionCampo {

    if (omitirBicSwift) {
      return EvaluacionCampo.correcto();
    }

    const limpio =
      valor
        .trim()
        .toUpperCase();


    /*
      Si ya tiene error de formato,
      ese error se muestra normalmente.
      No agregamos además una advertencia.
    */
    if (
      this.validarBicSwift(
        limpio,
        false
      )
    ) {
      return EvaluacionCampo.correcto();
    }


    const advertencias: string[] =
      [];


    // -----------------------------------------------------
    // SECUENCIAS TÍPICAS DE PRUEBA
    // -----------------------------------------------------

    const patronesPrueba = [
      "ASDF",
      "QWER",
      "ZXCV",
      "TEST",
      "1234"
    ];

    if (
      patronesPrueba.some(
        (patron) =>
          limpio.includes(
            patron
          )
      )
    ) {
      advertencias.push(
        "El BIC / SWIFT parece contener una secuencia utilizada para pruebas."
      );
    }


    // -----------------------------------------------------
    // DIVERSIDAD ANORMALMENTE BAJA
    //
    // Ejemplo:
    // FDFDSDFASDA
    // -----------------------------------------------------

    const caracteresUnicos =
      this.contarCaracteresUnicos(
        limpio
      );


    if (
      limpio.length === 11 &&
      caracteresUnicos <= 4
    ) {
      advertencias.push(
        "El BIC / SWIFT presenta una combinación de caracteres poco habitual. Verifique el código antes de continuar."
      );
    }


    // -----------------------------------------------------
    // MUCHOS CARACTERES IGUALES
    // -----------------------------------------------------

    if (
      /(.)\1{3,}/.test(
        limpio
      )
    ) {
      advertencias.push(
        "El BIC / SWIFT contiene demasiados caracteres repetidos."
      );
    }


    if (
      advertencias.length > 0
    ) {
      return EvaluacionCampo.advertencia(
        ...Array.from(
          new Set(advertencias)
        )
      );
    }


    return EvaluacionCampo.correcto();
  }
}