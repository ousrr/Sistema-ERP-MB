import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { requireCurrentUserId } from "../../../middlewares/request-context.middleware.js";
import {
  CuentaProveedorConflictError,
  CuentaProveedorNotFoundError,
  CuentaProveedorService,
  CuentaProveedorValidationError,
} from "./cuentas-proveedor.service.js";

import type {
  ActualizarCuentaProveedorInput,
  CambiarEstadoCuentaProveedorInput,
  CrearCuentaProveedorInput,
  EstadoCuentaProveedor,
  FiltrosCuentaProveedor,
} from "./cuentas-proveedor.types.js";

function convertirFechaOpcional(valor: unknown): Date | null {
  if (valor === null || valor === undefined || valor === "") return null;
  return new Date(String(valor));
}

function convertirId19Opcional(valor: unknown): string | null {
  if (valor === null || valor === undefined || valor === "") return null;
  return String(valor).trim();
}

function convertirId19(valor: unknown): string {
  return String(valor ?? "").trim();
}

export class CuentaProveedorController {
  constructor(
    private readonly service: CuentaProveedorService =
      new CuentaProveedorService()
  ) {}

  listar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filtros: FiltrosCuentaProveedor = {
        proveedorId:
          req.query.proveedorId == null || req.query.proveedorId === ""
            ? null
            : Number(req.query.proveedorId),
        estado:
          req.query.estado == null || req.query.estado === ""
            ? null
            : String(req.query.estado) as EstadoCuentaProveedor,
        bancoId:
          req.query.bancoId == null || req.query.bancoId === ""
            ? null
            : Number(req.query.bancoId),
        monedaId:
          req.query.monedaId == null || req.query.monedaId === ""
            ? null
            : Number(req.query.monedaId),
      };

      res.status(200).json({
        ok: true,
        data: await this.service.listar(filtros),
      });
    } catch (error) {
      if (error instanceof CuentaProveedorValidationError) {
        res.status(400).json({ ok: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  listarVerificadas = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const proveedorId = Number(req.params.proveedorId);
      res.status(200).json({
        ok: true,
        data: await this.service.listarVerificadas(proveedorId),
      });
    } catch (error) {
      if (error instanceof CuentaProveedorValidationError) {
        res.status(400).json({ ok: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  obtenerPorId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cuenta = await this.service.obtenerPorId(
        convertirId19(req.params.ctaProveedorId)
      );
      res.status(200).json({ ok: true, data: cuenta });
    } catch (error) {
      if (error instanceof CuentaProveedorValidationError) {
        res.status(400).json({ ok: false, message: error.message });
        return;
      }
      if (error instanceof CuentaProveedorNotFoundError) {
        res.status(404).json({ ok: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  crear = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input: CrearCuentaProveedorInput = {
        proveedorId: Number(req.body.proveedorId),
        bancoId: Number(req.body.bancoId),
        tipoCuentaId: Number(req.body.tipoCuentaId),
        monedaId: Number(req.body.monedaId),
        cuentaAnteriorId: convertirId19Opcional(req.body.cuentaAnteriorId),
        titular: String(req.body.titular ?? ""),
        numeroCuenta: String(req.body.numeroCuenta ?? ""),
        cartaSolicitudDocId: convertirId19(req.body.cartaSolicitudDocId),
        constanciaBancoDocId: convertirId19(req.body.constanciaBancoDocId),
        representanteDocId: convertirId19Opcional(req.body.representanteDocId),
        motivoRegistro: String(req.body.motivoRegistro ?? ""),
        fechaVigencia: convertirFechaOpcional(req.body.fechaVigencia),
        estado: String(req.body.estado ?? "") as EstadoCuentaProveedor,
        observaciones:
          req.body.observaciones == null
            ? null
            : String(req.body.observaciones),
        solicitadoPor: requireCurrentUserId(res),
      };

      const ctaProveedorId = await this.service.crear(input);

      res.status(201).json({
        ok: true,
        message: "Cuenta bancaria del proveedor creada correctamente.",
        data: { ctaProveedorId },
      });
    } catch (error) {
      if (error instanceof CuentaProveedorValidationError) {
        res.status(400).json({ ok: false, message: error.message });
        return;
      }
      if (error instanceof CuentaProveedorConflictError) {
        res.status(409).json({ ok: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  actualizar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input: ActualizarCuentaProveedorInput = {
        ctaProveedorId: convertirId19(req.params.ctaProveedorId),
        proveedorId: Number(req.body.proveedorId),
        bancoId: Number(req.body.bancoId),
        tipoCuentaId: Number(req.body.tipoCuentaId),
        monedaId: Number(req.body.monedaId),
        cuentaAnteriorId: convertirId19Opcional(req.body.cuentaAnteriorId),
        titular: String(req.body.titular ?? ""),
        numeroCuenta: String(req.body.numeroCuenta ?? ""),
        cartaSolicitudDocId: convertirId19(req.body.cartaSolicitudDocId),
        constanciaBancoDocId: convertirId19(req.body.constanciaBancoDocId),
        representanteDocId: convertirId19Opcional(req.body.representanteDocId),
        motivoRegistro: String(req.body.motivoRegistro ?? ""),
        fechaVigencia: convertirFechaOpcional(req.body.fechaVigencia),
        observaciones:
          req.body.observaciones == null
            ? null
            : String(req.body.observaciones),
      };

      await this.service.actualizar(input);
      res.status(200).json({
        ok: true,
        message: "Cuenta bancaria del proveedor actualizada correctamente.",
      });
    } catch (error) {
      if (error instanceof CuentaProveedorValidationError) {
        res.status(400).json({ ok: false, message: error.message });
        return;
      }
      if (error instanceof CuentaProveedorNotFoundError) {
        res.status(404).json({ ok: false, message: error.message });
        return;
      }
      if (error instanceof CuentaProveedorConflictError) {
        res.status(409).json({ ok: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  cambiarEstado = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input: CambiarEstadoCuentaProveedorInput = {
        ctaProveedorId: convertirId19(req.params.ctaProveedorId),
        estado: String(req.body.estado ?? "") as EstadoCuentaProveedor,
      };

      await this.service.cambiarEstado(input);
      res.status(200).json({
        ok: true,
        message:
          "Estado de la cuenta bancaria del proveedor actualizado correctamente.",
      });
    } catch (error) {
      if (error instanceof CuentaProveedorValidationError) {
        res.status(400).json({ ok: false, message: error.message });
        return;
      }
      if (error instanceof CuentaProveedorNotFoundError) {
        res.status(404).json({ ok: false, message: error.message });
        return;
      }
      next(error);
    }
  };
}
