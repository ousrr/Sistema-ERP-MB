import { plantillasChequeRepository } from "./plantillas-cheque.repository.js";

import type {
  ActualizarCampoPlantillaChequeInput,
  ActualizarPlantillaChequeInput,
  CampoPlantillaCheque,
  CrearCampoPlantillaChequeInput,
  CrearPlantillaChequeInput,
  EstadoCampoCheque,
  EstadoPlantillaCheque,
  PlantillaCheque,
} from "./plantillas-cheque.types.js";

const ESTADOS_PLANTILLA: EstadoPlantillaCheque[] = [
  "ACTIVA",
  "INACTIVA",
];

const ESTADOS_CAMPO: EstadoCampoCheque[] = [
  "ACTIVO",
  "INACTIVO",
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

function validarTextoObligatorio(
  valor: string,
  nombre: string
): void {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    throw new Error(
      `${nombre} es obligatorio.`
    );
  }
}

function validarNumeroNoNegativo(
  valor: number,
  nombre: string
): void {
  if (
    typeof valor !== "number" ||
    !Number.isFinite(valor) ||
    valor < 0
  ) {
    throw new Error(
      `${nombre} debe ser un número mayor o igual que cero.`
    );
  }
}

function validarNumeroPositivo(
  valor: number,
  nombre: string
): void {
  if (
    typeof valor !== "number" ||
    !Number.isFinite(valor) ||
    valor <= 0
  ) {
    throw new Error(
      `${nombre} debe ser un número mayor que cero.`
    );
  }
}

function validarEstadoPlantilla(
  estado: EstadoPlantillaCheque
): void {
  if (!ESTADOS_PLANTILLA.includes(estado)) {
    throw new Error(
      `Estado de plantilla no válido: ${estado}.`
    );
  }
}

function validarEstadoCampo(
  estado: EstadoCampoCheque
): void {
  if (!ESTADOS_CAMPO.includes(estado)) {
    throw new Error(
      `Estado de campo no válido: ${estado}.`
    );
  }
}

function validarDatosPlantilla(
  input:
    | CrearPlantillaChequeInput
    | ActualizarPlantillaChequeInput
): void {
  validarId(
    input.bancoId,
    "El banco"
  );

  if (
    input.tipoCuentaId !== undefined &&
    input.tipoCuentaId !== null
  ) {
    validarId(
      input.tipoCuentaId,
      "El tipo de cuenta"
    );
  }

  validarTextoObligatorio(
    input.nombre,
    "El nombre"
  );

  validarTextoObligatorio(
    input.tamanoPapel,
    "El tamaño de papel"
  );

  validarNumeroNoNegativo(
    input.margenSuperiorMm,
    "El margen superior"
  );

  validarNumeroNoNegativo(
    input.margenInferiorMm,
    "El margen inferior"
  );

  validarNumeroNoNegativo(
    input.margenIzquierdoMm,
    "El margen izquierdo"
  );

  validarNumeroNoNegativo(
    input.margenDerechoMm,
    "El margen derecho"
  );

  if (
    input.archivoFondoId !== undefined &&
    input.archivoFondoId !== null
  ) {
    validarId(
      input.archivoFondoId,
      "El archivo de fondo"
    );
  }
}

function validarDatosCampo(
  input:
    | CrearCampoPlantillaChequeInput
    | ActualizarCampoPlantillaChequeInput
): void {
  validarNumeroNoNegativo(
    input.posicionXMm,
    "La posición X"
  );

  validarNumeroNoNegativo(
    input.posicionYMm,
    "La posición Y"
  );

  validarNumeroPositivo(
    input.anchoMm,
    "El ancho"
  );

  validarNumeroPositivo(
    input.altoMm,
    "El alto"
  );

  validarNumeroPositivo(
    input.tamanoFuente,
    "El tamaño de fuente"
  );

  validarEstadoCampo(
    input.estado
  );
}

