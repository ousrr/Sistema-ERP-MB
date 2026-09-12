import { useState } from "react";
import type { FormEvent } from "react";

import { Alert } from "../../../../../shared/feedback/Alert";
import { FormField } from "../../../../../shared/forms/FormField";
import { Select } from "../../../../../shared/forms/Select";
import { Button } from "../../../../../shared/ui/Button";

import type {
  CuentaProveedor,
  EstadoCuentaProveedor,
} from "../types/cuentas-proveedor.types";

const ESTADOS: EstadoCuentaProveedor[] = [
  "PENDIENTE",
  "EN_REVISION",
  "VERIFICADA",
  "RECHAZADA",
  "BLOQUEADA",
  "INACTIVA",
];

interface Props {
  cuenta: CuentaProveedor;
  procesando?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (estado: EstadoCuentaProveedor) => Promise<void> | void;
}

export function CuentaProveedorEstadoDialog({
  cuenta,
  procesando = false,
  error = null,
  onCancel,
  onConfirm,
}: Props) {
  const [estado, setEstado] = useState<EstadoCuentaProveedor>(cuenta.estado);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onConfirm(estado);
  }

  return (
    <div className="cuentas-proveedor-dialog-backdrop" role="presentation">
      <section className="cuentas-proveedor-dialog cuentas-proveedor-dialog--small" role="dialog" aria-modal="true">
        <div className="cuentas-proveedor-dialog__header">
          <div>
            <span>Estado</span>
            <h2>Cambiar estado de cuenta</h2>
          </div>
        </div>

        <form onSubmit={submit} className="cuentas-proveedor-dialog__form">
          <Alert>
            La cuenta #{cuenta.ctaProveedorId} está actualmente en {cuenta.estado}. Solo se utilizarán estados definidos por el modelo Oracle.
          </Alert>
          {error ? <Alert>{error}</Alert> : null}

          <FormField label="Nuevo estado" required>
            <Select value={estado} onChange={(e) => setEstado(e.target.value as EstadoCuentaProveedor)}>
              {ESTADOS.map((item) => (
                <option key={item} value={item}>{item.replace("_", " ")}</option>
              ))}
            </Select>
          </FormField>

          <div className="cuentas-proveedor-dialog__actions">
            <Button type="button" variant="outline" onClick={onCancel} disabled={procesando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={procesando || estado === cuenta.estado}>
              {procesando ? "Actualizando..." : "Confirmar cambio"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
