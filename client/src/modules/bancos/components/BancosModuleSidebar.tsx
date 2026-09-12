import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";


export type PaginaBancos =
  | "inicio"
  | "dashboard"
  | "cuentas"
  | "chequeras"
  | "cuentas-proveedor"
  | "conciliacion"
  | "reportes"
  | "bancos"
  | "catalogos"
  | "formatos-importacion"
  | "reglas-aprobacion"
  | "plantillas-cheque"
  | "parametros-conciliacion"
  | "auditoria";


type ItemMenu = {
  id: PaginaBancos;
  label: string;
  ruta: string;
  disponible: boolean;
};


function obtenerPaginaActual(): PaginaBancos {
  const hash =
    window.location.hash
      .replace("#", "")
      .trim();

  switch (hash) {
    case "inicio":
      return "inicio";

    case "dashboard":
      return "dashboard";

    case "cuentas":
      return "cuentas";

    case "chequeras":
      return "chequeras";

    case "cuentas-proveedor":
      return "cuentas-proveedor";

    case "conciliacion":
      return "conciliacion";

    case "reportes":
      return "reportes";

    case "bancos":
      return "bancos";

    case "catalogos":
      return "catalogos";

    case "formatos-importacion":
      return "formatos-importacion";

    case "reglas-aprobacion":
      return "reglas-aprobacion";

    case "plantillas-cheque":
      return "plantillas-cheque";

    case "parametros-conciliacion":
      return "parametros-conciliacion";

    case "auditoria":
      return "auditoria";

    default:
      return "chequeras";
  }
}


const cuentasMovimientos: ItemMenu[] = [
  {
    id: "cuentas",
    label: "Cuentas bancarias",
    ruta: "/bancos/cuentas",
    disponible: true,
  },

  {
    id: "chequeras",
    label: "Chequeras",
    ruta: "/bancos/cuentas/chequeras",
    disponible: true,
  },
];


const pagosAutorizados: ItemMenu[] = [
  {
    id: "cuentas-proveedor",
    label:
      "Cuentas bancarias de proveedores",
    ruta:
      "/bancos/pagos/cuentas-proveedor",
    disponible: true,
  },
];


const configuracionAuditoria: ItemMenu[] = [
  {
    id: "bancos",
    label: "Bancos",
    ruta:
      "/bancos/configuracion/catalogos/bancos",
    disponible: true,
  },

  {
    id: "catalogos",
    label:
      "Catálogos bancarios",
    ruta:
      "/bancos/configuracion/catalogos/bancarios",
    disponible: true,
  },

  {
    id: "formatos-importacion",
    label:
      "Formatos de importación",
    ruta:
      "/bancos/configuracion/catalogos/formatos-importacion",
    disponible: true,
  },

  {
    id: "reglas-aprobacion",
    label:
      "Reglas de aprobación",
    ruta:
      "/bancos/configuracion/catalogos/reglas-aprobacion",
    disponible: true,
  },

  {
    id: "plantillas-cheque",
    label:
      "Plantillas de cheque",
    ruta:
      "/bancos/configuracion/plantillas-cheque",
    disponible: true,
  },

  {
    id: "parametros-conciliacion",
    label:
      "Parámetros de conciliación",
    ruta:
      "/bancos/configuracion/parametros-conciliacion",
    disponible: true,
  },

  {
    id: "auditoria",
    label:
      "Auditoría bancaria",
    ruta:
      "/bancos/configuracion/auditoria",
    disponible: false,
  },
];


