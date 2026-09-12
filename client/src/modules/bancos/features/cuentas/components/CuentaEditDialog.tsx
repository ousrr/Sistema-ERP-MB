import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Pencil,
  X,
} from "lucide-react";

import {
  Alert,
} from "../../../../../shared/feedback/Alert";

import {
  FormField,
} from "../../../../../shared/forms/FormField";

import {
  Input,
} from "../../../../../shared/forms/Input";

import {
  Select,
} from "../../../../../shared/forms/Select";

import {
  Button,
} from "../../../../../shared/ui/Button";

import {
  IconButton,
} from "../../../../../shared/ui/IconButton";

import type {
  CuentaBancaria,
  IndicadorSN,
  UsoPrincipalCuenta,
} from "../types/cuentas.types";


export type CuentaEditFormData = {
  nombreInterno: string;

  usoPrincipal:
    UsoPrincipalCuenta;

  permiteCobros:
    IndicadorSN;

  permitePagos:
    IndicadorSN;

  permiteCheques:
    IndicadorSN;

  permiteTransferencias:
    IndicadorSN;

  observaciones:
    string | null;
};


type CuentaEditDialogProps = {
  cuenta:
    CuentaBancaria;

  procesando?:
    boolean;

  error?:
    string | null;

  onCancel:
    () => void;

  onSubmit:
    (
      datos:
        CuentaEditFormData
    ) =>
      Promise<void> | void;
};


