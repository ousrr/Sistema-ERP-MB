import type { ReactNode } from "react";

type PageSectionProps = {
  children: ReactNode;
};

export function PageSection({ children }: PageSectionProps) {
  return <section className="page-section">{children}</section>;
}
