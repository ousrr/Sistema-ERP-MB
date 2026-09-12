import { HttpError, type Definition, type Repository } from "./persona5.types.js";
import { validate, validateEntity, validateId } from "./persona5.validation.js";

export class ConfigService {
  constructor(public definition: Definition, private repository: Repository) {}
  list() { return this.repository.list(); }
  catalogs() { return this.repository.catalogs(); }
  async get(id: unknown) {
    const row = await this.repository.get(validateId(id));
    if (!row) throw new HttpError(404, "Registro no encontrado.");
    return row;
  }
  create(data: unknown) { return this.repository.create(validateEntity(data, this.definition)); }
  update(id: unknown, data: unknown) { return this.repository.update(validateId(id), validateEntity(data, this.definition, true)); }
  state(id: unknown, data: unknown) {
    const row = validate(data, [{ name: "estado", kind: "state" }], this.definition.states);
    return this.repository.state(validateId(id), row.estado!);
  }
  deactivate(id: unknown) { return this.repository.state(validateId(id), this.definition.inactive); }
  resolve(data: unknown) { return this.repository.resolve(validate(data, this.definition.resolver)); }
}

