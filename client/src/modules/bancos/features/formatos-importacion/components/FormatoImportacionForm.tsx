import {
  useEffect,
  useState,
} from "react";

import {
  Minus,
  Plus,
} from "lucide-react";

import { Alert } from "../../../../../shared/feedback/Alert";
import { FormField } from "../../../../../shared/forms/FormField";
import { Input } from "../../../../../shared/forms/Input";
import { Select } from "../../../../../shared/forms/Select";
import { Button } from "../../../../../shared/ui/Button";

import type {
  CrearFormatoImportacion,
} from "../types/formatos-importacion.types";

type FormatoImportacionFormProps = {
  initialValues?: CrearFormatoImportacion;

  onSubmit: (
    data: CrearFormatoImportacion
  ) => Promise<void>;

  onCancel?: () => void;

  guardando?: boolean;

  submitLabel?: string;
};

type ErroresFormulario = Partial<
  Record<
    keyof CrearFormatoImportacion,
    string
  >
>;

type CampoNumerico =
  | "version"
  | "filaEncabezado"
  | "archivoEjemploId";

const valoresIniciales: CrearFormatoImportacion = {
  bancoId: 1,
  nombre: "",
  version: 1,
  tipoArchivo: "CSV",
  delimitador: ",",
  formatoFecha: "DD/MM/YYYY",
  filaEncabezado: 1,
  archivoEjemploId: 1,
  estado: "ACTIVO",
};

const REGEX_NOMBRE =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ._-]*$/;

const REGEX_NOMBRE_COMPLETO =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ._-]+$/;

const REGEX_SOLO_DIGITOS =
  /^\d*$/;

const DELIMITADORES_PERMITIDOS = [
  ",",
  ";",
  "|",
];

const FORMATOS_FECHA_PERMITIDOS = [
  "DD/MM/YYYY",
  "YYYY-MM-DD",
  "MM/DD/YYYY",
];

function estiloError() {
  return {
    display: "block",
    marginTop: "6px",
    color: "#b42318",
    fontSize: "0.85rem",
  };
}

function convertirNumero(
  valor: string
): number {
  if (valor.trim() === "") {
    return Number.NaN;
  }

  return Number(valor);
}

type NumericStepperProps = {
  value: string;
  min: number;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  ariaLabel: string;
  onChange: (
    value: string
  ) => void;
  onInvalidCharacter?: () => void;
};

