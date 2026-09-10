import {
  useEffect,
  useRef,
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  FormField
} from "../../../../../shared/forms/FormField";

import {
  Input
} from "../../../../../shared/forms/Input";

import {
  Select
} from "../../../../../shared/forms/Select";

import {
  Button
} from "../../../../../shared/ui/Button";

import {
  ResponsiveFormLayout
} from "../../../common/layout/ResponsiveFormLayout";

import type {
  CatalogoFormData,
  CatalogoResponse,
  NaturalezaCatalogo
} from "../types/CatalogoBancario";

import {
  CatalogoFieldRules,
  type CatalogoFormErrors
} from "../rules/CatalogoFieldRules";

import {
  CatalogoPresentation
} from "../presentation/CatalogoPresentation";

import {
  CatalogoConfirmSummary
} from "./CatalogoConfirmSummary";


export type CatalogoFormMode =
  | "crear"
  | "editar";


type CatalogoFormProps = {

  catalogosExistentes?:
    CatalogoResponse[];

  modo:
    CatalogoFormMode;

  valoresIniciales?:
    CatalogoFormData;

  cargando?:
    boolean;

  onSubmit:
    (
      datos:
        CatalogoFormData
    ) => Promise<void>;

  onCancel?:
    () => void;
};


const VALORES_INICIALES:
  CatalogoFormData = {

  grupo: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  aplicaA: "",
  naturaleza: null,

  requiereComentario:
    "N",

  requiereEvidencia:
    "N",

  permiteReversion:
    "N"
};


