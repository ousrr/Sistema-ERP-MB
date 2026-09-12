import type {
  ReactNode
} from "react";


type CatalogoActionTone =
  | "edit"
  | "danger"
  | "success";


type CatalogoActionButtonProps = {

  icon:
    ReactNode;

  label:
    string;

  tone:
    CatalogoActionTone;

  disabled?: boolean;

  onClick:
    () => void;
};


export function CatalogoActionButton({
  icon,
  label,
  tone,
  disabled = false,
  onClick
}: CatalogoActionButtonProps) {

  const estilos =
    obtenerEstilos(
      tone
    );


  return (
    <button
      type="button"

      aria-label={
        label
      }

      title={
        label
      }

      disabled={
        disabled
      }

      onClick={
        onClick
      }

      style={{
        width:
          "36px",

        height:
          "36px",

        display:
          "grid",

        placeItems:
          "center",

        padding:
          0,

        borderRadius:
          "8px",

        border:
          `1px solid ${estilos.border}`,

        background:
          "#FFFFFF",

        color:
          estilos.color,

        cursor:
          disabled
            ? "default"
            : "pointer",

        opacity:
          disabled
            ? 0.55
            : 1,

        boxShadow:
          "0 1px 2px rgba(16, 24, 40, 0.04)"
      }}
    >
      {icon}
    </button>
  );
}


function obtenerEstilos(
  tone:
    CatalogoActionTone
) {

  switch (
    tone
  ) {

    case "danger":

      return {
        border:
          "#FDA29B",

        color:
          "#F04438"
      };


    case "success":

      return {
        border:
          "#6CE9A6",

        color:
          "#039855"
      };


    case "edit":
    default:

      return {
        border:
          "#84ADFF",

        color:
          "#1570EF"
      };
  }
}