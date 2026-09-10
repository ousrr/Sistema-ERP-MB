import {
  Button
} from "../../../../../shared/ui/Button";

import {
  EstadoActivoInactivoAction,
  type EstadoActivoInactivo
} from "../rules/EstadoActivoInactivo";

import "./EstadoBancoActions.css";


interface ConfirmStateDialogProps {

  abierto: boolean;

  nombreBanco: string;

  estadoActual: EstadoActivoInactivo;

  cargando?: boolean;

  error?: string;

  onConfirm: () => void;

  onCancel: () => void;
}


export function ConfirmStateDialog({
  abierto,
  nombreBanco,
  estadoActual,
  cargando = false,
  error,
  onConfirm,
  onCancel
}: ConfirmStateDialogProps) {

  if (!abierto) {
    return null;
  }


  const configuracion =
    EstadoActivoInactivoAction.desde(
      estadoActual
    );


  return (
    <div
      className="estado-dialog-overlay"

      onMouseDown={() => {

        if (!cargando) {
          onCancel();
        }
      }}
    >

      <section
        className="estado-dialog"

        role="dialog"

        aria-modal="true"

        aria-label={
          configuracion.titulo
        }

        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <div
          className="estado-dialog__header"
        >

          <div
            className={
              configuracion.variante === "danger"
                ? "estado-dialog__icon estado-dialog__icon--danger"
                : "estado-dialog__icon estado-dialog__icon--success"
            }
            aria-hidden="true"
          >
            !
          </div>


          <div>

            <h2>
              {configuracion.titulo}
            </h2>

            <p>
              {configuracion.obtenerMensaje(
                nombreBanco
              )}
            </p>

          </div>

        </div>


        {error ? (

          <div
            className="estado-dialog__error"
          >
            {error}
          </div>

        ) : null}


        <div
          className="estado-dialog__actions"
        >

          <Button
            type="button"

            variant="secondary"

            disabled={
              cargando
            }

            onClick={
              onCancel
            }
          >
            Cancelar
          </Button>


          <Button
            type="button"

            variant={
              configuracion.variante === "danger"
                ? "danger"
                : "primary"
            }

            disabled={
              cargando
            }

            onClick={
              onConfirm
            }
          >

            {cargando
              ? "Procesando..."
              : configuracion.confirmacion}

          </Button>

        </div>

      </section>

    </div>
  );
}