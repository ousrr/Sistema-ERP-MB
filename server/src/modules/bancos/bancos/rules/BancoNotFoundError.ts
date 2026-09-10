import {
  ApplicationError
} from "../../common/errors/ApplicationError.js";


export class BancoNotFoundError
  extends ApplicationError {

  constructor(
    bancoId: number
  ) {

    super(
      `No existe un banco con el ID ${bancoId}.`,
      404,
      "BANCO_NO_ENCONTRADO"
    );

    this.name =
      "BancoNotFoundError";
  }
}