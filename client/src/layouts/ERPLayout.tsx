import type {
  ReactNode,
} from "react";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface ERPLayoutProps {
  children: ReactNode;

  title?: string;

  activeModule?:
    | "dashboard"
    | "compras"
    | "inventario"
    | "cxp"
    | "cxc"
    | "bancos";
}

export function ERPLayout({
  children,
  title = "Sistema ERP",
  activeModule = "bancos",
}: ERPLayoutProps) {
  return (
    <div className="erp-layout">

      <Sidebar
        activeItem={activeModule}
      />

      <div className="erp-layout__main">

        <Header
          title={title}
        />

        <main className="erp-layout__content">
          {children}
        </main>

      </div>

    </div>
  );
}