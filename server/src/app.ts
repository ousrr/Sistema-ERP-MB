import cors from "cors";
import bancoRouter from "./modules/bancos/bancos/routes/banco.routes.js";
import catalogoRouter from "./modules/bancos/catalogos/routes/catalogo.routes.js";
import cuentasRouter from "./modules/bancos/cuentas/cuentas.routes.js";
import cuentasProveedorRouter from "./modules/bancos/cuentas-proveedor/cuentas-proveedor.routes.js";
import formatosImportacionRouter from "./modules/bancos/formatos-importacion/formatosImportacion.routes.js";
import { chequerasRouter } from "./modules/bancos/chequeras/chequeras.routes.js";
import { plantillasChequeRouter } from "./modules/bancos/plantillas-cheque/plantillas-cheque.routes.js";
import { parametrosConciliacionRouter } from "./modules/bancos/parametros-conciliacion/parametros-conciliacion.routes.js";
import { reglasAprobacionRouter } from "./modules/bancos/reglas-aprobacion/reglas-aprobacion.routes.js";
import express from "express";

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/v1/bancos/bancos", bancoRouter);
app.use("/api/v1/bancos/catalogos", catalogoRouter);
app.use("/api/v1/bancos/cuentas", cuentasRouter);
app.use("/api/v1/bancos/cuentas-proveedor", cuentasProveedorRouter);
app.use("/api/v1/bancos/formatos-importacion", formatosImportacionRouter);
app.use("/api/v1/bancos/chequeras", chequerasRouter);
app.use("/api/v1/bancos/plantillas-cheque", plantillasChequeRouter);
app.use("/api/v1/bancos/parametros-conciliacion", parametrosConciliacionRouter);
app.use("/api/v1/bancos/reglas-aprobacion", reglasAprobacionRouter);
app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Backend ERP funcionando",
  });
});