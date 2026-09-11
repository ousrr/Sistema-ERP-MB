import { apiClient } from "../../../../../shared/api/apiClient";

import type {
  ActualizarCuentaBancariaInput,
  ApiDataResponse,
  ApiMessageResponse,
  CambiarEstadoCuentaBancariaInput,
  CrearCuentaBancariaInput,
  CuentaBancaria,
  CuentaBancariaActiva,
  FiltrosCuentaBancaria,
  FiltrosCuentaBancariaActiva,
} from "../types/cuentas.types";

const CUENTAS_API = "/api/v1/bancos/cuentas";

function agregarParametro(
  params: URLSearchParams,
  nombre: string,
  valor: string | number | null | undefined
): void {
  if (valor !== null && valor !== undefined && valor !== "") {
    params.set(nombre, String(valor));
  }
}

export async function listarCuentas(
  filtros: FiltrosCuentaBancaria = {}
): Promise<CuentaBancaria[]> {
  const params = new URLSearchParams();

  agregarParametro(params, "estado", filtros.estado);
  agregarParametro(params, "bancoId", filtros.bancoId);
  agregarParametro(params, "monedaId", filtros.monedaId);

  const query = params.toString();
  const resultado = await apiClient.get<ApiDataResponse<CuentaBancaria[]>>(
    query ? `${CUENTAS_API}?${query}` : CUENTAS_API
  );

  return resultado.data;
}

export async function listarCuentasActivas(
  filtros: FiltrosCuentaBancariaActiva = {}
): Promise<CuentaBancariaActiva[]> {
  const params = new URLSearchParams();

  agregarParametro(params, "bancoId", filtros.bancoId);
  agregarParametro(params, "monedaId", filtros.monedaId);

  const query = params.toString();
  const resultado = await apiClient.get<ApiDataResponse<CuentaBancariaActiva[]>>(
    query
      ? `${CUENTAS_API}/activas?${query}`
      : `${CUENTAS_API}/activas`
  );

  return resultado.data;
}

export async function obtenerCuentaPorId(
  cuentaId: number
): Promise<CuentaBancaria> {
  const resultado = await apiClient.get<ApiDataResponse<CuentaBancaria>>(
    `${CUENTAS_API}/${cuentaId}`
  );

  return resultado.data;
}

export function crearCuenta(
  datos: CrearCuentaBancariaInput
): Promise<ApiMessageResponse> {
  return apiClient.post<ApiMessageResponse>(CUENTAS_API, datos);
}

export function actualizarCuenta(
  cuentaId: number,
  datos: ActualizarCuentaBancariaInput
): Promise<ApiMessageResponse> {
  return apiClient.put<ApiMessageResponse>(
    `${CUENTAS_API}/${cuentaId}`,
    datos
  );
}

export function cambiarEstadoCuenta(
  cuentaId: number,
  datos: CambiarEstadoCuentaBancariaInput
): Promise<ApiMessageResponse> {
  return apiClient.patch<ApiMessageResponse>(
    `${CUENTAS_API}/${cuentaId}/estado`,
    datos
  );
}
