import { useEffect, useState } from "react";
import { ERPLayout } from "../layouts/ERPLayout";
import { BancosModuleSidebar } from "../modules/bancos/components/BancosModuleSidebar";

import { BancosPage } from "../modules/bancos/features/bancos/pages/BancosPage";
import { CatalogosPage } from "../modules/bancos/features/catalogos/pages/CatalogosPage";
import { CuentasPage } from "../modules/bancos/features/cuentas/pages/CuentasPage";
import { CuentasProveedorPage } from "../modules/bancos/features/cuentas-proveedor/pages/CuentasProveedorPage";
import { FormatosImportacionPage } from "../modules/bancos/features/formatos-importacion/pages/FormatosImportacionPage";
import { ChequerasPage } from "../modules/bancos/features/chequeras/pages/ChequerasPage";
import { PlantillasChequePage } from "../modules/bancos/features/plantillas-cheque/pages/PlantillasChequePage";
import { ParametrosConciliacionPage } from "../modules/bancos/features/parametros-conciliacion/pages/ParametrosConciliacionPage";
import { ReglasAprobacionPage } from "../modules/bancos/features/reglas-aprobacion/pages/ReglasAprobacionPage";

type PaginaBancosIntegrada =
  | "bancos"
  | "catalogos"
  | "cuentas"
  | "cuentas-proveedor"
  | "formatos-importacion"
  | "chequeras"
  | "plantillas-cheque"
  | "parametros-conciliacion"
  | "reglas-aprobacion";

function obtenerPaginaActual(): PaginaBancosIntegrada {
  const hash = window.location.hash.replace("#", "").trim();

  switch (hash) {
    case "bancos": return "bancos";
    case "catalogos": return "catalogos";
    case "cuentas": return "cuentas";
    case "cuentas-proveedor": return "cuentas-proveedor";
    case "formatos-importacion": return "formatos-importacion";
    case "chequeras": return "chequeras";
    case "plantillas-cheque": return "plantillas-cheque";
    case "parametros-conciliacion": return "parametros-conciliacion";
    case "reglas-aprobacion": return "reglas-aprobacion";
    default: return "chequeras";
  }
}

function renderPagina(pagina: PaginaBancosIntegrada) {
  switch (pagina) {
    case "bancos": return <BancosPage />;
    case "catalogos": return <CatalogosPage />;
    case "cuentas": return <CuentasPage />;
    case "cuentas-proveedor": return <CuentasProveedorPage />;
    case "formatos-importacion": return <FormatosImportacionPage />;
    case "chequeras": return <ChequerasPage />;
    case "plantillas-cheque": return <PlantillasChequePage />;
    case "parametros-conciliacion": return <ParametrosConciliacionPage />;
    case "reglas-aprobacion": return <ReglasAprobacionPage />;
  }
}

export function App() {
  const [paginaActual, setPaginaActual] = useState<PaginaBancosIntegrada>(obtenerPaginaActual);

  useEffect(() => {
    const handleHashChange = () => setPaginaActual(obtenerPaginaActual());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <ERPLayout activeModule="bancos" title="Módulo de Bancos">
      <BancosModuleSidebar />
      {renderPagina(paginaActual)}
    </ERPLayout>
  );
}
