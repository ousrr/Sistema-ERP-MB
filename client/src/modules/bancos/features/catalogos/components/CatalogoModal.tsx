import type {
  ReactNode
} from "react";

import {
  ResponsiveModal
} from "../../../common/layout/ResponsiveModal";


type CatalogoModalProps = {

  abierto:
    boolean;

  titulo:
    string;

  children:
    ReactNode;

  bloqueado?:
    boolean;

  onClose:
    () => void;
};


export function CatalogoModal({
  abierto,
  titulo,
  children,
  bloqueado = false,
  onClose
}: CatalogoModalProps) {

  return (
    <ResponsiveModal
      abierto={
        abierto
      }

      titulo={
        titulo
      }

      bloqueado={
        bloqueado
      }

      maxWidth={
        900
      }

      onClose={
        onClose
      }
    >
      {children}
    </ResponsiveModal>
  );
}
