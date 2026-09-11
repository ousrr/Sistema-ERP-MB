import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  actualizarCuentaProveedor,
  cambiarEstadoCuentaProveedor,
  crearCuentaProveedor,
  listarCuentasProveedor
} from "../api/cuentas-proveedor.api";

import type {
  ActualizarCuentaProveedorInput,
  CambiarEstadoCuentaProveedorInput,
  CrearCuentaProveedorInput,
  CuentaProveedor,
  FiltrosCuentaProveedor
} from "../types/cuentas-proveedor.types";


function obtenerMensajeError(
  error: unknown
): string {

  if (
    error instanceof Error &&
    error.message.trim() !== ""
  ) {

    return error.message;
  }


  return "Ocurrió un error al procesar la operación.";
}


export function useCuentasProveedor() {

  const [
    cuentas,
    setCuentas
  ] = useState<CuentaProveedor[]>([]);


  const [
    cargando,
    setCargando
  ] = useState<boolean>(true);


  const [
    procesando,
    setProcesando
  ] = useState<boolean>(false);


  const [
    error,
    setError
  ] = useState<string | null>(null);


  const [
    mensaje,
    setMensaje
  ] = useState<string | null>(null);


  const limpiarMensajes =
    useCallback(
      (): void => {

        setError(null);
        setMensaje(null);
      },
      []
    );


  const cargar =
    useCallback(
      async (
        filtros:
          FiltrosCuentaProveedor = {}
      ): Promise<boolean> => {

        setCargando(true);
        setError(null);


        try {

          const resultado =
            await listarCuentasProveedor(
              filtros
            );


          setCuentas(
            resultado
          );


          return true;

        } catch (errorActual) {

          setError(
            obtenerMensajeError(
              errorActual
            )
          );


          return false;

        } finally {

          setCargando(false);
        }
      },
      []
    );


  const crear =
    useCallback(
      async (
        input:
          CrearCuentaProveedorInput
      ): Promise<boolean> => {

        setProcesando(true);
        setError(null);
        setMensaje(null);


        try {

          const respuestaApi =
            await crearCuentaProveedor(
              input
            );


          setMensaje(
            respuestaApi.message
          );


          await cargar();


          return true;

        } catch (errorActual) {

          setError(
            obtenerMensajeError(
              errorActual
            )
          );


          return false;

        } finally {

          setProcesando(false);
        }
      },
      [
        cargar
      ]
    );


  const actualizar =
    useCallback(
      async (
        input:
          ActualizarCuentaProveedorInput
      ): Promise<boolean> => {

        setProcesando(true);
        setError(null);
        setMensaje(null);


        try {

          const respuestaApi =
            await actualizarCuentaProveedor(
              input
            );


          setMensaje(
            respuestaApi.message
          );


          await cargar();


          return true;

        } catch (errorActual) {

          setError(
            obtenerMensajeError(
              errorActual
            )
          );


          return false;

        } finally {

          setProcesando(false);
        }
      },
      [
        cargar
      ]
    );


  const cambiarEstado =
    useCallback(
      async (
        input:
          CambiarEstadoCuentaProveedorInput
      ): Promise<boolean> => {

        setProcesando(true);
        setError(null);
        setMensaje(null);


        try {

          const respuestaApi =
            await cambiarEstadoCuentaProveedor(
              input
            );


          setMensaje(
            respuestaApi.message
          );


          await cargar();


          return true;

        } catch (errorActual) {

          setError(
            obtenerMensajeError(
              errorActual
            )
          );


          return false;

        } finally {

          setProcesando(false);
        }
      },
      [
        cargar
      ]
    );


  useEffect(
    () => {

      void cargar();

    },
    [
      cargar
    ]
  );


  return {
    cuentas,
    cargando,
    procesando,
    error,
    mensaje,

    cargar,
    crear,
    actualizar,
    cambiarEstado,
    limpiarMensajes
  };
}