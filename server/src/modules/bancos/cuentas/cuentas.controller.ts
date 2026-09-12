import type {
  NextFunction,
  Request,
  Response
} from 'express';

import {
  CuentaBancariaConflictError,
  CuentaBancariaService,
  CuentaBancariaValidationError,
  CuentaBancariaNotFoundError
} from './cuentas.service.js';


import {
  requireCurrentUserId
} from '../../../middlewares/request-context.middleware.js';

import type {
  FiltrosCuentaBancariaActiva,
  ActualizarCuentaBancariaInput,
  CambiarEstadoCuentaBancariaInput,
  CrearCuentaBancariaInput,
  EstadoCuentaBancaria,
  FiltrosCuentaBancaria
} from './cuentas.types.js';


function convertirFechaLocal(
  valor: unknown
): Date {

  if (typeof valor !== 'string') {
    return new Date(Number.NaN);
  }

  const coincidencia =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      valor.trim()
    );

  if (!coincidencia) {
    return new Date(Number.NaN);
  }

  const anio =
    Number(coincidencia[1]);

  const mes =
    Number(coincidencia[2]);

  const dia =
    Number(coincidencia[3]);

  const fecha =
    new Date(
      anio,
      mes - 1,
      dia
    );

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return new Date(Number.NaN);
  }

  return fecha;
}


export class CuentaBancariaController {

  private readonly service: CuentaBancariaService;

  constructor(
    service: CuentaBancariaService = new CuentaBancariaService()
  ) {
    this.service = service;
  }


  listar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {

    try {
      const filtros: FiltrosCuentaBancaria = {};

      if (typeof req.query.estado === 'string') {
        filtros.estado =
          req.query.estado.trim().toUpperCase() as EstadoCuentaBancaria;
      }

      if (typeof req.query.bancoId === 'string') {
        filtros.bancoId = Number(req.query.bancoId);
      }

      if (typeof req.query.monedaId === 'string') {
        filtros.monedaId = Number(req.query.monedaId);
      }

      const cuentas = await this.service.listar(filtros);

      res.status(200).json({
        ok: true,
        data: cuentas
      });

    } catch (error) {

      if (error instanceof CuentaBancariaValidationError) {
        res.status(400).json({
          ok: false,
          message: error.message
        });

        return;
      }

      next(error);
    }
  };

  listarActivas = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filtros: FiltrosCuentaBancariaActiva = {
        bancoId:
          req.query.bancoId == null ||
          req.query.bancoId === ''
            ? null
            : Number(req.query.bancoId),

        monedaId:
          req.query.monedaId == null ||
          req.query.monedaId === ''
            ? null
            : Number(req.query.monedaId)
      };

      const cuentas = await this.service.listarActivas(filtros);

