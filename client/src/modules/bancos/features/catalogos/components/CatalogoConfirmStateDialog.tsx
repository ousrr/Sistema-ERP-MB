import {
  Button
} from "../../../../../shared/ui/Button";

import {
  FeedbackMessage
} from "../../../common/components/FeedbackMessage";

import type {
  CatalogoResponse,
  EstadoCatalogo
} from "../types/CatalogoBancario";


type CatalogoConfirmStateDialogProps = {

  catalogo:
    CatalogoResponse | null;

  cargando?:
    boolean;

  error?:
    string | null;

  onCancel:
    () => void;

  onConfirm:
    (
      estado:
        EstadoCatalogo
    ) => Promise<void>;
};


export function CatalogoConfirmStateDialog({
  catalogo,
  cargando = false,
  error = null,
  onCancel,
  onConfirm
}: CatalogoConfirmStateDialogProps) {

  if (!catalogo) {
    return null;
  }


  const nuevoEstado:
    EstadoCatalogo =
      catalogo.estado ===
        "ACTIVO"
        ? "INACTIVO"
        : "ACTIVO";


  const activar =
    nuevoEstado ===
      "ACTIVO";


  return (
    <div
      style={{
        position:
          "fixed",

        inset:
          0,

        zIndex:
          1100,

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          "24px",

        background:
          "rgba(15, 23, 42, 0.48)"
      }}
    >

      <div
        role="dialog"

        aria-modal="true"

        aria-labelledby=
          "catalogo-state-dialog-title"

        aria-describedby=
          "catalogo-state-dialog-description"

        style={{
          width:
            "min(440px, 100%)",

          padding:
            "24px",

          borderRadius:
            "14px",

          background:
            "#ffffff",

          boxShadow:
            "0 20px 60px rgba(15, 23, 42, 0.20)"
        }}
      >

        <h3
          id=
            "catalogo-state-dialog-title"

          style={{
            margin:
              "0 0 12px"
          }}
        >
          {activar
            ? "Activar catálogo"
            : "Inactivar catálogo"}
        </h3>


        <p
          id=
            "catalogo-state-dialog-description"
        >
          ¿Deseas{" "}
          {activar
            ? "activar"
            : "inactivar"}{" "}
          el catálogo{" "}

          <strong>
            {catalogo.nombre}
          </strong>
          ?
        </p>


        <p
          style={{
            fontSize:
              "13px",

            color:
              "#667085"
          }}
        >
          Grupo: {catalogo.grupo}
          <br />
          Código: {catalogo.codigo}
        </p>


        {error ? (

          <FeedbackMessage
            message={
              error
            }

            tone=
              "error"
          />

        ) : null}


        <div
          style={{
            display:
              "flex",

            justifyContent:
              "flex-end",

            gap:
              "10px",

            marginTop:
              "22px"
          }}
        >

          <Button
            type="button"

            variant="outline"

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
              activar
                ? "primary"
                : "danger"
            }

            disabled={
              cargando
            }

            onClick={() =>
              void onConfirm(
                nuevoEstado
              )
            }
          >
            {cargando
              ? "Procesando..."
              : activar
                ? "Activar"
                : "Inactivar"}
          </Button>

        </div>

      </div>

    </div>
  );
}
