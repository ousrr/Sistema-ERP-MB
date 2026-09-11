import {
  listarFormatos,
  listarFormatosActivosPorBanco,
  obtenerFormato,
  crearFormato,
  actualizarFormato,
  cambiarEstadoFormato,
  listarMapeos,
  crearMapeo,
  actualizarMapeo,
  eliminarMapeo,
  type CrearFormatoInput,
  type ActualizarFormatoInput,
  type CrearMapeoInput,
  type ActualizarMapeoInput,
} from './formatosImportacion.repository.js';

/* =========================================================
   CONSTANTES DE VALIDACIÓN
   ========================================================= */

const TIPOS_ARCHIVO_PERMITIDOS = [
  'CSV',
  'XLS',
  'XLSX',
];

const ESTADOS_PERMITIDOS = [
  'ACTIVO',
  'INACTIVO',
];

const OBLIGATORIO_PERMITIDOS = [
  'S',
  'N',
];

const DELIMITADORES_PERMITIDOS = [
  ',',
  ';',
  '|',
];

const FORMATOS_FECHA_PERMITIDOS = [
  'DD/MM/YYYY',
  'YYYY-MM-DD',
  'MM/DD/YYYY',
];

/*
 * Nombre de formato:
 * - Letras
 * - Tildes
 * - Ñ
 * - Números
 * - Espacios
 * - Punto
 * - Guion
 * - Guion bajo
 */
const REGEX_NOMBRE_FORMATO =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ._-]+$/;

/*
 * Campo del sistema:
 * Ejemplos válidos:
 *
 * FECHA
 * DESCRIPCION
 * NUMERO_DOCUMENTO
 * DEBITO_1
 *
 * No permite:
 * espacios, símbolos, etiquetas HTML, etc.
 */
const REGEX_CAMPO_SISTEMA =
  /^[A-Za-z][A-Za-z0-9_]*$/;

/*
 * Nombre de una columna proveniente del archivo bancario.
 *
 * Permitimos caracteres normales que sí pueden aparecer
 * en encabezados bancarios.
 */
const REGEX_NOMBRE_COLUMNA =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ._-]+$/;

/* =========================================================
   VALIDACIONES GENERALES
   ========================================================= */

function validarId(
  id: number,
  nombre: string
): void {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      `${nombre} debe ser un número entero mayor que 0.`
    );
  }
}

function validarTexto(
  valor: string,
  nombre: string,
  longitudMaxima?: number
): void {
  if (
    typeof valor !== 'string' ||
    !valor.trim()
  ) {
    throw new Error(
      `${nombre} es obligatorio.`
    );
  }

  if (
    longitudMaxima &&
    valor.trim().length > longitudMaxima
  ) {
    throw new Error(
      `${nombre} no puede superar ${longitudMaxima} caracteres.`
    );
  }
}

function normalizarEspacios(
  valor: string
): string {
  return valor
    .trim()
    .replace(/\s+/g, ' ');
}

function validarNombreFormato(
  nombre: string
): void {
  validarTexto(
    nombre,
    'El nombre del formato',
    100
  );

  const nombreNormalizado =
    normalizarEspacios(nombre);

  if (nombreNormalizado.length < 3) {
    throw new Error(
      'El nombre del formato debe contener al menos 3 caracteres.'
    );
  }

  if (
    !REGEX_NOMBRE_FORMATO.test(
      nombreNormalizado
    )
  ) {
    throw new Error(
      'El nombre del formato contiene caracteres no permitidos. Usa únicamente letras, números, espacios, punto, guion o guion bajo.'
    );
  }
}

function validarVersion(
  version: number
): void {
  if (
    !Number.isInteger(version) ||
    version <= 0
  ) {
    throw new Error(
      'La versión debe ser un número entero mayor que 0.'
    );
  }
}

