import "dotenv/config";

import { closeOraclePool } from "../src/config/oracle.js";
import { chequerasRepository } from "../src/modules/bancos/chequeras/chequeras.repository.js";

async function main(): Promise<void> {
  try {
    console.log("========================================");
    console.log("PRUEBA INTEGRACIÓN - CHEQUERAS REPOSITORY");
    console.log("========================================");

    // ---------------------------------------------------------
    // 1. LISTAR
    // ---------------------------------------------------------
    console.log("\n1. Probando LISTAR...");

    const chequeras = await chequerasRepository.listar();

    console.log(`Registros recuperados: ${chequeras.length}`);
    console.dir(chequeras, { depth: null });

    if (chequeras.length === 0) {
      throw new Error(
        "PKG_MB_CHEQUERAS.LISTAR no devolvió ninguna chequera."
      );
    }

    const primera = chequeras[0];

    if (!primera) {
      throw new Error(
        "No fue posible obtener la primera chequera."
      );
    }

    // Verifica específicamente el problema que tuvimos
    if (
      primera.chequeraId === undefined ||
      primera.cuentaId === undefined ||
      primera.numeroInicial === undefined ||
      primera.numeroFinal === undefined ||
      primera.estado === undefined
    ) {
      throw new Error(
        "El Repository recibió filas desde Oracle, pero el mapeo de columnas produjo valores undefined."
      );
    }

    console.log("\nLISTAR correcto.");
    console.log(`Primera chequera: ID ${primera.chequeraId}`);

    // ---------------------------------------------------------
    // 2. OBTENER
    // ---------------------------------------------------------
    console.log("\n2. Probando OBTENER...");

    const detalle = await chequerasRepository.obtener(
      primera.chequeraId
    );

    console.dir(detalle, { depth: null });

    if (detalle.chequeraId !== primera.chequeraId) {
      throw new Error(
        `OBTENER devolvió la chequera ${detalle.chequeraId}, pero se esperaba ${primera.chequeraId}.`
      );
    }

    console.log("\nOBTENER correcto.");

    // ---------------------------------------------------------
    // 3. LISTAR POR CUENTA
    // ---------------------------------------------------------
    console.log("\n3. Probando LISTAR_POR_CUENTA...");

    const porCuenta =
      await chequerasRepository.listarPorCuenta(
        primera.cuentaId
      );

    console.log(
      `Chequeras encontradas para CUENTA_ID ${primera.cuentaId}: ${porCuenta.length}`
    );

    console.dir(porCuenta, { depth: null });

    if (porCuenta.length === 0) {
      throw new Error(
        `LISTAR_POR_CUENTA no devolvió registros para CUENTA_ID ${primera.cuentaId}.`
      );
    }

    const contienePrimera = porCuenta.some(
      (chequera) =>
        chequera.chequeraId === primera.chequeraId
    );

    if (!contienePrimera) {
      throw new Error(
        `LISTAR_POR_CUENTA no devolvió la chequera ${primera.chequeraId}.`
      );
    }

    console.log("\nLISTAR_POR_CUENTA correcto.");

    // ---------------------------------------------------------
    // RESULTADO
    // ---------------------------------------------------------
    console.log("\n========================================");
    console.log("REPOSITORY DE CHEQUERAS FUNCIONANDO.");
    console.log("LISTAR             ✅");
    console.log("OBTENER            ✅");
    console.log("LISTAR_POR_CUENTA  ✅");
    console.log("========================================");
  } catch (error) {
    console.error("\n========================================");
    console.error("ERROR EN REPOSITORY DE CHEQUERAS");
    console.error("========================================");

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    try {
      await closeOraclePool();
    } catch (error) {
      console.error(
        "No fue posible cerrar correctamente el pool Oracle:"
      );
      console.error(error);

      process.exitCode = 1;
    }
  }
}

await main();