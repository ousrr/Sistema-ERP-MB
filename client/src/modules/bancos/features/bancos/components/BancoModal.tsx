import type {
  ReactNode
} from "react";

import "./BancoModal.css";


interface BancoModalProps {

  abierto: boolean;

  titulo: string;

  descripcion?: string;

  children: ReactNode;

  bloqueado?: boolean;

  onClose: () => void;
}


export function BancoModal({
  abierto,
  titulo,
  descripcion,
  children,
  bloqueado = false,
  onClose
}: BancoModalProps) {

  if (!abierto) {
    return null;
  }


  function manejarFondo():
    void {

    if (!bloqueado) {
      onClose();
    }
  }


  return (
    <div
      className="banco-modal-overlay"

      role="presentation"

      onMouseDown={
        manejarFondo
      }
    >

      <section
        className="banco-modal"

        role="dialog"

        aria-modal="true"

        aria-label={
          titulo
        }

        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <header
          className="banco-modal__header"
        >

          <div>

            <h2
              className="banco-modal__title"
            >
              {titulo}
            </h2>


            {descripcion ? (

              <p
                className="banco-modal__description"
              >
                {descripcion}
              </p>

            ) : null}

          </div>


          <button
            type="button"

            className="banco-modal__close"

            aria-label="Cerrar ventana"

            disabled={
              bloqueado
            }

            onClick={
              onClose
            }
          >
            ×
          </button>

        </header>


        <div
          className="banco-modal__content"
        >
          {children}
        </div>

      </section>

    </div>
  );
}