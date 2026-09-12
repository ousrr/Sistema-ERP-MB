import { ConfigPage } from "../../persona5/ConfigPage";
import type { Config } from "../../persona5/types";

const config: Config = {
  ...{
  "key": "parametros-conciliacion",
  "id": "parametro_id",
  "title": "Parámetros de conciliación",
  "singular": "parámetro de conciliación",
  "description": "Configure tolerancias y criterios de coincidencia por banco o cuenta.",
  "active": "ACTIVO",
  "inactive": "INACTIVO",
  "states": [
    "ACTIVO",
    "INACTIVO"
  ],
  "fields": [
    {
      "kind": "id",
      "name": "banco_id",
      "label": "Banco",
      "group": "Alcance",
      "help": "Seleccione un banco del catálogo MB_BANCO.",
      "catalog": "bancos"
    },
    {
      "kind": "id",
      "name": "cuenta_id",
      "optional": true,
      "label": "Cuenta bancaria (opcional)",
      "group": "Alcance",
      "help": "Vacío: configuración general del banco. La cuenta debe pertenecer al banco seleccionado.",
      "catalog": "cuentas"
    },
    {
      "kind": "integer",
      "name": "tolerancia_dias",
      "label": "Tolerancia de días",
      "group": "Tolerancias",
      "help": "Entero de 0 a 999."
    },
    {
      "kind": "money",
      "name": "tolerancia_monto",
      "label": "Tolerancia de monto",
      "group": "Tolerancias",
      "help": "Monto no negativo, hasta 2 decimales. Use punto decimal."
    },
    {
      "kind": "flag",
      "name": "coincide_referencia",
      "label": "Comparar referencia",
      "group": "Criterios de coincidencia"
    },
    {
      "kind": "flag",
      "name": "coincide_cheque",
      "label": "Comparar número de cheque",
      "group": "Criterios de coincidencia"
    },
    {
      "kind": "flag",
      "name": "coincide_beneficiario",
      "label": "Comparar beneficiario",
      "group": "Criterios de coincidencia"
    },
    {
      "kind": "flag",
      "name": "coincide_concepto",
      "label": "Comparar concepto",
      "group": "Criterios de coincidencia"
    },
    {
      "kind": "percent",
      "name": "porcentaje_minimo",
      "label": "Coincidencia mínima (%)",
      "group": "Tolerancias",
      "help": "Entre 0 y 100, hasta 2 decimales."
    },
    {
      "kind": "flag",
      "name": "revision_manual",
      "label": "Enviar a revisión manual",
      "group": "Criterios de coincidencia"
    },
    {
      "kind": "state",
      "name": "estado",
      "label": "Estado",
      "group": "Control"
    }
  ],
  "resolver": [
    {
      "kind": "id",
      "name": "banco_id",
      "label": "Banco",
      "group": "Alcance",
      "help": "Seleccione un banco del catálogo MB_BANCO.",
      "catalog": "bancos"
    },
    {
      "kind": "id",
      "name": "cuenta_id",
      "optional": true,
      "label": "Cuenta bancaria (opcional)",
      "group": "Alcance",
      "help": "Vacío: configuración general del banco. La cuenta debe pertenecer al banco seleccionado.",
      "catalog": "cuentas"
    }
  ],
  "defaults": {
    "tolerancia_dias": "0",
    "tolerancia_monto": "0",
    "porcentaje_minimo": "100",
    "coincide_referencia": "S",
    "coincide_cheque": "N",
    "coincide_beneficiario": "N",
    "coincide_concepto": "N",
    "revision_manual": "S",
    "estado": "ACTIVO"
  }
},
  columns: [
 { label: "Banco", value: r => r.banco_nombre ?? r.banco_id! },
 { label: "Cuenta", value: r => r.cuenta_nombre ?? (r.cuenta_id ? "ID " + r.cuenta_id : "General del banco") },
 { label: "Días", value: r => r.tolerancia_dias! },
 { label: "Monto tolerado", value: r => r.tolerancia_monto! },
 { label: "Coincidencia", value: r => r.porcentaje_minimo + "%" },
]
};

export function ParametrosConciliacionPage() { return <ConfigPage config={config} />; }

