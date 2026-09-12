import { chequerasRepository } from "./chequeras.repository.js";

import type {
  ActualizarChequeraInput,
  Chequera,
  CrearChequeraInput,
  EstadoChequera,
} from "./chequeras.types.js";

const ESTADOS_CHEQUERA: EstadoChequera[] = [
  "BORRADOR",
  "ACTIVA",
  "AGOTADA",
  "INACTIVA",
];

function validarId(
  valor: number,
  nombre: string
): void {
  if (
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    throw new Error(
      `${nombre} debe ser un número entero mayor que cero.`
    );
  }
}

function validarNumeroCheque(
  valor: number,
  nombre: string
): void {
  if (
    !Number.isInteger(valor) ||
    valor < 0
  ) {
    throw new Error(
      `${nombre} debe ser un número entero válido.`
    );
  }
}

function validarFecha(
  fecha: Date
): void {
  if (
    !(fecha instanceof Date) ||
    Number.isNaN(fecha.getTime())
  ) {
    throw new Error(
      "La fecha de recepción no es válida."
    );
  }
}

function validarRango(
  numeroInicial: number,
  numeroFinal: number
): void {
  validarNumeroCheque(
    numeroInicial,
    "El número inicial"
  );

  validarNumeroCheque(
    numeroFinal,
    "El número final"
  );

  if (numeroInicial > numeroFinal) {
    throw new Error(
      "El número inicial no puede ser mayor que el número final."
    );
  }
}

function validarEstado(
  estado: EstadoChequera
): void {
  if (
    !ESTADOS_CHEQUERA.includes(estado)
  ) {
    throw new Error(
      `Estado de chequera no válido: ${estado}.`
    );
  }
}

function validarDatosCrear(
  input: CrearChequeraInput
): void {
  validarId(
    input.cuentaId,
    "La cuenta bancaria"
  );

  validarId(
    input.custodioId,
    "El custodio"
  );

  validarRango(
    input.numeroInicial,
    input.numeroFinal
  );

  validarFecha(
    input.fechaRecepcion
  );

  validarEstado(
    input.estado
  );
}

function validarDatosActualizar(
  input: ActualizarChequeraInput
): void {
  validarId(
    input.cuentaId,
    "La cuenta bancaria"
  );

  validarId(
    input.custodioId,
    "El custodio"
  );

  validarRango(
    input.numeroInicial,
    input.numeroFinal
  );

  validarFecha(
    input.fechaRecepcion
  );
}

export class ChequerasService {
  async listar(): Promise<Chequera[]> {
    return await chequerasRepository.listar();
  }

  async listarPorCuenta(
    cuentaId: number
  ): Promise<Chequera[]> {
    validarId(
      cuentaId,
      "La cuenta bancaria"
    );

    return await chequerasRepository.listarPorCuenta(
      cuentaId
    );
  }

  async obtener(
    chequeraId: number
  ): Promise<Chequera> {
    validarId(
      chequeraId,
      "La chequera"
    );

    return await chequerasRepository.obtener(
      chequeraId
    );
  }

  async crear(
    input: CrearChequeraInput
  ): Promise<Chequera> {
    validarDatosCrear(input);

    const chequeraId =
      await chequerasRepository.crear(
        input
      );

    return await chequerasRepository.obtener(
      chequeraId
    );
  }

  async actualizar(
    chequeraId: number,
    input: ActualizarChequeraInput
  ): Promise<Chequera> {
    validarId(
      chequeraId,
      "La chequera"
    );

    validarDatosActualizar(input);

    await chequerasRepository.actualizar(
      chequeraId,
      input
    );

    return await chequerasRepository.obtener(
      chequeraId
    );
  }

  async cambiarEstado(
    chequeraId: number,
    estado: EstadoChequera
  ): Promise<Chequera> {
    validarId(
      chequeraId,
      "La chequera"
    );

    validarEstado(estado);

    await chequerasRepository.cambiarEstado(
      chequeraId,
      estado
    );

    return await chequerasRepository.obtener(
      chequeraId
    );
  }

  async desactivar(
    chequeraId: number
  ): Promise<Chequera> {
    validarId(
      chequeraId,
      "La chequera"
    );

    await chequerasRepository.desactivar(
      chequeraId
    );

    return await chequerasRepository.obtener(
      chequeraId
    );
  }
}

export const chequerasService =
  new ChequerasService();