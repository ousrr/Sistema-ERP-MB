import type {
  CatalogoBancario,
  CatalogoOpcion,
  EstadoCatalogo,
  CrearCatalogoData,
  ActualizarCatalogoData
} from "../models/CatalogoBancario.js";

import type {
  ICatalogoRepository
} from "../repositories/ICatalogoRepository.js";

import {
  CatalogoRules
} from "../rules/CatalogoRules.js";

import {
  CatalogoNotFoundError
} from "../rules/CatalogoNotFoundError.js";

import {
  CatalogoValidationError
} from "../rules/CatalogoValidationError.js";


export class CatalogoService {

  constructor(
    private readonly catalogoRepository:
      ICatalogoRepository
  ) {}


  async listar():
    Promise<CatalogoBancario[]> {

    return this.catalogoRepository
      .listar();
  }


  async obtenerPorId(
    catalogoId: number
  ): Promise<CatalogoBancario | null> {

    CatalogoRules
      .validarCatalogoId(
        catalogoId
      );

    return this.catalogoRepository
      .obtenerPorId(
        catalogoId
      );
  }


  async listarPorGrupo(
    grupo: string
  ): Promise<CatalogoOpcion[]> {

    const grupoNormalizado =
      CatalogoRules
        .normalizarGrupo(
          grupo
        );

    CatalogoRules
      .validarGrupo(
        grupoNormalizado
      );

    return this.catalogoRepository
      .listarPorGrupo(
        grupoNormalizado
      );
  }


  async crear(
    datos: CrearCatalogoData
  ): Promise<number> {

    const datosPreparados =
      CatalogoRules
        .prepararCreacion(
          datos
        );

    return this.catalogoRepository
      .crear(
        datosPreparados
      );
  }


  async actualizar(
    catalogoId: number,
    datos: ActualizarCatalogoData
  ): Promise<void> {

    CatalogoRules
      .validarCatalogoId(
        catalogoId
      );


    const catalogoActual =
      await this.catalogoRepository
        .obtenerPorId(
          catalogoId
        );


    if (!catalogoActual) {

      throw new CatalogoNotFoundError(
        catalogoId
      );
    }


    if (
      catalogoActual.estado ===
      "INACTIVO"
    ) {

      throw new CatalogoValidationError(
        "El registro está inactivo. Debe reactivarlo antes de poder editarlo.",
        "CATALOGO_INACTIVO_NO_EDITABLE"
      );
    }


    const datosPreparados =
      CatalogoRules
        .prepararActualizacion(
          catalogoActual.grupo,
          datos
        );


    await this.catalogoRepository
      .actualizar(
        catalogoId,
        datosPreparados
      );
  }


  async cambiarEstado(
    catalogoId: number,
    estado: EstadoCatalogo
  ): Promise<void> {

    CatalogoRules
      .validarCatalogoId(
        catalogoId
      );

    CatalogoRules
      .validarEstado(
        estado
      );


    const catalogoActual =
      await this.catalogoRepository
        .obtenerPorId(
          catalogoId
        );


    if (!catalogoActual) {

      throw new CatalogoNotFoundError(
        catalogoId
      );
    }


    await this.catalogoRepository
      .cambiarEstado(
        catalogoId,
        estado
      );
  }
}