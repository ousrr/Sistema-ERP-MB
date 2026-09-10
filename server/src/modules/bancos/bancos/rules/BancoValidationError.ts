import {
  ApplicationError
} from "../../common/errors/ApplicationError.js";


export class BancoValidationError
  extends ApplicationError {

  constructor(
    message: string
  ) {

    super(
      message,
      400,
      "BANCO_VALIDACION"
    );

    this.name =
      "BancoValidationError";
  }
}