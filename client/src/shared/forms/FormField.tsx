import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  required?: boolean;
  help?: string;
  children: ReactNode;
};

export function FormField({
  label,
  required,
  help,
  children,
}: FormFieldProps) {
  return (
    <label className="form-field">
      <span className="form-field__label">
        {label} {required ? "*" : ""}
      </span>
      {children}
      {help ? <small className="form-field__help">{help}</small> : null}
    </label>
  );
}