export class PlantillasChequeService {
  async listar(): Promise<PlantillaCheque[]> {
    return await plantillasChequeRepository.listar();
  }

  async listarPorBanco(
    bancoId: number
  ): Promise<PlantillaCheque[]> {
    validarId(
      bancoId,
      "El banco"
    );

    return await plantillasChequeRepository.listarPorBanco(
      bancoId
    );
  }

  async obtener(
    plantillaId: number
  ): Promise<PlantillaCheque> {
    validarId(
      plantillaId,
      "La plantilla"
    );

    return await plantillasChequeRepository.obtener(
      plantillaId
    );
  }

  async crear(
    input: CrearPlantillaChequeInput
  ): Promise<PlantillaCheque> {
    validarDatosPlantilla(input);

    validarEstadoPlantilla(
      input.estado
    );

    const plantillaId =
      await plantillasChequeRepository.crear(
        input
      );

    return await plantillasChequeRepository.obtener(
      plantillaId
    );
  }

  async actualizar(
    plantillaId: number,
    input: ActualizarPlantillaChequeInput
  ): Promise<PlantillaCheque> {
    validarId(
      plantillaId,
      "La plantilla"
    );

    validarDatosPlantilla(input);

    await plantillasChequeRepository.actualizar(
      plantillaId,
      input
    );

    return await plantillasChequeRepository.obtener(
      plantillaId
    );
  }

  async cambiarEstado(
    plantillaId: number,
    estado: EstadoPlantillaCheque
  ): Promise<PlantillaCheque> {
    validarId(
      plantillaId,
      "La plantilla"
    );

    validarEstadoPlantilla(
      estado
    );

    await plantillasChequeRepository.cambiarEstado(
      plantillaId,
      estado
    );

    return await plantillasChequeRepository.obtener(
      plantillaId
    );
  }

  async desactivar(
    plantillaId: number
  ): Promise<PlantillaCheque> {
    validarId(
      plantillaId,
      "La plantilla"
    );

    await plantillasChequeRepository.desactivar(
      plantillaId
    );

    return await plantillasChequeRepository.obtener(
      plantillaId
    );
  }

  async listarCampos(
    plantillaId: number
  ): Promise<CampoPlantillaCheque[]> {
    validarId(
      plantillaId,
      "La plantilla"
    );

    return await plantillasChequeRepository.listarCampos(
      plantillaId
    );
  }

  async crearCampo(
    plantillaId: number,
    input: CrearCampoPlantillaChequeInput
  ): Promise<CampoPlantillaCheque[]> {
    validarId(
      plantillaId,
      "La plantilla"
    );

    validarDatosCampo(input);

    await plantillasChequeRepository.crearCampo(
      plantillaId,
      input
    );

    return await plantillasChequeRepository.listarCampos(
      plantillaId
    );
  }

  async actualizarCampo(
    plantillaId: number,
    campoPlantillaId: number,
    input: ActualizarCampoPlantillaChequeInput
  ): Promise<CampoPlantillaCheque[]> {
    validarId(
      plantillaId,
      "La plantilla"
    );

    validarId(
      campoPlantillaId,
      "El campo de plantilla"
    );

    validarDatosCampo(input);

    await plantillasChequeRepository.actualizarCampo(
      campoPlantillaId,
      input
    );

    return await plantillasChequeRepository.listarCampos(
      plantillaId
    );
  }

  async eliminarCampo(
    plantillaId: number,
    campoPlantillaId: number
  ): Promise<CampoPlantillaCheque[]> {
    validarId(
      plantillaId,
      "La plantilla"
    );

    validarId(
      campoPlantillaId,
      "El campo de plantilla"
    );

    await plantillasChequeRepository.eliminarCampo(
      campoPlantillaId
    );

    return await plantillasChequeRepository.listarCampos(
      plantillaId
    );
  }
}

export const plantillasChequeService =
  new PlantillasChequeService();