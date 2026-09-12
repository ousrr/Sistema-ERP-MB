import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Check,
  Filter
} from "lucide-react";

import {
  Button
} from "../../../../shared/ui/Button";

import type {
  EstadoListaFiltro,
  OrdenAlfabetico
} from "../list/ListFilterRules";

import "./ListFilterMenu.css";


type ListFilterMenuProps = {

  estado:
    EstadoListaFiltro;

  orden:
    OrdenAlfabetico;

  onEstadoChange:
    (
      estado:
        EstadoListaFiltro
    ) => void;

  onOrdenChange:
    (
      orden:
        OrdenAlfabetico
    ) => void;
};


type OpcionProps<T extends string> = {

  label:
    string;

  value:
    T;

  actual:
    T;

  onSelect:
    (
      value:
        T
    ) => void;
};


export function ListFilterMenu({
  estado,
  orden,
  onEstadoChange,
  onOrdenChange
}: ListFilterMenuProps) {

  const [
    abierto,
    setAbierto
  ] = useState(
    false
  );


  const contenedorRef =
    useRef<HTMLDivElement | null>(
      null
    );


  useEffect(
    () => {

      if (
        !abierto
      ) {
        return;
      }


      function manejarClickExterno(
        event:
          MouseEvent
      ) {

        const objetivo =
          event.target as Node;


        if (
          !contenedorRef.current
            ?.contains(
              objetivo
            )
        ) {

          setAbierto(
            false
          );
        }
      }


      document.addEventListener(
        "mousedown",
        manejarClickExterno
      );


      return () => {

        document.removeEventListener(
          "mousedown",
          manejarClickExterno
        );
      };

    },
    [
      abierto
    ]
  );


  return (
    <div
      ref={
        contenedorRef
      }

      className=
        "mb-list-filter"
    >

      <Button
        type=
          "button"

        variant=
          "outline"

        aria-expanded={
          abierto
        }

        aria-haspopup=
          "menu"

        onClick={() =>
          setAbierto(
            (
              actual
            ) =>
              !actual
          )
        }
      >

        <Filter
          size={
            16
          }
        />

        Filtrar

      </Button>


      {abierto ? (

        <div
          className=
            "mb-list-filter__menu"

          role=
            "menu"
        >

          <div
            className=
              "mb-list-filter__section"
          >

            <div
              className=
                "mb-list-filter__title"
            >
              Estado
            </div>


            <Opcion
              label=
                "Todos"

              value=
                "TODOS"

              actual={
                estado
              }

              onSelect={
                onEstadoChange
              }
            />


            <Opcion
              label=
                "Activos"

              value=
                "ACTIVO"

              actual={
                estado
              }

              onSelect={
                onEstadoChange
              }
            />


            <Opcion
              label=
                "Inactivos"

              value=
                "INACTIVO"

              actual={
                estado
              }

              onSelect={
                onEstadoChange
              }
            />

          </div>


          <div
            className=
              "mb-list-filter__divider"
          />


          <div
            className=
              "mb-list-filter__section"
          >

            <div
              className=
                "mb-list-filter__title"
            >
              Orden alfabético
            </div>


            <Opcion
              label=
                "Nombre A–Z"

              value=
                "AZ"

              actual={
                orden
              }

              onSelect={
                onOrdenChange
              }
            />


            <Opcion
              label=
                "Nombre Z–A"

              value=
                "ZA"

              actual={
                orden
              }

              onSelect={
                onOrdenChange
              }
            />


            <Opcion
              label=
                "Orden original"

              value=
                "SIN_ORDEN"

              actual={
                orden
              }

              onSelect={
                onOrdenChange
              }
            />

          </div>

        </div>

      ) : null}

    </div>
  );
}


function Opcion<
  T extends string
>({
  label,
  value,
  actual,
  onSelect
}: OpcionProps<T>) {

  const seleccionada =
    value ===
      actual;


  return (
    <button
      type=
        "button"

      className={
        seleccionada
          ? "mb-list-filter__option is-active"
          : "mb-list-filter__option"
      }

      role=
        "menuitem"

      onClick={() =>
        onSelect(
          value
        )
      }
    >

      <span>
        {label}
      </span>


      {seleccionada ? (

        <Check
          size={
            16
          }

          aria-hidden=
            "true"
        />

      ) : (

        <span
          className=
            "mb-list-filter__check-space"

          aria-hidden=
            "true"
        />

      )}

    </button>
  );
}
