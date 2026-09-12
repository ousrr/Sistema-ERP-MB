import {
  CheckCircle2,
  CircleOff,
  Lock,
  X,
} from "lucide-react";

import {
  Alert,
} from "../../../../../shared/feedback/Alert";

import {
  Button,
} from "../../../../../shared/ui/Button";

import {
  IconButton,
} from "../../../../../shared/ui/IconButton";

import type {
  CuentaBancaria,
  EstadoCuentaBancaria,
} from "../types/cuentas.types";


type EstadoObjetivoCuenta =
  | "ACTIVA"
  | "INACTIVA"
  | "CERRADA";


type CuentaEstadoDialogProps = {
  cuenta:
    CuentaBancaria;

  /*
    Se mantiene ACTIVA como valor predeterminado
    para conservar compatibilidad con el flujo
    actual de CuentasPage mientras se conectan
    las nuevas acciones de inactivar y cerrar.
  */
  nuevoEstado?:
    EstadoObjetivoCuenta;

  procesando?:
    boolean;

  error?:
    string | null;

  onCancel:
    () => void;

  onConfirm:
    () => Promise<void> | void;
};


type ConfiguracionEstado = {
  titulo:
    string;

  subtitulo:
    string;

  descripcion:
    string;

  etiquetaBoton:
    string;

  etiquetaProcesando:
    string;

  colorPrincipal:
    string;

  colorFondo:
    string;

  colorBorde:
    string;
};


function enmascararNumeroCuenta(
  numeroCuenta: string
): string {

  const numero =
    numeroCuenta.trim();


  if (
    numero.length <= 4
  ) {

    return numero;
  }


  return (
    `${"•".repeat(
      numero.length - 4
    )}${numero.slice(-4)}`
  );
}


function obtenerEtiquetaEstado(
  estado: EstadoCuentaBancaria
): string {

  switch (
    estado
  ) {

    case "BORRADOR":
      return "Borrador";

    case "ACTIVA":
      return "Activa";

    case "INACTIVA":
      return "Inactiva";

    case "CERRADA":
      return "Cerrada";
  }
}


function obtenerConfiguracion(
  cuenta: CuentaBancaria,
  nuevoEstado: EstadoObjetivoCuenta
): ConfiguracionEstado {

  const estadoActual =
    obtenerEtiquetaEstado(
      cuenta.estado
    );


  switch (
    nuevoEstado
  ) {

    case "ACTIVA":
      return {
        titulo:
          "Activar cuenta bancaria",

        subtitulo:
          `Cambio de ${estadoActual} a Activa`,

        descripcion:
          "Al activar esta cuenta dejará de estar en borrador y pasará a estar disponible para los procesos bancarios que correspondan según su configuración.",

        etiquetaBoton:
          "Confirmar activación",

        etiquetaProcesando:
          "Activando...",

        colorPrincipal:
          "#15803d",

        colorFondo:
          "#f0fdf4",

        colorBorde:
          "#bbf7d0",
      };


    case "INACTIVA":
      return {
        titulo:
          "Inactivar cuenta bancaria",

        subtitulo:
          `Cambio de ${estadoActual} a Inactiva`,

        descripcion:
          "La cuenta dejará de estar operativa. Una cuenta inactiva no podrá editarse ni utilizarse para nuevas operaciones bancarias mediante el flujo actual.",

        etiquetaBoton:
          "Confirmar inactivación",

        etiquetaProcesando:
          "Inactivando...",

        colorPrincipal:
          "#b45309",

        colorFondo:
          "#fffbeb",

        colorBorde:
          "#fde68a",
      };


    case "CERRADA":
      return {
        titulo:
          "Cerrar cuenta bancaria",

        subtitulo:
          `Cambio de ${estadoActual} a Cerrada`,

        descripcion:
          "El cierre es final. Antes de cerrarla, el sistema verificará fondos comprometidos, movimientos, transferencias, cheques y conciliaciones pendientes. Si existe algún pendiente, el cierre será rechazado.",

        etiquetaBoton:
          "Confirmar cierre",

        etiquetaProcesando:
          "Cerrando...",

        colorPrincipal:
          "#b91c1c",

        colorFondo:
          "#fef2f2",

        colorBorde:
          "#fecaca",
      };
  }
}


function IconoEstado({
  estado,
}: {
  estado: EstadoObjetivoCuenta;
}) {

  switch (
    estado
  ) {

    case "ACTIVA":
      return (
        <CheckCircle2
          size={20}
        />
      );


    case "INACTIVA":
      return (
        <CircleOff
          size={20}
        />
      );


    case "CERRADA":
      return (
        <Lock
          size={20}
        />
      );
  }
}


