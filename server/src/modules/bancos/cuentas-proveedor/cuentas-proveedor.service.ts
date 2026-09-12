import { CuentaProveedorRepository } from "./cuentas-proveedor.repository.js";

import type {
  ActualizarCuentaProveedorInput,
  CambiarEstadoCuentaProveedorInput,
  CrearCuentaProveedorInput,
  CuentaProveedor,
  CuentaProveedorVerificada,
  EstadoCuentaProveedor,
  FiltrosCuentaProveedor,
} from "./cuentas-proveedor.types.js";

export class CuentaProveedorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CuentaProveedorValidationError";
  }
}

export class CuentaProveedorNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CuentaProveedorNotFoundError";
  }
}

export class CuentaProveedorConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CuentaProveedorConflictError";
  }
}

interface OracleErrorLike {
  errorNum?: number;
  code?: string;
  message?: string;
}

const ESTADOS_VALIDOS: readonly EstadoCuentaProveedor[] = [
  "PENDIENTE",
  "EN_REVISION",
  "VERIFICADA",
  "RECHAZADA",
  "BLOQUEADA",
  "INACTIVA",
];

function obtenerCodigoOracle(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;
  const oracleError = error as OracleErrorLike;

  if (typeof oracleError.errorNum === "number") {
    return Math.abs(oracleError.errorNum);
  }

  const texto = `${oracleError.code ?? ""} ${oracleError.message ?? ""}`;
  const match = texto.match(/ORA-(\d+)/i);
  return match?.[1] ? Number(match[1]) : null;
}

function validarId(valor: number, nombre: string): void {
  if (!Number.isSafeInteger(valor) || valor <= 0) {
    throw new CuentaProveedorValidationError(
      `${nombre} debe ser un nÃƒÂºmero entero positivo.`
    );
  }
}

function validarNumber19(valor: string, nombre: string): void {
  if (!/^[1-9]\d{0,18}$/.test(valor)) {
    throw new CuentaProveedorValidationError(
      `${nombre} debe ser un identificador numÃƒÂ©rico positivo de hasta 19 dÃƒÂ­gitos.`
    );
  }
}

function validarNumber19Opcional(
  valor: string | null,
  nombre: string
): void {
  if (valor !== null) validarNumber19(valor, nombre);
}

function validarTexto(
  valor: string,
  nombre: string,
  maximo: number
): void {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new CuentaProveedorValidationError(`${nombre} es obligatorio.`);
  }

  if (valor.length > maximo) {
    throw new CuentaProveedorValidationError(
      `${nombre} no puede superar ${maximo} caracteres.`
    );
  }
}

function validarTextoOpcional(
  valor: string | null,
  nombre: string,
  maximo: number
): void {
  if (valor !== null && valor.length > maximo) {
    throw new CuentaProveedorValidationError(
      `${nombre} no puede superar ${maximo} caracteres.`
    );
  }
}

function validarFechaOpcional(valor: Date | null): void {
  if (
    valor !== null &&
    (!(valor instanceof Date) || Number.isNaN(valor.getTime()))
  ) {
    throw new CuentaProveedorValidationError(
      "La fecha de vigencia no es vÃƒÂ¡lida."
    );
  }
}

function validarEstado(estado: EstadoCuentaProveedor): void {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new CuentaProveedorValidationError(
      "El estado indicado no es vÃƒÂ¡lido."
    );
  }
}

function validarDatosBase(
  input: Omit<CrearCuentaProveedorInput, "solicitadoPor"> | ActualizarCuentaProveedorInput
): void {
  validarId(input.proveedorId, "El identificador del proveedor");
  validarId(input.bancoId, "El identificador del banco");
  validarId(input.tipoCuentaId, "El identificador del tipo de cuenta");
  validarId(input.monedaId, "El identificador de la moneda");
  validarNumber19Opcional(
    input.cuentaAnteriorId,
    "El identificador de la cuenta anterior"
  );
  validarTexto(input.titular, "El titular", 150);
  validarTexto(input.numeroCuenta, "El nÃƒÂºmero de cuenta", 34);
  validarNumber19(
    input.cartaSolicitudDocId,
    "El identificador de la carta de solicitud"
  );
  validarNumber19(
    input.constanciaBancoDocId,
    "El identificador de la constancia bancaria"
  );
  validarNumber19Opcional(
    input.representanteDocId,
    "El identificador del documento del representante"
  );
  validarTexto(input.motivoRegistro, "El motivo de registro", 500);
  validarFechaOpcional(input.fechaVigencia);
  validarTextoOpcional(input.observaciones, "Las observaciones", 500);
}

export class CuentaProveedorService {
  constructor(
    private readonly repository: CuentaProveedorRepository =
      new CuentaProveedorRepository()
  ) {}

  async listar(
    filtros: FiltrosCuentaProveedor = {}
  ): Promise<CuentaProveedor[]> {
    if (filtros.proveedorId != null) {
      validarId(filtros.proveedorId, "El identificador del proveedor");
    }
    if (filtros.bancoId != null) {
      validarId(filtros.bancoId, "El identificador del banco");
    }
    if (filtros.monedaId != null) {
      validarId(filtros.monedaId, "El identificador de la moneda");
    }
    if (filtros.estado != null) validarEstado(filtros.estado);

    return this.repository.listar(filtros);
  }