type ErroresFormulario = {
  nombreInterno?:
    string;

  observaciones?:
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


function convertirIndicador(
  valor: boolean
): IndicadorSN {

  return valor
    ? "S"
    : "N";
}


export function CuentaEditDialog({
  cuenta,
  procesando = false,
  error = null,
  onCancel,
  onSubmit,
}: CuentaEditDialogProps) {

  const [
    nombreInterno,
    setNombreInterno,
  ] =
    useState(
      cuenta.nombreInterno
    );


  const [
    usoPrincipal,
    setUsoPrincipal,
  ] =
    useState<UsoPrincipalCuenta>(
      cuenta.usoPrincipal
    );


  const [
    permiteCobros,
    setPermiteCobros,
  ] =
    useState<IndicadorSN>(
      cuenta.permiteCobros
    );


  const [
    permitePagos,
    setPermitePagos,
  ] =
    useState<IndicadorSN>(
      cuenta.permitePagos
    );


  const [
    permiteCheques,
    setPermiteCheques,
  ] =
    useState<IndicadorSN>(
      cuenta.permiteCheques
    );


  const [
    permiteTransferencias,
    setPermiteTransferencias,
  ] =
    useState<IndicadorSN>(
      cuenta.permiteTransferencias
    );


  const [
    observaciones,
    setObservaciones,
  ] =
    useState(
      cuenta.observaciones ?? ""
    );


  const [
    errores,
    setErrores,
  ] =
    useState<ErroresFormulario>(
      {}
    );


  useEffect(
    () => {

      setNombreInterno(
        cuenta.nombreInterno
      );

      setUsoPrincipal(
        cuenta.usoPrincipal
      );

      setPermiteCobros(
        cuenta.permiteCobros
      );

      setPermitePagos(
        cuenta.permitePagos
      );

      setPermiteCheques(
        cuenta.permiteCheques
      );

      setPermiteTransferencias(
        cuenta.permiteTransferencias
      );

      setObservaciones(
        cuenta.observaciones ?? ""
      );

      setErrores(
        {}
      );

    },
    [
      cuenta,
    ]
  );


  function validar():
    boolean {

    const nuevosErrores:
      ErroresFormulario = {};


    const nombre =
      nombreInterno.trim();


    if (
      nombre === ""
    ) {

      nuevosErrores.nombreInterno =
        "El nombre interno es obligatorio.";

    } else if (
      nombre.length > 80
    ) {

      nuevosErrores.nombreInterno =
        "El nombre interno no puede superar 80 caracteres.";
    }


    if (
      observaciones.length >
      500
    ) {

      nuevosErrores.observaciones =
        "Las observaciones no pueden superar 500 caracteres.";
    }


    setErrores(
      nuevosErrores
    );


    return (
      Object.keys(
        nuevosErrores
      ).length === 0
    );
  }


  async function manejarSubmit(
    event:
      FormEvent<HTMLFormElement>
  ): Promise<void> {

    event.preventDefault();


    if (
      !validar()
    ) {

      return;
    }


    await onSubmit({
      nombreInterno:
        nombreInterno.trim(),

      usoPrincipal,

      permiteCobros,

      permitePagos,

      permiteCheques,

      permiteTransferencias,

      observaciones:
        observaciones.trim() === ""
          ? null
          : observaciones.trim(),
    });
  }


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
        aria-labelledby="cuenta-edit-title"
        style={{
          width:
            "min(760px, 100%)",

          maxHeight:
            "calc(100vh - 48px)",

          overflowY:
            "auto",

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
                "flex-start",

              gap:
                "12px",
            }}
          >

            <span
              aria-hidden="true"
              style={{
                width:
                  "38px",

                height:
                  "38px",

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
                  "#eff6ff",

                color:
                  "var(--erp-color-primary)",
              }}
            >
              <Pencil
                size={18}
              />
            </span>


            <div>

              <h2
                id="cuenta-edit-title"
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
                Editar cuenta bancaria
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
                {cuenta.codigoCuenta}
              </p>

            </div>

          </div>


          <IconButton
            type="button"
            label="Cerrar edición"
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


        <form
          noValidate
          onSubmit={
            manejarSubmit
          }
        >

          <div
            style={{
              display:
                "grid",

              gap:
                "20px",

              padding:
                "22px",
            }}
          >

            <Alert>
              Banco, número de cuenta, tipo y moneda se conservan sin cambios
              durante esta edición. El responsable también se conserva mientras
              el ERP incorpora el selector global de usuarios.
            </Alert>


            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",

                gap:
                  "14px",
              }}
            >

              <DatoSoloLectura
                etiqueta="Banco"
                valor={
                  cuenta.bancoNombre
                }
              />


              <DatoSoloLectura
                etiqueta="Número de cuenta"
                valor={
                  enmascararNumeroCuenta(
                    cuenta.numeroCuenta
                  )
                }
              />


              <DatoSoloLectura
                etiqueta="Tipo de cuenta"
                valor={
                  cuenta.tipoCuentaNombre
                }
              />


              <DatoSoloLectura
                etiqueta="Moneda"
                valor={
                  `Moneda #${cuenta.monedaId}`
                }
              />


              <DatoSoloLectura
                etiqueta="Responsable"
                valor={
                  `Responsable #${cuenta.responsableId}`
                }
              />


              <DatoSoloLectura
                etiqueta="Estado actual"
                valor={
                  cuenta.estado
                }
              />

            </div>


            <FormField
              label="Nombre interno"
              required
            >

              <div>

                <Input
                  value={
                    nombreInterno
                  }
                  maxLength={
                    80
                  }
                  disabled={
                    procesando
                  }
                  onChange={(
                    event
                  ) =>
                    setNombreInterno(
                      event.target.value
                    )
                  }
                />


                {errores.nombreInterno ? (

                  <p
                    className="text-danger"
                    style={{
                      margin:
                        "6px 0 0",

                      fontSize:
                        "11px",
                    }}
                  >
                    {errores.nombreInterno}
                  </p>

                ) : null}

              </div>

            </FormField>


            <FormField
              label="Uso principal"
              required
            >

              <Select
                value={
                  usoPrincipal
                }
                disabled={
                  procesando
                }
                onChange={(
                  event
                ) =>
                  setUsoPrincipal(
                    event.target
                      .value as
                      UsoPrincipalCuenta
                  )
                }
              >

                <option
                  value="COBROS"
                >
                  Cobros
                </option>

                <option
                  value="PAGOS"
                >
                  Pagos
                </option>

                <option
                  value="AMBOS"
                >
                  Cobros y pagos
                </option>

              </Select>

            </FormField>


            <div>

              <div
                style={{
                  marginBottom:
                    "10px",

                  color:
                    "#334155",

                  fontSize:
                    "13px",

                  fontWeight:
                    600,
                }}
              >
                Operaciones permitidas
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

                <PermisoCuenta
                  etiqueta="Recibir cobros"
                  checked={
                    permiteCobros ===
                    "S"
                  }
                  disabled={
                    procesando
                  }
                  onChange={(
                    checked
                  ) =>
                    setPermiteCobros(
                      convertirIndicador(
                        checked
                      )
                    )
                  }
                />


                <PermisoCuenta
                  etiqueta="Pagar proveedores"
                  checked={
                    permitePagos ===
                    "S"
                  }
                  disabled={
                    procesando
                  }
                  onChange={(
                    checked
                  ) =>
                    setPermitePagos(
                      convertirIndicador(
                        checked
                      )
                    )
                  }
                />


                <PermisoCuenta
                  etiqueta="Emitir cheques"
                  checked={
                    permiteCheques ===
                    "S"
                  }
                  disabled={
                    procesando
                  }
                  onChange={(
                    checked
                  ) =>
                    setPermiteCheques(
                      convertirIndicador(
                        checked
                      )
                    )
                  }
                />


                <PermisoCuenta
                  etiqueta="Realizar transferencias"
                  checked={
                    permiteTransferencias ===
                    "S"
                  }
                  disabled={
                    procesando
                  }
                  onChange={(
                    checked
                  ) =>
                    setPermiteTransferencias(
                      convertirIndicador(
                        checked
                      )
                    )
                  }
                />

              </div>

            </div>


            <FormField
              label="Observaciones"
              help="Opcional. Máximo 500 caracteres."
            >

              <div>

                <textarea
                  className="form-input"
                  rows={4}
                  value={
                    observaciones
                  }
                  maxLength={
                    500
                  }
                  disabled={
                    procesando
                  }
                  onChange={(
                    event
                  ) =>
                    setObservaciones(
                      event.target.value
                    )
                  }
                  style={{
                    resize:
                      "vertical",

                    minHeight:
                      "96px",
                  }}
                />


                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    gap:
                      "12px",

                    marginTop:
                      "5px",
                  }}
                >

                  <span
                    className="text-danger"
                    style={{
                      fontSize:
                        "11px",
                    }}
                  >
                    {
                      errores.observaciones ??
                      ""
                    }
                  </span>


                  <span
                    className="text-muted"
                    style={{
                      fontSize:
                        "10px",
                    }}
                  >
                    {observaciones.length}/500
                  </span>

                </div>

              </div>

            </FormField>


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
              type="submit"
              disabled={
                procesando
              }
            >
              {procesando
                ? "Guardando..."
                : "Guardar cambios"}
            </Button>

          </div>

        </form>

      </section>

    </div>
  );
}


