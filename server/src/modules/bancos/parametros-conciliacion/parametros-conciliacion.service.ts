import { ConfigService } from "../persona5/persona5.service.js";
import { definition } from "./parametros-conciliacion.types.js";
import { repository } from "./parametros-conciliacion.repository.js";
export const service = new ConfigService(definition, repository);

