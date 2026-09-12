export type EstadoActivoInactivo =
  | "ACTIVO"
  | "INACTIVO";


export type VarianteAccionEstado =
  | "danger"
  | "success";


export class EstadoActivoInactivoAction {

  private constructor(
    public readonly estadoActual: EstadoActivoInactivo,
    public readonly estadoSiguiente: EstadoActivoInactivo,
    public readonly accion: string,
    public readonly titulo: string,
    public readonly confirmacion: string,
    public readonly variante: VarianteAccionEstado
  ) {}


  // =====================================================
  // CREAR CONFIGURACIÓN SEGÚN ESTADO ACTUAL
  // =====================================================

  static desde(
    estadoActual: EstadoActivoInactivo
  ): EstadoActivoInactivoAction {

    if (
      estadoActual === "ACTIVO"
    ) {

      return new EstadoActivoInactivoAction(
        "ACTIVO",
        "INACTIVO",
        "Desactivar banco",
        "Desactivar banco",
        "Desactivar banco",
        "danger"
      );
    }


    return new EstadoActivoInactivoAction(
      "INACTIVO",
      "ACTIVO",
      "Activar banco",
      "Activar banco",
      "Activar banco",
      "success"
    );
  }


  // =====================================================
  // MENSAJE PARA EL USUARIO
  // =====================================================

  obtenerMensaje(
    nombreBanco: string
  ): string {

    if (
      this.estadoActual === "ACTIVO"
    ) {

      return (
        `¿Deseas desactivar ${nombreBanco}? ` +
        "El banco dejará de estar disponible para nuevas asignaciones, " +
        "pero su información e historial se conservarán."
      );
    }


    return (
      `¿Deseas activar nuevamente ${nombreBanco}? ` +
      "El banco volverá a estar disponible para nuevas asignaciones."
    );
  }
}