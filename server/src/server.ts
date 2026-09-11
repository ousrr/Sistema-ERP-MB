import "dotenv/config";
import { app } from "./app.js";
import {
  closeOraclePool,
  initializeOraclePool,
} from "./config/oracle.js";

const PORT = Number(process.env.PORT ?? 3000);

async function startServer(): Promise<void> {
  try {
    await initializeOraclePool();

    const server = app.listen(PORT, () => {
      console.log(`Backend ERP ejecutándose en http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Recibida señal ${signal}. Cerrando servidor...`);

      server.close(async () => {
        try {
          await closeOraclePool();
          process.exit(0);
        } catch (error) {
          console.error("Error al cerrar el pool Oracle:", error);
          process.exit(1);
        }
      });
    };

    process.once("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.once("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("No fue posible iniciar el backend:");
    console.error(error);
    process.exit(1);
  }
}

void startServer();
