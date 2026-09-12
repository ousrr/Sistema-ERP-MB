import { Router } from 'express';

import { OracleCatalogoRepository } from '../repositories/OracleCatalogoRepository.js';
import { CatalogoService } from '../services/CatalogoService.js';
import { CatalogoController } from '../controllers/CatalogoController.js';

const router = Router();


// =========================================================
// DEPENDENCIAS DEL MÓDULO
// =========================================================

const catalogoRepository = new OracleCatalogoRepository();
const catalogoService = new CatalogoService(catalogoRepository);
const catalogoController = new CatalogoController(catalogoService);


// =========================================================
// RUTAS
// =========================================================

// Listar todos los catálogos
router.get(
  '/',
  catalogoController.listar
);


// Listar catálogos activos por grupo
// Ejemplo: /grupo/TIPO_CUENTA
router.get(
  '/grupo/:grupo',
  catalogoController.listarPorGrupo
);


// Obtener catálogo por ID
router.get(
  '/:id',
  catalogoController.obtenerPorId
);


// Crear catálogo
router.post(
  '/',
  catalogoController.crear
);


// Actualizar catálogo
router.put(
  '/:id',
  catalogoController.actualizar
);


// Cambiar estado ACTIVO / INACTIVO
router.patch(
  '/:id/estado',
  catalogoController.cambiarEstado
);


export default router;