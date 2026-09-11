import oracledb from "oracledb";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value;
}

const poolAlias = "erp_bancos_pool";

let poolInicializado = false;

export async function initializeOraclePool(): Promise<void> {
  if (poolInicializado) {
    return;
  }

  await oracledb.createPool({
    poolAlias,
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    connectString: requireEnv("DB_CONNECT_STRING"),
    poolMin: Number(process.env.DB_POOL_MIN ?? 1),
    poolMax: Number(process.env.DB_POOL_MAX ?? 4),
    poolIncrement: Number(process.env.DB_POOL_INCREMENT ?? 1),
  });

  poolInicializado = true;

  console.log("Pool Oracle inicializado correctamente.");
}

export async function getOracleConnection(): Promise<oracledb.Connection> {
  if (!poolInicializado) {
    await initializeOraclePool();
  }

  return oracledb.getConnection(poolAlias);
}

export async function testOracleConnection(): Promise<void> {
  let connection: oracledb.Connection | undefined;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute<{
      USUARIO: string;
      SERVICE_NAME: string;
    }>(
      `
      SELECT
        USER AS USUARIO,
        SYS_CONTEXT('USERENV', 'SERVICE_NAME') AS SERVICE_NAME
      FROM DUAL
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    console.log("Conexión Oracle exitosa.");
    console.log(result.rows?.[0]);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function closeOraclePool(): Promise<void> {
  if (!poolInicializado) {
    return;
  }

  const pool = oracledb.getPool(poolAlias);

  await pool.close(10);

  poolInicializado = false;

  console.log("Pool Oracle cerrado.");
}
