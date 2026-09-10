import {
  ArrowLeft,
  Check
} from "lucide-react";

import {
  Button
} from "../../../../../shared/ui/Button";

import {
  ResponsiveFormLayout
} from "../../../common/layout/ResponsiveFormLayout";

import type {
  CatalogoFormData
} from "../types/CatalogoBancario";

import {
  CatalogoPresentation
} from "../presentation/CatalogoPresentation";

import type {
  CatalogoFormMode
} from "./CatalogoForm";


type CatalogoConfirmSummaryProps = {

  modo:
    CatalogoFormMode;

  datos:
    CatalogoFormData;

  cargando:
    boolean;

  error?:
    string;

  onBack:
    () => void;

  onConfirm:
    () => Promise<void>;
};


export function CatalogoConfirmSummary({
  modo,
  datos,
  cargando,
  error,
  onBack,
  onConfirm
}: CatalogoConfirmSummaryProps) {

  const naturaleza =
    CatalogoPresentation
      .obtenerNaturalezaVisual(
        datos.naturaleza
      )
      .etiqueta;


  return (
    <ResponsiveFormLayout.Stack>

      <div>

        <h4
          style={{
            margin:
              "0 0 6px",

            color:
              "#101828",

            fontSize:
              "17px",

            fontWeight:
              600
          }}
        >
          Así se guardará
        </h4>


        <p
          style={{
            margin:
              0,

            color:
              "#667085",

            fontSize:
              "13px",

            lineHeight:
              1.5,

            overflowWrap:
              "anywhere"
          }}
        >
          Revise la información visible antes de confirmar.
          El sistema completará automáticamente los datos técnicos internos.
        </p>

      </div>


      {/* IDENTIFICACIÓN */}

      <div
        style={{
          minWidth:
            0,

          padding:
            "18px",

          border:
            "1px solid #EAECF0",

          borderRadius:
            "10px",

          background:
            "#FFFFFF"
        }}
      >

        <ResponsiveFormLayout.Grid
          variant=
            "identity"
        >

          <Dato
            label=
              "Código"

            value={
              datos.codigo
            }

            tecnico
          />


          <Dato
            label=
              "Nombre"

            value={
              datos.nombre
            }
          />

        </ResponsiveFormLayout.Grid>

      </div>


      {/* DESCRIPCIÓN */}

      <div
        style={{
          minWidth:
            0,

          padding:
            "15px 18px",

          border:
            "1px solid #EAECF0",

          borderRadius:
            "10px",

          background:
            "#F9FAFB"
        }}
      >

        <div
          style={{
            marginBottom:
              "5px",

            color:
              "#667085",

            fontSize:
              "11px",

            fontWeight:
              600,

            textTransform:
              "uppercase"
          }}
        >
          Descripción
        </div>


        <div
          style={{
            color:
              "#344054",

            fontSize:
              "13px",

            lineHeight:
              1.5,

            overflowWrap:
              "anywhere"
          }}
        >
          {datos.descripcion ||
            "Sin descripción"}
        </div>

      </div>


      {/* COMPORTAMIENTO */}

      <div>

        <div
          style={{
            marginBottom:
              "10px",

            color:
              "#344054",

            fontSize:
              "13px",

            fontWeight:
              600
          }}
        >
          Comportamiento
        </div>


        <ResponsiveFormLayout.Grid
          variant=
            "summaryFour"
        >

          <Estado
            label=
              "Naturaleza"

            value={
              naturaleza
            }
          />


          <Estado
            label=
              "Pedir comentario"

            value={
              datos.requiereComentario ===
                "S"
                ? "Sí"
                : "No"
            }
          />


          <Estado
            label=
              "Pedir evidencia"

            value={
              datos.requiereEvidencia ===
                "S"
                ? "Sí"
                : "No"
            }
          />


          <Estado
            label=
              "Permitir reversión"

            value={
              datos.permiteReversion ===
                "S"
                ? "Sí"
                : "No"
            }
          />

        </ResponsiveFormLayout.Grid>

      </div>


      {/* NOTA */}

      <div
        style={{
          minWidth:
            0,

          padding:
            "11px 13px",

          border:
            "1px solid #D1E9FF",

          borderRadius:
            "8px",

          background:
            "#F5FAFF",

          color:
            "#175CD3",

          fontSize:
            "12px",

          lineHeight:
            1.5,

          overflowWrap:
            "anywhere"
        }}
      >
        El código se guarda como identificador interno.
        La ubicación técnica donde se reutiliza este valor se asigna
        automáticamente según el tipo de catálogo seleccionado.
      </div>


      {error ? (

        <div
          role=
            "alert"

          style={{
            minWidth:
              0,

            padding:
              "10px 12px",

            border:
              "1px solid #FECDCA",

            borderRadius:
              "8px",

            background:
              "#FEF3F2",

            color:
              "#B42318",

            fontSize:
              "13px",

            overflowWrap:
              "anywhere"
          }}
        >
          {error}
        </div>

      ) : null}


      <ResponsiveFormLayout.Actions>

        <Button
          type=
            "button"

          variant=
            "outline"

          disabled={
            cargando
          }

          onClick={
            onBack
          }
        >
          <ArrowLeft
            size={
              16
            }
          />

          Corregir datos
        </Button>


        <Button
          type=
            "button"

          variant=
            "primary"

          disabled={
            cargando
          }

          onClick={() =>
            void onConfirm()
          }
        >
          <Check
            size={
              16
            }
          />

          {cargando
            ? "Guardando..."
            : modo ===
                "crear"
              ? "Confirmar y guardar"
              : "Confirmar cambios"}
        </Button>

      </ResponsiveFormLayout.Actions>

    </ResponsiveFormLayout.Stack>
  );
}


type DatoProps = {

  label:
    string;

  value:
    string;

  tecnico?:
    boolean;
};


function Dato({
  label,
  value,
  tecnico = false
}: DatoProps) {

  return (
    <div
      style={{
        minWidth:
          0
      }}
    >

      <div
        style={{
          marginBottom:
            "6px",

          color:
            "#667085",

          fontSize:
            "11px",

          fontWeight:
            600,

          textTransform:
            "uppercase"
        }}
      >
        {label}
      </div>


      <div
        style={{
          color:
            tecnico
              ? "#175CD3"
              : "#344054",

          fontSize:
            "14px",

          fontWeight:
            600,

          fontFamily:
            tecnico
              ? "monospace"
              : "inherit",

          overflowWrap:
            "anywhere"
        }}
      >
        {value}
      </div>

    </div>
  );
}


type EstadoProps = {

  label:
    string;

  value:
    string;
};


function Estado({
  label,
  value
}: EstadoProps) {

  const positivo =
    value ===
      "Sí";


  return (
    <div
      style={{
        minWidth:
          0,

        padding:
          "12px",

        border:
          "1px solid #EAECF0",

        borderRadius:
          "8px",

        background:
          "#FFFFFF"
      }}
    >

      <div
        style={{
          marginBottom:
            "5px",

          color:
            "#667085",

          fontSize:
            "11px",

          overflowWrap:
            "anywhere"
        }}
      >
        {label}
      </div>


      <strong
        style={{
          color:
            positivo
              ? "#027A48"
              : "#344054",

          fontSize:
            "13px",

          overflowWrap:
            "anywhere"
        }}
      >
        {value}
      </strong>

    </div>
  );
}
