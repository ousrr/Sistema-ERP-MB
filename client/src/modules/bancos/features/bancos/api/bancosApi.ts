import {
  ApiClient
} from "../../../common/api/ApiClient";

import type {
  BancoFormData
} from "../types/BancoFormData";

import type {
  EstadoActivoInactivo
} from "../rules/EstadoActivoInactivo";


export {
  ApiError as BancoApiError
} from "../../../common/api/ApiError";


// =====================================================
// TIPOS
// =====================================================

export interface BancoResponse {

  bancoId: number;

  codigoBanco: string;

  nombre: string;

  bicSwift: string | null;

  estado:
    EstadoActivoInactivo;

  creadoPor: number;

  creadoEn: string;
}


export type CrearBancoRequest =
  BancoFormData;


export type ActualizarBancoRequest =
  BancoFormData;


export interface CrearBancoResponse {

  message: string;

  bancoId: number;
}


export interface ActualizarBancoResponse {

  message: string;
}


export interface CambiarEstadoBancoResponse {

  message: string;
}


// =====================================================
// CLIENTE REUTILIZABLE DEL MÓDULO
// =====================================================

const api =
  new ApiClient({
    baseUrl:
      "/api/v1/bancos/bancos",

    serviceName:
      "Bancos",

    serviceCode:
      "BANCOS"
  });


// =====================================================
// LISTAR BANCOS
// =====================================================

export function listarBancos():
  Promise<BancoResponse[]> {

  return api.get<BancoResponse[]>(
    "",
    {
      operation:
        "LISTAR_BANCOS",

      fallbackMessage:
        "No fue posible obtener los bancos."
    }
  );
}


// =====================================================
// OBTENER BANCO POR ID
// =====================================================

export function obtenerBanco(
  bancoId: number
): Promise<BancoResponse> {

  return api.get<BancoResponse>(
    `/${bancoId}`,
    {
      operation:
        "OBTENER_BANCO",

      fallbackMessage:
        "No fue posible obtener el banco."
    }
  );
}


// =====================================================
// CREAR BANCO
// =====================================================

export function crearBanco(
  datos: CrearBancoRequest
): Promise<CrearBancoResponse> {

  return api.post<
    CrearBancoResponse,
    CrearBancoRequest
  >(
    "",
    datos,
    {
      operation:
        "CREAR_BANCO",

      fallbackMessage:
        "No fue posible crear el banco."
    }
  );
}


// =====================================================
// ACTUALIZAR BANCO
// =====================================================

export function actualizarBanco(
  bancoId: number,
  datos: ActualizarBancoRequest
): Promise<ActualizarBancoResponse> {

  return api.put<
    ActualizarBancoResponse,
    ActualizarBancoRequest
  >(
    `/${bancoId}`,
    datos,
    {
      operation:
        "ACTUALIZAR_BANCO",

      fallbackMessage:
        "No fue posible actualizar el banco."
    }
  );
}


// =====================================================
// CAMBIAR ESTADO
// =====================================================

export function cambiarEstadoBanco(
  bancoId: number,
  estado: EstadoActivoInactivo
): Promise<CambiarEstadoBancoResponse> {

  return api.patch<
    CambiarEstadoBancoResponse,
    {
      estado:
        EstadoActivoInactivo;
    }
  >(
    `/${bancoId}/estado`,
    {
      estado
    },
    {
      operation:
        "CAMBIAR_ESTADO_BANCO",

      fallbackMessage:
        "No fue posible cambiar el estado del banco."
    }
  );
}
