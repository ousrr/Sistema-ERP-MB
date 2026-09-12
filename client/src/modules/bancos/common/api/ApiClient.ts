import {
  ApiError
} from "./ApiError";


export interface ApiClientConfig {

  baseUrl: string;

  serviceName: string;

  serviceCode: string;
}


export interface ApiOperationContext {

  operation: string;

  fallbackMessage: string;
}


type BackendErrorResponse = {

  code?: unknown;

  message?: unknown;
};


type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";


export class ApiClient {

  constructor(
    private readonly config:
      ApiClientConfig
  ) {}


  // =====================================================
  // GET
  // =====================================================

  get<TResponse>(
    path: string,
    context: ApiOperationContext
  ): Promise<TResponse> {

    return this.request<TResponse>(
      "GET",
      path,
      undefined,
      context
    );
  }


  // =====================================================
  // POST
  // =====================================================

  post<
    TResponse,
    TRequest
  >(
    path: string,
    body: TRequest,
    context: ApiOperationContext
  ): Promise<TResponse> {

    return this.request<TResponse>(
      "POST",
      path,
      body,
      context
    );
  }


  // =====================================================
  // PUT
  // =====================================================

  put<
    TResponse,
    TRequest
  >(
    path: string,
    body: TRequest,
    context: ApiOperationContext
  ): Promise<TResponse> {

    return this.request<TResponse>(
      "PUT",
      path,
      body,
      context
    );
  }


  // =====================================================
  // PATCH
  // =====================================================

  patch<
    TResponse,
    TRequest
  >(
    path: string,
    body: TRequest,
    context: ApiOperationContext
  ): Promise<TResponse> {

    return this.request<TResponse>(
      "PATCH",
      path,
      body,
      context
    );
  }


  // =====================================================
  // DELETE
  // =====================================================

  delete<TResponse>(
    path: string,
    context: ApiOperationContext
  ): Promise<TResponse> {

    return this.request<TResponse>(
      "DELETE",
      path,
      undefined,
      context
    );
  }


  // =====================================================
  // PETICIÓN CENTRALIZADA
  // =====================================================

  private async request<TResponse>(
    method: HttpMethod,
    path: string,
    body: unknown,
    context: ApiOperationContext
  ): Promise<TResponse> {

    let response:
      Response;


    try {

      response =
        await fetch(
          this.buildUrl(
            path
          ),
          this.buildRequestInit(
            method,
            body
          )
        );

    } catch (
      cause
    ) {

      const error =
        new ApiError(
          `${this.config.serviceCode}_SERVICIO_NO_DISPONIBLE`,
          this.getServiceUnavailableMessage(),
          0
        );


      this.logDiagnostic(
        error,
        context.operation,
        cause
      );


      throw error;
    }


    if (
      !response.ok
    ) {

      const error =
        await this.buildResponseError(
          response,
          context
        );


      this.logDiagnostic(
        error,
        context.operation
      );


      throw error;
    }


    if (
      response.status === 204
    ) {

      return undefined as TResponse;
    }


    try {

      return await response.json() as TResponse;

    } catch (
      cause
    ) {

      const error =
        new ApiError(
          `${this.config.serviceCode}_RESPUESTA_INVALIDA`,
          `El servicio de ${this.config.serviceName} devolvió una respuesta no válida. Si el problema continúa, contacta al administrador del sistema.`,
          response.status
        );


      this.logDiagnostic(
        error,
        context.operation,
        cause
      );


      throw error;
    }
  }


  // =====================================================
  // CREAR ERROR DESDE HTTP
  // =====================================================

  private async buildResponseError(
    response: Response,
    context: ApiOperationContext
  ): Promise<ApiError> {

    let code =
      `HTTP_${response.status}`;


    let message =
      context.fallbackMessage;


    let hasBackendCode =
      false;


    try {

      const data =
        await response.json() as
          BackendErrorResponse;


      if (
        typeof data.code ===
          "string" &&
        data.code.trim() !==
          ""
      ) {

        code =
          data.code.trim();

        hasBackendCode =
          true;
      }


      if (
        typeof data.message ===
          "string" &&
        data.message.trim() !==
          ""
      ) {

        message =
          data.message.trim();
      }

    } catch {

      /*
        Un proxy, gateway o servidor intermedio
        puede devolver HTML o texto en lugar del
        contrato JSON de la aplicación.

        Nunca se muestra ese contenido técnico
        directamente al usuario.
      */
    }


    if (
      this.isServiceUnavailableStatus(
        response.status
      ) &&
      !hasBackendCode
    ) {

      code =
        `${this.config.serviceCode}_SERVICIO_NO_DISPONIBLE`;


      message =
        this.getServiceUnavailableMessage();
    }


    return new ApiError(
      code,
      message,
      response.status
    );
  }


  // =====================================================
  // REQUEST INIT
  // =====================================================

  private buildRequestInit(
    method: HttpMethod,
    body: unknown
  ): RequestInit {

    if (
      body === undefined
    ) {

      return {
        method
      };
    }


    return {
      method,

      headers: {
        "Content-Type":
          "application/json"
      },

      body:
        JSON.stringify(
          body
        )
    };
  }


  // =====================================================
  // URL
  // =====================================================

  private buildUrl(
    path: string
  ): string {

    if (
      !path
    ) {

      return this.config
        .baseUrl;
    }


    if (
      path.startsWith(
        "/"
      )
    ) {

      return (
        this.config.baseUrl +
        path
      );
    }


    return (
      `${this.config.baseUrl}/${path}`
    );
  }


  // =====================================================
  // SERVICIO NO DISPONIBLE
  // =====================================================

  private isServiceUnavailableStatus(
    status: number
  ): boolean {

    return (
      status === 502 ||
      status === 503 ||
      status === 504
    );
  }


  private getServiceUnavailableMessage():
    string {

    return (
      `No fue posible conectar con el servicio de ${this.config.serviceName}. ` +
      "Reintenta la conexión. Si el problema continúa, " +
      "contacta al administrador del sistema."
    );
  }


  // =====================================================
  // DIAGNÓSTICO TÉCNICO
  // =====================================================

  private logDiagnostic(
    error: ApiError,
    operation: string,
    cause?: unknown
  ): void {

    console.error(
      `[${this.config.serviceCode} API]`,
      {
        operation,
        code:
          error.code,
        status:
          error.status,
        cause:
          cause ?? null
      }
    );
  }
}
