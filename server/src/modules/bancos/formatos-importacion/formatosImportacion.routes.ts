import { Router } from 'express';

import {
  listarFormatosController,
  listarFormatosActivosPorBancoController,
  obtenerFormatoController,
  crearFormatoController,
  actualizarFormatoController,
  cambiarEstadoFormatoController,
  listarMapeosController,
  crearMapeoController,
  actualizarMapeoController,
  eliminarMapeoController,
} from './formatosImportacion.controller.js';

const router = Router();

/* =========================================================
   FORMATOS DE IMPORTACIÓN
   ========================================================= */

// Listar todos los formatos
router.get(
  '/',
  listarFormatosController
);

// Listar formatos activos por banco
router.get(
  '/activos',
  listarFormatosActivosPorBancoController
);

// Obtener un formato por ID
router.get(
  '/:id',
  obtenerFormatoController
);

// Crear formato
router.post(
  '/',
  crearFormatoController
);

// Actualizar formato
router.put(
  '/:id',
  actualizarFormatoController
);

// Cambiar estado ACTIVO / INACTIVO
router.patch(
  '/:id/estado',
  cambiarEstadoFormatoController
);

/* =========================================================
   MAPEO DE COLUMNAS
   ========================================================= */

// Listar los mapeos de un formato
router.get(
  '/:id/mapeos',
  listarMapeosController
);

// Crear un mapeo para un formato
router.post(
  '/:id/mapeos',
  crearMapeoController
);

// Actualizar un mapeo
router.put(
  '/mapeos/:mapeoId',
  actualizarMapeoController
);

// Eliminar un mapeo
router.delete(
  '/mapeos/:mapeoId',
  eliminarMapeoController
);

export default router;