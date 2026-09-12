import { Router } from "express";

import { plantillasChequeController } from "./plantillas-cheque.controller.js";

export const plantillasChequeRouter =
  Router();

/**
 * GET /api/bancos/plantillas-cheque
 */
plantillasChequeRouter.get(
  "/",
  (req, res) =>
    plantillasChequeController.listar(
      req,
      res
    )
);

/**
 * GET /api/bancos/plantillas-cheque/banco/:bancoId
 */
plantillasChequeRouter.get(
  "/banco/:bancoId",
  (req, res) =>
    plantillasChequeController.listarPorBanco(
      req,
      res
    )
);

/**
 * GET /api/bancos/plantillas-cheque/:id/campos
 */
plantillasChequeRouter.get(
  "/:id/campos",
  (req, res) =>
    plantillasChequeController.listarCampos(
      req,
      res
    )
);

/**
 * POST /api/bancos/plantillas-cheque/:id/campos
 */
plantillasChequeRouter.post(
  "/:id/campos",
  (req, res) =>
    plantillasChequeController.crearCampo(
      req,
      res
    )
);

/**
 * PUT /api/bancos/plantillas-cheque/:id/campos/:campoId
 */
plantillasChequeRouter.put(
  "/:id/campos/:campoId",
  (req, res) =>
    plantillasChequeController.actualizarCampo(
      req,
      res
    )
);

/**
 * DELETE /api/bancos/plantillas-cheque/:id/campos/:campoId
 *
 * Eliminación lógica del campo.
 */
plantillasChequeRouter.delete(
  "/:id/campos/:campoId",
  (req, res) =>
    plantillasChequeController.eliminarCampo(
      req,
      res
    )
);

/**
 * PATCH /api/bancos/plantillas-cheque/:id/estado
 */
plantillasChequeRouter.patch(
  "/:id/estado",
  (req, res) =>
    plantillasChequeController.cambiarEstado(
      req,
      res
    )
);

/**
 * GET /api/bancos/plantillas-cheque/:id
 */
plantillasChequeRouter.get(
  "/:id",
  (req, res) =>
    plantillasChequeController.obtener(
      req,
      res
    )
);

/**
 * POST /api/bancos/plantillas-cheque
 */
plantillasChequeRouter.post(
  "/",
  (req, res) =>
    plantillasChequeController.crear(
      req,
      res
    )
);

/**
 * PUT /api/bancos/plantillas-cheque/:id
 */
plantillasChequeRouter.put(
  "/:id",
  (req, res) =>
    plantillasChequeController.actualizar(
      req,
      res
    )
);

/**
 * DELETE /api/bancos/plantillas-cheque/:id
 *
 * Eliminación lógica de la plantilla.
 */
plantillasChequeRouter.delete(
  "/:id",
  (req, res) =>
    plantillasChequeController.desactivar(
      req,
      res
    )
);