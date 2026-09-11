import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { Alert } from "../../../../../shared/feedback/Alert";
import { EmptyState } from "../../../../../shared/feedback/EmptyState";
import { FormField } from "../../../../../shared/forms/FormField";
import { Input } from "../../../../../shared/forms/Input";
import { Select } from "../../../../../shared/forms/Select";
import { DataTable } from "../../../../../shared/tables/DataTable";
import { Button } from "../../../../../shared/ui/Button";

import {
  actualizarMapeo,
  crearMapeo,
  eliminarMapeo,
} from "../api/formatos-importacion.api";

import { useMapeosFormato } from "../hooks/useMapeosFormato";

import type {
  CrearMapeoFormato,
  MapeoFormato,
} from "../types/formatos-importacion.types";

type MapeoColumnasProps = {
  formatoId: number;
};

type ErroresFormulario = Partial<
  Record<
    keyof CrearMapeoFormato,
    string
  >
>;

const REGEX_CAMPO_SISTEMA =
  /^[A-Za-z][A-Za-z0-9_]*$/;

const REGEX_NOMBRE_COLUMNA =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ._-]+$/;

const REGEX_FORMATO_VALOR =
  /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ./_-]*$/;

const REGEX_SOLO_DIGITOS =
  /^\d*$/;

const valoresIniciales:
  CrearMapeoFormato = {
    campoSistema: "",
    nombreColumna: "",
    numeroColumna: null,
    esObligatorio: "S",
    formatoValor: "",
  };

function normalizarEspacios(
  valor: string
): string {
  return valor
    .trim()
    .replace(/\s+/g, " ");
}

function obtenerMensajeError(
  errores: ErroresFormulario,
  campo: keyof CrearMapeoFormato
) {
  const mensaje =
    errores[campo];

  if (!mensaje) {
    return null;
  }

  return (
    <small
      style={{
        display: "block",
        marginTop: "6px",
        color: "#b42318",
      }}
    >
      {mensaje}
    </small>
  );
}

