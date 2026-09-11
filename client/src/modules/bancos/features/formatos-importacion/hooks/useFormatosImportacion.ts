import { useCallback, useEffect, useMemo, useState } from "react";

import { listarFormatos } from "../api/formatos-importacion.api";

import type {
  FormatoImportacion,
} from "../types/formatos-importacion.types";

export function useFormatosImportacion() {
  const [formatos, setFormatos] = useState<FormatoImportacion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarFormatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const data = await listarFormatos();

      setFormatos(data);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar los formatos.";

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarFormatos();
  }, [cargarFormatos]);

  const formatosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return formatos;
    }

    return formatos.filter((formato) => {
      return (
        formato.nombre.toLowerCase().includes(termino) ||
        formato.banco.toLowerCase().includes(termino) ||
        formato.tipoArchivo.toLowerCase().includes(termino) ||
        formato.estado.toLowerCase().includes(termino)
      );
    });
  }, [formatos, busqueda]);

    return {
    formatos,
    formatosFiltrados,
    busqueda,
    setBusqueda,
    cargando,
    error,
    cargarFormatos,
  };
}