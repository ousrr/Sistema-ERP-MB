import {
  ApplicationError
} from "../../common/errors/ApplicationError.js";


export class BancoConflictError
  extends ApplicationError {

  constructor(
    message: string,
    code: string = "BANCO_CONFLICTO"
  ) {

    super(
      message,
      409,
      code
    );

    this.name =
      "BancoConflictError";
  }


  // =====================================================
  // CÓDIGO DUPLICADO
  // =====================================================

  static codigoDuplicado(
    codigoBanco: string
  ): BancoConflictError {

    return new BancoConflictError(
      `Ya existe un banco con el código / sigla ${codigoBanco}.`,
      "BANCO_CODIGO_DUPLICADO"
    );
  }


  // =====================================================
  // BANCO INACTIVO
  // =====================================================

  static bancoInactivoNoEditable(
    nombreBanco: string
  ): BancoConflictError {

    return new BancoConflictError(
      `No se puede editar el banco "${nombreBanco}" porque está inactivo. Actívelo antes de modificarlo.`,
      "BANCO_INACTIVO_NO_EDITABLE"
    );
  }
}