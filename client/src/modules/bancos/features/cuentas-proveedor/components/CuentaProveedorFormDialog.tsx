import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";

import { Alert } from "../../../../../shared/feedback/Alert";
import { FormField } from "../../../../../shared/forms/FormField";
import { Input } from "../../../../../shared/forms/Input";
import { Select } from "../../../../../shared/forms/Select";
import { Button } from "../../../../../shared/ui/Button";
import { IconButton } from "../../../../../shared/ui/IconButton";

import type {
  ActualizarCuentaProveedorInput,
  CrearCuentaProveedorInput,
  CuentaProveedor,
  EstadoCuentaProveedor,
} from "../types/cuentas-proveedor.types";

export interface OpcionProveedor {
  id: number;
  etiqueta: string;
}

export interface OpcionNumericaSegura {
  id: string;
  etiqueta: string;
}

export interface DependenciasCuentaProveedor {
  proveedores: OpcionProveedor[];
  bancos: OpcionProveedor[];
  tiposCuenta: OpcionProveedor[];
  monedas: OpcionProveedor[];
  documentos: OpcionNumericaSegura[];
  cuentasAnteriores: OpcionNumericaSegura[];
}

interface Props {
  mode: "create" | "edit";
  cuenta?: CuentaProveedor | null;
  dependencias: DependenciasCuentaProveedor;
  procesando?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (
    input: CrearCuentaProveedorInput | ActualizarCuentaProveedorInput
  ) => Promise<void> | void;
}

type ErroresFormulario = {
  proveedorId?: string;
  bancoId?: string;
  tipoCuentaId?: string;
  monedaId?: string;
  cuentaAnteriorId?: string;
  titular?: string;
  numeroCuenta?: string;
  cartaSolicitudDocId?: string;
  constanciaBancoDocId?: string;
  representanteDocId?: string;
  motivoRegistro?: string;
  observaciones?: string;
};

const ESTADOS_CREACION: EstadoCuentaProveedor[] = [
  "PENDIENTE",
  "EN_REVISION",
];

