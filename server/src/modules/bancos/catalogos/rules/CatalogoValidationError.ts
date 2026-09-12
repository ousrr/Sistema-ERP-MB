import {
  ApplicationError
} from "../../common/errors/ApplicationError.js";


export class CatalogoValidationError
  extends ApplicationError {

  constructor(
    message: string,
    code: string =
      "CATALOGO_VALIDACION"
  ) {

    super(
      message,
      400,
      code
    );

    this.name =
      "CatalogoValidationError";
  }
}