type OracleErrorLike = {
  errorNum?: number;
  message?: string;
};


export class OracleErrorClassifier {

  // =====================================================
  // OBTENER ERROR ORACLE
  // =====================================================

  private static obtenerError(
    error: unknown
  ): OracleErrorLike | null {

    if (
      typeof error !== "object" ||
      error === null
    ) {
      return null;
    }

    return error as OracleErrorLike;
  }


  // =====================================================
  // COMPROBAR CÓDIGO ORACLE
  //
  // Ejemplos:
  //
  // ORA-00001 -> 1
  // ORA-20021 -> 20021
  // ORA-20022 -> 20022
  // ORA-20023 -> 20023
  // =====================================================

  static esCodigoOracle(
    error: unknown,
    codigo: number
  ): boolean {

    const oracleError =
      this.obtenerError(
        error
      );


    if (!oracleError) {
      return false;
    }


    const codigoNormalizado =
      Math.abs(
        codigo
      );


    /*
      node-oracledb expone normalmente
      errorNum como número positivo.

      Ejemplo:

      ORA-20023
      errorNum = 20023
    */
    if (
      oracleError.errorNum ===
      codigoNormalizado
    ) {
      return true;
    }


    /*
      Comprobación por mensaje como respaldo.
    */
    const codigoOracle =
      `ORA-${codigoNormalizado
        .toString()
        .padStart(5, "0")}`;


    return (
      oracleError.message
        ?.toUpperCase()
        .includes(
          codigoOracle
        ) ?? false
    );
  }


  // =====================================================
  // ORA-00001
  // UNIQUE CONSTRAINT
  // =====================================================

  static esRestriccionUnica(
    error: unknown
  ): boolean {

    return this.esCodigoOracle(
      error,
      1
    );
  }


  // =====================================================
  // IDENTIFICAR UNA CONSTRAINT CONCRETA
  // =====================================================

  static contieneConstraint(
    error: unknown,
    constraintName: string
  ): boolean {

    const oracleError =
      this.obtenerError(
        error
      );


    if (
      !oracleError?.message
    ) {
      return false;
    }


    return oracleError.message
      .toUpperCase()
      .includes(
        constraintName
          .toUpperCase()
      );
  }


  // =====================================================
  // UNIQUE DE UNA CONSTRAINT ESPECÍFICA
  // =====================================================

  static esRestriccionUnicaDe(
    error: unknown,
    constraintName: string
  ): boolean {

    return (
      this.esRestriccionUnica(
        error
      ) &&
      this.contieneConstraint(
        error,
        constraintName
      )
    );
  }
}