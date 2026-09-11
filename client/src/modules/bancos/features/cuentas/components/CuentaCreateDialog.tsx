import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Landmark,
  Plus,
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
  CrearCuentaBancariaInput,
  EstadoCuentaBancaria,
  IndicadorSN,
  UsoPrincipalCuenta,
} from "../types/cuentas.types";


export type OpcionMaestroCuenta = {
  id: number;
  etiqueta: string;
};


export type CuentaCreateDialogProps = {
  bancos:
    OpcionMaestroCuenta[];

  monedas:
    OpcionMaestroCuenta[];

  tiposCuenta:
    OpcionMaestroCuenta[];

  responsables:
    OpcionMaestroCuenta[];

  empresaId:
    number | null;


  procesando?:
    boolean;

  error?:
    string | null;

  onCancel:
    () => void;

  onSubmit:
    (
      datos:
        CrearCuentaBancariaInput
    ) =>
      Promise<void> | void;
};


type ErroresFormulario = {
  bancoId?: string;
  monedaId?: string;
  tipoCuentaId?: string;
  responsableId?: string;

  numeroCuenta?: string;
  nombreInterno?: string;
  saldoInicial?: string;
  fechaApertura?: string;

  observaciones?: string;
};


function obtenerFechaLocalActual():
  string {

  const ahora =
    new Date();

  const anio =
    ahora.getFullYear();

  const mes =
    String(
      ahora.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const dia =
    String(
      ahora.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${anio}-${mes}-${dia}`;
}


function convertirIndicador(
  valor: boolean
): IndicadorSN {

  return valor
    ? "S"
    : "N";
}


function esIdValido(
  valor: number
): boolean {

  return (
    Number.isInteger(
      valor
    ) &&
    valor > 0
  );
}


function convertirSaldo(
  valor: string
): number | null {

  const texto =
    valor.trim();

  if (
    texto === "" ||
    !/^-?\d+(\.\d{1,2})?$/.test(
      texto
    )
  ) {

    return null;
  }


  const numero =
    Number(
      texto
    );


  return Number.isFinite(
    numero
  )
    ? numero
    : null;
}


export function CuentaCreateDialog({
  bancos,
  monedas,
  tiposCuenta,
  responsables,
  empresaId,
  procesando = false,
  error = null,
  onCancel,
  onSubmit,
}: CuentaCreateDialogProps) {

  const [
    bancoId,
    setBancoId,
  ] =
    useState(
      0
    );


  const [
    monedaId,
    setMonedaId,
  ] =
    useState(
      0
    );


  const [
    tipoCuentaId,
    setTipoCuentaId,
  ] =
    useState(
      0
    );


  const [
    responsableId,
    setResponsableId,
  ] =
    useState(
      0
    );


  const [
    numeroCuenta,
    setNumeroCuenta,
  ] =
    useState(
      ""
    );


  const [
    nombreInterno,
    setNombreInterno,
  ] =
    useState(
      ""
    );


  const [
    saldoInicial,
    setSaldoInicial,
  ] =
    useState(
      "0.00"
    );


  const [
    fechaApertura,
    setFechaApertura,
  ] =
    useState(
      obtenerFechaLocalActual()
    );


  const [
    usoPrincipal,
    setUsoPrincipal,
  ] =
    useState<UsoPrincipalCuenta>(
      "AMBOS"
    );


  const [
    permiteCobros,
    setPermiteCobros,
  ] =
    useState<IndicadorSN>(
      "N"
    );


  const [
    permitePagos,
    setPermitePagos,
  ] =
    useState<IndicadorSN>(
      "N"
    );


  const [
    permiteCheques,
    setPermiteCheques,
  ] =
    useState<IndicadorSN>(
      "N"
    );


  const [
    permiteTransferencias,
    setPermiteTransferencias,
  ] =
    useState<IndicadorSN>(
      "N"
    );


  const [
    estado,
    setEstado,
  ] =
    useState<EstadoCuentaBancaria>(
      "BORRADOR"
    );


  const [
    observaciones,
    setObservaciones,
  ] =
    useState(
      ""
    );


  const [
    errores,
    setErrores,
  ] =
    useState<ErroresFormulario>(
      {}
    );


  const dependenciasFaltantes =
    useMemo(
      () => {

        const faltantes:
          string[] = [];


        if (
          !esIdValido(
            empresaId ?? 0
          )
        ) {

          faltantes.push(
            "empresa"
          );
        }



        if (
          bancos.length === 0
        ) {

          faltantes.push(
            "bancos"
          );
        }


        if (
          monedas.length === 0
        ) {

          faltantes.push(
            "monedas"
          );
        }


        if (
          tiposCuenta.length === 0
        ) {

          faltantes.push(
            "tipos de cuenta"
          );
        }


        if (
          responsables.length === 0
        ) {

          faltantes.push(
            "responsables"
          );
        }


        return faltantes;

      },
      [
        bancos,
        monedas,
        tiposCuenta,
        responsables,
        empresaId,
      ]
    );


  const puedeGuardar =
    (
      dependenciasFaltantes.length ===
        0 &&
      !procesando
    );


  function validar():
    boolean {

    const nuevosErrores:
      ErroresFormulario = {};


    if (
      !esIdValido(
        bancoId
      )
    ) {

      nuevosErrores.bancoId =
        "Debe seleccionar un banco.";
    }


    if (
      !esIdValido(
        monedaId
      )
    ) {

      nuevosErrores.monedaId =
        "Debe seleccionar una moneda.";
    }


    if (
      !esIdValido(
        tipoCuentaId
      )
    ) {

      nuevosErrores.tipoCuentaId =
        "Debe seleccionar un tipo de cuenta.";
    }


    if (
      !esIdValido(
        responsableId
      )
    ) {

      nuevosErrores.responsableId =
        "Debe seleccionar un responsable.";
    }


    const numero =
      numeroCuenta.trim();


    if (
      !/^[0-9]{6,20}$/.test(
        numero
      )
    ) {

      nuevosErrores.numeroCuenta =
        "El número de cuenta debe contener únicamente entre 6 y 20 dígitos.";
    }


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


    const saldo =
      convertirSaldo(
        saldoInicial
      );


    if (
      saldo === null
    ) {

      nuevosErrores.saldoInicial =
        "El saldo inicial debe ser un número válido con máximo 2 decimales.";
    }


    if (
      fechaApertura === ""
    ) {

      nuevosErrores.fechaApertura =
        "La fecha de apertura es obligatoria.";

    } else if (
      fechaApertura >
        obtenerFechaLocalActual()
    ) {

      nuevosErrores.fechaApertura =
        "La fecha de apertura no puede ser posterior a la fecha actual.";
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
      !puedeGuardar ||
      !validar()
    ) {

      return;
    }


    const saldo =
      convertirSaldo(
        saldoInicial
      );


    if (
      saldo === null ||
      empresaId === null
    ) {

      return;
    }


    await onSubmit({
      empresaId,

      bancoId,

      monedaId,

      tipoCuentaId,

      responsableId,

      numeroCuenta:
        numeroCuenta.trim(),

      nombreInterno:
        nombreInterno.trim(),

      saldoInicial:
        saldo,

      fechaApertura,

      usoPrincipal,

      permiteCobros,

      permitePagos,

      permiteCheques,

      permiteTransferencias,

      estado,

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
        aria-labelledby="cuenta-create-title"
        style={{
          width:
            "min(820px, 100%)",

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
              <Landmark
                size={18}
              />
            </span>


            <div>

              <h2
                id="cuenta-create-title"
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
                Nueva cuenta bancaria
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
                Registra una cuenta bancaria empresarial.
              </p>

            </div>

          </div>


          <IconButton
            type="button"
            label="Cerrar registro de cuenta"
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
              El identificador y el código de la cuenta se generan automáticamente.
              La empresa y el usuario creador provienen del contexto del ERP.
            </Alert>


            {dependenciasFaltantes.length >
              0 ? (

              <div
                role="alert"
                style={{
                  padding:
                    "12px 14px",

                  border:
                    "1px solid #fde68a",

                  borderRadius:
                    "var(--erp-radius-md)",

                  background:
                    "#fffbeb",

                  color:
                    "#92400e",

                  fontSize:
                    "12px",
                }}
              >
                No se puede guardar todavía porque faltan maestros o contexto:
                {" "}
                {dependenciasFaltantes.join(
                  ", "
                )}.
              </div>

            ) : null}


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

              <FormField
                label="Banco"
                required
              >

                <div>

                  <Select
                    value={
                      String(
                        bancoId
                      )
                    }
                    disabled={
                      procesando ||
                      bancos.length === 0
                    }
                    onChange={(
                      event
                    ) =>
                      setBancoId(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  >

                    <option
                      value="0"
                    >
                      Seleccionar banco
                    </option>

                    {bancos.map(
                      (
                        banco
                      ) => (

                        <option
                          key={
                            banco.id
                          }
                          value={
                            banco.id
                          }
                        >
                          {banco.etiqueta}
                        </option>

                      )
                    )}

                  </Select>


                  <MensajeError
                    mensaje={
                      errores.bancoId
                    }
                  />

                </div>

              </FormField>


              <FormField
                label="Número de cuenta"
                required
                help="Solo números, entre 6 y 20 dígitos."
              >

                <div>

                  <Input
                    value={
                      numeroCuenta
                    }
                    inputMode="numeric"
                    maxLength={
                      20
                    }
                    disabled={
                      procesando
                    }
                    onChange={(
                      event
                    ) =>
                      setNumeroCuenta(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />


                  <MensajeError
                    mensaje={
                      errores.numeroCuenta
                    }
                  />

                </div>

              </FormField>


              <FormField
                label="Tipo de cuenta"
                required
              >

                <div>

                  <Select
                    value={
                      String(
                        tipoCuentaId
                      )
                    }
                    disabled={
                      procesando ||
                      tiposCuenta.length === 0
                    }
                    onChange={(
                      event
                    ) =>
                      setTipoCuentaId(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  >

                    <option
                      value="0"
                    >
                      Seleccionar tipo
                    </option>

                    {tiposCuenta.map(
                      (
                        tipo
                      ) => (

                        <option
                          key={
                            tipo.id
                          }
                          value={
                            tipo.id
                          }
                        >
                          {tipo.etiqueta}
                        </option>

                      )
                    )}

                  </Select>


                  <MensajeError
                    mensaje={
                      errores.tipoCuentaId
                    }
                  />

                </div>

              </FormField>


              <FormField
                label="Moneda"
                required
              >

                <div>

                  <Select
                    value={
                      String(
                        monedaId
                      )
                    }
                    disabled={
                      procesando ||
                      monedas.length === 0
                    }
                    onChange={(
                      event
                    ) =>
                      setMonedaId(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  >

                    <option
                      value="0"
                    >
                      Seleccionar moneda
                    </option>

                    {monedas.map(
                      (
                        moneda
                      ) => (

                        <option
                          key={
                            moneda.id
                          }
                          value={
                            moneda.id
                          }
                        >
                          {moneda.etiqueta}
                        </option>

                      )
                    )}

                  </Select>


                  <MensajeError
                    mensaje={
                      errores.monedaId
                    }
                  />

                </div>

              </FormField>


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


                  <MensajeError
                    mensaje={
                      errores.nombreInterno
                    }
                  />

                </div>

              </FormField>


              <FormField
                label="Responsable"
                required
              >

                <div>

                  <Select
                    value={
                      String(
                        responsableId
                      )
                    }
                    disabled={
                      procesando ||
                      responsables.length === 0
                    }
                    onChange={(
                      event
                    ) =>
                      setResponsableId(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  >

                    <option
                      value="0"
                    >
                      Seleccionar responsable
                    </option>

                    {responsables.map(
                      (
                        responsable
                      ) => (

                        <option
                          key={
                            responsable.id
                          }
                          value={
                            responsable.id
                          }
                        >
                          {responsable.etiqueta}
                        </option>

                      )
                    )}

                  </Select>


                  <MensajeError
                    mensaje={
                      errores.responsableId
                    }
                  />

                </div>

              </FormField>


              <FormField
                label="Saldo inicial"
                required
                help="Permite máximo 2 decimales."
              >

                <div>

                  <Input
                    type="number"
                    step="0.01"
                    value={
                      saldoInicial
                    }
                    disabled={
                      procesando
                    }
                    onChange={(
                      event
                    ) =>
                      setSaldoInicial(
                        event.target.value
                      )
                    }
                  />


                  <MensajeError
                    mensaje={
                      errores.saldoInicial
                    }
                  />

                </div>

              </FormField>


              <FormField
                label="Fecha de apertura"
                required
              >

                <div>

                  <Input
                    type="date"
                    value={
                      fechaApertura
                    }
                    max={
                      obtenerFechaLocalActual()
                    }
                    disabled={
                      procesando
                    }
                    onChange={(
                      event
                    ) =>
                      setFechaApertura(
                        event.target.value
                      )
                    }
                  />


                  <MensajeError
                    mensaje={
                      errores.fechaApertura
                    }
                  />

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


              <FormField
                label="Estado inicial"
                required
                help="Una cuenta nueva puede iniciar en Borrador o Activa."
              >

                <Select
                  value={
                    estado
                  }
                  disabled={
                    procesando
                  }
                  onChange={(
                    event
                  ) =>
                    setEstado(
                      event.target
                        .value as
                        EstadoCuentaBancaria
                    )
                  }
                >

                  <option
                    value="BORRADOR"
                  >
                    Borrador
                  </option>

                  <option
                    value="ACTIVA"
                  >
                    Activa
                  </option>

                </Select>

              </FormField>

            </div>


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
                !puedeGuardar
              }
              title={
                dependenciasFaltantes.length >
                  0
                  ? "Faltan datos maestros o contexto del ERP para registrar la cuenta."
                  : undefined
              }
            >
              <Plus
                size={16}
              />

              {procesando
                ? "Guardando..."
                : "Crear cuenta"}
            </Button>

          </div>

        </form>

      </section>

    </div>
  );
}


type MensajeErrorProps = {
  mensaje?:
    string;
};


function MensajeError({
  mensaje,
}: MensajeErrorProps) {

  if (
    !mensaje
  ) {

    return null;
  }


  return (
    <p
      className="text-danger"
      style={{
        margin:
          "6px 0 0",

        fontSize:
          "11px",
      }}
    >
      {mensaje}
    </p>
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