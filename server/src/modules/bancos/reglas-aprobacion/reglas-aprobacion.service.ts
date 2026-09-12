import { ConfigService } from "../persona5/persona5.service.js";
import { definition } from "./reglas-aprobacion.types.js";
import { repository } from "./reglas-aprobacion.repository.js";
export const service = new ConfigService(definition, repository);

