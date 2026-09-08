import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h2 className="page-header__title">{title}</h2>
        {description ? (
          <p className="page-header__description">{description}</p>
        ) : null}
      </div>
      <div className="page-header__actions">{actions}</div>
    </div>
  );
}