  async listarVerificadas(
    proveedorId: number
  ): Promise<CuentaProveedorVerificada[]> {
    validarId(proveedorId, "El identificador del proveedor");

    try {
      return await this.repository.listarVerificadas(proveedorId);
    } catch (error) {
      if (obtenerCodigoOracle(error) === 20021) {
        throw new CuentaProveedorValidationError(
          "Debe indicar un proveedor vÃƒÂ¡lido para consultar sus cuentas verificadas."
        );
      }
      throw error;
    }
  }

  async obtenerPorId(ctaProveedorId: string): Promise<CuentaProveedor> {
    validarNumber19(
      ctaProveedorId,
      "El identificador de la cuenta del proveedor"
    );

    try {
      const cuenta = await this.repository.obtenerPorId(ctaProveedorId);
      if (!cuenta) {
        throw new CuentaProveedorNotFoundError(
          "La cuenta bancaria del proveedor indicada no existe."
        );
      }
      return cuenta;
    } catch (error) {
      if (error instanceof CuentaProveedorNotFoundError) throw error;

      const codigo = obtenerCodigoOracle(error);
      if (codigo === 20022) {
        throw new CuentaProveedorValidationError(
          "Debe indicar el identificador de la cuenta bancaria del proveedor."
        );
      }
      if (codigo === 20023) {
        throw new CuentaProveedorNotFoundError(
          "La cuenta bancaria del proveedor indicada no existe."
        );
      }
      throw error;
    }
  }

  async crear(input: CrearCuentaProveedorInput): Promise<string> {
    validarDatosBase(input);
    validarId(input.solicitadoPor, "El identificador del usuario solicitante");
    validarEstado(input.estado);

    try {
      return await this.repository.crear(input);
    } catch (error) {
      const codigo = obtenerCodigoOracle(error);

      switch (codigo) {
        case 20026:
          throw new CuentaProveedorValidationError("El banco indicado no existe.");
        case 20027:
          throw new CuentaProveedorValidationError(
            "El tipo de cuenta indicado no existe."
          );

        case 20054:
          throw new CuentaProveedorValidationError(
            "El tipo de cuenta indicado se encuentra inactivo."
          );
        case 20028:
          throw new CuentaProveedorValidationError(
            "La cuenta bancaria anterior indicada no existe."
          );
        case 20029:
        case 20030:
          throw new CuentaProveedorConflictError(
            "La cuenta bancaria ya se encuentra registrada para este proveedor, banco y moneda."
          );
        case 20031:
          throw new CuentaProveedorValidationError(
            "No se pudo crear la cuenta porque una referencia asociada no existe."
          );
        case 20002:
          throw new CuentaProveedorValidationError("El estado indicado no es vÃƒÂ¡lido.");
        case 20043:
          throw new CuentaProveedorValidationError(
            "No se puede registrar una cuenta nueva para un banco inactivo."
          );
        default:
          throw error;
      }
    }
  }

  async actualizar(input: ActualizarCuentaProveedorInput): Promise<void> {
    validarNumber19(
      input.ctaProveedorId,
      "El identificador de la cuenta del proveedor"
    );
    validarDatosBase(input);

    const cuentaActual =
      await this.obtenerPorId(input.ctaProveedorId);

    if (
      cuentaActual.estado === "VERIFICADA" ||
      cuentaActual.estado === "BLOQUEADA" ||
      cuentaActual.estado === "INACTIVA"
    ) {
      throw new CuentaProveedorValidationError(
        "La cuenta no puede editarse en su estado actual."
      );
    }

    try {
      await this.repository.actualizar(input);
    } catch (error) {
      const codigo = obtenerCodigoOracle(error);

      switch (codigo) {
        case 20032:
          throw new CuentaProveedorValidationError(
            "Debe indicar el identificador de la cuenta bancaria del proveedor."
          );
        case 20033:
          throw new CuentaProveedorNotFoundError(
            "La cuenta bancaria del proveedor que desea actualizar no existe."
          );
        case 20034:
          throw new CuentaProveedorValidationError("El banco indicado no existe.");
        case 20035:
          throw new CuentaProveedorValidationError(
            "El tipo de cuenta indicado no existe."
          );
        case 20036:
          throw new CuentaProveedorValidationError(
            "La cuenta bancaria anterior indicada no existe."
          );
        case 20037:
        case 20038:
          throw new CuentaProveedorConflictError(
            "Ya existe otra cuenta bancaria con el mismo proveedor, banco, nÃƒÂºmero y moneda."
          );
        case 20039:
          throw new CuentaProveedorValidationError(
            "No se pudo actualizar la cuenta porque una referencia asociada no existe."
          );
        default:
          throw error;
      }
    }
  }

  async cambiarEstado(input: CambiarEstadoCuentaProveedorInput): Promise<void> {
    validarNumber19(
      input.ctaProveedorId,
      "El identificador de la cuenta del proveedor"
    );
    validarEstado(input.estado);

    try {
      await this.repository.cambiarEstado(input);
    } catch (error) {
      const codigo = obtenerCodigoOracle(error);
      if (codigo === 20040) {
        throw new CuentaProveedorValidationError(
          "Debe indicar el identificador de la cuenta bancaria del proveedor."
        );
      }
      if (codigo === 20041) {
        throw new CuentaProveedorNotFoundError(
          "La cuenta bancaria del proveedor indicada no existe."
        );
      }
      if (codigo === 20002) {
        throw new CuentaProveedorValidationError("El estado indicado no es vÃƒÂ¡lido.");
      }
      throw error;
    }
  }
}
