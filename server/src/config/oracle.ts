import 'dotenv/config';
import oracledb from 'oracledb';


// =====================================================
// OBTENER CONEXIÓN ORACLE
// =====================================================

export async function getOracleConnection():
  Promise<oracledb.Connection> {

  return oracledb.getConnection({
    user:
      process.env.DB_USER,

    password:
      process.env.DB_PASSWORD,

    connectString:
      process.env.DB_CONNECT_STRING
  });
}


// =====================================================
// PROBAR CONEXIÓN ORACLE
// =====================================================

export async function probarConexionOracle():
  Promise<void> {

  let connection:
    oracledb.Connection | undefined;


  try {

    connection =
      await getOracleConnection();


    const result =
      await connection.execute(
        `
        SELECT
          USER AS usuario,
          SYS_CONTEXT(
            'USERENV',
            'CON_NAME'
          ) AS contenedor
        FROM dual
        `
      );


    console.log(
      'Conexión Oracle correcta'
    );

    console.log(
      result.rows
    );

  } catch (error) {

    console.error(
      'Error al conectar con Oracle:'
    );

    console.error(
      error
    );

    throw error;

  } finally {

    if (connection) {
      await connection.close();
    }
  }
}