export function MapeoColumnas({
  formatoId,
}: MapeoColumnasProps) {
  const {
    mapeos,
    cargando,
    error,
    cargarMapeos,
  } =
    useMapeosFormato(
      formatoId
    );

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    mapeoEditando,
    setMapeoEditando,
  ] =
    useState<MapeoFormato | null>(
      null
    );

  const [
    formulario,
    setFormulario,
  ] =
    useState<CrearMapeoFormato>(
      valoresIniciales
    );

  /*
   * Número de columna como texto.
   *
   * Permite borrar el valor completamente
   * sin convertir "" en 0.
   */
  const [
    numeroColumnaTexto,
    setNumeroColumnaTexto,
  ] =
    useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    eliminandoId,
    setEliminandoId,
  ] =
    useState<number | null>(
      null
    );

  const [
    mensaje,
    setMensaje,
  ] =
    useState<string | null>(
      null
    );

  const [
    errorFormulario,
    setErrorFormulario,
  ] =
    useState<string | null>(
      null
    );

  const [
    errores,
    setErrores,
  ] =
    useState<ErroresFormulario>(
      {}
    );

  /* ================================================
     MENSAJE TEMPORAL
     ================================================ */

  useEffect(() => {
    if (!mensaje) {
      return;
    }

    const temporizador =
      window.setTimeout(() => {
        setMensaje(null);
      }, 4000);

    return () => {
      window.clearTimeout(
        temporizador
      );
    };
  }, [mensaje]);

  /* ================================================
     BLOQUEAR SCROLL CUANDO HAY MODAL
     ================================================ */

  useEffect(() => {
    if (!mostrarFormulario) {
      return;
    }

    const anterior =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        anterior;
    };
  }, [mostrarFormulario]);

  /* ================================================
     ABRIR NUEVO
     ================================================ */

  function abrirNuevoMapeo() {
    setMapeoEditando(null);

    setFormulario({
      ...valoresIniciales,
    });

    setNumeroColumnaTexto(
      ""
    );

    setMostrarFormulario(
      true
    );

    setMensaje(null);
    setErrorFormulario(null);
    setErrores({});
  }

  /* ================================================
     ABRIR EDICIÓN
     ================================================ */

  function abrirEditarMapeo(
    mapeo: MapeoFormato
  ) {
    setMapeoEditando(
      mapeo
    );

    setFormulario({
      campoSistema:
        mapeo.campoSistema,

      nombreColumna:
        mapeo.nombreColumna ??
        "",

      numeroColumna:
        mapeo.numeroColumna,

      esObligatorio:
        mapeo.esObligatorio,

      formatoValor:
        mapeo.formatoValor ??
        "",
    });

    setNumeroColumnaTexto(
      mapeo.numeroColumna != null
        ? String(
            mapeo.numeroColumna
          )
        : ""
    );

    setMostrarFormulario(
      true
    );

    setMensaje(null);
    setErrorFormulario(null);
    setErrores({});
  }

  /* ================================================
     CERRAR MODAL
     ================================================ */

  function cerrarFormulario() {
    if (guardando) {
      return;
    }

    setMostrarFormulario(
      false
    );

    setMapeoEditando(
      null
    );

    setFormulario({
      ...valoresIniciales,
    });

    setNumeroColumnaTexto(
      ""
    );

    setErrorFormulario(
      null
    );

    setErrores({});
  }

  /* ================================================
     ACTUALIZAR CAMPOS
     ================================================ */

  function actualizarCampo<
    K extends keyof CrearMapeoFormato
  >(
    campo: K,
    valor:
      CrearMapeoFormato[K]
  ) {
    setFormulario(
      (actual) => ({
        ...actual,
        [campo]: valor,
      })
    );

    setErrores(
      (actuales) => ({
        ...actuales,
        [campo]: undefined,
      })
    );

    setErrorFormulario(
      null
    );
  }

  /* ================================================
     NÚMERO COLUMNA
     ================================================ */

  function manejarNumeroColumna(
    valor: string
  ) {
    /*
     * Solo permitimos dígitos.
     *
     * Se rechazan:
     * -
     * +
     * .
     * ,
     * e
     * letras
     * símbolos
     */
    if (
      !REGEX_SOLO_DIGITOS.test(
        valor
      )
    ) {
      setErrores(
        (actual) => ({
          ...actual,

          numeroColumna:
            "Solo se permiten números enteros positivos.",
        })
      );

      return;
    }

    setNumeroColumnaTexto(
      valor
    );

    actualizarCampo(
      "numeroColumna",
      valor === ""
        ? null
        : Number(valor)
    );
  }

  /* ================================================
     VALIDACIÓN
     ================================================ */

  function validarFormulario(): boolean {
    const nuevosErrores:
      ErroresFormulario = {};

    const campoSistema =
      formulario.campoSistema.trim();

    const nombreColumna =
      formulario.nombreColumna?.trim() ??
      "";

    const formatoValor =
      formulario.formatoValor?.trim() ??
      "";

    /* CAMPO SISTEMA */

    if (!campoSistema) {
      nuevosErrores.campoSistema =
        "El campo del sistema es obligatorio.";
    } else if (
      campoSistema.length >
      30
    ) {
      nuevosErrores.campoSistema =
        "El campo del sistema no puede superar 30 caracteres.";
    } else if (
      !REGEX_CAMPO_SISTEMA.test(
        campoSistema
      )
    ) {
      nuevosErrores.campoSistema =
        "Solo se permiten letras, números y guion bajo. Debe comenzar con una letra.";
    } else {
      const normalizado =
        campoSistema.toUpperCase();

      const duplicado =
        mapeos.some(
          (mapeo) =>
            mapeo.mapeoId !==
              mapeoEditando?.mapeoId &&
            mapeo.campoSistema
              .trim()
              .toUpperCase() ===
              normalizado
        );

      if (duplicado) {
        nuevosErrores.campoSistema =
          `El campo ${normalizado} ya está configurado en este formato.`;
      }
    }

    /* NOMBRE COLUMNA */

    if (nombreColumna) {
      if (
        nombreColumna.length >
        100
      ) {
        nuevosErrores.nombreColumna =
          "El nombre de la columna no puede superar 100 caracteres.";
      } else if (
        !REGEX_NOMBRE_COLUMNA.test(
          nombreColumna
        )
      ) {
        nuevosErrores.nombreColumna =
          "El nombre de la columna contiene caracteres no permitidos.";
      }
    }

    /* NÚMERO COLUMNA */

    if (
      numeroColumnaTexto !==
      ""
    ) {
      const numero =
        Number(
          numeroColumnaTexto
        );

      if (
        !Number.isSafeInteger(
          numero
        ) ||
        numero <= 0
      ) {
        nuevosErrores.numeroColumna =
          "El número de columna debe ser un entero mayor que 0.";
      }
    }

    /* NOMBRE O NÚMERO */

    const tieneNombre =
      nombreColumna.length >
      0;

    const tieneNumero =
      numeroColumnaTexto !==
        "" &&
      Number.isSafeInteger(
        Number(
          numeroColumnaTexto
        )
      ) &&
      Number(
        numeroColumnaTexto
      ) > 0;

    if (
      !tieneNombre &&
      !tieneNumero
    ) {
      nuevosErrores.nombreColumna =
        "Indica el nombre de la columna o su número.";

      nuevosErrores.numeroColumna =
        "Indica el número de columna o su nombre.";
    }

    /* OBLIGATORIO */

    if (
      formulario.esObligatorio !==
        "S" &&
      formulario.esObligatorio !==
        "N"
    ) {
      nuevosErrores.esObligatorio =
        "Selecciona una opción válida.";
    }

    /* FORMATO VALOR */

    if (formatoValor) {
      if (
        formatoValor.length >
        50
      ) {
        nuevosErrores.formatoValor =
          "El formato no puede superar 50 caracteres.";
      } else if (
        !REGEX_FORMATO_VALOR.test(
          formatoValor
        )
      ) {
        nuevosErrores.formatoValor =
          "El formato contiene caracteres no permitidos.";
      }
    }

    setErrores(
      nuevosErrores
    );

    const hayErrores =
      Object.values(
        nuevosErrores
      ).some(Boolean);

    if (hayErrores) {
      setErrorFormulario(
        "Revisa los campos señalados antes de guardar el mapeo."
      );

      return false;
    }

    return true;
  }

  /* ================================================
     GUARDAR
     ================================================ */

  async function manejarGuardarMapeo(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !validarFormulario()
    ) {
      return;
    }

    try {
      setGuardando(true);

      setMensaje(null);

      setErrorFormulario(
        null
      );

      const datosNormalizados:
        CrearMapeoFormato =
        {
          ...formulario,

          campoSistema:
            formulario.campoSistema
              .trim()
              .toUpperCase(),

          nombreColumna:
            formulario.nombreColumna?.trim()
              ? normalizarEspacios(
                  formulario.nombreColumna
                )
              : "",

          numeroColumna:
            numeroColumnaTexto ===
            ""
              ? null
              : Number(
                  numeroColumnaTexto
                ),

          esObligatorio:
            formulario.esObligatorio,

          formatoValor:
            formulario.formatoValor?.trim()
              ? formulario.formatoValor.trim()
              : "",
        };

      if (mapeoEditando) {
        await actualizarMapeo(
          mapeoEditando.mapeoId,
          datosNormalizados
        );

        setMensaje(
          "Mapeo actualizado correctamente."
        );
      } else {
        await crearMapeo(
          formatoId,
          datosNormalizados
        );

        setMensaje(
          "Mapeo creado correctamente."
        );
      }

      setMostrarFormulario(
        false
      );

      setMapeoEditando(
        null
      );

      setFormulario({
        ...valoresIniciales,
      });

      setNumeroColumnaTexto(
        ""
      );

      setErrores({});

      await cargarMapeos();
    } catch (err) {
      const mensajeError =
        err instanceof Error
          ? err.message
          : "No se pudo guardar el mapeo.";

      setErrorFormulario(
        mensajeError
      );
    } finally {
      setGuardando(false);
    }
  }

  /* ================================================
     ELIMINAR
     ================================================ */

  async function manejarEliminarMapeo(
    mapeo: MapeoFormato
  ) {
    const confirmar =
      window.confirm(
        `¿Deseas eliminar el mapeo "${mapeo.campoSistema}"?\n\nEsta acción no se puede deshacer.`
      );

    if (!confirmar) {
      return;
    }

    try {
      setEliminandoId(
        mapeo.mapeoId
      );

      setMensaje(null);

      setErrorFormulario(
        null
      );

      await eliminarMapeo(
        mapeo.mapeoId
      );

      setMensaje(
        `El mapeo ${mapeo.campoSistema} fue eliminado correctamente.`
      );

      await cargarMapeos();
    } catch (err) {
      const mensajeError =
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el mapeo.";

      setErrorFormulario(
        mensajeError
      );
    } finally {
      setEliminandoId(
        null
      );
    }
  }

  return (
    <div>
      <style>
        {`
          /* =============================================
             CABECERA MAPEO
             ============================================= */

          .mapeo-toolbar {
            display: flex;

            justify-content:
              space-between;

            align-items:
              center;

            gap: 16px;

            margin-bottom:
              20px;
          }

          .mapeo-toolbar h3 {
            margin:
              0 0 4px 0;

            color:
              #0f172a;

            font-size:
              18px;
          }

          .mapeo-toolbar p {
            margin: 0;

            color:
              #64748b;

            font-size:
              14px;
          }


          /* =============================================
             MENSAJE
             ============================================= */

          .mapeo-mensaje {
            margin-bottom:
              16px;

            animation:
              mapeoMensajeEntrada
                0.2s ease,
              mapeoMensajeSalida
                0.8s ease 3.2s
                forwards;
          }

          @keyframes mapeoMensajeEntrada {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes mapeoMensajeSalida {
            from {
              opacity: 1;
            }

            to {
              opacity: 0;
            }
          }


          /* =============================================
             MODAL MAPEO
             ============================================= */

          .mapeo-modal-overlay {
            position: fixed;

            inset: 0;

            z-index: 1200;

            display: flex;

            align-items:
              center;

            justify-content:
              center;

            padding:
              24px;

            background:
              rgba(
                15,
                23,
                42,
                0.60
              );

            backdrop-filter:
              blur(2px);

            animation:
              mapeoFondoEntrada
              0.18s ease-out;
          }

          .mapeo-modal {
            width:
              min(
                1000px,
                95vw
              );

            max-height:
              90vh;

            overflow-y:
              auto;

            padding:
              24px;

            border:
              1px solid #dbe3ef;

            border-radius:
              16px;

            background:
              #ffffff;

            box-shadow:
              0 24px 65px
              rgba(
                15,
                23,
                42,
                0.30
              );

            animation:
              mapeoModalEntrada
              0.20s ease-out;
          }

          .mapeo-modal__header {
            margin:
              -24px
              -24px
              22px
              -24px;

            padding:
              20px
              24px;

            background:
              #2563eb;

            border-radius:
              16px
              16px
              0
              0;

            border-bottom:
              1px solid #dbe3ef;
          }

          .mapeo-modal__header h4 {
            margin:
              0 0 6px 0;

            color:
              #ffffff;

            font-size:
              20px;
          }

          .mapeo-modal__header p {
            margin: 0;

            color:
              #dbeafe;

            font-size:
              14px;
          }

          @keyframes mapeoFondoEntrada {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes mapeoModalEntrada {
            from {
              opacity: 0;

              transform:
                translateY(12px)
                scale(0.985);
            }

            to {
              opacity: 1;

              transform:
                translateY(0)
                scale(1);
            }
          }


          /* =============================================
             GRID MODAL
             ============================================= */

          .mapeo-form-grid {
            display: grid;

            grid-template-columns:
              repeat(
                12,
                minmax(0, 1fr)
              );

            gap:
              18px 16px;

            align-items:
              start;
          }

          .mapeo-campo-sistema {
            grid-column:
              span 4;
          }

          .mapeo-nombre-columna {
            grid-column:
              span 4;
          }

          .mapeo-numero {
            grid-column:
              span 2;
          }

          .mapeo-obligatorio {
            grid-column:
              span 2;
          }

          .mapeo-formato {
            grid-column:
              span 4;
          }


          /* =============================================
             OBLIGATORIOS NARANJA
             ============================================= */

          .mapeo-modal
          .form-field:has(
            [required]
          )
          .form-field__label::after {
            content:
              " *";

            color:
              #f59e0b;

            font-weight:
              800;
          }


          /* =============================================
             TABLA MAPEOS
             ============================================= */

          .mapeos-tabla {
            border:
              1px solid #cbd5e1;

            border-radius:
              12px;

            overflow:
              hidden;

            background:
              #ffffff;
          }

          .mapeos-tabla table {
            width:
              100%;

            border-collapse:
              collapse;
          }

          .mapeos-tabla thead {
            background:
              #eff6ff;
          }

          .mapeos-tabla th {
            background:
              #eff6ff;

            color:
              #1e3a8a;

            font-weight:
              700;

            border-bottom:
              1px solid #bfdbfe;
          }

          .mapeos-tabla
          th:not(:last-child),
          .mapeos-tabla
          td:not(:last-child) {
            border-right:
              1px solid #e2e8f0;
          }

          .mapeos-tabla
          tbody
          tr:not(:last-child)
          td {
            border-bottom:
              1px solid #edf1f7;
          }

          .mapeos-tabla
          tbody
          tr:hover {
            background:
              #f8fbff;
          }


          /* =============================================
             RESPONSIVE
             ============================================= */

          @media (
            max-width: 800px
          ) {
            .mapeo-toolbar {
              align-items:
                flex-start;

              flex-direction:
                column;
            }

            .mapeo-form-grid {
              grid-template-columns:
                1fr;
            }

            .mapeo-campo-sistema,
            .mapeo-nombre-columna,
            .mapeo-numero,
            .mapeo-obligatorio,
            .mapeo-formato {
              grid-column:
                1;
            }

            .mapeo-modal-overlay {
              padding:
                12px;
            }

            .mapeo-modal {
              width:
                100%;

              padding:
                18px;
            }

            .mapeo-modal__header {
              margin:
                -18px
                -18px
                20px
                -18px;

              padding:
                18px;
            }
          }
        `}
      </style>


      {/* ================================================
          ENCABEZADO
          ================================================ */}

      <div className="mapeo-toolbar">
        <div>
          <h3>
            Mapeo de columnas
          </h3>

          <p>
            Define cómo las columnas del archivo bancario se relacionan con los campos utilizados por el sistema.
          </p>
        </div>

        <Button
          type="button"
          onClick={
            abrirNuevoMapeo
          }
          disabled={
            cargando ||
            guardando ||
            eliminandoId !==
              null
          }
        >
          Agregar mapeo
        </Button>
      </div>


      {/* ================================================
          MENSAJES
          ================================================ */}

      {mensaje ? (
        <div className="mapeo-mensaje">
          <Alert>
            {mensaje}
          </Alert>
        </div>
      ) : null}

      {errorFormulario &&
      !mostrarFormulario ? (
        <Alert>
          {
            errorFormulario
          }
        </Alert>
      ) : null}


      {/* ================================================
          MODAL NUEVO / EDITAR MAPEO
          ================================================ */}

      {mostrarFormulario ? (
        <div
          className="mapeo-modal-overlay"
          role="presentation"
        >
          <div
            className="mapeo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-mapeo-modal"
          >
            <div className="mapeo-modal__header">
              <h4
                id="titulo-mapeo-modal"
              >
                {mapeoEditando
                  ? "Editar mapeo de columna"
                  : "Nuevo mapeo de columna"}
              </h4>

              <p>
                Indica qué campo del sistema corresponde a una columna del archivo bancario. Debes especificar por lo menos el nombre o el número de columna.
              </p>
            </div>

            {errorFormulario ? (
              <div
                style={{
                  marginBottom:
                    "18px",
                }}
              >
                <Alert>
                  {
                    errorFormulario
                  }
                </Alert>
              </div>
            ) : null}

            <form
              onSubmit={
                manejarGuardarMapeo
              }
              noValidate
            >
              <div className="mapeo-form-grid">

                {/* CAMPO SISTEMA */}

                <div className="mapeo-campo-sistema">
                  <FormField
                    label="Campo del sistema"
                    help="Ejemplo: FECHA, DESCRIPCION o NUMERO_DOCUMENTO."
                  >
                    <Input
                      type="text"
                      required
                      maxLength={30}
                      autoComplete="off"
                      value={
                        formulario.campoSistema
                      }
                      placeholder="Ej. FECHA"
                      disabled={
                        guardando
                      }
                      onChange={(
                        event
                      ) => {
                        const valor =
                          event.target.value
                            .toUpperCase();

                        if (
                          valor ===
                            "" ||
                          /^[A-Z0-9_]*$/.test(
                            valor
                          )
                        ) {
                          actualizarCampo(
                            "campoSistema",
                            valor
                          );
                        }
                      }}
                    />

                    {obtenerMensajeError(
                      errores,
                      "campoSistema"
                    )}
                  </FormField>
                </div>


                {/* NOMBRE COLUMNA */}

                <div className="mapeo-nombre-columna">
                  <FormField
                    label="Nombre de columna"
                    help="Nombre que aparece en el encabezado. Ejemplo: Fecha."
                  >
                    <Input
                      type="text"
                      maxLength={
                        100
                      }
                      autoComplete="off"
                      value={
                        formulario.nombreColumna ??
                        ""
                      }
                      placeholder="Ej. Fecha"
                      disabled={
                        guardando
                      }
                      onChange={(
                        event
                      ) => {
                        const valor =
                          event.target.value;

                        if (
                          valor ===
                            "" ||
                          REGEX_NOMBRE_COLUMNA.test(
                            valor
                          )
                        ) {
                          actualizarCampo(
                            "nombreColumna",
                            valor
                          );
                        }
                      }}
                    />

                    {obtenerMensajeError(
                      errores,
                      "nombreColumna"
                    )}
                  </FormField>
                </div>


                {/* NÚMERO COLUMNA */}

                <div className="mapeo-numero">
                  <FormField
                    label="Número"
                    help="Posición de la columna."
                  >
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={
                        numeroColumnaTexto
                      }
                      placeholder="Ej. 1"
                      disabled={
                        guardando
                      }
                      onChange={(
                        event
                      ) =>
                        manejarNumeroColumna(
                          event.target.value
                        )
                      }
                    />

                    {obtenerMensajeError(
                      errores,
                      "numeroColumna"
                    )}
                  </FormField>
                </div>


                {/* OBLIGATORIO */}

                <div className="mapeo-obligatorio">
                  <FormField
                    label="Obligatorio"
                    help="¿Debe venir en el archivo?"
                  >
                    <Select
                      required
                      value={
                        formulario.esObligatorio
                      }
                      disabled={
                        guardando
                      }
                      onChange={(
                        event
                      ) =>
                        actualizarCampo(
                          "esObligatorio",
                          event.target
                            .value as
                            | "S"
                            | "N"
                        )
                      }
                    >
                      <option value="S">
                        Sí
                      </option>

                      <option value="N">
                        No
                      </option>
                    </Select>

                    {obtenerMensajeError(
                      errores,
                      "esObligatorio"
                    )}
                  </FormField>
                </div>


                {/* FORMATO VALOR */}

                <div className="mapeo-formato">
                  <FormField
                    label="Formato del valor"
                    help="Opcional. Ej.: DD/MM/YYYY, TEXTO o DECIMAL."
                  >
                    <Input
                      type="text"
                      maxLength={
                        50
                      }
                      autoComplete="off"
                      value={
                        formulario.formatoValor ??
                        ""
                      }
                      placeholder="Ej. DD/MM/YYYY"
                      disabled={
                        guardando
                      }
                      onChange={(
                        event
                      ) => {
                        const valor =
                          event.target.value;

                        if (
                          valor ===
                            "" ||
                          REGEX_FORMATO_VALOR.test(
                            valor
                          )
                        ) {
                          actualizarCampo(
                            "formatoValor",
                            valor
                          );
                        }
                      }}
                    />

                    {obtenerMensajeError(
                      errores,
                      "formatoValor"
                    )}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    cerrarFormulario
                  }
                  disabled={
                    guardando
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={
                    guardando
                  }
                >
                  {guardando
                    ? "Guardando..."
                    : mapeoEditando
                      ? "Actualizar mapeo"
                      : "Guardar mapeo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}


      {/* ================================================
          ERROR CARGA
          ================================================ */}

      {error ? (
        <Alert>
          <p>{error}</p>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              void cargarMapeos()
            }
          >
            Reintentar
          </Button>
        </Alert>
      ) : null}


      {/* ================================================
          CONTENIDO
          ================================================ */}

      {cargando ? (
        <p>
          Cargando mapeos...
        </p>
      ) : mapeos.length ===
        0 ? (
        <EmptyState
          title="Sin mapeos configurados"
          description="Este formato todavía no tiene columnas mapeadas. Utiliza “Agregar mapeo” para configurar la primera."
        />
      ) : (
        <div className="mapeos-tabla">
          <DataTable
            headers={[
              "Campo del sistema",
              "Columna del archivo",
              "Número",
              "Obligatorio",
              "Formato",
              "Acciones",
            ]}
          >
            {mapeos.map(
              (mapeo) => (
                <tr
                  key={
                    mapeo.mapeoId
                  }
                >
                  <td>
                    <strong>
                      {
                        mapeo.campoSistema
                      }
                    </strong>
                  </td>

                  <td>
                    {
                      mapeo.nombreColumna ||
                      "—"
                    }
                  </td>

                  <td>
                    {
                      mapeo.numeroColumna ??
                      "—"
                    }
                  </td>

                  <td>
                    {
                      mapeo.esObligatorio ===
                      "S"
                        ? "Sí"
                        : "No"
                    }
                  </td>

                  <td>
                    {
                      mapeo.formatoValor ||
                      "—"
                    }
                  </td>

                  <td>
                    <div
                      style={{
                        display:
                          "flex",

                        gap:
                          "8px",

                        flexWrap:
                          "wrap",
                      }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          guardando ||
                          eliminandoId !==
                            null
                        }
                        onClick={() =>
                          abrirEditarMapeo(
                            mapeo
                          )
                        }
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        disabled={
                          guardando ||
                          eliminandoId !==
                            null
                        }
                        onClick={() =>
                          void manejarEliminarMapeo(
                            mapeo
                          )
                        }
                      >
                        {eliminandoId ===
                        mapeo.mapeoId
                          ? "Eliminando..."
                          : "Eliminar"}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </DataTable>
        </div>
      )}
    </div>
  );
}