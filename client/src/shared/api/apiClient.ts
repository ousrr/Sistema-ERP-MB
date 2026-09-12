import { ApiClient } from "../../modules/bancos/common/api/ApiClient";

const client = new ApiClient({
  baseUrl: "",
  serviceName: "Bancos",
  serviceCode: "BANCOS"
});

function context(operation: string) {
  return {
    operation,
    fallbackMessage: "No fue posible completar la operación solicitada."
  };
}

export const apiClient = {
  get<TResponse>(path: string): Promise<TResponse> {
    return client.get<TResponse>(path, context("GET"));
  },

  post<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return client.post<TResponse, unknown>(path, body, context("POST"));
  },

  put<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return client.put<TResponse, unknown>(path, body, context("PUT"));
  },

  patch<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return client.patch<TResponse, unknown>(path, body, context("PATCH"));
  },

  delete<TResponse>(path: string): Promise<TResponse> {
    return client.delete<TResponse>(path, context("DELETE"));
  }
};
