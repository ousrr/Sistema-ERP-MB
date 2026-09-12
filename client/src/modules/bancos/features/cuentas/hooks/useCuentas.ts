import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  actualizarCuenta,
  cambiarEstadoCuenta,
  crearCuenta,
  listarCuentas,
} from "../api/cuentas.api";

import type {
  ActualizarCuentaBancariaInput,
  CambiarEstadoCuentaBancariaInput,
  CrearCuentaBancariaInput,
  CuentaBancaria,
  FiltrosCuentaBancaria,
} from "../types/cuentas.types";


type UseCuentasResult = {
  cuentas: CuentaBancaria[];

  cargando: boolean;
  procesando: boolean;

  error: string | null;
  mensaje: string | null;

  cargar: (
    filtros?: FiltrosCuentaBancaria
  ) => Promise<void>;

  crear: (
    datos: CrearCuentaBancariaInput
  ) => Promise<boolean>;

  actualizar: (
    cuentaId: number,
    datos: ActualizarCuentaBancariaInput
  ) => Promise<boolean>;

  cambiarEstado: (
    cuentaId: number,
    datos: CambiarEstadoCuentaBancariaInput
  ) => Promise<boolean>;

  limpiarMensajes: () => void;
};


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string
): string {

  if (
    error instanceof Error &&
    error.message.trim() !== ""
  ) {

    return error.message;
  }


  return mensajePredeterminado;
}


export function useCuentas():
  UseCuentasResult {

  const [
    cuentas,
    setCuentas,
  ] = useState<CuentaBancaria[]>([]);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    procesando,
    setProcesando,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const [
    mensaje,
    setMensaje,
  ] = useState<string | null>(null);


  const cargar =
    useCallback(
      async (
        filtros: FiltrosCuentaBancaria = {}
      ): Promise<void> => {

        setCargando(true);
        setError(null);


        try {

          const datos =
            await listarCuentas(
              filtros
            );


          setCuentas(
            datos
          );

        } catch (errorActual) {

          setCuentas([]);

          setError(
            obtenerMensajeError(
              errorActual,
              "No fue posible cargar las cuentas bancarias."
            )
          );

        } finally {

          setCargando(false);
        }
      },
      []
    );


  useEffect(
    () => {

      void cargar();

    },
    [
      cargar,
    ]
  );


  const crear =
    useCallback(
      async (
        datos: CrearCuentaBancariaInput
      ): Promise<boolean> => {

        setProcesando(true);
        setError(null);
        setMensaje(null);


        try {

          const resultado =
            await crearCuenta(
              datos
            );


          setMensaje(
            resultado.message
          );


          await cargar();


          return true;

        } catch (errorActual) {

          setError(
            obtenerMensajeError(
              errorActual,
              "No fue posible crear la cuenta bancaria."
            )
          );


          return false;

        } finally {

          setProcesando(false);
        }
      },
      [
        cargar,
      ]
    );


  const actualizar =
    useCallback(
      async (
        cuentaId: number,
        datos: ActualizarCuentaBancariaInput
      ): Promise<boolean> => {

        setProcesando(true);
        setError(null);
        setMensaje(null);


        try {

          const resultado =
            await actualizarCuenta(
              cuentaId,
              datos
            );


          setMensaje(
            resultado.message
          );


          await cargar();


          return true;

        } catch (errorActual) {

          setError(
            obtenerMensajeError(
              errorActual,
              "No fue posible actualizar la cuenta bancaria."
            )
          );


          return false;

        } finally {

          setProcesando(false);
        }
      },
      [
        cargar,
      ]
    );


  const cambiarEstado =
    useCallback(
      async (
        cuentaId: number,
        datos: CambiarEstadoCuentaBancariaInput
      ): Promise<boolean> => {

        setProcesando(true);
        setError(null);
        setMensaje(null);


        try {

          const resultado =
            await cambiarEstadoCuenta(
              cuentaId,
              datos
            );


          setMensaje(
            resultado.message
          );


          await cargar();


          return true;

        } catch (errorActual) {

          setError(
            obtenerMensajeError(
              errorActual,
              "No fue posible cambiar el estado de la cuenta bancaria."
            )
          );


          return false;

        } finally {

          setProcesando(false);
        }
      },
      [
        cargar,
      ]
    );


  const limpiarMensajes =
    useCallback(
      (): void => {

        setError(null);
        setMensaje(null);
      },
      []
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

    limpiarMensajes,
  };
}