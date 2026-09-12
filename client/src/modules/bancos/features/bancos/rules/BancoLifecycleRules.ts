import type {
  EstadoActivoInactivo
} from "./EstadoActivoInactivo";


export class BancoLifecycleRules {

  // =====================================================
  // EDICIÓN
  // =====================================================

  static puedeEditar(
    estado: EstadoActivoInactivo
  ): boolean {

    return estado === "ACTIVO";
  }


  // =====================================================
  // MENSAJE DE EDICIÓN
  // =====================================================

  static obtenerMensajeEdicion(
    estado: EstadoActivoInactivo
  ): string {

    if (
      this.puedeEditar(
        estado
      )
    ) {

      return "Editar banco";
    }


    return "Banco inactivo. Actívelo antes de editarlo.";
  }
}