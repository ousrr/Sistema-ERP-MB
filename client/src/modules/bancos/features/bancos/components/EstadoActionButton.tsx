import {
  IconButton
} from "../../../../../shared/ui/IconButton";

import {
  EstadoActivoInactivoAction,
  type EstadoActivoInactivo
} from "../rules/EstadoActivoInactivo";

import "./EstadoBancoActions.css";


interface EstadoActionButtonProps {

  estado: EstadoActivoInactivo;

  disabled?: boolean;

  onClick: () => void;
}


export function EstadoActionButton({
  estado,
  disabled = false,
  onClick
}: EstadoActionButtonProps) {

  const configuracion =
    EstadoActivoInactivoAction.desde(
      estado
    );


  return (
    <span
      className={
        configuracion.variante === "danger"
          ? "estado-action estado-action--danger"
          : "estado-action estado-action--success"
      }
    >

      <IconButton
        label={
          configuracion.accion
        }

        disabled={
          disabled
        }

        onClick={
          onClick
        }

        icon={
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >

            <path
              fill="currentColor"
              d="M11 3h2v9h-2V3Zm1 18a9 9 0 1 1 6.36-2.64l-1.41-1.41A7 7 0 1 0 7.05 16.95l-1.41 1.41A9 9 0 0 1 12 3v2a7 7 0 1 0 4.95 2.05l1.41-1.41A9 9 0 0 1 12 21Z"
            />

          </svg>
        }
      />

    </span>
  );
}