import {
  useState
} from "react";

import {
  ERPLayout
} from "../layouts/ERPLayout";

import {
  ModuleLayout
} from "../layouts/ModuleLayout";

import {
  PageContainer
} from "../shared/layout/PageContainer";

import {
  BancosBreadcrumbs
} from "../modules/bancos/common/navigation/BancosBreadcrumbs";

import {
  BancosNavigationModel,
  type BancosSection
} from "../modules/bancos/common/navigation/BancosNavigation.types";

import {
  BancosPage
} from "../modules/bancos/features/bancos/pages/BancosPage";

import {
  CatalogosPage
} from "../modules/bancos/features/catalogos/pages/CatalogosPage";


export function App() {

  const [
    seccionActiva,
    setSeccionActiva
  ] = useState<BancosSection>(
    "bancos"
  );


  function renderContenido() {

    switch (
      seccionActiva
    ) {

      case "catalogos":

        return (
          <CatalogosPage />
        );


      case "bancos":
      default:

        return (
          <BancosPage />
        );
    }
  }


  const breadcrumbs =
    BancosNavigationModel
      .obtenerBreadcrumbs(
        seccionActiva
      );


  return (
    <ERPLayout>

      <ModuleLayout
        title=
          "Módulo de Bancos"

        navigation={

          <BancosBreadcrumbs
            items={
              breadcrumbs
            }

            activeKey={
              seccionActiva
            }

            onNavigate={
              setSeccionActiva
            }
          />

        }
      >

        <PageContainer>
          {renderContenido()}
        </PageContainer>

      </ModuleLayout>

    </ERPLayout>
  );
}
