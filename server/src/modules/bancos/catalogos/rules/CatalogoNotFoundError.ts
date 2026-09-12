import {
  ApplicationError
} from "../../common/errors/ApplicationError.js";


export class CatalogoNotFoundError
  extends ApplicationError {

  constructor(
    catalogoId: number
  ) {

    super(
      `No existe un catálogo bancario con el ID ${catalogoId}.`,
      404,
      "CATALOGO_NO_ENCONTRADO"
    );

    this.name =
      "CatalogoNotFoundError";
  }
}