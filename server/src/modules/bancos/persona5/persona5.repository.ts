import oracledb from "oracledb";
import { getOracleConnection } from "../../../config/oracle.js";
import { HttpError, type Definition, type Field, type Repository, type Row } from "./persona5.types.js";

// Every database operation invokes a public package method. No table DML here.
export class OracleConfigRepository implements Repository {
  constructor(private definition: Definition, private connect = getOracleConnection) {}

  private async transaction<T>(work: (c: oracledb.Connection) => Promise<T>): Promise<T> {
    const connection = await this.connect();
    try {
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally { await connection.close(); }
  }
  private args(fields: readonly Field[], data: Row): { sql: string; binds: oracledb.BindParameters } {
    const binds: oracledb.BindParameters = {};
    const sql = fields.map(f => {
      binds["p_" + f.name] = { dir: oracledb.BIND_IN, type: oracledb.STRING, val: data[f.name] ?? null };
      const bind = ":p_" + f.name;
      const value = f.kind === "date" ? "TO_DATE(" + bind + ", 'FXYYYY-MM-DD')" :
        ["id", "integer", "money", "percent"].includes(f.kind) ?
        "TO_NUMBER(" + bind + ", '999999999999999999999999999999D99', 'NLS_NUMERIC_CHARACTERS=''.,''')" : bind;
      return "p_" + f.name + " => " + value;
    }).join(", ");
    return { sql, binds };
  }
  private async cursor(method: string, fields: readonly Field[] = [], data: Row = {}, existing?: oracledb.Connection): Promise<Row[]> {
    const connection = existing ?? await this.connect();
    let cursor: oracledb.ResultSet<Record<string, string | null>> | undefined;
    try {
      const args = this.args(fields, data);
      const result = await connection.execute<{ p_resultado: oracledb.ResultSet<Record<string, string | null>> }>(
        "BEGIN " + this.definition.pkg + "." + method + "(" + (args.sql ? args.sql + ", " : "") + "p_resultado => :p_resultado); END;",
        { ...args.binds, p_resultado: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      cursor = result.outBinds?.p_resultado;
      if (!cursor) throw new Error("Package did not return a cursor.");
      const rows: Row[] = [];
      for (;;) {
        const batch = await cursor.getRows(250);
        for (const row of batch) rows.push(Object.fromEntries(Object.entries(row).map(([key, value]) => {
          const name = key.toLowerCase();
          const numeric = this.definition.fields.some(f => f.name === name && (f.kind === "money" || f.kind === "percent"));
          return [name, numeric && value?.startsWith(".") ? "0" + value : value];
        })));
        if (batch.length < 250) break;
      }
      return rows;
    } finally {
      try { if (cursor) await cursor.close(); } finally { if (!existing) await connection.close(); }
    }
  }
  list() { return this.cursor("LISTAR"); }
  async get(id: string, connection?: oracledb.Connection) {
    return (await this.cursor("OBTENER", [{ name: "id", kind: "id" }], { id }, connection))[0] ?? null;
  }
  create(data: Row) {
    return this.transaction(async connection => {
      const args = this.args(this.definition.fields, data);
      const result = await connection.execute<{ id: string }>(
        "DECLARE v_id NUMBER; BEGIN " + this.definition.pkg + ".CREAR(" + args.sql +
        ", p_id => v_id); :id := TO_CHAR(v_id, 'TM9'); END;",
        { ...args.binds, id: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 30 } }
      );
      const row = await this.get(result.outBinds!.id, connection);
      if (!row) throw new Error("Created record was not returned.");
      return row;
    });
  }
  update(id: string, data: Row) { return this.write("ACTUALIZAR", [{ name: "id", kind: "id" }, ...this.definition.fields.filter(f => !f.createOnly)], { id, ...data }); }
  state(id: string, estado: string) { return this.write("CAMBIAR_ESTADO", [{ name: "id", kind: "id" }, { name: "estado", kind: "state" }], { id, estado }); }
  private write(method: string, fields: readonly Field[], data: Row): Promise<Row> {
    return this.transaction(async connection => {
      const args = this.args(fields, data);
      await connection.execute("BEGIN " + this.definition.pkg + "." + method + "(" + args.sql + "); END;", args.binds);
      const row = await this.get(data.id!, connection);
      if (!row) throw new HttpError(404, "Registro no encontrado.");
      return row;
    });
  }
  async resolve(data: Row) { return (await this.cursor("RESOLVER_APLICABLE", this.definition.resolver, data))[0] ?? null; }
  async catalogs() {
    const result: Record<string, Row[]> = {};
    for (const [key, method] of Object.entries(this.definition.catalogs)) result[key] = await this.cursor(method);
    return result;
  }
}
