import { Router } from "express";

import { chequerasController } from "./chequeras.controller.js";

export const chequerasRouter = Router();

/**
 * GET /api/bancos/chequeras
 *
 * Lista todas las chequeras.
 */
chequerasRouter.get(
  "/",
  (req, res) =>
    chequerasController.listar(req, res)
);

/**
 * GET /api/bancos/chequeras/cuenta/:cuentaId
 *
 * Lista las chequeras asociadas a una cuenta bancaria.
 */
chequerasRouter.get(
  "/cuenta/:cuentaId",
  (req, res) =>
    chequerasController.listarPorCuenta(req, res)
);

/**
 * GET /api/bancos/chequeras/:id
 *
 * Obtiene una chequera específica.
 */
chequerasRouter.get(
  "/:id",
  (req, res) =>
    chequerasController.obtener(req, res)
);

/**
 * POST /api/bancos/chequeras
 *
 * Crea una nueva chequera.
 */
chequerasRouter.post(
  "/",
  (req, res) =>
    chequerasController.crear(req, res)
);

/**
 * PUT /api/bancos/chequeras/:id
 *
 * Actualiza una chequera existente.
 */
chequerasRouter.put(
  "/:id",
  (req, res) =>
    chequerasController.actualizar(req, res)
);

/**
 * PATCH /api/bancos/chequeras/:id/estado
 *
 * Cambia únicamente el estado.
 */
chequerasRouter.patch(
  "/:id/estado",
  (req, res) =>
    chequerasController.cambiarEstado(req, res)
);

/**
 * DELETE /api/bancos/chequeras/:id
 *
 * Eliminación lógica.
 * No borra físicamente el registro:
 * PKG_MB_CHEQUERAS.DESACTIVAR lo deja INACTIVA.
 */
chequerasRouter.delete(
  "/:id",
  (req, res) =>
    chequerasController.desactivar(req, res)
);