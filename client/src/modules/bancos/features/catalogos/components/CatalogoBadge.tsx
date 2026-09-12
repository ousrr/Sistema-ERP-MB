import type {
  CatalogoBadgeTone
} from "../presentation/CatalogoPresentation";


type CatalogoBadgeProps = {

  label: string;

  tone:
    CatalogoBadgeTone;
};


export function CatalogoBadge({
  label,
  tone
}: CatalogoBadgeProps) {

  const estilos =
    obtenerEstilos(
      tone
    );


  return (
    <span
      style={{
        display:
          "inline-flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        minHeight:
          "26px",

        padding:
          "4px 12px",

        borderRadius:
          "999px",

        background:
          estilos.background,

        color:
          estilos.color,

        fontSize:
          "12px",

        fontWeight:
          500,

        whiteSpace:
          "nowrap"
      }}
    >
      {label}
    </span>
  );
}


function obtenerEstilos(
  tone:
    CatalogoBadgeTone
) {

  switch (
    tone
  ) {

    case "success":

      return {
        background:
          "#ECFDF3",

        color:
          "#027A48"
      };


    case "danger":

      return {
        background:
          "#FEF3F2",

        color:
          "#B42318"
      };


    case "info":

      return {
        background:
          "#EFF4FF",

        color:
          "#175CD3"
      };


    case "warning":

      return {
        background:
          "#FFF6ED",

        color:
          "#B54708"
      };


    case "neutral":
    default:

      return {
        background:
          "#F2F4F7",

        color:
          "#475467"
      };
  }
}