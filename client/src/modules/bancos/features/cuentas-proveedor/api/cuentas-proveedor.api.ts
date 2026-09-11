import { apiClient } from "../../../../../shared/api/apiClient";

import type {
  ActualizarCuentaProveedorInput,
  CambiarEstadoCuentaProveedorInput,
  CrearCuentaProveedorInput,
  CuentaProveedor,
  CuentaProveedorResponse,
  CuentaProveedorVerificada,
  FiltrosCuentaProveedor,
  ListaCuentasProveedorResponse,
  ListaCuentasProveedorVerificadasResponse,
  OperacionCuentaProveedorResponse,
} from "../types/cuentas-proveedor.types";

const BASE_URL = "/api/v1/bancos/cuentas-proveedor";

export async function listarCuentasProveedor(
  filtros: FiltrosCuentaProveedor = {}
): Promise<CuentaProveedor[]> {
  const params = new URLSearchParams();

  if (filtros.proveedorId != null) {
    params.set("proveedorId", String(filtros.proveedorId));
  }
  if (filtros.estado != null) {
    params.set("estado", filtros.estado);
  }
  if (filtros.bancoId != null) {
    params.set("bancoId", String(filtros.bancoId));
  }
  if (filtros.monedaId != null) {
    params.set("monedaId", String(filtros.monedaId));
  }

  const query = params.toString();
  const data = await apiClient.get<ListaCuentasProveedorResponse>(
    query ? `${BASE_URL}?${query}` : BASE_URL
  );

  return data.data;
}

export async function obtenerCuentaProveedor(
  ctaProveedorId: string
): Promise<CuentaProveedor> {
  const data = await apiClient.get<CuentaProveedorResponse>(
    `${BASE_URL}/${encodeURIComponent(ctaProveedorId)}`
  );

  return data.data;
}

export async function listarCuentasProveedorVerificadas(
  proveedorId: number
): Promise<CuentaProveedorVerificada[]> {
  const data = await apiClient.get<ListaCuentasProveedorVerificadasResponse>(
    `${BASE_URL}/verificadas/${proveedorId}`
  );

  return data.data;
}

export async function crearCuentaProveedor(
  input: CrearCuentaProveedorInput
): Promise<OperacionCuentaProveedorResponse> {
  return apiClient.post<OperacionCuentaProveedorResponse>(BASE_URL, input);
}

export async function actualizarCuentaProveedor(
  input: ActualizarCuentaProveedorInput
): Promise<OperacionCuentaProveedorResponse> {
  const { ctaProveedorId, ...datos } = input;

  return apiClient.put<OperacionCuentaProveedorResponse>(
    `${BASE_URL}/${encodeURIComponent(ctaProveedorId)}`,
    datos
  );
}

export async function cambiarEstadoCuentaProveedor(
  input: CambiarEstadoCuentaProveedorInput
): Promise<OperacionCuentaProveedorResponse> {
  return apiClient.patch<OperacionCuentaProveedorResponse>(
    `${BASE_URL}/${encodeURIComponent(input.ctaProveedorId)}/estado`,
    { estado: input.estado }
  );
}
