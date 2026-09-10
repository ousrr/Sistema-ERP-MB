import {
  ApplicationError
} from "../../common/errors/ApplicationError.js";


export class CatalogoConflictError
  extends ApplicationError {

  constructor(
    message: string,
    code: string =
      "CATALOGO_CONFLICTO"
  ) {

    super(
      message,
      409,
      code
    );

    this.name =
      "CatalogoConflictError";
  }


  static grupoCodigoDuplicado(
    grupo: string,
    codigo: string
  ): CatalogoConflictError {

    return new CatalogoConflictError(
      `Ya existe un catálogo con el grupo ${grupo} y el código ${codigo}.`,
      "CATALOGO_GRUPO_CODIGO_DUPLICADO"
    );
  }
}