export function BancosModuleSidebar() {
  const [
    target,
    setTarget,
  ] =
    useState<HTMLElement | null>(
      null
    );

  const [
    paginaActual,
    setPaginaActual,
  ] =
    useState<PaginaBancos>(
      obtenerPaginaActual
    );

  const [
    cuentasAbierto,
    setCuentasAbierto,
  ] = useState(true);

  const [
    pagosAbierto,
    setPagosAbierto,
  ] = useState(false);

  const [
    configuracionAbierta,
    setConfiguracionAbierta,
  ] = useState(true);


  useEffect(() => {
    setTarget(
      document.querySelector<HTMLElement>(
        ".erp-sidebar__navigation"
      )
    );
  }, []);


  useEffect(() => {
    function handleHashChange() {
      const nuevaPagina =
        obtenerPaginaActual();

      setPaginaActual(
        nuevaPagina
      );

      if (
        nuevaPagina ===
          "cuentas" ||
        nuevaPagina ===
          "chequeras"
      ) {
        setCuentasAbierto(
          true
        );
      }

      if (
        nuevaPagina ===
        "cuentas-proveedor"
      ) {
        setPagosAbierto(
          true
        );
      }

      if (
        [
          "bancos",
          "catalogos",
          "formatos-importacion",
          "reglas-aprobacion",
          "plantillas-cheque",
          "parametros-conciliacion",
          "auditoria",
        ].includes(
          nuevaPagina
        )
      ) {
        setConfiguracionAbierta(
          true
        );
      }
    }


    window.addEventListener(
      "hashchange",
      handleHashChange
    );


    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );
    };
  }, []);


  function navegar(
    item: ItemMenu
  ) {
    if (
      !item.disponible
    ) {
      return;
    }

    window.location.hash =
      item.id;
  }


  function renderItem(
    item: ItemMenu
  ) {
    const activo =
      paginaActual ===
      item.id;

    return (
      <button
        key={item.id}
        type="button"
        className={
          activo
            ? "bancos-sidebar-extension__item bancos-sidebar-extension__item--active"
            : "bancos-sidebar-extension__item"
        }
        aria-current={
          activo
            ? "page"
            : undefined
        }
        aria-disabled={
          !item.disponible
        }
        title={
          item.disponible
            ? item.label
            : `${item.label} — pendiente de integración`
        }
        onClick={() =>
          navegar(
            item
          )
        }
        style={{
          paddingLeft:
            "20px",

          cursor:
            item.disponible
              ? "pointer"
              : "default",

          opacity:
            item.disponible
              ? 1
              : 0.7,
        }}
      >
        <span className="bancos-sidebar-extension__dot" />

        <span>
          {item.label}
        </span>
      </button>
    );
  }


  function renderGrupo(
    titulo: string,
    abierto: boolean,
    setAbierto:
      React.Dispatch<
        React.SetStateAction<boolean>
      >,
    items: ItemMenu[]
  ) {
    return (
      <div
        style={{
          marginTop:
            "4px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setAbierto(
              (actual) =>
                !actual
            )
          }
          style={{
            width: "100%",

            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",

            gap: "8px",

            padding:
              "9px 12px",

            border: "0",

            background:
              "transparent",

            color:
              "#cbd5e1",

            fontSize:
              "11px",

            fontWeight:
              600,

            textAlign:
              "left",

            cursor:
              "pointer",
          }}
        >
          <span>
            {titulo}
          </span>

          {abierto ? (
            <ChevronDown
              size={13}
            />
          ) : (
            <ChevronRight
              size={13}
            />
          )}
        </button>


        {abierto ? (
          <div>
            {items.map(
              renderItem
            )}
          </div>
        ) : null}
      </div>
    );
  }


  if (!target) {
    return null;
  }


  return createPortal(
    <div
      className="bancos-sidebar-extension"
      aria-label="Navegación interna del módulo Bancos"
    >
      {/*
       * ==================================
       * INICIO
       * ==================================
       */}

      <button
        type="button"
        className="bancos-sidebar-extension__item"
        aria-disabled="true"
        title="Inicio del módulo — pendiente de integración"
        style={{
          cursor:
            "default",
          opacity:
            0.7,
        }}
      >
        <span className="bancos-sidebar-extension__dot" />

        <span>
          Inicio del módulo
        </span>
      </button>


      <button
        type="button"
        className="bancos-sidebar-extension__item"
        aria-disabled="true"
        title="Dashboard bancario — pendiente de integración"
        style={{
          cursor:
            "default",
          opacity:
            0.7,
        }}
      >
        <span className="bancos-sidebar-extension__dot" />

        <span>
          Dashboard bancario
        </span>
      </button>


      {/*
       * ==================================
       * CUENTAS Y MOVIMIENTOS
       * ==================================
       */}

      {renderGrupo(
        "Cuentas y movimientos",
        cuentasAbierto,
        setCuentasAbierto,
        cuentasMovimientos
      )}


      {/*
       * ==================================
       * PAGOS AUTORIZADOS
       * ==================================
       */}

      {renderGrupo(
        "Pagos autorizados",
        pagosAbierto,
        setPagosAbierto,
        pagosAutorizados
      )}


      {/*
       * ==================================
       * CONCILIACIÓN
       * ==================================
       */}

      <button
        type="button"
        className="bancos-sidebar-extension__item"
        aria-disabled="true"
        title="Conciliación bancaria — pendiente de integración"
        style={{
          cursor:
            "default",
          opacity:
            0.7,
        }}
      >
        <span className="bancos-sidebar-extension__dot" />

        <span>
          Conciliación bancaria
        </span>
      </button>


      {/*
       * ==================================
       * REPORTES
       * ==================================
       */}

      <button
        type="button"
        className="bancos-sidebar-extension__item"
        aria-disabled="true"
        title="Reportes y Cash Flow — pendiente de integración"
        style={{
          cursor:
            "default",
          opacity:
            0.7,
        }}
      >
        <span className="bancos-sidebar-extension__dot" />

        <span>
          Reportes y Cash Flow
        </span>
      </button>


      {/*
       * ==================================
       * CONFIGURACIÓN Y AUDITORÍA
       * ==================================
       */}

      {renderGrupo(
        "Configuración y auditoría",
        configuracionAbierta,
        setConfiguracionAbierta,
        configuracionAuditoria
      )}
    </div>,
    target
  );
}