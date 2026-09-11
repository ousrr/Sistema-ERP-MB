import oracledb from 'oracledb';
import { env } from '../../../config/env.js';

export interface FormatoImportacionRow {
  formatoId: number;
  bancoId: number;
  banco: string;
  nombre: string;
  version: number;
  tipoArchivo: string;
  delimitador: string | null;
  formatoFecha: string;
  filaEncabezado: number;
  archivoEjemploId: number;
  estado: string;
}

export interface MapeoColumnaRow {
  mapeoId: number;
  formatoId: number;
  campoSistema: string;
  nombreColumna: string | null;
  numeroColumna: number | null;
  esObligatorio: string;
  formatoValor: string | null;
}

export interface CrearFormatoInput {
  bancoId: number;
  nombre: string;
  version: number;
  tipoArchivo: string;
  delimitador: string | null;
  formatoFecha: string;
  filaEncabezado: number;
  archivoEjemploId: number;
  estado: string;
}

export interface ActualizarFormatoInput {
  formatoId: number;
  bancoId: number;
  nombre: string;
  version: number;
  tipoArchivo: string;
  delimitador: string | null;
  formatoFecha: string;
  filaEncabezado: number;
  archivoEjemploId: number;
}

export interface CrearMapeoInput {
  formatoId: number;
  campoSistema: string;
  nombreColumna: string | null;
  numeroColumna: number | null;
  esObligatorio: string;
  formatoValor: string | null;
}

export interface ActualizarMapeoInput {
  mapeoId: number;
  campoSistema: string;
  nombreColumna: string | null;
  numeroColumna: number | null;
  esObligatorio: string;
  formatoValor: string | null;
}

async function getConnection() {
  return oracledb.getConnection({
    user: env.database.user,
    password: env.database.password,
    connectString: env.database.connectString,
  });
}

async function readFormatoCursor(
  resultSet: oracledb.ResultSet<unknown[]>
): Promise<FormatoImportacionRow[]> {
  const rows: FormatoImportacionRow[] = [];

  let row;

  while ((row = await resultSet.getRow())) {
    rows.push({
      formatoId: Number(row[0]),
      bancoId: Number(row[1]),
      banco: String(row[2]),
      nombre: String(row[3]),
      version: Number(row[4]),
      tipoArchivo: String(row[5]),
      delimitador: row[6] == null ? null : String(row[6]),
      formatoFecha: String(row[7]),
      filaEncabezado: Number(row[8]),
      archivoEjemploId: Number(row[9]),
      estado: String(row[10]),
    });
  }

  await resultSet.close();

  return rows;
}

async function readMapeoCursor(
  resultSet: oracledb.ResultSet<unknown[]>
): Promise<MapeoColumnaRow[]> {
  const rows: MapeoColumnaRow[] = [];

  let row;

  while ((row = await resultSet.getRow())) {
    rows.push({
      mapeoId: Number(row[0]),
      formatoId: Number(row[1]),
      campoSistema: String(row[2]),
      nombreColumna: row[3] == null ? null : String(row[3]),
      numeroColumna: row[4] == null ? null : Number(row[4]),
      esObligatorio: String(row[5]),
      formatoValor: row[6] == null ? null : String(row[6]),
    });
  }

  await resultSet.close();

  return rows;
}

/* =========================================================
   FORMATOS DE IMPORTACIÓN
   ========================================================= */

