import type { Definition } from "../persona5/persona5.types.js";
export const definition: Definition = {
  "key": "reglas-aprobacion",
  "pkg": "PKG_MB_REGLAS_APROBACION",
  "id": "regla_id",
  "states": [
    "BORRADOR",
    "ACTIVA",
    "INACTIVA"
  ],
  "inactive": "INACTIVA",
  "fields": [
    {
      "name": "empresa_id",
      "kind": "id"
    },
    {
      "name": "tipo_operacion_id",
      "kind": "id"
    },
    {
      "name": "moneda_id",
      "kind": "id",
      "max": "99999"
    },
    {
      "name": "nombre",
      "kind": "text"
    },
    {
      "name": "monto_minimo",
      "kind": "money"
    },
    {
      "name": "monto_maximo",
      "kind": "money",
      "optional": true
    },
    {
      "name": "cantidad_aprobaciones",
      "kind": "integer"
    },
    {
      "name": "doble_aprobacion",
      "kind": "flag"
    },
    {
      "name": "requiere_evidencia",
      "kind": "flag"
    },
    {
      "name": "permite_reprogramar",
      "kind": "flag"
    },
    {
      "name": "vigencia_desde",
      "kind": "date"
    },
    {
      "name": "vigencia_hasta",
      "kind": "date",
      "optional": true
    },
    {
      "name": "version",
      "kind": "integer",
      "max": "99999"
    },
    {
      "name": "estado",
      "kind": "state"
    },
    {
      "name": "creado_por",
      "kind": "id",
      "createOnly": true
    }
  ],
  "resolver": [
    {
      "name": "empresa_id",
      "kind": "id"
    },
    {
      "name": "tipo_operacion_id",
      "kind": "id"
    },
    {
      "name": "moneda_id",
      "kind": "id",
      "max": "99999"
    },
    {
      "name": "monto",
      "kind": "money"
    },
    {
      "name": "fecha",
      "kind": "date"
    }
  ],
  "catalogs": {
    "tipos": "LISTAR_TIPOS"
  }
};

