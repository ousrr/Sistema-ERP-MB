import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
};

export function IconButton({ icon, label, ...props }: IconButtonProps) {
  return (
    <button className="ui-icon-button" aria-label={label} title={label} {...props}>
      {icon}
    </button>
  );
}