export async function listarFormatos(): Promise<FormatoImportacionRow[]> {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        PKG_MB_FORMATOS_IMPORTACION.listar_formatos(
          p_resultado => :p_resultado
        );
      END;
      `,
      {
        p_resultado: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      }
    );

    const outBinds = result.outBinds as {
      p_resultado: oracledb.ResultSet<unknown[]>;
    };

    return await readFormatoCursor(outBinds.p_resultado);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

/* =========================================================
   LISTAR FORMATOS ACTIVOS POR BANCO
   ========================================================= */

export async function listarFormatosActivosPorBanco(
  bancoId: number
): Promise<FormatoImportacionRow[]> {
  const formatos = await listarFormatos();

  return formatos.filter(
    (formato) =>
      formato.bancoId === bancoId &&
      formato.estado.toUpperCase() === 'ACTIVO'
  );
}

export async function obtenerFormato(
  formatoId: number
): Promise<FormatoImportacionRow | null> {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        PKG_MB_FORMATOS_IMPORTACION.obtener_formato(
          p_formato_id => :p_formato_id,
          p_resultado  => :p_resultado
        );
      END;
      `,
      {
        p_formato_id: formatoId,
        p_resultado: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      }
    );

    const outBinds = result.outBinds as {
      p_resultado: oracledb.ResultSet<unknown[]>;
    };

    const rows = await readFormatoCursor(outBinds.p_resultado);

    return rows.length > 0 ? rows[0] : null;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function crearFormato(
  input: CrearFormatoInput
): Promise<number> {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        PKG_MB_FORMATOS_IMPORTACION.crear_formato(
          p_banco_id           => :p_banco_id,
          p_nombre             => :p_nombre,
          p_version            => :p_version,
          p_tipo_archivo       => :p_tipo_archivo,
          p_delimitador        => :p_delimitador,
          p_formato_fecha      => :p_formato_fecha,
          p_fila_encabezado    => :p_fila_encabezado,
          p_archivo_ejemplo_id => :p_archivo_ejemplo_id,
          p_estado             => :p_estado,
          p_formato_id         => :p_formato_id
        );
      END;
      `,
      {
        p_banco_id: input.bancoId,
        p_nombre: input.nombre,
        p_version: input.version,
        p_tipo_archivo: input.tipoArchivo,
        p_delimitador: input.delimitador,
        p_formato_fecha: input.formatoFecha,
        p_fila_encabezado: input.filaEncabezado,
        p_archivo_ejemplo_id: input.archivoEjemploId,
        p_estado: input.estado,
        p_formato_id: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      {
        autoCommit: true,
      }
    );

    const outBinds = result.outBinds as {
      p_formato_id: number;
    };

    return Number(outBinds.p_formato_id);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function actualizarFormato(
  input: ActualizarFormatoInput
): Promise<void> {
  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        PKG_MB_FORMATOS_IMPORTACION.actualizar_formato(
          p_formato_id         => :p_formato_id,
          p_banco_id           => :p_banco_id,
          p_nombre             => :p_nombre,
          p_version            => :p_version,
          p_tipo_archivo       => :p_tipo_archivo,
          p_delimitador        => :p_delimitador,
          p_formato_fecha      => :p_formato_fecha,
          p_fila_encabezado    => :p_fila_encabezado,
          p_archivo_ejemplo_id => :p_archivo_ejemplo_id
        );
      END;
      `,
      {
        p_formato_id: input.formatoId,
        p_banco_id: input.bancoId,
        p_nombre: input.nombre,
        p_version: input.version,
        p_tipo_archivo: input.tipoArchivo,
        p_delimitador: input.delimitador,
        p_formato_fecha: input.formatoFecha,
        p_fila_encabezado: input.filaEncabezado,
        p_archivo_ejemplo_id: input.archivoEjemploId,
      },
      {
        autoCommit: true,
      }
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function cambiarEstadoFormato(
  formatoId: number,
  estado: string
): Promise<void> {
  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        PKG_MB_FORMATOS_IMPORTACION.cambiar_estado_formato(
          p_formato_id => :p_formato_id,
          p_estado     => :p_estado
        );
      END;
      `,
      {
        p_formato_id: formatoId,
        p_estado: estado,
      },
      {
        autoCommit: true,
      }
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

/* =========================================================
   MAPEO DE COLUMNAS
   ========================================================= */

export async function listarMapeos(
  formatoId: number
): Promise<MapeoColumnaRow[]> {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        PKG_MB_FORMATOS_IMPORTACION.listar_mapeos(
          p_formato_id => :p_formato_id,
          p_resultado  => :p_resultado
        );
      END;
      `,
      {
        p_formato_id: formatoId,
        p_resultado: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      }
    );

    const outBinds = result.outBinds as {
      p_resultado: oracledb.ResultSet<unknown[]>;
    };

    return await readMapeoCursor(outBinds.p_resultado);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function crearMapeo(
  input: CrearMapeoInput
): Promise<number> {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        PKG_MB_FORMATOS_IMPORTACION.crear_mapeo(
          p_formato_id     => :p_formato_id,
          p_campo_sistema  => :p_campo_sistema,
          p_nombre_columna => :p_nombre_columna,
          p_numero_columna => :p_numero_columna,
          p_es_obligatorio => :p_es_obligatorio,
          p_formato_valor  => :p_formato_valor,
          p_mapeo_id       => :p_mapeo_id
        );
      END;
      `,
      {
        p_formato_id: input.formatoId,
        p_campo_sistema: input.campoSistema,
        p_nombre_columna: input.nombreColumna,
        p_numero_columna: input.numeroColumna,
        p_es_obligatorio: input.esObligatorio,
        p_formato_valor: input.formatoValor,
        p_mapeo_id: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      {
        autoCommit: true,
      }
    );

    const outBinds = result.outBinds as {
      p_mapeo_id: number;
    };

    return Number(outBinds.p_mapeo_id);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function actualizarMapeo(
  input: ActualizarMapeoInput
): Promise<void> {
  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        PKG_MB_FORMATOS_IMPORTACION.actualizar_mapeo(
          p_mapeo_id       => :p_mapeo_id,
          p_campo_sistema  => :p_campo_sistema,
          p_nombre_columna => :p_nombre_columna,
          p_numero_columna => :p_numero_columna,
          p_es_obligatorio => :p_es_obligatorio,
          p_formato_valor  => :p_formato_valor
        );
      END;
      `,
      {
        p_mapeo_id: input.mapeoId,
        p_campo_sistema: input.campoSistema,
        p_nombre_columna: input.nombreColumna,
        p_numero_columna: input.numeroColumna,
        p_es_obligatorio: input.esObligatorio,
        p_formato_valor: input.formatoValor,
      },
      {
        autoCommit: true,
      }
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function eliminarMapeo(
  mapeoId: number
): Promise<void> {
  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        PKG_MB_FORMATOS_IMPORTACION.eliminar_mapeo(
          p_mapeo_id => :p_mapeo_id
        );
      END;
      `,
      {
        p_mapeo_id: mapeoId,
      },
      {
        autoCommit: true,
      }
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}