function validarTipoArchivo(
  tipoArchivo: string
): void {
  if (
    typeof tipoArchivo !== 'string'
  ) {
    throw new Error(
      'Debe seleccionar un tipo de archivo válido.'
    );
  }

  const valor =
    tipoArchivo.toUpperCase();

  if (
    !TIPOS_ARCHIVO_PERMITIDOS.includes(
      valor
    )
  ) {
    throw new Error(
      `Tipo de archivo inválido. Valores permitidos: ${TIPOS_ARCHIVO_PERMITIDOS.join(', ')}.`
    );
  }
}

function validarEstado(
  estado: string
): void {
  if (
    typeof estado !== 'string'
  ) {
    throw new Error(
      'Debe seleccionar un estado válido.'
    );
  }

  const valor =
    estado.toUpperCase();

  if (
    !ESTADOS_PERMITIDOS.includes(valor)
  ) {
    throw new Error(
      `Estado inválido. Valores permitidos: ${ESTADOS_PERMITIDOS.join(', ')}.`
    );
  }
}

function validarObligatorio(
  valor: string
): void {
  if (
    typeof valor !== 'string'
  ) {
    throw new Error(
      'Debe indicar si el campo es obligatorio.'
    );
  }

  if (
    !OBLIGATORIO_PERMITIDOS.includes(
      valor.toUpperCase()
    )
  ) {
    throw new Error(
      'El indicador de obligatoriedad únicamente puede ser S o N.'
    );
  }
}

function validarFormatoFecha(
  formatoFecha: string
): void {
  validarTexto(
    formatoFecha,
    'El formato de fecha',
    30
  );

  if (
    !FORMATOS_FECHA_PERMITIDOS.includes(
      formatoFecha.trim()
    )
  ) {
    throw new Error(
      `Formato de fecha inválido. Valores permitidos: ${FORMATOS_FECHA_PERMITIDOS.join(', ')}.`
    );
  }
}

function validarDelimitador(
  tipoArchivo: string,
  delimitador: string | null | undefined
): void {
  const tipo =
    tipoArchivo.toUpperCase();

  /*
   * XLS y XLSX no utilizan delimitador.
   */
  if (
    tipo === 'XLS' ||
    tipo === 'XLSX'
  ) {
    return;
  }

  if (
    !delimitador ||
    !delimitador.trim()
  ) {
    throw new Error(
      'Debe seleccionar un delimitador para archivos CSV.'
    );
  }

  const valor =
    delimitador.trim();

  if (
    !DELIMITADORES_PERMITIDOS.includes(
      valor
    )
  ) {
    throw new Error(
      'Delimitador inválido. Solo se permite coma (,), punto y coma (;) o barra vertical (|).'
    );
  }
}

function validarFilaEncabezado(
  filaEncabezado: number
): void {
  if (
    !Number.isInteger(
      filaEncabezado
    ) ||
    filaEncabezado < 0
  ) {
    throw new Error(
      'La fila de encabezado debe ser un número entero mayor o igual que 0.'
    );
  }
}

function validarCampoSistema(
  campoSistema: string
): void {
  validarTexto(
    campoSistema,
    'El campo del sistema',
    30
  );

  const valor =
    campoSistema.trim();

  if (
    !REGEX_CAMPO_SISTEMA.test(valor)
  ) {
    throw new Error(
      'El campo del sistema solo puede contener letras, números y guion bajo, y debe comenzar con una letra.'
    );
  }
}

function validarNombreColumna(
  nombreColumna: string | null | undefined
): void {
  if (
    nombreColumna === null ||
    nombreColumna === undefined ||
    !nombreColumna.trim()
  ) {
    return;
  }

  const valor =
    normalizarEspacios(
      nombreColumna
    );

  if (valor.length > 100) {
    throw new Error(
      'El nombre de la columna no puede superar 100 caracteres.'
    );
  }

  if (
    !REGEX_NOMBRE_COLUMNA.test(valor)
  ) {
    throw new Error(
      'El nombre de la columna contiene caracteres no permitidos.'
    );
  }
}

function validarNumeroColumna(
  numeroColumna: number | null
): void {
  if (
    numeroColumna === null
  ) {
    return;
  }

  if (
    !Number.isInteger(
      numeroColumna
    ) ||
    numeroColumna <= 0
  ) {
    throw new Error(
      'El número de columna debe ser un número entero mayor que 0.'
    );
  }
}

