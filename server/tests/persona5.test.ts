import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import express from "express";
import type { AddressInfo } from "node:net";
import { definition as parameters } from "../src/modules/bancos/parametros-conciliacion/parametros-conciliacion.types.js";
import { definition as rules } from "../src/modules/bancos/reglas-aprobacion/reglas-aprobacion.types.js";
import { validate, validateEntity, validateId, cents } from "../src/modules/bancos/persona5/persona5.validation.js";
import { ConfigService } from "../src/modules/bancos/persona5/persona5.service.js";
import { configRouter } from "../src/modules/bancos/persona5/persona5.routes.js";
import { OracleConfigRepository } from "../src/modules/bancos/persona5/persona5.repository.js";
import type { Row, Repository } from "../src/modules/bancos/persona5/persona5.types.js";
import type oracledb from "oracledb";

const parameter: Row = {
  banco_id: "1", cuenta_id: null, tolerancia_dias: "2", tolerancia_monto: "1.50",
  coincide_referencia: "S", coincide_cheque: "N", coincide_beneficiario: "S",
  coincide_concepto: "N", porcentaje_minimo: "95", revision_manual: "S", estado: "ACTIVO",
};
const rule: Row = {
  empresa_id: "1", tipo_operacion_id: "2", moneda_id: "1", nombre: "Transferencias",
  monto_minimo: "0", monto_maximo: "10000", cantidad_aprobaciones: "2",
  doble_aprobacion: "S", requiere_evidencia: "S", permite_reprogramar: "N",
  vigencia_desde: "2026-01-01", vigencia_hasta: null, version: "1", estado: "ACTIVA", creado_por: "1",
};
test("exact schema accepts the four matching flags and nullable account", () => {
  assert.deepEqual(validateEntity(parameter, parameters), parameter);
});
test("IDs retain all 19 digits", () => assert.equal(validateId("9999999999999999999"), "9999999999999999999"));
test("IDs reject unsafe JS numbers and leading zeros", () => {
  for (const id of [1, 9007199254740993, "01", "0", "-1", "1 OR 1=1", "10000000000000000000"]) assert.throws(() => validateId(id));
});
test("NUMBER(18,2) stays exact at maximum precision", () => {
  assert.equal(cents("9999999999999999.99"), 999999999999999999n);
  assert.equal(validateEntity({ ...rule, monto_minimo: "9999999999999999.98", monto_maximo: "9999999999999999.99" }, rules).monto_maximo, "9999999999999999.99");
});
for (const value of ["-1", "0.001", "1e3", "1,25", "10000000000000000", "NaN", "Infinity"]) {
  test("invalid money " + value, () => assert.throws(() => validateEntity({ ...parameter, tolerancia_monto: value }, parameters)));
}
test("days use original NUMBER(3), not a made-up 365-day cap", () => {
  assert.equal(validateEntity({ ...parameter, tolerancia_dias: "999" }, parameters).tolerancia_dias, "999");
  for (const value of ["1000", "1.5", "-1"]) assert.throws(() => validateEntity({ ...parameter, tolerancia_dias: value }, parameters));
});
test("percentage boundaries", () => {
  for (const value of ["0", "100", "99.99"]) validateEntity({ ...parameter, porcentaje_minimo: value }, parameters);
  assert.throws(() => validateEntity({ ...parameter, porcentaje_minimo: "100.01" }, parameters));
});
test("original state vocabularies stay distinct", () => {
  assert.throws(() => validateEntity({ ...parameter, estado: "ACTIVA" }, parameters));
  assert.throws(() => validateEntity({ ...rule, estado: "ACTIVO" }, rules));
  validateEntity({ ...rule, estado: "BORRADOR" }, rules);
});
test("every S/N flag rejects arbitrary strings", () => {
  for (const definition of [parameters, rules]) for (const f of definition.fields.filter(f => f.kind === "flag"))
    assert.throws(() => validateEntity({ ...(definition === parameters ? parameter : rule), [f.name]: "YES" }, definition));
});
test("equal or inverted range is rejected; open-ended is allowed", () => {
  for (const max of ["10", "9.99"]) assert.throws(() => validateEntity({ ...rule, monto_minimo: "10", monto_maximo: max }, rules));
  validateEntity({ ...rule, monto_maximo: null }, rules);
});
test("date validation rejects invalid calendar dates and inverted period", () => {
  for (const date of ["2025-02-29", "2026-13-01", "2026-02-30", "0000-01-01", "2026-01-01T00:00:00"]) assert.throws(() => validateEntity({ ...rule, vigencia_desde: date }, rules));
  validateEntity({ ...rule, vigencia_desde: "2024-02-29" }, rules);
  assert.throws(() => validateEntity({ ...rule, vigencia_hasta: "2025-12-31" }, rules));
});
test("double approval requires at least two", () => assert.throws(() => validateEntity({ ...rule, cantidad_aprobaciones: "1" }, rules)));
test("approval count and version precision", () => {
  for (const field of ["cantidad_aprobaciones", "version"]) assert.throws(() => validateEntity({ ...rule, [field]: "0" }, rules));
  assert.throws(() => validateEntity({ ...rule, cantidad_aprobaciones: "1000" }, rules));
  assert.throws(() => validateEntity({ ...rule, version: "100000" }, rules));
});
test("creator is create-only and text is constrained in bytes", () => {
  assert.throws(() => validateEntity(rule, rules, true));
  const edit = { ...rule }; delete edit.creado_por;
  validateEntity(edit, rules, true);
  assert.throws(() => validateEntity({ ...rule, nombre: "á".repeat(51) }, rules));
});
test("unknown demo columns are not silently accepted", () => {
  assert.throws(() => validateEntity({ ...parameter, revision: "1" }, parameters));
  assert.throws(() => validateEntity({ ...rule, moneda: "GTQ" }, rules));
});
test("resolver requires real dimensions", () => {
  validate({ banco_id: "1", cuenta_id: null }, parameters.resolver);
  assert.throws(() => validate({ empresa_id: "1" }, rules.resolver));
});

