import {
  useState
} from "react";

import {
  Button
} from "../../../../../shared/ui/Button";

import type {
  BancoFormData
} from "../types/BancoFormData";

import type {
  EstadoActivoInactivo
} from "../rules/EstadoActivoInactivo";


export type ModoBancoForm =
  | "CREAR"
  | "EDITAR";


type BancoConfirmDialogProps = {

  datos:
    BancoFormData;

  modo?:
    ModoBancoForm;

  bancoId?:
    number;

  estadoActual?:
    EstadoActivoInactivo;

  advertencias?:
    string[];

  error?:
    string;

  cargando?:
    boolean;

  onConfirm:
    () => void;

  onCancel:
    () => void;
};


export function BancoConfirmDialog({
  datos,
  modo = "CREAR",
  bancoId,
  estadoActual = "ACTIVO",
  advertencias = [],
  error,
  cargando = false,
  onConfirm,
  onCancel
}: BancoConfirmDialogProps) {

  const [
    advertenciasRevisadas,
    setAdvertenciasRevisadas
  ] = useState(
    false
  );


  const esEdicion =
    modo === "EDITAR";


  const tieneAdvertencias =
    advertencias.length > 0;


  const puedeConfirmar =
    !tieneAdvertencias ||
    advertenciasRevisadas;


  // =====================================================
  // TEXTOS SEGÚN OPERACIÓN
  // =====================================================

  const titulo =
    esEdicion
      ? "Confirmar cambios"
      : "Confirmar registro";


  const descripcion =
    esEdicion
      ? "Revisa cómo quedará la información antes de guardar los cambios."
      : "Revisa cómo se guardará la información antes de continuar.";


  const tituloError =
    esEdicion
      ? "No fue posible actualizar el banco"
      : "No fue posible guardar el banco";


  const textoAdvertencia =
    esEdicion
      ? "Esto no significa necesariamente que los datos sean incorrectos, pero deben revisarse antes de actualizar el banco."
      : "Esto no significa necesariamente que los datos sean incorrectos, pero deben revisarse antes de registrar el banco.";


  const textoConfirmacionAdvertencias =
    esEdicion
      ? "Confirmo que revisé los datos señalados y deseo continuar con los cambios."
      : "Confirmo que revisé los datos señalados y deseo continuar con el registro.";


  const textoBoton =
    esEdicion
      ? "Confirmar cambios"
      : "Confirmar y guardar";


  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmar-banco-titulo"

      style={{
        position: "fixed",
        inset: 0,

        background:
          "rgba(0, 0, 0, 0.45)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: "20px",

        zIndex: 1000
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "560px",

          background:
            "white",

          borderRadius:
            "12px",

          padding:
            "24px",

          boxShadow:
            "0 20px 50px rgba(0,0,0,0.25)"
        }}
      >

        {/* ===============================================
            TÍTULO
        =============================================== */}

        <h3
          id="confirmar-banco-titulo"

          style={{
            marginTop: 0,
            marginBottom: "8px"
          }}
        >
          {titulo}
        </h3>


        <p
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#667085"
          }}
        >
          {descripcion}
        </p>


        {/* ===============================================
            ERROR DEL BACKEND
        =============================================== */}

        {error ? (

          <div
            role="alert"

            style={{
              border:
                "1px solid #FDA29B",

              background:
                "#FEF3F2",

              borderRadius:
                "8px",

              padding:
                "14px",

              marginBottom:
                "20px"
            }}
          >

            <strong
              style={{
                display: "block",
                color: "#B42318",
                marginBottom: "5px"
              }}
            >
              {tituloError}
            </strong>


            <span
              style={{
                color: "#B42318",
                fontSize: "13px",
                lineHeight: "1.5"
              }}
            >
              {error}
            </span>


            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#667085",
                fontSize: "12px"
              }}
            >
              Vuelve a editar los datos y corrige
              la información indicada antes de intentarlo
              nuevamente.
            </p>

          </div>

        ) : null}


        {/* ===============================================
            ADVERTENCIAS
        =============================================== */}

        {tieneAdvertencias ? (

          <div
            style={{
              border:
                "1px solid #F5C26B",

              background:
                "#FFF8E7",

              borderRadius:
                "8px",

              padding:
                "14px",

              marginBottom:
                "20px"
            }}
          >

            <strong
              style={{
                color:
                  "#934F00"
              }}
            >
              Se detectaron datos poco habituales
            </strong>


            <p
              style={{
                marginTop: "6px",
                marginBottom: "8px",
                fontSize: "13px"
              }}
            >
              {textoAdvertencia}
            </p>


            <ul
              style={{
                marginTop: "8px",
                marginBottom: "14px",
                paddingLeft: "20px"
              }}
            >

              {advertencias.map(
                (
                  advertencia,
                  index
                ) => (

                  <li
                    key={
                      `${advertencia}-${index}`
                    }

                    style={{
                      marginTop: "6px"
                    }}
                  >
                    {advertencia}
                  </li>

                )
              )}

            </ul>


            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                cursor: "pointer",
                fontSize: "13px",
                lineHeight: "1.4"
              }}
            >

              <input
                type="checkbox"

                checked={
                  advertenciasRevisadas
                }

                onChange={(
                  event
                ) =>
                  setAdvertenciasRevisadas(
                    event.target.checked
                  )
                }

                disabled={
                  cargando
                }
              />


              <span>
                {textoConfirmacionAdvertencias}
              </span>

            </label>

          </div>

        ) : null}


        {/* ===============================================
            DATOS
        =============================================== */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "150px 1fr",

            gap:
              "10px 16px",

            marginBottom:
              "20px"
          }}
        >

          {/* En edición mostramos primero el ID real */}

          {esEdicion ? (
            <>

              <strong>
                ID del banco
              </strong>

              <span>
                {bancoId ??
                  "No disponible"}
              </span>

            </>
          ) : null}


          <strong>
            Código / sigla
          </strong>

          <span>
            {datos.codigoBanco}
          </span>


          <strong>
            Nombre
          </strong>

          <span>
            {datos.nombre}
          </span>


          <strong>
            BIC / SWIFT
          </strong>

          <span>
            {datos.bicSwift ??
              "No registrado"}
          </span>


          <strong>
            {esEdicion
              ? "Estado actual"
              : "Estado inicial"}
          </strong>

          <span>
            {esEdicion
              ? estadoActual
              : "ACTIVO"}
          </span>


          {!esEdicion ? (
            <>

              <strong>
                ID del banco
              </strong>

              <span>
                Se generará automáticamente
              </span>

            </>
          ) : null}

        </div>


        {/* ===============================================
            AYUDA
        =============================================== */}

        <p
          style={{
            fontSize: "13px",
            color: "#667085",
            marginBottom: "20px"
          }}
        >
          Si algún dato no es correcto, utiliza
          “Volver a editar” antes de confirmar.
        </p>


        {/* ===============================================
            ACCIONES
        =============================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >

          <Button
            type="button"
            variant="outline"

            onClick={
              onCancel
            }

            disabled={
              cargando
            }
          >
            Volver a editar
          </Button>


          <Button
            type="button"
            variant="primary"

            onClick={
              onConfirm
            }

            disabled={
              cargando ||
              !puedeConfirmar ||
              Boolean(error)
            }
          >
            {cargando
              ? "Guardando..."
              : textoBoton}
          </Button>

        </div>

      </div>

    </div>
  );
}