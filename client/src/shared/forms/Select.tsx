import type { SelectHTMLAttributes, ReactNode } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
};

export function Select({ children, ...props }: SelectProps) {
  return (
    <select className="form-select" {...props}>
      {children}
    </select>
  );
}
