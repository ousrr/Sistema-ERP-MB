import { useEffect, useState } from "react";
import { Select } from "../../../../../shared/forms/Select";
import {
  listarCatalogosPorGrupo,
  type CatalogoOpcionResponse,
} from "../api/catalogosApi";

type CatalogSelectProps = {
  grupo: string;
  value: number | "";
  onChange: (catalogoId: number | "") => void;
  disabled?: boolean;
  required?: boolean;
};

export function CatalogSelect({
  grupo,
  value,
  onChange,
  disabled = false,
  required = false,
}: CatalogSelectProps) {
  const [catalogos, setCatalogos] = useState<CatalogoOpcionResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let componenteActivo = true;

    async function cargarCatalogos() {
      setCargando(true);
      setError(false);

      try {
        const datos = await listarCatalogosPorGrupo(grupo);

        if (componenteActivo) {
          setCatalogos(datos);
        }
      } catch {
        if (componenteActivo) {
          setCatalogos([]);
          setError(true);
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarCatalogos();

    return () => {
      componenteActivo = false;
    };
  }, [grupo]);

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
          ? "Cargando opciones..."
          : error
            ? "No fue posible cargar el catalogo"
            : "Seleccione una opcion"}
      </option>

      {catalogos.map((catalogo) => (
        <option
          key={catalogo.catalogoId}
          value={catalogo.catalogoId}
        >
          {catalogo.nombre}
        </option>
      ))}
    </Select>
  );
}