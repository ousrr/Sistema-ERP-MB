import { Router } from 'express';
import { CuentaBancariaController } from './cuentas.controller.js';

const router = Router();
const controller = new CuentaBancariaController();

router.get(
  '/',
  controller.listar
);

router.get(
  '/activas',
  controller.listarActivas
);

router.post(
  '/',
  controller.crear
);

router.get(
  '/:cuentaId',
  controller.obtenerPorId
);

router.put(
  '/:cuentaId',
  controller.actualizar
);

router.patch(
  '/:cuentaId/estado',
  controller.cambiarEstado
);

export default router;