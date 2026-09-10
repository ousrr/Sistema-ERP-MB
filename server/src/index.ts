import express from 'express';

import { probarConexionOracle } from './config/oracle.js';
import bancoRoutes from './modules/bancos/bancos/routes/banco.routes.js';
import catalogoRoutes from './modules/bancos/catalogos/routes/catalogo.routes.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());


// =========================================================
// HEALTH CHECK
// =========================================================

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'Backend ERP funcionando'
  });
});


// =========================================================
// RUTAS DEL MÓDULO DE BANCOS
// =========================================================

app.use(
  '/api/v1/bancos/bancos',
  bancoRoutes
);
app.use(
  '/api/v1/bancos/catalogos',
  catalogoRoutes
);


// =========================================================
// INICIO DEL SERVIDOR
// =========================================================

async function iniciarServidor(): Promise<void> {
  await probarConexionOracle();

  app.listen(PORT, () => {
    console.log(
      `Servidor ERP ejecutándose en http://localhost:${PORT}`
    );
  });
}

iniciarServidor().catch((error) => {
  console.error('No fue posible iniciar el backend.');
  console.error(error);
});