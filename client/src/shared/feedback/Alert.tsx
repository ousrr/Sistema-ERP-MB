import type { ReactNode } from "react";

type AlertProps = {
  children: ReactNode;
};

export function Alert({ children }: AlertProps) {
  return <div className="feedback-alert">{children}</div>;
}