export function CuentaEstadoDialog({
  cuenta,
  nuevoEstado = "ACTIVA",
  procesando = false,
  error = null,
  onCancel,
  onConfirm,
}: CuentaEstadoDialogProps) {

  const configuracion =
    obtenerConfiguracion(
      cuenta,
      nuevoEstado
    );


  return (
    <div
      role="presentation"
      style={{
        position:
          "fixed",

        inset:
          0,

        zIndex:
          1000,

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          "24px",

        background:
          "rgba(15, 23, 42, 0.48)",
      }}
    >

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cuenta-estado-title"
        aria-describedby="cuenta-estado-description"
        style={{
          width:
            "min(520px, 100%)",

          border:
            "1px solid var(--erp-color-border)",

          borderRadius:
            "var(--erp-radius-lg)",

          background:
            "var(--erp-color-surface)",

          boxShadow:
            "0 24px 64px rgba(15, 23, 42, 0.20)",
        }}
      >

        <div
          style={{
            display:
              "flex",

            alignItems:
              "flex-start",

            justifyContent:
              "space-between",

            gap:
              "16px",

            padding:
              "20px 22px",

            borderBottom:
              "1px solid var(--erp-color-border)",
          }}
        >

          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "12px",
            }}
          >

            <span
              aria-hidden="true"
              style={{
                width:
                  "40px",

                height:
                  "40px",

                display:
                  "inline-flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                flexShrink:
                  0,

                borderRadius:
                  "var(--erp-radius-md)",

                background:
                  configuracion.colorFondo,

                color:
                  configuracion.colorPrincipal,
              }}
            >
              <IconoEstado
                estado={
                  nuevoEstado
                }
              />
            </span>


            <div>

              <h2
                id="cuenta-estado-title"
                style={{
                  margin:
                    "0 0 4px",

                  color:
                    "var(--erp-color-text)",

                  fontSize:
                    "18px",

                  fontWeight:
                    700,
                }}
              >
                {
                  configuracion.titulo
                }
              </h2>


              <p
                style={{
                  margin:
                    0,

                  color:
                    "var(--erp-color-muted)",

                  fontSize:
                    "12px",
                }}
              >
                {
                  configuracion.subtitulo
                }
              </p>

            </div>

          </div>


          <IconButton
            type="button"
            label="Cerrar"
            icon={
              <X
                size={16}
              />
            }
            disabled={
              procesando
            }
            onClick={
              onCancel
            }
          />

        </div>


        <div
          style={{
            display:
              "grid",

            gap:
              "16px",

            padding:
              "22px",
          }}
        >

          <div
            id="cuenta-estado-description"
          >
            <Alert>
              {
                configuracion.descripcion
              }
            </Alert>
          </div>


          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",

              gap:
                "10px",
            }}
          >

            <Dato
              etiqueta="Banco"
              valor={
                cuenta.bancoNombre
              }
            />


            <Dato
              etiqueta="Cuenta"
              valor={
                enmascararNumeroCuenta(
                  cuenta.numeroCuenta
                )
              }
            />


            <Dato
              etiqueta="Nombre interno"
              valor={
                cuenta.nombreInterno
              }
            />


            <Dato
              etiqueta="Estado actual"
              valor={
                obtenerEtiquetaEstado(
                  cuenta.estado
                )
              }
            />

          </div>


          <div
            style={{
              padding:
                "14px",

              border:
                `1px solid ${configuracion.colorBorde}`,

              borderRadius:
                "var(--erp-radius-md)",

              background:
                configuracion.colorFondo,
            }}
          >

            <span
              style={{
                display:
                  "block",

                marginBottom:
                  "4px",

                color:
                  configuracion.colorPrincipal,

                fontSize:
                  "11px",

                fontWeight:
                  600,
              }}
            >
              Nuevo estado
            </span>


            <strong
              style={{
                color:
                  configuracion.colorPrincipal,

                fontSize:
                  "14px",
              }}
            >
              {
                nuevoEstado
              }
            </strong>

          </div>


          {
            nuevoEstado ===
            "CERRADA"
              ? (
                  <div
                    style={{
                      padding:
                        "12px 14px",

                      border:
                        "1px solid #e2e8f0",

                      borderRadius:
                        "var(--erp-radius-md)",

                      background:
                        "#f8fafc",

                      color:
                        "#475569",

                      fontSize:
                        "12px",

                      lineHeight:
                        1.5,
                    }}
                  >
                    La fecha de cierre será registrada automáticamente
                    por Oracle cuando el cambio sea aceptado.
                  </div>
                )
              : null
          }


          {error ? (

            <div
              role="alert"
              style={{
                padding:
                  "12px 14px",

                border:
                  "1px solid #fecaca",

                borderRadius:
                  "var(--erp-radius-md)",

                background:
                  "#fef2f2",

                color:
                  "#b91c1c",

                fontSize:
                  "12px",
              }}
            >
              {error}
            </div>

          ) : null}

        </div>


        <div
          style={{
            display:
              "flex",

            justifyContent:
              "flex-end",

            gap:
              "10px",

            padding:
              "16px 22px",

            borderTop:
              "1px solid var(--erp-color-border)",

            background:
              "#f8fafc",
          }}
        >

          <Button
            type="button"
            variant="secondary"
            disabled={
              procesando
            }
            onClick={
              onCancel
            }
          >
            Cancelar
          </Button>


          <Button
            type="button"
            disabled={
              procesando
            }
            onClick={() =>
              void onConfirm()
            }
          >
            <IconoEstado
              estado={
                nuevoEstado
              }
            />

            {
              procesando
                ? configuracion.etiquetaProcesando
                : configuracion.etiquetaBoton
            }
          </Button>

        </div>

      </section>

    </div>
  );
}


type DatoProps = {
  etiqueta:
    string;

  valor:
    string;
};


function Dato({
  etiqueta,
  valor,
}: DatoProps) {

  return (
    <div
      style={{
        minWidth:
          0,

        padding:
          "11px 12px",

        border:
          "1px solid #e2e8f0",

        borderRadius:
          "var(--erp-radius-md)",

        background:
          "#f8fafc",
      }}
    >

      <span
        style={{
          display:
            "block",

          marginBottom:
            "4px",

          color:
            "#94a3b8",

          fontSize:
            "10px",

          fontWeight:
            600,

          textTransform:
            "uppercase",

          letterSpacing:
            "0.04em",
        }}
      >
        {etiqueta}
      </span>


      <strong
        style={{
          color:
            "#334155",

          fontSize:
            "12px",

          fontWeight:
            600,

          overflowWrap:
            "anywhere",
        }}
      >
        {valor}
      </strong>

    </div>
  );
}
