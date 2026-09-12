import { HttpError, type Definition, type Field, type Row } from "./persona5.types.js";

export function validateId(value: unknown, digits = 19): string {
  if (typeof value !== "string" || !new RegExp("^([1-9][0-9]{0," + (digits - 1) + "})$").test(value)) {
    throw new HttpError(400, "ID invalido: use un entero positivo sin ceros iniciales.");
  }
  return value;
}
export function cents(value: string): bigint {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole!) * 100n + BigInt(fraction.padEnd(2, "0"));
}
export function validate(data: unknown, fields: readonly Field[], states: readonly string[] = []): Row {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new HttpError(400, "Se esperaba un objeto JSON.");
  const source = data as Record<string, unknown>;
  const unknown = Object.keys(source).find(key => !fields.some(f => f.name === key));
  if (unknown) throw new HttpError(400, "Campo no permitido: " + unknown);
  const result: Row = {};
  for (const f of fields) {
    const raw = source[f.name];
    if ((raw === null || raw === undefined || raw === "") && f.optional) { result[f.name] = null; continue; }
    if (typeof raw !== "string" || raw.trim() === "") throw new HttpError(400, f.name + ": campo obligatorio (texto).");
    const value = raw.trim();
    const fail = () => { throw new HttpError(400, f.name + ": valor o formato invalido."); };
    switch (f.kind) {
      case "id": validateId(value, (f.max ?? "9999999999").length); break;
      case "integer":
        if (!/^(0|[1-9][0-9]*)$/.test(value) || BigInt(value) > BigInt(f.max ?? "999") ||
            (f.name !== "tolerancia_dias" && value === "0")) fail();
        break;
      case "money": case "percent":
        if (!/^(0|[1-9][0-9]{0,15})(\.[0-9]{1,2})?$/.test(value)) fail();
        if (cents(value) > cents(f.kind === "percent" ? "100" : "9999999999999999.99")) fail();
        break;
      case "flag": if (value !== "S" && value !== "N") fail(); break;
      case "state": if (!states.includes(value)) fail(); break;
      case "text": if (Buffer.byteLength(value, "utf8") > Number(f.max ?? 100)) fail(); break;
      case "date": {
        const date = new Date(value + "T00:00:00Z");
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value < "0001-01-01" ||
            !Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== value) fail();
        break;
      }
    }
    result[f.name] = value;
  }
  return result;
}
export function validateEntity(data: unknown, definition: Definition, editing = false): Row {
  const row = validate(data, definition.fields.filter(f => !(editing && f.createOnly)), definition.states);
  if (definition.key === "reglas-aprobacion") {
    if (row.monto_maximo !== null && cents(row.monto_maximo!) <= cents(row.monto_minimo!))
      throw new HttpError(400, "El monto maximo debe ser mayor al minimo.");
    if (row.vigencia_hasta && row.vigencia_hasta < row.vigencia_desde!)
      throw new HttpError(400, "El fin de vigencia no puede ser anterior al inicio.");
    if (row.doble_aprobacion === "S" && BigInt(row.cantidad_aprobaciones!) < 2n)
      throw new HttpError(400, "Doble aprobacion requiere al menos dos aprobaciones.");
  }
  return row;
}

