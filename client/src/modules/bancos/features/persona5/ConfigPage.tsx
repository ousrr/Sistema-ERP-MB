import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Pencil, Plus, RefreshCw } from "lucide-react";
import { PageContainer } from "../../../../shared/layout/PageContainer";
import { Card } from "../../../../shared/ui/Card";
import { Button } from "../../../../shared/ui/Button";
import { IconButton } from "../../../../shared/ui/IconButton";
import { Badge } from "../../../../shared/ui/Badge";
import { Input } from "../../../../shared/forms/Input";
import { Select } from "../../../../shared/forms/Select";
import { FormField } from "../../../../shared/forms/FormField";
import { SearchInput } from "../../../../shared/forms/SearchInput";
import { DataTable } from "../../../../shared/tables/DataTable";
import { Alert } from "../../../../shared/feedback/Alert";
import { configApi } from "./api";
import type { Catalogs, Config, Field, Row } from "./types";
import "./persona5.css";

const message = (error: unknown) => error instanceof Error ? error.message : "No se pudo completar la operación.";
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const labelState = (state: string) => ({ ACTIVO: "Activo", INACTIVO: "Inactivo", ACTIVA: "Activa", INACTIVA: "Inactiva", BORRADOR: "Borrador" }[state] ?? state);

function FieldInput({ field, value, values, catalogs, config, onChange }: {
  field: Field; value: string; values: Row; catalogs: Catalogs; config: Config; onChange: (v: string) => void;
}) {
  let options = field.catalog ? catalogs[field.catalog] ?? [] : [];
  if (field.name === "cuenta_id") options = options.filter(row => row.banco_id === values.banco_id);
  const missingOption = value && field.catalog && !options.some(row => row.id === value);
  return <FormField label={field.label} required={!field.optional} help={field.help}>
    {field.kind === "flag" ? <Select value={value} required onChange={e => onChange(e.target.value)}>
      <option value="S">Sí</option><option value="N">No</option>
    </Select> : field.kind === "state" ? <Select value={value} required onChange={e => onChange(e.target.value)}>
      {config.states.map(s => <option key={s} value={s}>{labelState(s)}</option>)}
    </Select> : field.catalog ? <Select value={value} required={!field.optional} onChange={e => onChange(e.target.value)}>
      <option value="">{field.optional ? "Todas las cuentas (general del banco)" : "Seleccione…"}</option>
      {missingOption && <option value={value}>ID {value} (no disponible en catálogo)</option>}
      {options.map(row => <option key={row.id} value={row.id!}>{row.nombre}{row.estado !== "ACTIVO" && row.estado !== "ACTIVA" ? " (inactivo)" : ""}</option>)}
    </Select> : <Input value={value} required={!field.optional}
      type={field.kind === "date" ? "date" : "text"}
      inputMode={["id", "integer"].includes(field.kind) ? "numeric" : ["money", "percent"].includes(field.kind) ? "decimal" : undefined}
      pattern={["id", "integer"].includes(field.kind) ? "[0-9]+" : ["money", "percent"].includes(field.kind) ? "[0-9]+([.][0-9]{1,2})?" : undefined}
      maxLength={field.kind === "text" ? Number(field.max ?? 100) : field.kind === "id" ? (field.max ?? "9999999999").length : undefined}
      placeholder={field.optional ? "Sin límite" : undefined}
      onChange={e => onChange(e.target.value)} />}
  </FormField>;
}

