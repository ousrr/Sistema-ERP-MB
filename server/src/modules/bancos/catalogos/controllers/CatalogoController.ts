import type {
  Request,
  Response
} from "express";

import {
  CatalogoService
} from "../services/CatalogoService.js";

import type {
  EstadoCatalogo,
  NaturalezaCatalogo,
  ValorSiNo,
  CrearCatalogoData,
  ActualizarCatalogoData
} from "../models/CatalogoBancario.js";

import {
  ApplicationError
} from "../../common/errors/ApplicationError.js";


export class CatalogoController {

  constructor(
    private readonly catalogoService:
      CatalogoService
  ) {}


  // =====================================================
  // MANEJO CENTRALIZADO DE ERRORES
  // =====================================================

  private manejarError(
    res: Response,
    error: unknown
  ): Response {

    if (
      error instanceof ApplicationError
    ) {

      return res
        .status(
          error.statusCode
        )
        .json({
          code:
            error.code,

          message:
            error.message
        });
    }


    console.error(
      "Error inesperado en CatalogoController:",
      error
    );


    return res
      .status(500)
      .json({
        code:
          "ERROR_INTERNO",

        message:
          "Ocurrió un error interno al procesar el catálogo bancario."
      });
  }


  // =====================================================
  // LISTAR
  // =====================================================

  listar = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const catalogos =
        await this.catalogoService
          .listar();


      return res
        .status(200)
        .json(
          catalogos
        );

    } catch (error) {

      return this.manejarError(
        res,
        error
      );
    }
  };


  // =====================================================
  // OBTENER POR ID
  // =====================================================

  obtenerPorId = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const catalogoId =
        Number(
          req.params.id
        );


      const catalogo =
        await this.catalogoService
          .obtenerPorId(
            catalogoId
          );


      if (!catalogo) {

        return res
          .status(404)
          .json({
            code:
              "CATALOGO_NO_ENCONTRADO",

            message:
              "Catálogo bancario no encontrado."
          });
      }


      return res
        .status(200)
        .json(
          catalogo
        );

    } catch (error) {

      return this.manejarError(
        res,
        error
      );
    }
  };


  // =====================================================
  // LISTAR POR GRUPO
  // =====================================================

  listarPorGrupo = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const grupoParam =
        req.params.grupo;


      const grupo =
        Array.isArray(
          grupoParam
        )
          ? grupoParam[0]
          : grupoParam;


      const catalogos =
        await this.catalogoService
          .listarPorGrupo(
            grupo ?? ""
          );


      return res
        .status(200)
        .json(
          catalogos
        );

    } catch (error) {

      return this.manejarError(
        res,
        error
      );
    }
  };


  // =====================================================
  // CREAR
  //
  // catalogoId NO viene del cliente.
  // Oracle lo genera mediante la secuencia.
  // =====================================================

  crear = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const {
        grupo,
        codigo,
        nombre,
        descripcion,
        aplicaA,
        naturaleza,
        requiereComentario,
        requiereEvidencia,
        permiteReversion,
        estado
      } = req.body;


      const datos:
        CrearCatalogoData = {

        grupo,
        codigo,
        nombre,

        descripcion:
          descripcion ?? null,

        aplicaA:
          aplicaA ?? null,

        naturaleza:
          (naturaleza ?? null) as
            NaturalezaCatalogo,

        requiereComentario:
          requiereComentario as
            ValorSiNo,

        requiereEvidencia:
          requiereEvidencia as
            ValorSiNo,

        permiteReversion:
          permiteReversion as
            ValorSiNo,

        estado:
          (estado ?? "ACTIVO") as
            EstadoCatalogo
      };


      const catalogoId =
        await this.catalogoService
          .crear(
            datos
          );


      return res
        .status(201)
        .json({
          message:
            "Catálogo bancario creado correctamente.",

          catalogoId
        });

    } catch (error) {

      return this.manejarError(
        res,
        error
      );
    }
  };


  // =====================================================
  // ACTUALIZAR
  // =====================================================

  actualizar = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const catalogoId =
        Number(
          req.params.id
        );


      const {
        nombre,
        descripcion,
        aplicaA,
        naturaleza,
        requiereComentario,
        requiereEvidencia,
        permiteReversion
      } = req.body;


      const datos:
        ActualizarCatalogoData = {

        nombre,

        descripcion:
          descripcion ?? null,

        aplicaA:
          aplicaA ?? null,

        naturaleza:
          (naturaleza ?? null) as
            NaturalezaCatalogo,

        requiereComentario:
          requiereComentario as
            ValorSiNo,

        requiereEvidencia:
          requiereEvidencia as
            ValorSiNo,

        permiteReversion:
          permiteReversion as
            ValorSiNo
      };


      await this.catalogoService
        .actualizar(
          catalogoId,
          datos
        );


      return res
        .status(200)
        .json({
          message:
            "Catálogo bancario actualizado correctamente."
        });

    } catch (error) {

      return this.manejarError(
        res,
        error
      );
    }
  };


  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  cambiarEstado = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const catalogoId =
        Number(
          req.params.id
        );


      const {
        estado
      } = req.body as {
        estado?: EstadoCatalogo;
      };


      await this.catalogoService
        .cambiarEstado(
          catalogoId,
          estado as EstadoCatalogo
        );


      return res
        .status(200)
        .json({
          message:
            `Catálogo cambiado a estado ${estado} correctamente.`
        });

    } catch (error) {

      return this.manejarError(
        res,
        error
      );
    }
  };
}