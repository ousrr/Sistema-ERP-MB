import {
  useEffect
} from "react";

import type {
  ReactNode
} from "react";

import "./ResponsiveModal.css";


type ResponsiveModalProps = {

  abierto:
    boolean;

  titulo:
    string;

  children:
    ReactNode;

  bloqueado?:
    boolean;

  maxWidth?:
    number;

  onClose:
    () => void;
};


export class ResponsiveModalRules {

  static puedeCerrar(
    bloqueado:
      boolean
  ): boolean {

    return !bloqueado;
  }


  static esCierrePorEscape(
    key:
      string
  ): boolean {

    return key ===
      "Escape";
  }
}


export function ResponsiveModal({
  abierto,
  titulo,
  children,
  bloqueado = false,
  maxWidth = 900,
  onClose
}: ResponsiveModalProps) {

  useEffect(
    () => {

      if (
        !abierto
      ) {
        return;
      }


      const overflowAnterior =
        document.body.style.overflow;


      document.body.style.overflow =
        "hidden";


      function manejarTeclado(
        event:
          KeyboardEvent
      ) {

        if (
          ResponsiveModalRules
            .esCierrePorEscape(
              event.key
            ) &&
          ResponsiveModalRules
            .puedeCerrar(
              bloqueado
            )
        ) {

          onClose();
        }
      }


      window.addEventListener(
        "keydown",
        manejarTeclado
      );


      return () => {

        window.removeEventListener(
          "keydown",
          manejarTeclado
        );


        document.body.style.overflow =
          overflowAnterior;
      };

    },
    [
      abierto,
      bloqueado,
      onClose
    ]
  );


  if (
    !abierto
  ) {
    return null;
  }


  return (
    <div
      className=
        "mb-responsive-modal__overlay"

      role=
        "presentation"

      onMouseDown={(
        event
      ) => {

        if (
          event.target ===
            event.currentTarget &&
          ResponsiveModalRules
            .puedeCerrar(
              bloqueado
            )
        ) {

          onClose();
        }
      }}
    >

      <div
        className=
          "mb-responsive-modal"

        role=
          "dialog"

        aria-modal=
          "true"

        aria-label={
          titulo
        }

        style={{
          ["--mb-modal-max-width" as string]:
            `${maxWidth}px`
        }}
      >

        <div
          className=
            "mb-responsive-modal__header"
        >

          <h3
            className=
              "mb-responsive-modal__title"
          >
            {titulo}
          </h3>


          <button
            className=
              "mb-responsive-modal__close"

            type=
              "button"

            aria-label=
              "Cerrar"

            title=
              "Cerrar"

            disabled={
              bloqueado
            }

            onClick={
              onClose
            }
          >
            ×
          </button>

        </div>


        <div
          className=
            "mb-responsive-modal__body"
        >
          {children}
        </div>

      </div>

    </div>
  );
}