function EntryDialog({ config, record, catalogs, resolving, onClose, onSaved }: {
  config: Config; record: Row | null; catalogs: Catalogs; resolving: boolean; onClose: () => void; onSaved: (row: Row) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const api = useMemo(() => configApi(config.key), [config.key]);
  const fields = resolving ? config.resolver : config.fields.filter(f => !(record && f.createOnly));
  const initial = Object.fromEntries(fields.map(f => [f.name, record?.[f.name] ?? config.defaults[f.name] ?? ""])) as Row;
  const [values, setValues] = useState<Row>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Row | null | undefined>();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const close = () => { if (!busy && (resolving || !dirty || window.confirm("¿Descartar los cambios sin guardar?"))) onClose(); };
  useEffect(() => {
    const current = dialog.current!;
    current.showModal();
    return () => current.close();
  }, []);
  const groups = [...new Set(fields.map(f => f.group))];
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setResult(undefined);
    const payload = Object.fromEntries(fields.map(f => [f.name, values[f.name] === "" && f.optional ? null : values[f.name]])) as Row;
    try {
      if (resolving) setResult(await api.resolve(payload));
      else { await onSaved(await api.save(payload, record?.[config.id] ?? undefined)); onClose(); }
    } catch (e) { setError(message(e)); }
    finally { setBusy(false); }
  }
  return <dialog className="p5-dialog" ref={dialog} aria-labelledby="p5-dialog-title" onCancel={e => { e.preventDefault(); close(); }}>
    <form onSubmit={submit}>
      <header><h2 id="p5-dialog-title">{resolving ? "Consultar configuración aplicable" : (record ? "Editar " : "Nuevo: ") + config.singular}</h2>
        <p>{resolving ? "Consulta las reglas guardadas en Oracle; no modifica datos." : "Los campos marcados con * son obligatorios."}</p></header>
      <div className="p5-dialog-content">
        {error && <div role="alert"><Alert>{error}</Alert></div>}
        {groups.map(group => <fieldset key={group} disabled={busy}><legend>{group}</legend>
          <div className="p5-form-grid">{fields.filter(f => f.group === group).map(field =>
            <FieldInput key={field.name} field={field} config={config} catalogs={catalogs} value={values[field.name] ?? ""} values={values}
              onChange={value => { setResult(undefined); setValues(previous => ({ ...previous, [field.name]: value, ...(field.name === "banco_id" ? { cuenta_id: "" } : {}) })); }} />
          )}</div></fieldset>)}
        {result !== undefined && <section className="p5-result" aria-live="polite">
          <h3>{result ? "Configuración encontrada · ID " + result[config.id] : "Sin configuración aplicable"}</h3>
          {result ? <RecordDetails config={config} record={result} /> : <p>No hay una configuración activa que coincida con estos datos. No se aplicó ningún valor predeterminado.</p>}
        </section>}
      </div>
      <footer><Button type="button" variant="secondary" disabled={busy} onClick={close}>{resolving ? "Cerrar" : "Cancelar"}</Button>
        <Button type="submit" disabled={busy}>{busy ? "Procesando…" : resolving ? "Consultar" : "Guardar"}</Button></footer>
    </form>
  </dialog>;
}

function RecordDetails({ config, record }: { config: Config; record: Row }) {
  return <dl className="p5-details">{config.fields.map(field => <div key={field.name}><dt>{field.label}</dt>
    <dd>{record[field.name] === null ? (field.name === "cuenta_id" ? "General del banco" : "Sin límite") :
      field.kind === "flag" ? (record[field.name] === "S" ? "Sí" : "No") :
      field.kind === "state" ? labelState(record[field.name]!) : record[field.name]}</dd></div>)}
      {record.creado_en && <div><dt>Creado en</dt><dd>{record.creado_en.replace("T", " ")}</dd></div>}
    </dl>;
}