test("HTTP routes validate, preserve IDs, map package errors and never delete rows", async (t) => {
  let stored: Row = { parametro_id: "9007199254740993", ...parameter };
  const repo: Repository = {
    list: async () => [stored], get: async id => id === stored.parametro_id ? stored : null,
    create: async data => { stored = { parametro_id: stored.parametro_id, ...data }; return stored; },
    update: async (_id, data) => { stored = { ...stored, ...data }; return stored; },
    state: async (_id, state) => {
      if (state === "ACTIVO") throw { errorNum: 20002, message: "ORA-20002: Conflicto de prueba.\nORA-06512: interna" };
      stored = { ...stored, estado: state }; return stored;
    },
    resolve: async () => null,
    catalogs: async () => ({ bancos: [], cuentas: [] }),
  };
  const app = express(); app.use(express.json()); app.use("/test", configRouter(new ConfigService(parameters, repo)));
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise<void>((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  } catch (error) {
    if (["EPERM", "EACCES"].includes((error as NodeJS.ErrnoException).code ?? "")) {
      t.skip("This execution environment does not allow listening sockets.");
      return;
    }
    throw error;
  }
  const base = "http://127.0.0.1:" + (server.address() as AddressInfo).port + "/test";
  const send = (path: string, method = "GET", body?: unknown) => fetch(base + path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  try {
    const list = await send(""); assert.equal(list.status, 200); assert.equal((await list.json()).data[0].parametro_id, "9007199254740993");
    assert.equal((await send("/catalogos")).status, 200);
    assert.equal((await send("/2")).status, 404);
    assert.equal((await send("/0")).status, 400);
    assert.equal((await send("", "POST", { ...parameter, tolerancia_dias: "-1" })).status, 400);
    assert.equal((await send("", "POST", parameter)).status, 201);
    const edited = await send("/" + stored.parametro_id, "PUT", { ...parameter, tolerancia_dias: "4" });
    assert.equal((await edited.json()).data.tolerancia_dias, "4");
    const deleted = await send("/" + stored.parametro_id, "DELETE");
    assert.equal((await deleted.json()).data.estado, "INACTIVO");
    assert.equal((await send("")).status, 200); // Record remains.
    const conflict = await send("/" + stored.parametro_id + "/estado", "PATCH", { estado: "ACTIVO" });
    assert.equal(conflict.status, 409); assert.equal((await conflict.json()).message, "Conflicto de prueba.");
    assert.equal((await (await send("/resolver", "POST", { banco_id: "1", cuenta_id: null })).json()).data, null);
  } finally { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); }
});

function fakeConnection(fail = false) {
  const calls: string[] = [];
  let bindSeen: unknown;
  const connection = {
    async execute(sql: string, binds: unknown) {
      calls.push(sql);
      if (sql.includes(".CREAR")) {
        bindSeen = binds;
        if (fail) throw new Error("write failed");
        return { outBinds: { id: "9007199254740993" } };
      }
      return { outBinds: { p_resultado: {
        async getRows() { return [{ PARAMETRO_ID: "9007199254740993", TOLERANCIA_MONTO: ".50" }]; },
        async close() { calls.push("cursor.close"); },
      } } };
    },
    async commit() { calls.push("commit"); },
    async rollback() { calls.push("rollback"); },
    async close() { calls.push("connection.close"); },
  } as unknown as oracledb.Connection;
  return { connection, calls, get binds() { return bindSeen as Record<string, { val: string }>; } };
}
test("repository calls packages, binds decimal strings and closes cursors before commit", async () => {
  const mock = fakeConnection();
  const repo = new OracleConfigRepository(parameters, async () => mock.connection);
  const row = await repo.create({ ...parameter, tolerancia_monto: "9999999999999999.99" });
  assert.equal(row.parametro_id, "9007199254740993");
  assert.equal(row.tolerancia_monto, "0.50");
  assert.equal(mock.binds.p_tolerancia_monto.val, "9999999999999999.99");
  assert.deepEqual(mock.calls.slice(-3), ["cursor.close", "commit", "connection.close"]);
  assert.ok(mock.calls[0]!.includes("PKG_MB_PARAMETROS_CONCILIACION.CREAR"));
  assert.ok(mock.calls[0]!.includes("NLS_NUMERIC_CHARACTERS"));
});
test("repository rolls back failed writes and always closes the connection", async () => {
  const mock = fakeConnection(true);
  await assert.rejects(new OracleConfigRepository(parameters, async () => mock.connection).create(parameter));
  assert.deepEqual(mock.calls.slice(-2), ["rollback", "connection.close"]);
  assert.ok(!mock.calls.includes("commit"));
});
test("package signatures, original columns and API metadata match", () => {
  const original = readFileSync(new URL("../../database/persona5/referencia/modulo_bancos_oracle_MB.sql", import.meta.url), "utf8");
  for (const definition of [parameters, rules]) {
    const table = definition === parameters ? "MB_PARAMETRO_CONCILIACION" : "MB_REGLA_APROBACION_BANCARIA";
    const ddl = original.split("CREATE TABLE " + table + " (")[1]!.split("\n);")[0]!;
    const spec = readFileSync(new URL("../../database/persona5/" + definition.pkg.toLowerCase() + ".pks", import.meta.url), "utf8");
    const body = readFileSync(new URL("../../database/persona5/" + definition.pkg.toLowerCase() + ".pkb", import.meta.url), "utf8");
    for (const field of definition.fields) {
      assert.ok(ddl.includes(field.name + " "), field.name + " must exist in original DDL");
      assert.ok(spec.includes("p_" + field.name + " IN " + table + "." + field.name + "%TYPE"));
    }
    for (const method of ["LISTAR", "OBTENER", "CREAR", "ACTUALIZAR", "CAMBIAR_ESTADO", "DESACTIVAR", "RESOLVER_APLICABLE", ...Object.values(definition.catalogs)]) {
      assert.ok(spec.includes("PROCEDURE " + method + "(")); assert.ok(body.includes("PROCEDURE " + method + "("));
    }
    assert.ok(body.includes("LOCK TABLE " + table + " IN SHARE ROW EXCLUSIVE MODE WAIT 5"));
    assert.ok(spec.includes("FUNCTION OBTENER_ID_APLICABLE("));
    assert.ok(body.includes("FUNCTION OBTENER_ID_APLICABLE("));
    assert.ok(!/^\s*(COMMIT|ROLLBACK|DELETE FROM|DROP TABLE)/mi.test(body));
    assert.ok(body.indexOf("p_tolerancia_monto <> ROUND") < body.indexOf("r.tolerancia_monto := p_tolerancia_monto") || definition === rules);
  }
});
