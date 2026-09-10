export type CampoErrorBanco =
  | "codigoBanco"
  | "nombre"
  | "bicSwift";


export class BancoBackendErrorRules {

  // =====================================================
  // CAMPO ASOCIADO A UN ERROR DEL BACKEND
  // =====================================================

  static obtenerCampo(
    code: string
  ): CampoErrorBanco | null {

    switch (
      code
    ) {

      case "BANCO_CODIGO_DUPLICADO":

        return "codigoBanco";


      default:

        return null;
    }
  }
}