import type { ReactNode } from "react";

type ModuleLayoutProps = {
  title?: string;
  navigation?: ReactNode;
  children: ReactNode;
};

export function ModuleLayout({
  title,
  navigation,
  children,
}: ModuleLayoutProps) {
  return (
    <section className="module-layout">
      {title ? <h1 className="module-layout__title">{title}</h1> : null}
      <div className="module-layout__navigation">{navigation}</div>
      <div className="module-layout__page">{children}</div>
    </section>
  );
}
