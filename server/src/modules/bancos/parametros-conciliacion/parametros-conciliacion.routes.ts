import { configRouter } from "../persona5/persona5.routes.js";
import { service } from "./parametros-conciliacion.service.js";
export const parametrosConciliacionRouter = configRouter(service);

