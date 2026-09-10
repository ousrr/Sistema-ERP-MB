import type {
  Request,
  Response
} from "express";

import {
  BancoService
} from "../services/BancoService.js";

import type {
  EstadoBanco,
  CrearBancoData,
  ActualizarBancoData
} from "../models/Banco.js";

import {
  ApplicationError
} from "../../common/errors/ApplicationError.js";


export class BancoController {

  constructor(
    private readonly service:
      BancoService
  ) {}


  // =====================================================
  // MANEJO CENTRALIZADO DE ERRORES
  // =====================================================

  private manejarError(
    res: Response,
    error: unknown
  ): Response {

    /*
      Cualquier error controlado de la aplicación
      contiene:

      statusCode
      code
      message

      Ejemplos:

      400 BANCO_VALIDACION
      409 BANCO_CODIGO_DUPLICADO
    */
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


    /*
      Error inesperado:
      Oracle, conexión, programación, etc.

      No exponemos detalles técnicos al usuario.
    */
    console.error(
      "Error inesperado en BancoController:",
      error
    );


    return res
      .status(500)
      .json({
        code:
          "ERROR_INTERNO",

        message:
          "Ocurrió un error interno al procesar la operación bancaria."
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

      const bancos =
        await this.service.listar();


      return res
        .status(200)
        .json(
          bancos
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

      const bancoId =
        Number(
          req.params.bancoId
        );


      if (
        !Number.isInteger(
          bancoId
        ) ||
        bancoId <= 0
      ) {

        return res
          .status(400)
          .json({
            code:
              "BANCO_ID_INVALIDO",

            message:
              "El ID del banco no es válido."
          });
      }


      const banco =
        await this.service
          .obtenerPorId(
            bancoId
          );


      if (!banco) {

        return res
          .status(404)
          .json({
            code:
              "BANCO_NO_ENCONTRADO",

            message:
              "Banco no encontrado."
          });
      }


      return res
        .status(200)
        .json(
          banco
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
  // =====================================================

  crear = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const {
        codigoBanco,
        nombre,
        bicSwift
      } = req.body;


      /*
        creadoPor = 1 sigue siendo temporal.

        Más adelante debe obtenerse
        del usuario autenticado.
      */
      const datos:
        CrearBancoData = {

        codigoBanco,
        nombre,

        bicSwift:
          bicSwift ?? null,

        creadoPor:
          1
      };


      const bancoId =
        await this.service.crear(
          datos
        );


      return res
        .status(201)
        .json({
          message:
            "Banco creado correctamente.",

          bancoId
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

      const bancoId =
        Number(
          req.params.bancoId
        );


      if (
        !Number.isInteger(
          bancoId
        ) ||
        bancoId <= 0
      ) {

        return res
          .status(400)
          .json({
            code:
              "BANCO_ID_INVALIDO",

            message:
              "El ID del banco no es válido."
          });
      }


      const {
        codigoBanco,
        nombre,
        bicSwift
      } = req.body;


      const datos:
        ActualizarBancoData = {

        codigoBanco,
        nombre,

        bicSwift:
          bicSwift ?? null
      };


      await this.service.actualizar(
        bancoId,
        datos
      );


      return res
        .status(200)
        .json({
          message:
            "Banco actualizado correctamente."
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

      const bancoId =
        Number(
          req.params.bancoId
        );


      if (
        !Number.isInteger(
          bancoId
        ) ||
        bancoId <= 0
      ) {

        return res
          .status(400)
          .json({
            code:
              "BANCO_ID_INVALIDO",

            message:
              "El ID del banco no es válido."
          });
      }


      const {
        estado
      } = req.body as {
        estado?: EstadoBanco;
      };


      if (
        estado !== "ACTIVO" &&
        estado !== "INACTIVO"
      ) {

        return res
          .status(400)
          .json({
            code:
              "BANCO_ESTADO_INVALIDO",

            message:
              "El estado debe ser ACTIVO o INACTIVO."
          });
      }


      await this.service
        .cambiarEstado(
          bancoId,
          estado
        );


      return res
        .status(200)
        .json({
          message:
            `Banco cambiado a estado ${estado} correctamente.`
        });

    } catch (error) {

      return this.manejarError(
        res,
        error
      );
    }
  };
}