function hoyLocal(): string {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fechaInput(valor: string | null | undefined): string {
  if (!valor) return "";
  return valor.slice(0, 10);
}

function validarId19(valor: string): boolean {
  return /^[1-9]\d{0,18}$/.test(valor);
}

export function CuentaProveedorFormDialog({
  mode,
  cuenta = null,
  dependencias,
  procesando = false,
  error = null,
  onCancel,
  onSubmit,
}: Props) {
  const editando = mode === "edit";

  const [proveedorId, setProveedorId] = useState(0);
  const [bancoId, setBancoId] = useState(0);
  const [tipoCuentaId, setTipoCuentaId] = useState(0);
  const [monedaId, setMonedaId] = useState(0);
  const [cuentaAnteriorId, setCuentaAnteriorId] = useState("");
  const [titular, setTitular] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [cartaSolicitudDocId, setCartaSolicitudDocId] = useState("");
  const [constanciaBancoDocId, setConstanciaBancoDocId] = useState("");
  const [representanteDocId, setRepresentanteDocId] = useState("");
  const [motivoRegistro, setMotivoRegistro] = useState("");
  const [fechaVigencia, setFechaVigencia] = useState("");
  const [estado, setEstado] = useState<EstadoCuentaProveedor>("PENDIENTE");
  const [observaciones, setObservaciones] = useState("");
  const [errores, setErrores] = useState<ErroresFormulario>({});

  useEffect(() => {
    setErrores({});

    if (!cuenta) {
      setFechaVigencia(hoyLocal());
      return;
    }

    setProveedorId(cuenta.proveedorId);
    setBancoId(cuenta.bancoId);
    setTipoCuentaId(cuenta.tipoCuentaId);
    setMonedaId(cuenta.monedaId);
    setCuentaAnteriorId(cuenta.cuentaAnteriorId ?? "");
    setTitular(cuenta.titular);
    setNumeroCuenta(cuenta.numeroCuenta);
    setCartaSolicitudDocId(cuenta.cartaSolicitudDocId);
    setConstanciaBancoDocId(cuenta.constanciaBancoDocId);
    setRepresentanteDocId(cuenta.representanteDocId ?? "");
    setMotivoRegistro(cuenta.motivoRegistro);
    setFechaVigencia(fechaInput(cuenta.fechaVigencia));
    setEstado(cuenta.estado);
    setObservaciones(cuenta.observaciones ?? "");
  }, [cuenta]);

  const dependenciasFaltantes = useMemo(() => {
    const faltantes: string[] = [];
    if (dependencias.proveedores.length === 0) faltantes.push("proveedores");
    if (dependencias.bancos.length === 0) faltantes.push("bancos");
    if (dependencias.tiposCuenta.length === 0) faltantes.push("tipos de cuenta");
    if (dependencias.monedas.length === 0) faltantes.push("monedas");
    if (dependencias.documentos.length === 0) faltantes.push("documentos");
    return faltantes;
  }, [dependencias]);

  function limpiarError(campo: keyof ErroresFormulario): void {
    setErrores((actuales) => {
      if (!actuales[campo]) return actuales;

      return {
        ...actuales,
        [campo]: undefined,
      };
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nuevosErrores: ErroresFormulario = {};

    if (proveedorId <= 0) {
      nuevosErrores.proveedorId = "Seleccione un proveedor.";
    }

    if (bancoId <= 0) {
      nuevosErrores.bancoId = "Seleccione un banco.";
    }

    if (tipoCuentaId <= 0) {
      nuevosErrores.tipoCuentaId = "Seleccione un tipo de cuenta.";
    }

    if (monedaId <= 0) {
      nuevosErrores.monedaId = "Seleccione una moneda.";
    }

    if (!titular.trim()) {
      nuevosErrores.titular = "El titular es obligatorio.";
    } else if (titular.trim().length > 150) {
      nuevosErrores.titular = "El titular no puede superar 150 caracteres.";
    }

    if (!numeroCuenta.trim()) {
      nuevosErrores.numeroCuenta = "El número de cuenta es obligatorio.";
    } else if (numeroCuenta.trim().length > 34) {
      nuevosErrores.numeroCuenta = "El número de cuenta no puede superar 34 caracteres.";
    }

    if (!cartaSolicitudDocId) {
      nuevosErrores.cartaSolicitudDocId = "Seleccione la carta de solicitud.";
    } else if (!validarId19(cartaSolicitudDocId)) {
      nuevosErrores.cartaSolicitudDocId = "La carta de solicitud no es válida.";
    }

    if (!constanciaBancoDocId) {
      nuevosErrores.constanciaBancoDocId = "Seleccione la constancia bancaria.";
    } else if (!validarId19(constanciaBancoDocId)) {
      nuevosErrores.constanciaBancoDocId = "La constancia bancaria no es válida.";
    }

    if (cuentaAnteriorId && !validarId19(cuentaAnteriorId)) {
      nuevosErrores.cuentaAnteriorId = "La cuenta anterior no es válida.";
    }

    if (representanteDocId && !validarId19(representanteDocId)) {
      nuevosErrores.representanteDocId = "El documento del representante no es válido.";
    }

    if (!motivoRegistro.trim()) {
      nuevosErrores.motivoRegistro = "El motivo del registro es obligatorio.";
    } else if (motivoRegistro.trim().length > 500) {
      nuevosErrores.motivoRegistro = "El motivo del registro no puede superar 500 caracteres.";
    }

    if (observaciones.length > 500) {
      nuevosErrores.observaciones = "Las observaciones no pueden superar 500 caracteres.";
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    const base = {
      proveedorId,
      bancoId,
      tipoCuentaId,
      monedaId,
      cuentaAnteriorId: cuentaAnteriorId || null,
      titular: titular.trim(),
      numeroCuenta: numeroCuenta.trim(),
      cartaSolicitudDocId,
      constanciaBancoDocId,
      representanteDocId: representanteDocId || null,
      motivoRegistro: motivoRegistro.trim(),
      fechaVigencia: fechaVigencia || null,
      observaciones: observaciones.trim() || null,
    };

    if (editando && cuenta) {
      await onSubmit({
        ctaProveedorId: cuenta.ctaProveedorId,
        ...base,
      });
      return;
    }

    await onSubmit({
      ...base,
      estado,
    });
  }

  return (
    <div className="cuentas-proveedor-dialog-backdrop" role="presentation">
      <section
        className="cuentas-proveedor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cuenta-proveedor-dialog-title"
      >
        <div className="cuentas-proveedor-dialog__header">
          <div>
            <span>{editando ? "Edición" : "Registro"}</span>
            <h2 id="cuenta-proveedor-dialog-title">
              {editando ? "Editar cuenta de proveedor" : "Nueva cuenta de proveedor"}
            </h2>
          </div>
          <IconButton
            type="button"
            icon={<X size={18} />}
            label="Cerrar"
            onClick={onCancel}
            disabled={procesando}
          />
        </div>

        <form onSubmit={submit} className="cuentas-proveedor-dialog__form">
          {dependenciasFaltantes.length > 0 ? (
            <Alert>
              Para completar esta operación faltan fuentes reales de: {dependenciasFaltantes.join(", ")}.
              En integración estos datos deben provenir de Persona 3 y de los maestros globales.
            </Alert>
          ) : null}

          {error ? <Alert>{error}</Alert> : null}

          <div className="cuentas-proveedor-dialog__grid">
            <FormField label="Proveedor" required>
              <div>
                <Select
                  value={proveedorId || ""}
                  onChange={(e) => {
                    setProveedorId(Number(e.target.value));
                    limpiarError("proveedorId");
                  }}
                >
                  <option value="">Seleccione proveedor</option>
                  {dependencias.proveedores.map((item) => (
                    <option key={item.id} value={item.id}>{item.etiqueta}</option>
                  ))}
                </Select>
                <MensajeError mensaje={errores.proveedorId} />
              </div>
            </FormField>

            <FormField label="Banco" required>
              <div>
                <Select
                  value={bancoId || ""}
                  onChange={(e) => {
                    setBancoId(Number(e.target.value));
                    limpiarError("bancoId");
                  }}
                >
                  <option value="">Seleccione banco</option>
                  {dependencias.bancos.map((item) => (
                    <option key={item.id} value={item.id}>{item.etiqueta}</option>
                  ))}
                </Select>
                <MensajeError mensaje={errores.bancoId} />
              </div>
            </FormField>

            <FormField label="Tipo de cuenta" required>
              <div>
                <Select
                  value={tipoCuentaId || ""}
                  onChange={(e) => {
                    setTipoCuentaId(Number(e.target.value));
                    limpiarError("tipoCuentaId");
                  }}
                >
                  <option value="">Seleccione tipo</option>
                  {dependencias.tiposCuenta.map((item) => (
                    <option key={item.id} value={item.id}>{item.etiqueta}</option>
                  ))}
                </Select>
                <MensajeError mensaje={errores.tipoCuentaId} />
              </div>
            </FormField>

            <FormField label="Moneda" required>
              <div>
                <Select
                  value={monedaId || ""}
                  onChange={(e) => {
                    setMonedaId(Number(e.target.value));
                    limpiarError("monedaId");
                  }}
                >
                  <option value="">Seleccione moneda</option>
                  {dependencias.monedas.map((item) => (
                    <option key={item.id} value={item.id}>{item.etiqueta}</option>
                  ))}
                </Select>
                <MensajeError mensaje={errores.monedaId} />
              </div>
            </FormField>

            <FormField label="Titular" required>
              <div>
                <Input
                  value={titular}
                  maxLength={150}
                  onChange={(e) => {
                    setTitular(e.target.value);
                    limpiarError("titular");
                  }}
                />
                <MensajeError mensaje={errores.titular} />
              </div>
            </FormField>

            <FormField label="Número de cuenta" required>
              <div>
                <Input
                  value={numeroCuenta}
                  maxLength={34}
                  onChange={(e) => {
                    setNumeroCuenta(e.target.value);
                    limpiarError("numeroCuenta");
                  }}
                />
                <MensajeError mensaje={errores.numeroCuenta} />
              </div>
            </FormField>

            <FormField label="Carta de solicitud" required>
              <div>
                <Select
                  value={cartaSolicitudDocId}
                  onChange={(e) => {
                    setCartaSolicitudDocId(e.target.value);
                    limpiarError("cartaSolicitudDocId");
                  }}
                >
                  <option value="">Seleccione documento</option>
                  {dependencias.documentos.map((item) => (
                    <option key={item.id} value={item.id}>{item.etiqueta}</option>
                  ))}
                </Select>
                <MensajeError mensaje={errores.cartaSolicitudDocId} />
              </div>
            </FormField>

            <FormField label="Constancia bancaria" required>
              <div>
                <Select
                  value={constanciaBancoDocId}
                  onChange={(e) => {
                    setConstanciaBancoDocId(e.target.value);
                    limpiarError("constanciaBancoDocId");
                  }}
                >
                  <option value="">Seleccione documento</option>
                  {dependencias.documentos.map((item) => (
                    <option key={item.id} value={item.id}>{item.etiqueta}</option>
                  ))}
                </Select>
                <MensajeError mensaje={errores.constanciaBancoDocId} />
              </div>
            </FormField>

            <FormField label="Documento del representante">
              <div>
                <Select
                  value={representanteDocId}
                  onChange={(e) => {
                    setRepresentanteDocId(e.target.value);
                    limpiarError("representanteDocId");
                  }}
                >
                  <option value="">No aplica</option>
                  {dependencias.documentos.map((item) => (
                    <option key={item.id} value={item.id}>{item.etiqueta}</option>
                  ))}
                </Select>
                <MensajeError mensaje={errores.representanteDocId} />
              </div>
            </FormField>

            <FormField label="Cuenta anterior">
              <div>
                <Select
                  value={cuentaAnteriorId}
                  onChange={(e) => {
                    setCuentaAnteriorId(e.target.value);
                    limpiarError("cuentaAnteriorId");
                  }}
                >
                  <option value="">No aplica</option>
                  {dependencias.cuentasAnteriores
                    .filter((item) => item.id !== cuenta?.ctaProveedorId)
                    .map((item) => (
                      <option key={item.id} value={item.id}>{item.etiqueta}</option>
                    ))}
                </Select>
                <MensajeError mensaje={errores.cuentaAnteriorId} />
              </div>
            </FormField>

            <FormField label="Fecha de vigencia">
              <Input type="date" value={fechaVigencia} onChange={(e) => setFechaVigencia(e.target.value)} />
            </FormField>

            {!editando ? (
              <FormField label="Estado inicial" required>
                <Select value={estado} onChange={(e) => setEstado(e.target.value as EstadoCuentaProveedor)}>
                  {ESTADOS_CREACION.map((item) => (
                    <option key={item} value={item}>{item === "EN_REVISION" ? "En revisión" : "Pendiente"}</option>
                  ))}
                </Select>
              </FormField>
            ) : null}
          </div>

          <FormField label="Motivo del registro" required>
            <div>
              <textarea
                className="form-input cuentas-proveedor-dialog__textarea"
                value={motivoRegistro}
                maxLength={500}
                rows={3}
                onChange={(e) => {
                  setMotivoRegistro(e.target.value);
                  limpiarError("motivoRegistro");
                }}
              />
              <MensajeError mensaje={errores.motivoRegistro} />
            </div>
          </FormField>

          <FormField label="Observaciones">
            <div>
              <textarea
                className="form-input cuentas-proveedor-dialog__textarea"
                value={observaciones}
                maxLength={500}
                rows={3}
                onChange={(e) => {
                  setObservaciones(e.target.value);
                  limpiarError("observaciones");
                }}
              />
              <MensajeError mensaje={errores.observaciones} />
            </div>
          </FormField>

          <div className="cuentas-proveedor-dialog__actions">
            <Button type="button" variant="outline" onClick={onCancel} disabled={procesando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={procesando || dependenciasFaltantes.length > 0}
            >
              {procesando ? "Guardando..." : editando ? "Guardar cambios" : "Crear cuenta"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}


type MensajeErrorProps = {
  mensaje?: string;
};

function MensajeError({ mensaje }: MensajeErrorProps) {
  if (!mensaje) return null;

  return (
    <p
      className="text-danger"
      style={{
        margin: "6px 0 0",
        fontSize: "11px",
      }}
    >
      {mensaje}
    </p>
  );
}
