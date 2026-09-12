import { useEffect, useState } from "react";

import { Select } from "../../../../../shared/forms/Select";

import { listarFormatosActivosPorBanco } from "../api/formatos-importacion.api";

import type {
  FormatoImportacion,
} from "../types/formatos-importacion.types";

type FormatoImportacionSelectProps = {
  bancoId: number;
  value: number | null;
  onChange: (formatoId: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  refreshKey?: number;
};

export function FormatoImportacionSelect({
  bancoId,
  value,
  onChange,
  disabled = false,
  required = false,
  refreshKey = 0,
}: FormatoImportacionSelectProps) {
  const [formatos, setFormatos] = useState<
    FormatoImportacion[]
  >([]);

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function cargarFormatos() {
      if (!bancoId || bancoId <= 0) {
        setFormatos([]);
        onChange(null);
        return;
      }

      try {
        setCargando(true);
        setError(null);

        const data =
          await listarFormatosActivosPorBanco(
            bancoId
          );

        setFormatos(data);

        if (
          value !== null &&
          !data.some(
            (formato) =>
              formato.formatoId === value
          )
        ) {
          onChange(null);
        }
      } catch (error) {
        const mensaje =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los formatos.";

        setError(mensaje);
        setFormatos([]);
      } finally {
        setCargando(false);
      }
    }

    void cargarFormatos();
  }, [bancoId, refreshKey]);

  return (
    <div>
      <Select
        value={value ?? ""}
        required={required}
        disabled={
          disabled ||
          cargando ||
          bancoId <= 0
        }
        onChange={(event) => {
          const nuevoValor =
            event.target.value;

          onChange(
            nuevoValor
              ? Number(nuevoValor)
              : null
          );
        }}
      >
        <option value="">
          {cargando
            ? "Cargando formatos..."
            : "Seleccione un formato"}
        </option>

        {formatos.map((formato) => (
          <option
            key={formato.formatoId}
            value={formato.formatoId}
          >
            {formato.nombre} v
            {formato.version}
          </option>
        ))}
      </Select>

      {error ? (
        <small
          style={{
            display: "block",
            marginTop: "6px",
            color:
              "var(--color-danger, #b42318)",
          }}
        >
          {error}
        </small>
      ) : null}
    </div>
  );
}