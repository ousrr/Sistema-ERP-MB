import {
  useEffect,
  useState,
} from "react";

import { Select } from "../../../../../shared/forms/Select";
import { listarCuentasActivas } from "../api/cuentas.api";
import type { CuentaBancariaActiva } from "../types/cuentas.types";

export interface CuentaBancariaSelectProps {
  value: number | null;
  onChange: (cuentaId: number | null) => void;
  bancoId?: number | null;
  monedaId?: number | null;
  disabled?: boolean;
  required?: boolean;
  ariaLabel?: string;
}

function enmascararCuenta(numero: string): string {
  const limpio = numero.trim();
  if (limpio.length <= 4) return "••••";
  return `••••${limpio.slice(-4)}`;
}

export function CuentaBancariaSelect({
  value,
  onChange,
  bancoId = null,
  monedaId = null,
  disabled = false,
  required = false,
  ariaLabel = "Cuenta bancaria",
}: CuentaBancariaSelectProps) {
  const [cuentas, setCuentas] = useState<CuentaBancariaActiva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar(): Promise<void> {
      setCargando(true);
      setError(null);

      try {
        const resultado = await listarCuentasActivas({ bancoId, monedaId });
        if (!cancelado) setCuentas(resultado);
      } catch (errorActual) {
        if (!cancelado) {
          setCuentas([]);
          setError(
            errorActual instanceof Error
              ? errorActual.message
              : "No fue posible cargar las cuentas activas."
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    void cargar();

    return () => {
      cancelado = true;
    };
  }, [bancoId, monedaId]);

  return (
    <div>
      <Select
        value={value ?? ""}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? null : Number(raw));
        }}
        disabled={disabled || cargando}
        required={required}
        aria-label={ariaLabel}
      >
        <option value="">
          {cargando ? "Cargando cuentas..." : "Seleccione una cuenta"}
        </option>

        {cuentas.map((cuenta) => (
          <option key={cuenta.cuentaId} value={cuenta.cuentaId}>
            {cuenta.codigoBanco} · {cuenta.nombreInterno} · {enmascararCuenta(cuenta.numeroCuenta)}
          </option>
        ))}
      </Select>

      {error ? (
        <small role="alert" style={{ display: "block", marginTop: 6 }}>
          {error}
        </small>
      ) : null}
    </div>
  );
}
