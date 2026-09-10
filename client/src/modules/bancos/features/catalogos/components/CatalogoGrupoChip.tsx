import {
  ArrowLeftRight,
  ArrowRight,
  CreditCard,
  FileText,
  Tag,
  User
} from "lucide-react";

import {
  CatalogoPresentation,
  type CatalogoGrupoIcono
} from "../presentation/CatalogoPresentation";


type CatalogoGrupoChipProps = {

  grupo: string;

  activo?: boolean;

  onClick:
    () => void;
};


export function CatalogoGrupoChip({
  grupo,
  activo = false,
  onClick
}: CatalogoGrupoChipProps) {

  const presentacion =
    CatalogoPresentation
      .obtenerGrupoVisual(
        grupo
      );


  return (
    <button
      type="button"

      onClick={
        onClick
      }

      style={{
        display:
          "inline-flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        gap:
          "7px",

        minHeight:
          "34px",

        padding:
          "6px 12px",

        borderRadius:
          "7px",

        border:
          activo
            ? "1px solid #2E90FA"
            : "1px solid #D0D5DD",

        background:
          activo
            ? "#EFF8FF"
            : "#FFFFFF",

        color:
          activo
            ? "#175CD3"
            : "#344054",

        cursor:
          "pointer",

        fontSize:
          "12px",

        fontWeight:
          500,

        boxShadow:
          activo
            ? "0 0 0 1px rgba(46, 144, 250, 0.05)"
            : "0 1px 2px rgba(16, 24, 40, 0.05)"
      }}
    >

      {renderIcono(
        presentacion.icono,
        activo
      )}


      <span>
        {presentacion.etiqueta}
      </span>

    </button>
  );
}


function renderIcono(
  icono:
    CatalogoGrupoIcono,

  activo:
    boolean
) {

  const color =
    activo
      ? "#1570EF"
      : "#667085";


  const propiedades = {
    size:
      16,

    color
  };


  switch (
    icono
  ) {

    case "cuenta":

      return (
        <User
          {...propiedades}
        />
      );


    case "operacion":

      return (
        <ArrowLeftRight
          {...propiedades}
        />
      );


    case "movimiento":

      return (
        <ArrowRight
          {...propiedades}
        />
      );


    case "documento":

      return (
        <FileText
          {...propiedades}
        />
      );


    case "pago":

      return (
        <CreditCard
          {...propiedades}
        />
      );


    case "generico":
    default:

      return (
        <Tag
          {...propiedades}
        />
      );
  }
}