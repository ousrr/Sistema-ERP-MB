import { configRouter } from "../persona5/persona5.routes.js";
import { service } from "./reglas-aprobacion.service.js";
export const reglasAprobacionRouter = configRouter(service);