export function ConfigPage({ config }: { config: Config }) {
  const api = useMemo(() => configApi(config.key), [config.key]);
  const [rows, setRows] = useState<Row[]>([]);
  const [catalogs, setCatalogs] = useState<Catalogs>({});
  const [catalogsReady, setCatalogsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("TODOS");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ record: Row | null; resolving: boolean } | null>(null);
  const requestId = useRef(0);
  async function load(signal?: AbortSignal) {
    const request = ++requestId.current;
    setLoading(true); setError("");
    try {
      const [newRows, newCatalogs] = await Promise.all([api.list(signal), api.catalogs(signal)]);
      if (signal?.aborted || request !== requestId.current) return;
      setRows(newRows); setCatalogs(newCatalogs); setCatalogsReady(true);
      setSelectedId(current => newRows.some(row => row[config.id] === current) ? current : newRows[0]?.[config.id] ?? null);
    } catch (e) {
      if (!signal?.aborted && request === requestId.current) { setError(message(e)); setCatalogsReady(false); }
    } finally { if (!signal?.aborted && request === requestId.current) setLoading(false); }
  }
  useEffect(() => {
    document.body.classList.add("persona5-route");
    const controller = new AbortController();
    void load(controller.signal);
    return () => { controller.abort(); document.body.classList.remove("persona5-route"); };
  }, [api]);
  const visible = rows.filter(row => (state === "TODOS" || row.estado === state) && normalize(Object.values(row).join(" ")).includes(normalize(search)));
  const selected = rows.find(row => row[config.id] === selectedId);
  async function saved(row: Row) {
    setRows(current => [row, ...current.filter(r => r[config.id] !== row[config.id])]);
    setSelectedId(row[config.id]); setNotice("Cambios guardados en Oracle."); setError("");
  }
  async function changeState(row: Row) {
    const next = row.estado === config.active ? config.inactive : config.active;
    if (!window.confirm("¿Cambiar el registro " + row[config.id] + " a " + labelState(next).toLowerCase() + "?")) return;
    setBusy(true); setError(""); setNotice("");
    try { await saved(await api.state(row[config.id]!, next)); }
    catch (e) { setError(message(e)); } finally { setBusy(false); }
  }
  return <PageContainer><section className="p5-page">
    <nav className="p5-breadcrumb" aria-label="Ruta">Bancos <span>/</span> Configuración <span>/</span> <strong>{config.title}</strong></nav>
    <div className="p5-title-row"><div><h1>{config.title}</h1><p>{config.description}</p></div>
      <Button disabled={!catalogsReady || loading || busy} onClick={() => { setNotice(""); setModal({ record: null, resolving: false }); }}><Plus size={16} /> Nuevo registro</Button></div>
    {error && <div role="alert"><Alert>{error}</Alert></div>}
    {notice && <p className="p5-notice" role="status">{notice}</p>}
    <div className="p5-grid"><Card>
      <div className="p5-toolbar">
        <SearchInput aria-label="Buscar registros" placeholder="Buscar por nombre, ID o estado…" value={search} onChange={e => setSearch(e.target.value)} />
        <Select aria-label="Filtrar por estado" value={state} onChange={e => setState(e.target.value)}>
          <option value="TODOS">Todos los estados</option>{config.states.map(s => <option key={s} value={s}>{labelState(s)}</option>)}
        </Select>
        <IconButton label="Actualizar lista" icon={<RefreshCw size={16} />} disabled={loading || busy} onClick={() => void load()} />
      </div>
      {loading ? <p role="status" className="p5-empty">Cargando desde Oracle…</p> : visible.length === 0 ?
        <div className="p5-empty"><h3>{error ? "No se pudieron cargar los registros" : rows.length ? "No hay coincidencias" : "Todavía no hay registros"}</h3>
          <p>{error ? "Revise el mensaje de error y pulse Actualizar lista." : rows.length ? "Pruebe otro filtro o término de búsqueda." : "Cree la primera configuración con Nuevo registro."}</p></div> :
        <DataTable headers={["ID", ...config.columns.map(c => c.label), "Estado", "Acciones"]}>
          {visible.map(row => <tr key={row[config.id]} className={row[config.id] === selectedId ? "p5-selected" : ""}>
            <td><button type="button" className="p5-record-link" aria-label={"Ver detalle del registro " + row[config.id]} aria-pressed={row[config.id] === selectedId} onClick={() => setSelectedId(row[config.id])}>{row[config.id]}</button></td>
            {config.columns.map(c => <td key={c.label}>{c.value(row)}</td>)}<td><Badge>{labelState(row.estado!)}</Badge></td>
            <td><div className="p5-actions"><IconButton label={"Editar registro " + row[config.id]} icon={<Pencil size={15} />} disabled={busy || !catalogsReady} onClick={() => setModal({ record: row, resolving: false })} />
              <Button variant="ghost" disabled={busy} onClick={() => void changeState(row)}>{row.estado === config.active ? "Inactivar" : "Activar"}</Button></div></td>
          </tr>)}
        </DataTable>}
      <p className="p5-count">{visible.length} de {rows.length} registros · La inactivación conserva el registro.</p>
    </Card><aside><Card><h2>Detalle de configuración</h2>
      {selected ? <><p className="p5-muted">Registro #{selected[config.id]}</p><RecordDetails config={config} record={selected} /></> :
        <p className="p5-muted">Seleccione el ID de un registro para ver todos sus campos.</p>}
    </Card><Card><h2>Consultar regla aplicable</h2><p className="p5-muted">{config.key === "parametros-conciliacion" ?
      "Se prioriza la cuenta específica. Si no tiene configuración activa, se usa la general del banco." :
      "Busca por empresa, operación, moneda, monto y fecha. Los rangos activos no pueden superponerse."}</p>
      <Button variant="outline" disabled={!catalogsReady || loading || busy} onClick={() => setModal({ record: null, resolving: true })}>Consultar en Oracle</Button>
    </Card></aside></div>
    {modal && <EntryDialog config={config} record={modal.record} resolving={modal.resolving} catalogs={catalogs} onClose={() => setModal(null)} onSaved={saved} />}
  </section></PageContainer>;
}
