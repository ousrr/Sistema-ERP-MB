import { OracleConfigRepository } from "../persona5/persona5.repository.js";
import { definition } from "./reglas-aprobacion.types.js";
export const repository = new OracleConfigRepository(definition);