      res.status(200).json({
        ok: true,
        data: cuentas
      });

    } catch (error) {
      if (error instanceof CuentaBancariaValidationError) {
        res.status(400).json({
          ok: false,
          message: error.message
        });

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
      const cuentaId = Number(req.params.cuentaId);

      const cuenta = await this.service.obtenerPorId(cuentaId);

      res.status(200).json({
        ok: true,
        data: cuenta
      });

    } catch (error) {
      if (error instanceof CuentaBancariaValidationError) {
        res.status(400).json({
          ok: false,
          message: error.message
        });

        return;
      }

      if (error instanceof CuentaBancariaNotFoundError) {
        res.status(404).json({
          ok: false,
          message: error.message
        });

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
      const body = req.body as Record<string, unknown>;

      const input: CrearCuentaBancariaInput = {
        empresaId: Number(body.empresaId),
        bancoId: Number(body.bancoId),
        monedaId: Number(body.monedaId),
        tipoCuentaId: Number(body.tipoCuentaId),
        responsableId: Number(body.responsableId),

        numeroCuenta: body.numeroCuenta as string,
        nombreInterno: body.nombreInterno as string,

        saldoInicial: Number(body.saldoInicial),

        fechaApertura:
          convertirFechaLocal(
            body.fechaApertura
          ),

        usoPrincipal:
          body.usoPrincipal as CrearCuentaBancariaInput['usoPrincipal'],

        permiteCobros:
          body.permiteCobros as CrearCuentaBancariaInput['permiteCobros'],

        permitePagos:
          body.permitePagos as CrearCuentaBancariaInput['permitePagos'],

        permiteCheques:
          body.permiteCheques as CrearCuentaBancariaInput['permiteCheques'],

        permiteTransferencias:
          body.permiteTransferencias as CrearCuentaBancariaInput['permiteTransferencias'],

        estado:
          body.estado as EstadoCuentaBancaria,

        observaciones:
          body.observaciones == null
            ? null
            : body.observaciones as string,

        creadoPor: requireCurrentUserId(res)
      };

      await this.service.crear(input);

      res.status(201).json({
        ok: true,
        message: 'Cuenta bancaria creada correctamente.'
      });

    } catch (error) {
      if (error instanceof CuentaBancariaValidationError) {
        res.status(400).json({
          ok: false,
          message: error.message
        });

        return;
      }

      if (error instanceof CuentaBancariaConflictError) {
        res.status(409).json({
          ok: false,
          message: error.message
        });

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
      const body = req.body as Record<string, unknown>;

      const input: ActualizarCuentaBancariaInput = {
        cuentaId: Number(req.params.cuentaId),
        empresaId: Number(body.empresaId),
        bancoId: Number(body.bancoId),
        monedaId: Number(body.monedaId),
        tipoCuentaId: Number(body.tipoCuentaId),
        responsableId: Number(body.responsableId),

        codigoCuenta: body.codigoCuenta as string,
        numeroCuenta: body.numeroCuenta as string,
        nombreInterno: body.nombreInterno as string,

        saldoInicial: Number(body.saldoInicial),

        fechaApertura:
          convertirFechaLocal(
            body.fechaApertura
          ),

        usoPrincipal:
          body.usoPrincipal as ActualizarCuentaBancariaInput['usoPrincipal'],

        permiteCobros:
          body.permiteCobros as ActualizarCuentaBancariaInput['permiteCobros'],

        permitePagos:
          body.permitePagos as ActualizarCuentaBancariaInput['permitePagos'],

        permiteCheques:
          body.permiteCheques as ActualizarCuentaBancariaInput['permiteCheques'],

        permiteTransferencias:
          body.permiteTransferencias as ActualizarCuentaBancariaInput['permiteTransferencias'],

        fechaCierre:
          body.fechaCierre == null || body.fechaCierre === ''
            ? null
            : new Date(body.fechaCierre as string),

        observaciones:
          body.observaciones == null
            ? null
            : body.observaciones as string,

        modificadoPor: requireCurrentUserId(res)
      };

      await this.service.actualizar(input);

      res.status(200).json({
        ok: true,
        message: 'Cuenta bancaria actualizada correctamente.'
      });

    } catch (error) {
      if (error instanceof CuentaBancariaValidationError) {
        res.status(400).json({
          ok: false,
          message: error.message
        });

        return;
      }

      if (error instanceof CuentaBancariaNotFoundError) {
        res.status(404).json({
          ok: false,
          message: error.message
        });

        return;
      }

      if (error instanceof CuentaBancariaConflictError) {
        res.status(409).json({
          ok: false,
          message: error.message
        });

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
      const body = req.body as Record<string, unknown>;

      const input: CambiarEstadoCuentaBancariaInput = {
        cuentaId: Number(req.params.cuentaId),

        estado:
          body.estado as EstadoCuentaBancaria,

        modificadoPor:
          requireCurrentUserId(res)
      };

      await this.service.cambiarEstado(input);

      res.status(200).json({
        ok: true,
        message: 'Estado de la cuenta bancaria actualizado correctamente.'
      });

    } catch (error) {
      if (error instanceof CuentaBancariaValidationError) {
        res.status(400).json({
          ok: false,
          message: error.message
        });

        return;
      }

      if (error instanceof CuentaBancariaNotFoundError) {
        res.status(404).json({
          ok: false,
          message: error.message
        });

        return;
      }

      next(error);
    }
  };
}
