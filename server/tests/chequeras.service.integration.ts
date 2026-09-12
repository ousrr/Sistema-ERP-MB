import "dotenv/config";

import { closeOraclePool } from "../src/config/oracle.js";
import { chequerasService } from "../src/modules/bancos/chequeras/chequeras.service.js";

async function esperarError(
  nombrePrueba: string,
  accion: () => Promise<unknown>,
  textoEsperado: string
): Promise<void> {
  try {
    await accion();

    throw new Error(
      `${nombrePrueba}: se esperaba un error, pero la operación fue aceptada.`
    );
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    /*
     * Si llegamos al error que nosotros mismos lanzamos
     * porque no ocurrió la validación esperada,
     * debe propagarse.
     */
    if (
      error.message.includes(
        "se esperaba un error, pero la operación fue aceptada"
      )
    ) {
      throw error;
    }

    if (!error.message.includes(textoEsperado)) {
      throw new Error(
        `${nombrePrueba}: ocurrió un error diferente al esperado.\n` +
          `Esperado: ${textoEsperado}\n` +
          `Recibido: ${error.message}`
      );
    }

    console.log(`${nombrePrueba} ✅`);
  }
}

async function main(): Promise<void> {
  try {
    console.log("=======================================");
    console.log("PRUEBA INTEGRACIÓN - CHEQUERAS SERVICE");
    console.log("=======================================");

    // ---------------------------------------------------------
    // 1. LISTAR
    // ---------------------------------------------------------
    console.log("\n1. Probando LISTAR...");

    const chequeras = await chequerasService.listar();

    console.log(`Registros recuperados: ${chequeras.length}`);
    console.dir(chequeras, { depth: null });

    if (chequeras.length === 0) {
      throw new Error(
        "El Service no devolvió ninguna chequera."
      );
    }

    const primera = chequeras[0];

    if (!primera) {
      throw new Error(
        "No fue posible obtener la primera chequera."
      );
    }

    if (
      !Number.isInteger(primera.chequeraId) ||
      primera.chequeraId <= 0
    ) {
      throw new Error(
        "LISTAR devolvió un chequeraId inválido."
      );
    }

    console.log("LISTAR correcto ✅");

    // ---------------------------------------------------------
    // 2. OBTENER
    // ---------------------------------------------------------
    console.log("\n2. Probando OBTENER...");

    const detalle = await chequerasService.obtener(
      primera.chequeraId
    );

    console.dir(detalle, { depth: null });

    if (detalle.chequeraId !== primera.chequeraId) {
      throw new Error(
        "OBTENER devolvió una chequera diferente."
      );
    }

    console.log("OBTENER correcto ✅");

    // ---------------------------------------------------------
    // 3. LISTAR POR CUENTA
    // ---------------------------------------------------------
    console.log("\n3. Probando LISTAR_POR_CUENTA...");

    const porCuenta =
      await chequerasService.listarPorCuenta(
        primera.cuentaId
      );

    console.log(
      `Chequeras para CUENTA_ID ${primera.cuentaId}: ${porCuenta.length}`
    );

    console.dir(porCuenta, { depth: null });

    if (porCuenta.length === 0) {
      throw new Error(
        "LISTAR_POR_CUENTA no devolvió registros."
      );
    }

    const pertenece = porCuenta.every(
      (chequera) =>
        chequera.cuentaId === primera.cuentaId
    );

    if (!pertenece) {
      throw new Error(
        "LISTAR_POR_CUENTA devolvió una chequera de otra cuenta."
      );
    }

    console.log(
      "LISTAR_POR_CUENTA correcto ✅"
    );

    // ---------------------------------------------------------
    // 4. VALIDACIÓN DE ID DE CHEQUERA
    // ---------------------------------------------------------
    console.log(
      "\n4. Probando validaciones del Service..."
    );

    await esperarError(
      "Rechazar chequeraId = 0",
      async () => {
        await chequerasService.obtener(0);
      },
      "La chequera debe ser un número entero mayor que cero."
    );

    await esperarError(
      "Rechazar chequeraId negativo",
      async () => {
        await chequerasService.obtener(-1);
      },
      "La chequera debe ser un número entero mayor que cero."
    );

    await esperarError(
      "Rechazar cuentaId = 0",
      async () => {
        await chequerasService.listarPorCuenta(0);
      },
      "La cuenta bancaria debe ser un número entero mayor que cero."
    );

    // ---------------------------------------------------------
    // 5. VALIDACIÓN DE CREACIÓN
    //    Estos datos NO deben llegar a Oracle.
    // ---------------------------------------------------------
    await esperarError(
      "Rechazar rango invertido",
      async () => {
        await chequerasService.crear({
          cuentaId: 1,
          serie: "TEST",
          numeroInicial: 2000,
          numeroFinal: 1000,
          fechaRecepcion: new Date(),
          custodioId: 1,
          estado: "BORRADOR",
        });
      },
      "El número inicial no puede ser mayor que el número final."
    );

    await esperarError(
      "Rechazar fecha inválida",
      async () => {
        await chequerasService.crear({
          cuentaId: 1,
          serie: "TEST",
          numeroInicial: 2000,
          numeroFinal: 2100,
          fechaRecepcion: new Date("fecha-invalida"),
          custodioId: 1,
          estado: "BORRADOR",
        });
      },
      "La fecha de recepción no es válida."
    );

    await esperarError(
      "Rechazar custodio inválido",
      async () => {
        await chequerasService.crear({
          cuentaId: 1,
          serie: "TEST",
          numeroInicial: 2000,
          numeroFinal: 2100,
          fechaRecepcion: new Date(),
          custodioId: 0,
          estado: "BORRADOR",
        });
      },
      "El custodio debe ser un número entero mayor que cero."
    );

    console.log("\n=======================================");
    console.log("CHEQUERAS SERVICE FUNCIONANDO.");
    console.log("LISTAR                    ✅");
    console.log("OBTENER                   ✅");
    console.log("LISTAR_POR_CUENTA         ✅");
    console.log("VALIDACIÓN DE IDs         ✅");
    console.log("VALIDACIÓN DE RANGO       ✅");
    console.log("VALIDACIÓN DE FECHA       ✅");
    console.log("VALIDACIÓN DE CUSTODIO    ✅");
    console.log("=======================================");
  } catch (error) {
    console.error("\n=======================================");
    console.error("ERROR EN CHEQUERAS SERVICE");
    console.error("=======================================");

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