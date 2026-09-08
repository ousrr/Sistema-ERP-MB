import type { InputHTMLAttributes } from "react";

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="form-input form-search"
      type="search"
      {...props}
    />
  );
}
