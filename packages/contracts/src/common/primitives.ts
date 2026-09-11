/** Texto ISO YYYY-MM-DD. */
export type IsoDateString = string;

/** Fecha/hora serializada en ISO 8601. */
export type IsoDateTimeString = string;

/** Decimal transportado como texto para evitar pérdida de precisión en JavaScript. */
export type DecimalString = string;

/** Identificador Oracle NUMBER(19) transportado como texto para evitar pérdida de precisión. */
export type OracleNumber19Id = string;

export type IndicadorSN = "S" | "N";

export type EstadoActivoInactivo = "ACTIVO" | "INACTIVO";
