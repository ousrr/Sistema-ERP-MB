import { ConfigPage } from "../../persona5/ConfigPage";
import type { Config } from "../../persona5/types";

const config: Config = {
  ...{
  "key": "reglas-aprobacion",
  "id": "regla_id",
  "title": "Reglas de aprobación",
  "singular": "regla de aprobación",
  "description": "Defina las aprobaciones requeridas según el monto y la vigencia.",
  "active": "ACTIVA",
  "inactive": "INACTIVA",
  "states": [
    "BORRADOR",
    "ACTIVA",
    "INACTIVA"
  ],
  "fields": [
    {
      "kind": "id",
      "name": "empresa_id",
      "label": "ID de empresa",
      "group": "Alcance",
      "help": "ID existente de su ERP. Este módulo no crea empresas."
    },
    {
      "kind": "id",
      "name": "tipo_operacion_id",
      "label": "Tipo de operación",
      "group": "Alcance",
      "help": "Catálogo bancario del grupo TIPO_OPERACION.",
      "catalog": "tipos"
    },
    {
      "kind": "id",
      "max": "99999",
      "name": "moneda_id",
      "label": "ID de moneda",
      "group": "Alcance",
      "help": "ID existente de su ERP (no el código GTQ/USD)."
    },
    {
      "kind": "text",
      "name": "nombre",
      "label": "Nombre de la regla",
      "group": "Alcance",
      "help": "Máximo 100 bytes UTF-8."
    },
    {
      "kind": "money",
      "name": "monto_minimo",
      "label": "Monto mínimo",
      "group": "Rango de aprobación",
      "help": "Incluido en el rango; mínimo 0. Use punto decimal."
    },
    {
      "kind": "money",
      "name": "monto_maximo",
      "optional": true,
      "label": "Monto máximo (opcional)",
      "group": "Rango de aprobación",
      "help": "Incluido en el rango. Debe superar al mínimo. Vacío: sin límite."
    },
    {
      "kind": "integer",
      "name": "cantidad_aprobaciones",
      "label": "Aprobaciones requeridas",
      "group": "Rango de aprobación",
      "help": "Entero de 1 a 999."
    },
    {
      "kind": "flag",
      "name": "doble_aprobacion",
      "label": "Doble aprobación",
      "group": "Condiciones",
      "help": "Si selecciona Sí, se requieren al menos 2 aprobaciones."
    },
    {
      "kind": "flag",
      "name": "requiere_evidencia",
      "label": "Requiere evidencia",
      "group": "Condiciones"
    },
    {
      "kind": "flag",
      "name": "permite_reprogramar",
      "label": "Permite reprogramar",
      "group": "Condiciones"
    },
    {
      "kind": "date",
      "name": "vigencia_desde",
      "label": "Vigente desde",
      "group": "Vigencia",
      "help": "Día incluido en la vigencia."
    },
    {
      "kind": "date",
      "name": "vigencia_hasta",
      "optional": true,
      "label": "Vigente hasta (opcional)",
      "group": "Vigencia",
      "help": "Día incluido. Vacío: sin vencimiento."
    },
    {
      "kind": "integer",
      "max": "99999",
      "name": "version",
      "label": "Versión",
      "group": "Control",
      "help": "Entero de 1 a 99999. No se incrementa automáticamente."
    },
    {
      "kind": "state",
      "name": "estado",
      "label": "Estado",
      "group": "Control"
    },
    {
      "createOnly": true,
      "kind": "id",
      "name": "creado_por",
      "label": "ID de usuario creador",
      "group": "Control",
      "help": "Requerido al crear. Se conserva al editar; pendiente integración con la sesión del ERP."
    }
  ],
  "resolver": [
    {
      "kind": "id",
      "name": "empresa_id",
      "label": "ID de empresa",
      "group": "Alcance",
      "help": "ID existente de su ERP. Este módulo no crea empresas."
    },
    {
      "kind": "id",
      "name": "tipo_operacion_id",
      "label": "Tipo de operación",
      "group": "Alcance",
      "help": "Catálogo bancario del grupo TIPO_OPERACION.",
      "catalog": "tipos"
    },
    {
      "kind": "id",
      "max": "99999",
      "name": "moneda_id",
      "label": "ID de moneda",
      "group": "Alcance",
      "help": "ID existente de su ERP (no el código GTQ/USD)."
    },
    {
      "kind": "money",
      "name": "monto",
      "label": "Monto de la operación",
      "group": "Consulta",
      "help": "Monto no negativo, hasta 2 decimales."
    },
    {
      "kind": "date",
      "name": "fecha",
      "label": "Fecha de operación",
      "group": "Consulta"
    }
  ],
  "defaults": {
    "monto_minimo": "0",
    "cantidad_aprobaciones": "1",
    "doble_aprobacion": "N",
    "requiere_evidencia": "N",
    "permite_reprogramar": "N",
    "version": "1",
    "estado": "BORRADOR"
  }
},
  columns: [
 { label: "Regla / empresa", value: r => r.nombre + " · Empresa " + r.empresa_id },
 { label: "Operación / moneda", value: r => (r.tipo_operacion_nombre ?? r.tipo_operacion_id) + " · Moneda " + r.moneda_id },
 { label: "Rango", value: r => r.monto_minimo + " — " + (r.monto_maximo ?? "Sin límite") },
 { label: "Aprobaciones", value: r => r.cantidad_aprobaciones! },
 { label: "Vigencia", value: r => r.vigencia_desde + " — " + (r.vigencia_hasta ?? "Sin fin") },
]
};

export function ReglasAprobacionPage() { return <ConfigPage config={config} />; }