function validarUbicacionColumna(
  nombreColumna:
    | string
    | null
    | undefined,
  numeroColumna: number | null
): void {
  const tieneNombre =
    typeof nombreColumna === 'string' &&
    nombreColumna.trim().length > 0;

  const tieneNumero =
    numeroColumna !== null;

  /*
   * Regla importante del modelo:
   * al menos uno debe estar informado.
   */
  if (
    !tieneNombre &&
    !tieneNumero
  ) {
    throw new Error(
      'Debe indicar el nombre de la columna o el número de columna.'
    );
  }
}

/* =========================================================
   VALIDACIÓN COMPLETA DEL FORMATO
   ========================================================= */

function validarDatosFormato(
  input: CrearFormatoInput
): void {
  validarId(
    input.bancoId,
    'El banco'
  );

  validarNombreFormato(
    input.nombre
  );

  validarVersion(
    input.version
  );

  validarTipoArchivo(
    input.tipoArchivo
  );

  validarDelimitador(
    input.tipoArchivo,
    input.delimitador
  );

  validarFormatoFecha(
    input.formatoFecha
  );

  validarFilaEncabezado(
    input.filaEncabezado
  );

  validarId(
    input.archivoEjemploId,
    'El archivo de ejemplo'
  );

  validarEstado(
    input.estado
  );
}

/* =========================================================
   FORMATOS DE IMPORTACIÓN
   ========================================================= */

export async function listarFormatosService() {
  return await listarFormatos();
}

/* =========================================================
   LISTAR FORMATOS ACTIVOS POR BANCO
   ========================================================= */

export async function listarFormatosActivosPorBancoService(
  bancoId: number
) {
  validarId(
    bancoId,
    'El banco'
  );

  return await listarFormatosActivosPorBanco(
    bancoId
  );
}

/* =========================================================
   OBTENER FORMATO
   ========================================================= */

export async function obtenerFormatoService(
  formatoId: number
) {
  validarId(
    formatoId,
    'El formato'
  );

  const formato =
    await obtenerFormato(
      formatoId
    );

  if (!formato) {
    throw new Error(
      `No existe un formato con ID ${formatoId}.`
    );
  }

  return formato;
}

/* =========================================================
   CREAR FORMATO
   ========================================================= */

export async function crearFormatoService(
  input: CrearFormatoInput
) {
  validarDatosFormato(input);

  const tipoArchivo =
    input.tipoArchivo.toUpperCase();

  return await crearFormato({
    ...input,

    nombre:
      normalizarEspacios(
        input.nombre
      ),

    tipoArchivo,

    /*
     * CSV conserva delimitador.
     * XLS/XLSX no necesitan delimitador.
     */
    delimitador:
      tipoArchivo === 'CSV'
        ? input.delimitador?.trim() || null
        : null,

    formatoFecha:
      input.formatoFecha.trim(),

    estado:
      input.estado.toUpperCase(),
  });
}

/* =========================================================
   ACTUALIZAR FORMATO
   ========================================================= */

export async function actualizarFormatoService(
  input: ActualizarFormatoInput
) {
  validarId(
    input.formatoId,
    'El formato'
  );

  await obtenerFormatoService(
    input.formatoId
  );

  /*
   * Validaciones equivalentes a crear.
   */
  validarId(
    input.bancoId,
    'El banco'
  );

  validarNombreFormato(
    input.nombre
  );

  validarVersion(
    input.version
  );

  validarTipoArchivo(
    input.tipoArchivo
  );

  validarDelimitador(
    input.tipoArchivo,
    input.delimitador
  );

  validarFormatoFecha(
    input.formatoFecha
  );

  validarFilaEncabezado(
    input.filaEncabezado
  );

  validarId(
    input.archivoEjemploId,
    'El archivo de ejemplo'
  );

  const tipoArchivo =
    input.tipoArchivo.toUpperCase();

  await actualizarFormato({
    ...input,

    nombre:
      normalizarEspacios(
        input.nombre
      ),

    tipoArchivo,

    delimitador:
      tipoArchivo === 'CSV'
        ? input.delimitador?.trim() || null
        : null,

    formatoFecha:
      input.formatoFecha.trim(),
  });

  return await obtenerFormatoService(
    input.formatoId
  );
}