function NumericStepper({
  value,
  min,
  disabled = false,
  error = false,
  required = false,
  ariaLabel,
  onChange,
  onInvalidCharacter,
}: NumericStepperProps) {
  const cantidadDigitos =
    Math.max(value.length, 1);

  const anchoInput =
    Math.min(
      Math.max(
        48,
        cantidadDigitos * 11 + 22
      ),
      150
    );

  function manejarCambio(
    valorIngresado: string
  ) {
    if (
      !REGEX_SOLO_DIGITOS.test(
        valorIngresado
      )
    ) {
      onInvalidCharacter?.();
      return;
    }

    onChange(valorIngresado);
  }

  function incrementar() {
    if (disabled) {
      return;
    }

    if (value === "") {
      onChange(String(min));
      return;
    }

    const numero =
      Number(value);

    if (
      !Number.isSafeInteger(numero)
    ) {
      return;
    }

    if (
      numero >=
      Number.MAX_SAFE_INTEGER
    ) {
      return;
    }

    onChange(
      String(numero + 1)
    );
  }

  function disminuir() {
    if (disabled) {
      return;
    }

    if (value === "") {
      onChange(String(min));
      return;
    }

    const numero =
      Number(value);

    if (
      !Number.isSafeInteger(numero)
    ) {
      return;
    }

    const nuevoValor =
      Math.max(
        min,
        numero - 1
      );

    onChange(
      String(nuevoValor)
    );
  }

  function normalizarAlSalir() {
    if (value === "") {
      return;
    }

    const numero =
      Number(value);

    if (
      !Number.isSafeInteger(numero)
    ) {
      return;
    }

    onChange(
      String(numero)
    );
  }

  return (
    <div
      className={
        error
          ? "numeric-stepper numeric-stepper--error"
          : "numeric-stepper"
      }
    >
      <button
        type="button"
        className="numeric-stepper__button"
        onClick={disminuir}
        disabled={
          disabled ||
          (
            value !== "" &&
            Number(value) <= min
          )
        }
        aria-label={`Disminuir ${ariaLabel}`}
        title="Disminuir"
      >
        <Minus
          size={18}
          strokeWidth={2.5}
        />
      </button>

      <input
        type="text"
        className="numeric-stepper__input"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={value}
        required={required}
        disabled={disabled}
        aria-invalid={error}
        aria-label={ariaLabel}
        style={{
          width: `${anchoInput}px`,
        }}
        onChange={(event) =>
          manejarCambio(
            event.target.value
          )
        }
        onBlur={
          normalizarAlSalir
        }
      />

      <button
        type="button"
        className="numeric-stepper__button"
        onClick={incrementar}
        disabled={disabled}
        aria-label={`Incrementar ${ariaLabel}`}
        title="Incrementar"
      >
        <Plus
          size={18}
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}

export function FormatoImportacionForm({
  initialValues,
  onSubmit,
  onCancel,
  guardando = false,
  submitLabel = "Guardar formato",
}: FormatoImportacionFormProps) {
  const [
    formulario,
    setFormulario,
  ] =
    useState<CrearFormatoImportacion>(
      initialValues ??
        valoresIniciales
    );

  const [
    versionTexto,
    setVersionTexto,
  ] = useState(
    String(
      initialValues?.version ??
        valoresIniciales.version
    )
  );

  const [
    filaEncabezadoTexto,
    setFilaEncabezadoTexto,
  ] = useState(
    String(
      initialValues?.filaEncabezado ??
        valoresIniciales.filaEncabezado
    )
  );

  const [
    archivoEjemploTexto,
    setArchivoEjemploTexto,
  ] = useState(
    initialValues?.archivoEjemploId != null
      ? String(
          initialValues.archivoEjemploId
        )
      : String(
          valoresIniciales.archivoEjemploId
        )
  );

  const [
    errores,
    setErrores,
  ] =
    useState<ErroresFormulario>({});

  const [
    mostrarResumenErrores,
    setMostrarResumenErrores,
  ] =
    useState(false);

  useEffect(() => {
    const valores =
      initialValues ??
      valoresIniciales;

    setFormulario(
      valores
    );

    setVersionTexto(
      String(
        valores.version
      )
    );

    setFilaEncabezadoTexto(
      String(
        valores.filaEncabezado
      )
    );

    setArchivoEjemploTexto(
      valores.archivoEjemploId !=
      null
        ? String(
            valores.archivoEjemploId
          )
        : ""
    );

    setErrores({});

    setMostrarResumenErrores(
      false
    );
  }, [initialValues]);

  function limpiarErrorCampo(
    campo:
      keyof CrearFormatoImportacion
  ) {
    setErrores((actual) => ({
      ...actual,
      [campo]: undefined,
    }));
  }

  function marcarErrorNumerico(
    campo: CampoNumerico
  ) {
    const mensajes:
      Record<
        CampoNumerico,
        string
      > = {
      version:
        "Solo se permiten números enteros positivos.",

      filaEncabezado:
        "Solo se permiten números enteros iguales o mayores a 0.",

      archivoEjemploId:
        "Solo se permiten números enteros positivos.",
    };

    setErrores(
      (actual) => ({
        ...actual,
        [campo]:
          mensajes[campo],
      })
    );
  }

  function actualizarCampo<
    K extends
      keyof CrearFormatoImportacion
  >(
    campo: K,
    valor:
      CrearFormatoImportacion[K]
  ) {
    setFormulario(
      (actual) => ({
        ...actual,
        [campo]: valor,
      })
    );

    limpiarErrorCampo(
      campo
    );
  }

  function manejarCambioNombre(
    valorIngresado: string
  ) {
    if (
      REGEX_NOMBRE.test(
        valorIngresado
      )
    ) {
      actualizarCampo(
        "nombre",
        valorIngresado
      );
    } else {
      setErrores(
        (actual) => ({
          ...actual,

          nombre:
            "Solo se permiten letras, números, espacios, punto, guion y guion bajo.",
        })
      );
    }
  }

  function manejarCambioTipoArchivo(
    valor: string
  ) {
    if (
      valor !== "CSV" &&
      valor !== "XLS" &&
      valor !== "XLSX"
    ) {
      return;
    }

    setFormulario(
      (actual) => ({
        ...actual,

        tipoArchivo:
          valor,

        delimitador:
          valor === "CSV"
            ? actual.delimitador ||
              ","
            : "",
      })
    );

    limpiarErrorCampo(
      "tipoArchivo"
    );

    limpiarErrorCampo(
      "delimitador"
    );
  }

  function validarFormulario(
    datos:
      CrearFormatoImportacion
  ): ErroresFormulario {
    const nuevosErrores:
      ErroresFormulario = {};

    if (
      !Number.isInteger(
        datos.bancoId
      ) ||
      datos.bancoId <= 0
    ) {
      nuevosErrores.bancoId =
        "Debe seleccionar un banco válido.";
    }

    const nombre =
      datos.nombre.trim();

    if (!nombre) {
      nuevosErrores.nombre =
        "El nombre del formato es obligatorio.";
    } else if (
      nombre.length < 3
    ) {
      nuevosErrores.nombre =
        "El nombre debe contener al menos 3 caracteres.";
    } else if (
      nombre.length > 100
    ) {
      nuevosErrores.nombre =
        "El nombre no puede superar los 100 caracteres.";
    } else if (
      !REGEX_NOMBRE_COMPLETO.test(
        nombre
      )
    ) {
      nuevosErrores.nombre =
        "El nombre contiene caracteres no permitidos.";
    }

    if (
      !Number.isSafeInteger(
        datos.version
      ) ||
      datos.version < 1
    ) {
      nuevosErrores.version =
        "La versión debe ser un número entero mayor o igual a 1.";
    }

    if (
      datos.tipoArchivo !==
        "CSV" &&
      datos.tipoArchivo !==
        "XLS" &&
      datos.tipoArchivo !==
        "XLSX"
    ) {
      nuevosErrores.tipoArchivo =
        "Seleccione un tipo de archivo válido.";
    }

    if (
      datos.tipoArchivo ===
      "CSV"
    ) {
      if (
        !datos.delimitador
      ) {
        nuevosErrores.delimitador =
          "Debe seleccionar un delimitador para archivos CSV.";
      } else if (
        !DELIMITADORES_PERMITIDOS.includes(
          datos.delimitador
        )
      ) {
        nuevosErrores.delimitador =
          "El delimitador seleccionado no es válido.";
      }
    }

    if (
      !FORMATOS_FECHA_PERMITIDOS.includes(
        datos.formatoFecha
      )
    ) {
      nuevosErrores.formatoFecha =
        "Seleccione un formato de fecha válido.";
    }

    if (
      !Number.isSafeInteger(
        datos.filaEncabezado
      ) ||
      datos.filaEncabezado <
        0
    ) {
      nuevosErrores.filaEncabezado =
        "La fila de encabezado debe ser un número entero igual o mayor a 0.";
    }

    if (
      datos.archivoEjemploId ===
        null ||
      datos.archivoEjemploId ===
        undefined ||
      !Number.isSafeInteger(
        datos.archivoEjemploId
      ) ||
      datos.archivoEjemploId <
        1
    ) {
      nuevosErrores.archivoEjemploId =
        "Debe indicar un archivo de ejemplo válido.";
    }

    if (
      datos.estado !==
        "ACTIVO" &&
      datos.estado !==
        "INACTIVO"
    ) {
      nuevosErrores.estado =
        "Seleccione un estado válido.";
    }

    return nuevosErrores;
  }

  async function manejarSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const version =
      convertirNumero(
        versionTexto
      );

    const filaEncabezado =
      convertirNumero(
        filaEncabezadoTexto
      );

    const archivoEjemploId =
      archivoEjemploTexto === ""
        ? null
        : convertirNumero(
            archivoEjemploTexto
          );

    const datosNormalizados:
      CrearFormatoImportacion =
      {
        ...formulario,

        nombre:
          formulario.nombre
            .trim()
            .replace(
              /\s+/g,
              " "
            ),

        version,

        filaEncabezado,

        archivoEjemploId,

        delimitador:
          formulario.tipoArchivo ===
          "CSV"
            ? formulario.delimitador
            : "",
      };

    const nuevosErrores =
      validarFormulario(
        datosNormalizados
      );

    if (
      Object.keys(
        nuevosErrores
      ).length > 0
    ) {
      setErrores(
        nuevosErrores
      );

      setMostrarResumenErrores(
        true
      );

      return;
    }

    setErrores({});

    setMostrarResumenErrores(
      false
    );

    setFormulario(
      datosNormalizados
    );

    await onSubmit(
      datosNormalizados
    );
  }

  return (
    <>
      <style>
        {`
          /* =============================================
             GRID DEL FORMULARIO
             ============================================= */

          .formato-form-grid {
            display: grid;

            grid-template-columns:
              repeat(12, minmax(0, 1fr));

            gap:
              18px 16px;

            align-items:
              start;
          }

          .campo-banco {
            grid-column:
              span 3;
          }

          .campo-nombre {
            grid-column:
              span 3;
          }

          .campo-version {
            grid-column:
              span 2;
          }

          .campo-tipo {
            grid-column:
              span 2;
          }

          .campo-delimitador {
            grid-column:
              span 2;
          }

          .campo-fecha {
            grid-column:
              span 3;
          }

          .campo-fila {
            grid-column:
              span 2;
          }

          .campo-archivo {
            grid-column:
              span 2;
          }

          .campo-estado {
            grid-column:
              span 2;
          }


          /* =============================================
             ASTERISCO OBLIGATORIO NARANJA
             ============================================= */

          .formato-form-grid
          .form-field:has([required])
          .form-field__label::after {
            content: " *";

            color:
              #f59e0b;

            font-weight:
              800;
          }


          /* =============================================
             CONTROLES COMPACTOS
             ============================================= */

          .campo-version
          .numeric-stepper,
          .campo-fila
          .numeric-stepper,
          .campo-archivo
          .numeric-stepper {
            width:
              fit-content;

            max-width:
              100%;
          }

          .campo-tipo
          select,
          .campo-delimitador
          select,
          .campo-estado
          select {
            width:
              100%;
          }


          /* =============================================
             STEPPER NUMÉRICO
             ============================================= */

          .numeric-stepper {
            display:
              inline-flex;

            align-items:
              stretch;

            height:
              44px;

            border:
              1px solid #cbd5e1;

            border-radius:
              10px;

            overflow:
              hidden;

            background:
              #ffffff;

            transition:
              border-color
                0.15s ease,
              box-shadow
                0.15s ease;
          }

          .numeric-stepper:focus-within {
            border-color:
              #2563eb;

            box-shadow:
              0 0 0 3px
              rgba(
                37,
                99,
                235,
                0.10
              );
          }

          .numeric-stepper--error {
            border-color:
              #dc2626;
          }


          /* BOTONES - / + */

          .numeric-stepper__button {
            width:
              44px;

            min-width:
              44px;

            display:
              flex;

            align-items:
              center;

            justify-content:
              center;

            border:
              0;

            background:
              #f8fafc;

            color:
              #334155;

            cursor:
              pointer;

            transition:
              background
                0.15s ease,
              color
                0.15s ease;
          }

          .numeric-stepper__button:first-child {
            border-right:
              1px solid #e2e8f0;
          }

          .numeric-stepper__button:last-child {
            border-left:
              1px solid #e2e8f0;
          }

          .numeric-stepper__button:hover:not(:disabled) {
            background:
              #eff6ff;

            color:
              #2563eb;
          }

          .numeric-stepper__button:active:not(:disabled) {
            background:
              #dbeafe;
          }

          .numeric-stepper__button:disabled {
            opacity:
              0.4;

            cursor:
              not-allowed;
          }


          /* INPUT DEL STEPPER */

          .numeric-stepper__input {
            min-width:
              48px;

            padding:
              0 8px;

            border:
              0;

            outline:
              none;

            background:
              #ffffff;

            color:
              #0f172a;

            text-align:
              center;

            font-size:
              14px;

            font-family:
              inherit;

            transition:
              width
                0.15s ease;
          }

          .numeric-stepper__input:disabled {
            background:
              #f8fafc;

            color:
              #94a3b8;
          }


          /* =============================================
             RESPONSIVE
             ============================================= */

          @media (
            max-width: 1100px
          ) {
            .campo-banco,
            .campo-nombre,
            .campo-fecha {
              grid-column:
                span 4;
            }

            .campo-version,
            .campo-tipo,
            .campo-delimitador,
            .campo-fila,
            .campo-archivo,
            .campo-estado {
              grid-column:
                span 4;
            }
          }

          @media (
            max-width: 700px
          ) {
            .formato-form-grid {
              grid-template-columns:
                1fr;
            }

            .campo-banco,
            .campo-nombre,
            .campo-version,
            .campo-tipo,
            .campo-delimitador,
            .campo-fecha,
            .campo-fila,
            .campo-archivo,
            .campo-estado {
              grid-column:
                1;
            }
          }
        `}
      </style>

      <form
        onSubmit={
          manejarSubmit
        }
        noValidate
      >
        {mostrarResumenErrores ? (
          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <Alert>
              Revisa los campos marcados antes de continuar. Algunos datos son inválidos o están incompletos.
            </Alert>
          </div>
        ) : null}


        <div className="formato-form-grid">

          {/* BANCO */}

          <div className="campo-banco">
            <FormField
              label="Banco"
              help="Banco al que pertenece el formato."
            >
              <Select
                value={
                  formulario.bancoId
                }
                required
                disabled={
                  guardando
                }
                onChange={(
                  event
                ) =>
                  actualizarCampo(
                    "bancoId",
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value={1}>
                  Banco Agromercantil de Guatemala, S.A.
                </option>
              </Select>

              {errores.bancoId ? (
                <small
                  style={
                    estiloError()
                  }
                >
                  {
                    errores.bancoId
                  }
                </small>
              ) : null}
            </FormField>
          </div>


          {/* NOMBRE */}

          <div className="campo-nombre">
            <FormField
              label="Nombre"
              help="Usa un nombre claro. Ejemplo: BAM CSV."
            >
              <Input
                type="text"
                value={
                  formulario.nombre
                }
                required
                maxLength={
                  100
                }
                autoComplete="off"
                placeholder="Ej. BAM CSV"
                disabled={
                  guardando
                }
                aria-invalid={
                  Boolean(
                    errores.nombre
                  )
                }
                onChange={(
                  event
                ) =>
                  manejarCambioNombre(
                    event.target.value
                  )
                }
              />

              {errores.nombre ? (
                <small
                  style={
                    estiloError()
                  }
                >
                  {
                    errores.nombre
                  }
                </small>
              ) : null}
            </FormField>
          </div>


          {/* VERSIÓN */}

          <div className="campo-version">
            <FormField
              label="Versión"
              help="Debe ser 1 o mayor."
            >
              <NumericStepper
                value={
                  versionTexto
                }
                min={1}
                required
                disabled={
                  guardando
                }
                error={
                  Boolean(
                    errores.version
                  )
                }
                ariaLabel="Versión"
                onChange={(
                  valor
                ) => {
                  setVersionTexto(
                    valor
                  );

                  limpiarErrorCampo(
                    "version"
                  );
                }}
                onInvalidCharacter={() =>
                  marcarErrorNumerico(
                    "version"
                  )
                }
              />

              {errores.version ? (
                <small
                  style={
                    estiloError()
                  }
                >
                  {
                    errores.version
                  }
                </small>
              ) : null}
            </FormField>
          </div>


          {/* TIPO DE ARCHIVO */}

          <div className="campo-tipo">
            <FormField
              label="Tipo de archivo"
              help="Archivo entregado por el banco."
            >
              <Select
                value={
                  formulario.tipoArchivo
                }
                required
                disabled={
                  guardando
                }
                onChange={(
                  event
                ) =>
                  manejarCambioTipoArchivo(
                    event.target.value
                  )
                }
              >
                <option value="CSV">
                  CSV
                </option>

                <option value="XLS">
                  XLS
                </option>

                <option value="XLSX">
                  XLSX
                </option>
              </Select>

              {errores.tipoArchivo ? (
                <small
                  style={
                    estiloError()
                  }
                >
                  {
                    errores.tipoArchivo
                  }
                </small>
              ) : null}
            </FormField>
          </div>


          {/* DELIMITADOR */}

          <div className="campo-delimitador">
            <FormField
              label="Delimitador"
              help={
                formulario.tipoArchivo ===
                "CSV"
                  ? "Separador de columnas."
                  : "No aplica para XLS o XLSX."
              }
            >
              <Select
                value={
                  formulario.tipoArchivo ===
                  "CSV"
                    ? formulario.delimitador
                    : ""
                }
                required={
                  formulario.tipoArchivo ===
                  "CSV"
                }
                disabled={
                  guardando ||
                  formulario.tipoArchivo !==
                    "CSV"
                }
                onChange={(
                  event
                ) =>
                  actualizarCampo(
                    "delimitador",
                    event.target.value
                  )
                }
              >
                {formulario.tipoArchivo !==
                "CSV" ? (
                  <option value="">
                    No aplica
                  </option>
                ) : (
                  <>
                    <option value=",">
                      Coma (,)
                    </option>

                    <option value=";">
                      Punto y coma (;)
                    </option>

                    <option value="|">
                      Barra vertical (|)
                    </option>
                  </>
                )}
              </Select>

              {errores.delimitador ? (
                <small
                  style={
                    estiloError()
                  }
                >
                  {
                    errores.delimitador
                  }
                </small>
              ) : null}
            </FormField>
          </div>


          {/* FORMATO DE FECHA */}

          <div className="campo-fecha">
            <FormField
              label="Formato de fecha"
              help="Formato utilizado en el archivo."
            >
              <Select
                value={
                  formulario.formatoFecha
                }
                required
                disabled={
                  guardando
                }
                onChange={(
                  event
                ) =>
                  actualizarCampo(
                    "formatoFecha",
                    event.target.value
                  )
                }
              >
                <option value="DD/MM/YYYY">
                  DD/MM/YYYY — Día/Mes/Año
                </option>

                <option value="YYYY-MM-DD">
                  YYYY-MM-DD — Año-Mes-Día
                </option>

                <option value="MM/DD/YYYY">
                  MM/DD/YYYY — Mes/Día/Año
                </option>
              </Select>

              {errores.formatoFecha ? (
                <small
                  style={
                    estiloError()
                  }
                >
                  {
                    errores.formatoFecha
                  }
                </small>
              ) : null}
            </FormField>
          </div>


          {/* FILA DE ENCABEZADO */}

          <div className="campo-fila">
            <FormField
              label="Fila de encabezado"
              help="Usa 0 si no tiene encabezado."
            >
              <NumericStepper
                value={
                  filaEncabezadoTexto
                }
                min={0}
                required
                disabled={
                  guardando
                }
                error={
                  Boolean(
                    errores.filaEncabezado
                  )
                }
                ariaLabel="Fila de encabezado"
                onChange={(
                  valor
                ) => {
                  setFilaEncabezadoTexto(
                    valor
                  );

                  limpiarErrorCampo(
                    "filaEncabezado"
                  );
                }}
                onInvalidCharacter={() =>
                  marcarErrorNumerico(
                    "filaEncabezado"
                  )
                }
              />

              {errores.filaEncabezado ? (
                <small
                  style={
                    estiloError()
                  }
                >
                  {
                    errores.filaEncabezado
                  }
                </small>
              ) : null}
            </FormField>
          </div>


          {/* ARCHIVO DE EJEMPLO */}

          <div className="campo-archivo">
            <FormField
              label="Archivo de ejemplo"
              help="ID del documento de referencia."
            >
              <NumericStepper
                value={
                  archivoEjemploTexto
                }
                min={1}
                required
                disabled={
                  guardando
                }
                error={
                  Boolean(
                    errores.archivoEjemploId
                  )
                }
                ariaLabel="Archivo de ejemplo"
                onChange={(
                  valor
                ) => {
                  setArchivoEjemploTexto(
                    valor
                  );

                  limpiarErrorCampo(
                    "archivoEjemploId"
                  );
                }}
                onInvalidCharacter={() =>
                  marcarErrorNumerico(
                    "archivoEjemploId"
                  )
                }
              />

              {errores.archivoEjemploId ? (
                <small
                  style={
                    estiloError()
                  }
                >
                  {
                    errores.archivoEjemploId
                  }
                </small>
              ) : null}
            </FormField>
          </div>


          {/* ESTADO */}

          <div className="campo-estado">
            <FormField
              label="Estado"
              help="Define si puede utilizarse."
            >
              <Select
                value={
                  formulario.estado
                }
                required
                disabled={
                  guardando
                }
                onChange={(
                  event
                ) =>
                  actualizarCampo(
                    "estado",
                    event.target.value as
                      | "ACTIVO"
                      | "INACTIVO"
                  )
                }
              >
                <option value="ACTIVO">
                  Activo
                </option>

                <option value="INACTIVO">
                  Inactivo
                </option>
              </Select>

              {errores.estado ? (
                <small
                  style={
                    estiloError()
                  }
                >
                  {
                    errores.estado
                  }
                </small>
              ) : null}
            </FormField>
          </div>
        </div>


        {/* BOTONES */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "flex-end",

            gap:
              "12px",

            marginTop:
              "28px",

            flexWrap:
              "wrap",
          }}
        >
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={
                onCancel
              }
              disabled={
                guardando
              }
            >
              Cancelar
            </Button>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            disabled={
              guardando
            }
          >
            {guardando
              ? "Guardando..."
              : submitLabel}
          </Button>
        </div>
      </form>
    </>
  );
}