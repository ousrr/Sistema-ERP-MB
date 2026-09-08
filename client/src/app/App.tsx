import { ERPLayout } from "../layouts/ERPLayout";
import { ModuleLayout } from "../layouts/ModuleLayout";

import { PageContainer } from "../shared/layout/PageContainer";
import { PageHeader } from "../shared/layout/PageHeader";
import { PageSection } from "../shared/layout/PageSection";

import { ModuleTabs } from "../shared/navigation/ModuleTabs";

export function App() {
  return (
    <ERPLayout>
      <ModuleLayout
        title="Módulo"
        navigation={
          <ModuleTabs
            items={[
              { label: "Inicio" },
              { label: "Opción 1" },
              { label: "Opción 2" },
              { label: "Configuración" },
            ]}
          />
        }
      >
        <PageContainer>
          <PageHeader
            title="Área de trabajo"
            description="Aquí se desarrollará el contenido de cada módulo."
          />

          <PageSection>
            Contenido de la página
          </PageSection>
        </PageContainer>
      </ModuleLayout>
    </ERPLayout>
  );
}