/* =========================================================
   CAMBIAR ESTADO
   ========================================================= */

export async function cambiarEstadoFormatoService(
  formatoId: number,
  estado: string
) {
  validarId(
    formatoId,
    'El formato'
  );

  await obtenerFormatoService(
    formatoId
  );

  validarEstado(
    estado
  );

  await cambiarEstadoFormato(
    formatoId,
    estado.toUpperCase()
  );

  return await obtenerFormatoService(
    formatoId
  );
}

/* =========================================================
   MAPEO DE COLUMNAS
   ========================================================= */

export async function listarMapeosService(
  formatoId: number
) {
  validarId(
    formatoId,
    'El formato'
  );

  await obtenerFormatoService(
    formatoId
  );

  return await listarMapeos(
    formatoId
  );
}

/* =========================================================
   CREAR MAPEO
   ========================================================= */

export async function crearMapeoService(
  input: CrearMapeoInput
) {
  validarId(
    input.formatoId,
    'El formato'
  );

  await obtenerFormatoService(
    input.formatoId
  );

  validarCampoSistema(
    input.campoSistema
  );

  validarObligatorio(
    input.esObligatorio
  );

  validarNombreColumna(
    input.nombreColumna
  );

  validarNumeroColumna(
    input.numeroColumna
  );

  validarUbicacionColumna(
    input.nombreColumna,
    input.numeroColumna
  );

  /*
   * Evitamos que el mismo campo del sistema
   * se configure dos veces dentro del mismo formato.
   */
  const mapeosExistentes =
    await listarMapeos(
      input.formatoId
    );

  const campoNormalizado =
    input.campoSistema
      .trim()
      .toUpperCase();

  const duplicado =
    mapeosExistentes.some(
      (mapeo) =>
        mapeo.campoSistema
          .trim()
          .toUpperCase() ===
        campoNormalizado
    );

  if (duplicado) {
    throw new Error(
      `El campo ${campoNormalizado} ya está configurado en este formato. Selecciona otro campo del sistema.`
    );
  }

  return await crearMapeo({
    ...input,

    campoSistema:
      campoNormalizado,

    nombreColumna:
      input.nombreColumna?.trim()
        ? normalizarEspacios(
            input.nombreColumna
          )
        : null,

    esObligatorio:
      input.esObligatorio
        .toUpperCase(),

    formatoValor:
      input.formatoValor?.trim() ||
      null,
  });
}

/* =========================================================
   ACTUALIZAR MAPEO
   ========================================================= */

export async function actualizarMapeoService(
  input: ActualizarMapeoInput
) {
  validarId(
    input.mapeoId,
    'El mapeo'
  );

  validarCampoSistema(
    input.campoSistema
  );

  validarObligatorio(
    input.esObligatorio
  );

  validarNombreColumna(
    input.nombreColumna
  );

  validarNumeroColumna(
    input.numeroColumna
  );

  validarUbicacionColumna(
    input.nombreColumna,
    input.numeroColumna
  );

  await actualizarMapeo({
    ...input,

    campoSistema:
      input.campoSistema
        .trim()
        .toUpperCase(),

    nombreColumna:
      input.nombreColumna?.trim()
        ? normalizarEspacios(
            input.nombreColumna
          )
        : null,

    esObligatorio:
      input.esObligatorio
        .toUpperCase(),

    formatoValor:
      input.formatoValor?.trim() ||
      null,
  });
}

/* =========================================================
   ELIMINAR MAPEO
   ========================================================= */

export async function eliminarMapeoService(
  mapeoId: number
) {
  validarId(
    mapeoId,
    'El mapeo'
  );

  await eliminarMapeo(
    mapeoId
  );
}