import type { Definition } from "../persona5/persona5.types.js";
export const definition: Definition = {
  "key": "parametros-conciliacion",
  "pkg": "PKG_MB_PARAMETROS_CONCILIACION",
  "id": "parametro_id",
  "states": [
    "ACTIVO",
    "INACTIVO"
  ],
  "inactive": "INACTIVO",
  "fields": [
    {
      "name": "banco_id",
      "kind": "id"
    },
    {
      "name": "cuenta_id",
      "kind": "id",
      "optional": true
    },
    {
      "name": "tolerancia_dias",
      "kind": "integer"
    },
    {
      "name": "tolerancia_monto",
      "kind": "money"
    },
    {
      "name": "coincide_referencia",
      "kind": "flag"
    },
    {
      "name": "coincide_cheque",
      "kind": "flag"
    },
    {
      "name": "coincide_beneficiario",
      "kind": "flag"
    },
    {
      "name": "coincide_concepto",
      "kind": "flag"
    },
    {
      "name": "porcentaje_minimo",
      "kind": "percent"
    },
    {
      "name": "revision_manual",
      "kind": "flag"
    },
    {
      "name": "estado",
      "kind": "state"
    }
  ],
  "resolver": [
    {
      "name": "banco_id",
      "kind": "id"
    },
    {
      "name": "cuenta_id",
      "kind": "id",
      "optional": true
    }
  ],
  "catalogs": {
    "bancos": "LISTAR_BANCOS",
    "cuentas": "LISTAR_CUENTAS"
  }
};

