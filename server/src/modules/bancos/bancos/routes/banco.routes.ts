import { Router } from "express";

import {
  OracleBancoRepository
} from "../repositories/OracleBancoRepository.js";

import {
  BancoService
} from "../services/BancoService.js";

import {
  BancoController
} from "../controllers/BancoController.js";


const router = Router();


// =========================================================
// DEPENDENCIAS DEL MÓDULO
// =========================================================

const bancoRepository =
  new OracleBancoRepository();

const bancoService =
  new BancoService(
    bancoRepository
  );

const bancoController =
  new BancoController(
    bancoService
  );


// =========================================================
// RUTAS
// =========================================================


// Listar bancos
router.get(
  "/",
  bancoController.listar
);


// Obtener banco por ID
router.get(
  "/:bancoId",
  bancoController.obtenerPorId
);


// Crear banco
router.post(
  "/",
  bancoController.crear
);


// Actualizar banco
router.put(
  "/:bancoId",
  bancoController.actualizar
);


// Cambiar estado ACTIVO / INACTIVO
router.patch(
  "/:bancoId/estado",
  bancoController.cambiarEstado
);


export default router;