import { useEffect, useState } from "react";
import { Select } from "../../../../../shared/forms/Select";
import {
  listarBancos,
  type BancoResponse,
} from "../api/bancosApi";

type BankSelectProps = {
  value: number | "";
  onChange: (bancoId: number | "") => void;
  disabled?: boolean;
  required?: boolean;
};

export function BankSelect({
  value,
  onChange,
  disabled = false,
  required = false,
}: BankSelectProps) {
  const [bancos, setBancos] = useState<BancoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let componenteActivo = true;

    async function cargarBancos() {
      try {
        const datos = await listarBancos();

        if (componenteActivo) {
          setBancos(
            datos.filter((banco) => banco.estado === "ACTIVO")
          );
        }
      } catch {
        if (componenteActivo) {
          setError(true);
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarBancos();

    return () => {
      componenteActivo = false;
    };
  }, []);

  return (
    <Select
      value={value}
      onChange={(event) => {
        const nuevoValor = event.target.value;

        onChange(
          nuevoValor === "" ? "" : Number(nuevoValor)
        );
      }}
      disabled={disabled || cargando || error}
      required={required}
    >
      <option value="">
        {cargando
          ? "Cargando bancos..."
          : error
            ? "No fue posible cargar los bancos"
            : "Seleccione un banco"}
      </option>

      {bancos.map((banco) => (
        <option
          key={banco.bancoId}
          value={banco.bancoId}
        >
          {banco.nombre}
        </option>
      ))}
    </Select>
  );
}