/** Respuesta estándar de error para todas las APIs del ERP. */
export interface ApiErrorResponse {
  ok: false;
  code: string;
  message: string;
  details?: unknown;
}

/** Respuesta estándar cuando una operación devuelve datos. */
export interface ApiDataResponse<T> {
  ok: true;
  data: T;
  message?: string;
}

/** Respuesta estándar para operaciones sin payload de datos. */
export interface ApiMessageResponse {
  ok: true;
  message: string;
}

export type ApiResponse<T> = ApiDataResponse<T> | ApiErrorResponse;
