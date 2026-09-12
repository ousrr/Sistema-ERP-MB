import { useCallback, useEffect, useState } from "react";

import {
  listarMapeos,
} from "../api/formatos-importacion.api";

import type {
  MapeoFormato,
} from "../types/formatos-importacion.types";

export function useMapeosFormato(
  formatoId: number | null
) {
  const [mapeos, setMapeos] =
    useState<MapeoFormato[]>([]);

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const cargarMapeos = useCallback(async () => {
    if (formatoId === null) {
      setMapeos([]);
      setError(null);
      return;
    }

    try {
      setCargando(true);
      setError(null);

      const data = await listarMapeos(formatoId);

      setMapeos(data);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los mapeos.";

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, [formatoId]);

  useEffect(() => {
    void cargarMapeos();
  }, [cargarMapeos]);

  return {
    mapeos,
    cargando,
    error,
    cargarMapeos,
  };
}