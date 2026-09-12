import { Router } from 'express';

import { CuentaProveedorController } from './cuentas-proveedor.controller.js';


const router = Router();

const controller =
  new CuentaProveedorController();


router.get(
  '/',
  controller.listar
);


router.get(
  '/verificadas/:proveedorId',
  controller.listarVerificadas
);


router.post(
  '/',
  controller.crear
);


router.get(
  '/:ctaProveedorId',
  controller.obtenerPorId
);


router.put(
  '/:ctaProveedorId',
  controller.actualizar
);


router.patch(
  '/:ctaProveedorId/estado',
  controller.cambiarEstado
);


export default router;