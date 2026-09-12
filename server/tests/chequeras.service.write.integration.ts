import "dotenv/config";

import { closeOraclePool } from "../src/config/oracle.js";
import { chequerasService } from "../src/modules/bancos/chequeras/chequeras.service.js";

async function main(): Promise<void> {
  let chequeraIdCreada: number | null = null;

  /*
   * Serie distinta en cada ejecución para evitar
   * colisiones si la prueba tuviera que repetirse.
   */
  const seriePrueba =
    `SVC${Date.now().toString().slice(-6)}`;

  try {
    console.log("============================================");
    console.log("PRUEBA ESCRITURA - CHEQUERAS SERVICE");
    console.log("============================================");

    // ---------------------------------------------------------
    // 1. CREAR
    // ---------------------------------------------------------
    console.log("\n1. Probando CREAR...");

    const creada = await chequerasService.crear({
      cuentaId: 1,
      serie: seriePrueba,
      numeroInicial: 2001,
      numeroFinal: 2050,
      fechaRecepcion: new Date(),
      custodioId: 1,
      ubicacionFisica: "Bóveda de prueba Service",
      documentoRecepcionId: null,
      estado: "BORRADOR",
      observaciones:
        "Chequera creada por prueba de integración del Service",
    });

    chequeraIdCreada = creada.chequeraId;

    console.dir(creada, { depth: null });

    if (!Number.isInteger(creada.chequeraId)) {
      throw new Error(
        "CREAR no devolvió un chequeraId válido."
      );
    }

    if (creada.serie !== seriePrueba) {
      throw new Error(
        `CREAR devolvió serie ${creada.serie}, pero se esperaba ${seriePrueba}.`
      );
    }

    if (creada.estado !== "BORRADOR") {
      throw new Error(
        `CREAR devolvió estado ${creada.estado}, pero se esperaba BORRADOR.`
      );
    }

    console.log(
      `CREAR correcto ✅ ID generado: ${creada.chequeraId}`
    );

    // ---------------------------------------------------------
    // 2. ACTUALIZAR
    // ---------------------------------------------------------
    console.log("\n2. Probando ACTUALIZAR...");

    const actualizada =
      await chequerasService.actualizar(
        creada.chequeraId,
        {
          cuentaId: 1,
          serie: seriePrueba,
          numeroInicial: 2001,
          numeroFinal: 2060,
          fechaRecepcion: creada.fechaRecepcion,
          custodioId: 1,
          ubicacionFisica:
            "Caja fuerte de prueba actualizada",
          documentoRecepcionId: null,
          observaciones:
            "Chequera actualizada desde Service",
        }
      );

    console.dir(actualizada, { depth: null });

    if (actualizada.numeroFinal !== 2060) {
      throw new Error(
        `ACTUALIZAR devolvió numeroFinal ${actualizada.numeroFinal}, pero se esperaba 2060.`
      );
    }

    if (
      actualizada.ubicacionFisica !==
      "Caja fuerte de prueba actualizada"
    ) {
      throw new Error(
        "ACTUALIZAR no modificó la ubicación física."
      );
    }

    console.log("ACTUALIZAR correcto ✅");

    // ---------------------------------------------------------
    // 3. CAMBIAR ESTADO → ACTIVA
    // ---------------------------------------------------------
    console.log(
      "\n3. Probando CAMBIAR_ESTADO → ACTIVA..."
    );

    const activada =
      await chequerasService.cambiarEstado(
        creada.chequeraId,
        "ACTIVA"
      );

    console.dir(activada, { depth: null });

    if (activada.estado !== "ACTIVA") {
      throw new Error(
        `CAMBIAR_ESTADO devolvió ${activada.estado}, pero se esperaba ACTIVA.`
      );
    }

    console.log(
      "CAMBIAR_ESTADO → ACTIVA correcto ✅"
    );

    // ---------------------------------------------------------
    // 4. DESACTIVAR
    // ---------------------------------------------------------
    console.log("\n4. Probando DESACTIVAR...");

    const desactivada =
      await chequerasService.desactivar(
        creada.chequeraId
      );

    console.dir(desactivada, { depth: null });

    if (desactivada.estado !== "INACTIVA") {
      throw new Error(
        `DESACTIVAR devolvió ${desactivada.estado}, pero se esperaba INACTIVA.`
      );
    }

    console.log("DESACTIVAR correcto ✅");

    // ---------------------------------------------------------
    // 5. COMPROBAR PERSISTENCIA
    // ---------------------------------------------------------
    console.log(
      "\n5. Verificando registro final en Oracle..."
    );

    const final =
      await chequerasService.obtener(
        creada.chequeraId
      );

    console.dir(final, { depth: null });

    if (final.estado !== "INACTIVA") {
      throw new Error(
        "La chequera no quedó INACTIVA en Oracle."
      );
    }

    if (final.numeroFinal !== 2060) {
      throw new Error(
        "La actualización no permaneció almacenada en Oracle."
      );
    }

    console.log(
      "Persistencia final correcta ✅"
    );

    // ---------------------------------------------------------
    // RESULTADO
    // ---------------------------------------------------------
    console.log("\n============================================");
    console.log("ESCRITURA DE CHEQUERAS FUNCIONANDO.");
    console.log("CREAR                  ✅");
    console.log("ACTUALIZAR             ✅");
    console.log("CAMBIAR_ESTADO         ✅");
    console.log("DESACTIVAR             ✅");
    console.log("PERSISTENCIA ORACLE    ✅");
    console.log("============================================");

    console.log(
      `Chequera de prueba final: ID ${creada.chequeraId}, estado INACTIVA.`
    );
  } catch (error) {
    console.error("\n============================================");
    console.error("ERROR EN ESCRITURA DE CHEQUERAS");
    console.error("============================================");

    if (chequeraIdCreada !== null) {
      console.error(
        `La prueba alcanzó a crear CHEQUERA_ID ${chequeraIdCreada}.`
      );
    }

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