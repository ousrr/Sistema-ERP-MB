import {
  ApiClient
} from "../../../common/api/ApiClient";

import type {
  ActualizarCatalogoRequest,
  CambiarEstadoCatalogoRequest,
  CatalogoOpcionResponse,
  CatalogoResponse,
  CrearCatalogoRequest,
  CrearCatalogoResponse,
  MensajeResponse
} from "../types/CatalogoBancario";


export {
  ApiError as CatalogoApiError
} from "../../../common/api/ApiError";


export type {
  CatalogoOpcionResponse
} from "../types/CatalogoBancario";


// =====================================================
// CLIENTE REUTILIZABLE DEL MÓDULO
// =====================================================

const api =
  new ApiClient({
    baseUrl:
      "/api/v1/bancos/catalogos",

    serviceName:
      "Catálogos",

    serviceCode:
      "CATALOGOS"
  });


// =====================================================
// LISTAR TODOS
// =====================================================

export function listarCatalogos():
  Promise<CatalogoResponse[]> {

  return api.get<CatalogoResponse[]>(
    "",
    {
      operation:
        "LISTAR_CATALOGOS",

      fallbackMessage:
        "No fue posible obtener los catálogos bancarios."
    }
  );
}


// =====================================================
// OBTENER POR ID
// =====================================================

export function obtenerCatalogo(
  catalogoId: number
): Promise<CatalogoResponse> {

  return api.get<CatalogoResponse>(
    `/${catalogoId}`,
    {
      operation:
        "OBTENER_CATALOGO",

      fallbackMessage:
        "No fue posible obtener el catálogo bancario."
    }
  );
}


// =====================================================
// LISTAR ACTIVOS POR GRUPO
// =====================================================

export function listarCatalogosPorGrupo(
  grupo: string
): Promise<CatalogoOpcionResponse[]> {

  return api.get<CatalogoOpcionResponse[]>(
    `/grupo/${encodeURIComponent(
      grupo
    )}`,
    {
      operation:
        "LISTAR_CATALOGOS_POR_GRUPO",

      fallbackMessage:
        "No fue posible obtener las opciones del catálogo."
    }
  );
}


// =====================================================
// CREAR
// =====================================================

export function crearCatalogo(
  datos: CrearCatalogoRequest
): Promise<CrearCatalogoResponse> {

  return api.post<
    CrearCatalogoResponse,
    CrearCatalogoRequest
  >(
    "",
    datos,
    {
      operation:
        "CREAR_CATALOGO",

      fallbackMessage:
        "No fue posible crear el catálogo bancario."
    }
  );
}


// =====================================================
// ACTUALIZAR
// =====================================================

export function actualizarCatalogo(
  catalogoId: number,
  datos: ActualizarCatalogoRequest
): Promise<MensajeResponse> {

  return api.put<
    MensajeResponse,
    ActualizarCatalogoRequest
  >(
    `/${catalogoId}`,
    datos,
    {
      operation:
        "ACTUALIZAR_CATALOGO",

      fallbackMessage:
        "No fue posible actualizar el catálogo bancario."
    }
  );
}


// =====================================================
// CAMBIAR ESTADO
// =====================================================

export function cambiarEstadoCatalogo(
  catalogoId: number,
  estado:
    CambiarEstadoCatalogoRequest["estado"]
): Promise<MensajeResponse> {

  const datos:
    CambiarEstadoCatalogoRequest = {

    estado
  };


  return api.patch<
    MensajeResponse,
    CambiarEstadoCatalogoRequest
  >(
    `/${catalogoId}/estado`,
    datos,
    {
      operation:
        "CAMBIAR_ESTADO_CATALOGO",

      fallbackMessage:
        "No fue posible cambiar el estado del catálogo bancario."
    }
  );
}