export function CatalogoForm({
  modo,
  valoresIniciales,
  catalogosExistentes = [],
  cargando = false,
  onSubmit,
  onCancel
}: CatalogoFormProps) {

  const [
    datos,
    setDatos
  ] = useState<CatalogoFormData>(
    valoresIniciales ??
      VALORES_INICIALES
  );


  const [
    errores,
    setErrores
  ] = useState<CatalogoFormErrors>(
    {}
  );


  const [
    datosPendientes,
    setDatosPendientes
  ] = useState<CatalogoFormData | null>(
    null
  );


  const [
    errorGuardado,
    setErrorGuardado
  ] = useState<
    string | undefined
  >();


  const [
    guardando,
    setGuardando
  ] = useState(
    false
  );


  const descripcionRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );


  useEffect(
    () => {

      setDatos(
        valoresIniciales ??
          VALORES_INICIALES
      );


      setErrores(
        {}
      );


      setDatosPendientes(
        null
      );


      setErrorGuardado(
        undefined
      );

    },
    [
      valoresIniciales,
      modo
    ]
  );


  useEffect(
    () => {

      const elemento =
        descripcionRef.current;


      if (
        !elemento
      ) {
        return;
      }


      elemento.style.height =
        "auto";


      elemento.style.height =
        `${Math.max(
          70,
          elemento.scrollHeight
        )}px`;

    },
    [
      datos.descripcion
    ]
  );


  const bloqueado =
    cargando ||
    guardando;


  const esEdicion =
    modo ===
      "editar";


  const presentacion =
    CatalogoPresentation
      .obtenerFormularioVisual(
        datos.grupo
      );


  function actualizarCampo<
    K extends keyof CatalogoFormData
  >(
    campo:
      K,

    valor:
      CatalogoFormData[K]
  ) {

    setDatos(
      (
        actual
      ) => ({

        ...actual,

        [campo]:
          valor
      })
    );


    setErrores(
      (
        actual
      ) => ({

        ...actual,

        [campo]:
          undefined
      })
    );


    setErrorGuardado(
      undefined
    );
  }


  function renderError(
    mensaje:
      string | undefined
  ) {

    if (
      !mensaje
    ) {
      return null;
    }


    return (
      <p
        role=
          "alert"

        style={{
          margin:
            "5px 0 0",

          color:
            "#B42318",

          fontSize:
            "12px",

          overflowWrap:
            "anywhere"
        }}
      >
        {mensaje}
      </p>
    );
  }


  function renderAyuda(
    contenido:
      string
  ) {

    return (
      <small
        style={{
          display:
            "block",

          marginTop:
            "5px",

          color:
            "#667085",

          fontSize:
            "11px",

          lineHeight:
            1.4,

          overflowWrap:
            "anywhere"
        }}
      >
        {contenido}
      </small>
    );
  }


  function prepararConfirmacion(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    const preparados =
      CatalogoFieldRules
        .prepararDatos(
          datos
        );


    const nuevosErrores =
      CatalogoFieldRules
        .validarFormulario(
          preparados
        );


    if (
      Object.keys(
        nuevosErrores
      ).length >
        0
    ) {

      setErrores(
        nuevosErrores
      );


      return;
    }


    if (
      modo ===
        "crear"
    ) {

      const errorDuplicado =
        CatalogoFieldRules
          .validarCodigoDuplicado(
            preparados.grupo,
            preparados.codigo,
            catalogosExistentes
          );


      if (
        errorDuplicado
      ) {

        setErrores({
          codigo:
            errorDuplicado
        });


        return;
      }
    }


    setDatos(
      preparados
    );


    setDatosPendientes(
      preparados
    );


    setErrorGuardado(
      undefined
    );
  }


  async function confirmarGuardado() {

    if (
      !datosPendientes
    ) {
      return;
    }


    setGuardando(
      true
    );


    setErrorGuardado(
      undefined
    );


    try {

      await onSubmit(
        datosPendientes
      );

    } catch (
      error
    ) {

      setErrorGuardado(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el registro."
      );

    } finally {

      setGuardando(
        false
      );
    }
  }


  if (
    datosPendientes
  ) {

    return (
      <CatalogoConfirmSummary
        modo={
          modo
        }

        datos={
          datosPendientes
        }

        cargando={
          bloqueado
        }

        error={
          errorGuardado
        }

        onBack={() => {

          setDatosPendientes(
            null
          );


          setErrorGuardado(
            undefined
          );
        }}

        onConfirm={
          confirmarGuardado
        }
      />
    );
  }


  return (
    <ResponsiveFormLayout.Form
      onSubmit={
        prepararConfirmacion
      }

      noValidate
    >

      <p
        style={{
          margin:
            "-4px 0 0",

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
        {presentacion.descripcion}
      </p>


      {/* CÓDIGO + NOMBRE */}

      <ResponsiveFormLayout.Grid
        variant=
          "identity"
      >

        <FormField
          label=
            "Código *"
        >

          <div>

            <Input
              value={
                datos.codigo
              }

              onChange={(
                event
              ) =>
                actualizarCampo(
                  "codigo",

                  CatalogoFieldRules
                    .normalizarCodigo(
                      event.target.value
                    )
                )
              }

              onBlur={() => {

                const valor =
                  CatalogoFieldRules
                    .normalizarCodigo(
                      datos.codigo
                    );


                actualizarCampo(
                  "codigo",
                  valor
                );


                setErrores(
                  (
                    actual
                  ) => ({

                    ...actual,

                    codigo:
                      CatalogoFieldRules
                        .validarCodigo(
                          valor
                        )
                  })
                );
              }}

              maxLength={
                30
              }

              required

              disabled={
                bloqueado ||
                esEdicion
              }

              placeholder={
                presentacion.ejemploCodigo
              }

              style={{
                width:
                  "100%"
              }}
            />


            {renderAyuda(
              esEdicion
                ? "Identificador interno. No puede modificarse después de crear el registro."
                : "Obligatorio. Puede escribirlo normalmente; el sistema ajustará mayúsculas y espacios automáticamente."
            )}


            {renderError(
              errores.codigo
            )}

          </div>

        </FormField>


        <FormField
          label=
            "Nombre *"
        >

          <div>

            <Input
              value={
                datos.nombre
              }

              onChange={(
                event
              ) =>
                actualizarCampo(
                  "nombre",

                  CatalogoFieldRules
                    .normalizarNombre(
                      event.target.value
                    )
                )
              }

              onBlur={() => {

                const valor =
                  datos.nombre.trim();


                actualizarCampo(
                  "nombre",
                  valor
                );


                setErrores(
                  (
                    actual
                  ) => ({

                    ...actual,

                    nombre:
                      CatalogoFieldRules
                        .validarNombre(
                          valor
                        )
                  })
                );
              }}

              maxLength={
                80
              }

              required

              disabled={
                bloqueado
              }

              placeholder={
                presentacion.ejemploNombre
              }

              style={{
                width:
                  "100%"
              }}
            />


            {renderAyuda(
              "Obligatorio. Este es el texto que verá el usuario en listas, formularios y filtros."
            )}


            {renderError(
              errores.nombre
            )}

          </div>

        </FormField>

      </ResponsiveFormLayout.Grid>


      {/* DESCRIPCIÓN */}

      <FormField
        label=
          "Descripción"
      >

        <div>

          <textarea
            ref={
              descripcionRef
            }

            className=
              "form-input"

            value={
              datos.descripcion
            }

            onChange={(
              event
            ) =>
              actualizarCampo(
                "descripcion",

                CatalogoFieldRules
                  .normalizarDescripcion(
                    event.target.value
                  )
              )
            }

            onBlur={() => {

              const valor =
                datos.descripcion.trim();


              actualizarCampo(
                "descripcion",
                valor
              );


              setErrores(
                (
                  actual
                ) => ({

                  ...actual,

                  descripcion:
                    CatalogoFieldRules
                      .validarDescripcion(
                        valor
                      )
                })
              );
            }}

            rows={
              2
            }

            maxLength={
              250
            }

            disabled={
              bloqueado
            }

            placeholder={
              presentacion.ejemploDescripcion
            }

            style={{
              width:
                "100%",

              minHeight:
                "70px",

              boxSizing:
                "border-box",

              resize:
                "none",

              overflow:
                "hidden",

              lineHeight:
                1.5
            }}
          />


          {renderAyuda(
            "Opcional. Explique de forma sencilla para qué sirve este valor. Máximo 250 caracteres."
          )}


          {renderError(
            errores.descripcion
          )}

        </div>

      </FormField>


      {/* COMPORTAMIENTO */}

      <div
        style={{
          minWidth:
            0,

          padding:
            "16px 18px",

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
              "#344054",

            fontSize:
              "14px",

            fontWeight:
              600,

            overflowWrap:
              "anywhere"
          }}
        >
          ¿Qué debe pasar cuando se utilice este valor?
        </div>


        <p
          style={{
            margin:
              "0 0 16px",

            color:
              "#667085",

            fontSize:
              "11px",

            lineHeight:
              1.45
          }}
        >
          Estas opciones son independientes entre sí.
        </p>


        <ResponsiveFormLayout.Grid
          variant=
            "behavior"
        >

          <ResponsiveFormLayout.Card>

            <FormField
              label={
                datos.grupo ===
                  "TIPO_MOVIMIENTO"
                  ? "Naturaleza contable *"
                  : "Naturaleza contable"
              }
            >

              <div>

                <Select
                  value={
                    datos.naturaleza ??
                    ""
                  }

                  onChange={(
                    event
                  ) => {

                    const valor =
                      event.target.value;


                    const naturaleza:
                      NaturalezaCatalogo =
                        valor ===
                          ""
                          ? null
                          : valor as
                              NaturalezaCatalogo;


                    actualizarCampo(
                      "naturaleza",
                      naturaleza
                    );


                    setErrores(
                      (
                        actual
                      ) => ({

                        ...actual,

                        naturaleza:
                          CatalogoFieldRules
                            .validarNaturaleza(
                              datos.grupo,
                              naturaleza
                            )
                      })
                    );
                  }}

                  disabled={
                    bloqueado
                  }

                  style={{
                    width:
                      "100%"
                  }}
                >

                  <option
                    value=
                      ""
                  >
                    No aplica
                  </option>


                  <option
                    value=
                      "D"
                  >
                    Débito
                  </option>


                  <option
                    value=
                      "C"
                  >
                    Crédito
                  </option>

                </Select>


                {renderAyuda(
                  presentacion.ayudaNaturaleza
                )}


                {renderError(
                  errores.naturaleza
                )}

              </div>

            </FormField>

          </ResponsiveFormLayout.Card>


          <OpcionBooleana
            title=
              "¿Pedir un comentario?"

            description=
              "El usuario deberá explicar el motivo al utilizar este valor."

            checked={
              datos.requiereComentario ===
                "S"
            }

            disabled={
              bloqueado
            }

            onChange={(
              checked
            ) =>
              actualizarCampo(
                "requiereComentario",
                checked
                  ? "S"
                  : "N"
              )
            }
          />


          <OpcionBooleana
            title=
              "¿Pedir evidencia?"

            description=
              "Se deberá adjuntar un comprobante, archivo o documento de respaldo."

            checked={
              datos.requiereEvidencia ===
                "S"
            }

            disabled={
              bloqueado
            }

            onChange={(
              checked
            ) =>
              actualizarCampo(
                "requiereEvidencia",
                checked
                  ? "S"
                  : "N"
              )
            }
          />


          <OpcionBooleana
            title=
              "¿Permitir reversión?"

            description=
              "Una operación realizada con este valor podrá revertirse después."

            checked={
              datos.permiteReversion ===
                "S"
            }

            disabled={
              bloqueado
            }

            onChange={(
              checked
            ) =>
              actualizarCampo(
                "permiteReversion",
                checked
                  ? "S"
                  : "N"
              )
            }
          />

        </ResponsiveFormLayout.Grid>

      </div>


      <ResponsiveFormLayout.Actions>

        {onCancel ? (

          <Button
            type=
              "button"

            variant=
              "outline"

            onClick={
              onCancel
            }

            disabled={
              bloqueado
            }
          >
            Cancelar
          </Button>

        ) : null}


        <Button
          type=
            "submit"

          variant=
            "primary"

          disabled={
            bloqueado
          }
        >
          {esEdicion
            ? "Revisar cambios"
            : "Revisar antes de guardar"}
        </Button>

      </ResponsiveFormLayout.Actions>

    </ResponsiveFormLayout.Form>
  );
}


type OpcionBooleanaProps = {

  title:
    string;

  description:
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


function OpcionBooleana({
  title,
  description,
  checked,
  disabled,
  onChange
}: OpcionBooleanaProps) {

  return (
    <label
      style={{
        minWidth:
          0,

        display:
          "flex",

        alignItems:
          "flex-start",

        gap:
          "9px",

        padding:
          "13px",

        border:
          checked
            ? "1px solid #84ADFF"
            : "1px solid #EAECF0",

        borderRadius:
          "8px",

        background:
          checked
            ? "#F5F8FF"
            : "#FFFFFF",

        cursor:
          disabled
            ? "default"
            : "pointer"
      }}
    >

      <input
        type=
          "checkbox"

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

        style={{
          flexShrink:
            0,

          marginTop:
            "3px"
        }}
      />


      <span
        style={{
          minWidth:
            0
        }}
      >

        <strong
          style={{
            display:
              "block",

            marginBottom:
              "4px",

            color:
              "#344054",

            fontSize:
              "12px",

            fontWeight:
              600,

            overflowWrap:
              "anywhere"
          }}
        >
          {title}
        </strong>


        <small
          style={{
            display:
              "block",

            color:
              "#667085",

            fontSize:
              "11px",

            lineHeight:
              1.45,

            overflowWrap:
              "anywhere"
          }}
        >
          {description}
        </small>

      </span>

    </label>
  );
}