type DatoSoloLecturaProps = {
  etiqueta:
    string;

  valor:
    string;
};


function DatoSoloLectura({
  etiqueta,
  valor,
}: DatoSoloLecturaProps) {

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
        }}
      >
        {valor}
      </strong>

    </div>
  );
}


type PermisoCuentaProps = {
  etiqueta:
    string;

  checked:
    boolean;

  disabled:
    boolean;

  onChange:
    (
      checked:
        boolean
    ) => void;
};


function PermisoCuenta({
  etiqueta,
  checked,
  disabled,
  onChange,
}: PermisoCuentaProps) {

  return (
    <label
      style={{
        minHeight:
          "48px",

        display:
          "flex",

        alignItems:
          "center",

        gap:
          "10px",

        padding:
          "10px 12px",

        border:
          checked
            ? "1px solid #93c5fd"
            : "1px solid #e2e8f0",

        borderRadius:
          "var(--erp-radius-md)",

        background:
          checked
            ? "#eff6ff"
            : "#ffffff",

        color:
          "#334155",

        fontSize:
          "12px",

        fontWeight:
          500,

        cursor:
          disabled
            ? "not-allowed"
            : "pointer",
      }}
    >

      <input
        type="checkbox"
        checked={
          checked
        }
        disabled={
          disabled
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.checked
          )
        }
      />

      <span>
        {etiqueta}
      </span>

    </label>
  );
}