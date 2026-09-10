import {
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
  Button
} from "../../../../../shared/ui/Button";

import type {
  BancoFormData
} from "../types/BancoFormData";

import type {
  EstadoActivoInactivo
} from "../rules/EstadoActivoInactivo";

import {
  BancoFieldRules
} from "../rules/BancoFieldRules";

import {
  BancoBackendErrorRules
} from "../rules/BancoBackendErrorRules";

import {
  BancoDuplicateRules,
  type BancoReferenciaCodigo
} from "../rules/BancoDuplicateRules";

import {
  BancoApiError
} from "../api/bancosApi";

import {
  BancoConfirmDialog,
  type ModoBancoForm
} from "./BancoConfirmDialog";


type BancoFormProps = {

  initialValues?:
    BancoFormData;

  submitLabel?:
    string;

  cargando?:
    boolean;

  modo?:
    ModoBancoForm;

  bancoId?:
    number;

  estadoActual?:
    EstadoActivoInactivo;

  bancosExistentes?:
    BancoReferenciaCodigo[];

  onSubmit:
    (
      datos:
        BancoFormData
    ) => Promise<void> | void;

  onCancel?:
    () => void;
};


type CampoActivo =
  | "codigoBanco"
  | "nombre"
  | "bicSwift"
  | null;


type ErroresFormulario = {

  codigoBanco?:
    string;

  nombre?:
    string;

  bicSwift?:
    string;
};


type EstadoVisual = {

  texto:
    string;

  tipo:
    | "VALIDO"
    | "ERROR"
    | "ADVERTENCIA"
    | "NEUTRAL";
};


const valoresIniciales:
  BancoFormData = {

  codigoBanco:
    "",

  nombre:
    "",

  bicSwift:
    null
};


export function BancoForm({
  initialValues = valoresIniciales,
  submitLabel = "Guardar banco",
  cargando = false,
  modo = "CREAR",
  bancoId,
  estadoActual = "ACTIVO",
  bancosExistentes = [],
  onSubmit,
  onCancel
}: BancoFormProps) {

  // =====================================================
  // CONTEXTO
  // =====================================================

  const esEdicion =
    modo === "EDITAR";


  // =====================================================
  // DATOS
  // =====================================================

  const [
    codigoBanco,
    setCodigoBanco
  ] = useState(
    initialValues.codigoBanco
  );


  const [
    nombre,
    setNombre
  ] = useState(
    initialValues.nombre
  );


  const [
    bicSwift,
    setBicSwift
  ] = useState(
    initialValues.bicSwift ??
    ""
  );


  const [
    omitirBicSwift,
    setOmitirBicSwift
  ] = useState(
    esEdicion
      ? initialValues.bicSwift === null
      : false
  );


  const [
    campoActivo,
    setCampoActivo
  ] = useState<CampoActivo>(
    null
  );


  const [
    errores,
    setErrores
  ] = useState<ErroresFormulario>(
    {}
  );


  // =====================================================
  // CONFIRMACIÓN
  // =====================================================

  const [
    datosPendientes,
    setDatosPendientes
  ] = useState<BancoFormData | null>(
    null
  );


  const [
    advertenciasPendientes,
    setAdvertenciasPendientes
  ] = useState<string[]>(
    []
  );


  const [
    errorGuardado,
    setErrorGuardado
  ] = useState<string | undefined>(
    undefined
  );


  const [
    guardando,
    setGuardando
  ] = useState(
    false
  );


  // =====================================================
  // VALIDACIONES VISUALES
  // =====================================================

  const codigoValido =
    codigoBanco.length > 0 &&
    !BancoFieldRules
      .validarCodigo(
        codigoBanco
      );


  const nombreValido =
    nombre.length > 0 &&
    !BancoFieldRules
      .validarNombre(
        nombre
      );


  const bicSwiftValido =
    !omitirBicSwift &&
    bicSwift.length > 0 &&
    !BancoFieldRules
      .validarBicSwift(
        bicSwift,
        false
      );


  // =====================================================
  // ADVERTENCIAS
  // =====================================================

  const evaluacionCodigo =
    BancoFieldRules
      .evaluarCodigo(
        codigoBanco
      );


  const evaluacionNombre =
    BancoFieldRules
      .evaluarNombre(
        nombre
      );


  const evaluacionBicSwift =
    BancoFieldRules
      .evaluarBicSwift(
        bicSwift,
        omitirBicSwift
      );


  // =====================================================
  // DUPLICADO
  // =====================================================

  function obtenerErrorCodigoDuplicado(
    valor:
      string
  ): string | undefined {

    return BancoDuplicateRules
      .validarCodigoDuplicado(
        valor,
        bancosExistentes,
        bancoId
      );
  }


  // =====================================================
  // VALIDACIÓN COMPLETA
  // =====================================================

  function validarFormulario():
    boolean {

    const errorCodigoFormato =
      BancoFieldRules
        .validarCodigo(
          codigoBanco
        );


    const errorCodigoDuplicado =
      errorCodigoFormato
        ? undefined
        : obtenerErrorCodigoDuplicado(
            codigoBanco
          );


    const nuevosErrores:
      ErroresFormulario = {

      codigoBanco:
        errorCodigoFormato ??
        errorCodigoDuplicado,

      nombre:
        BancoFieldRules
          .validarNombre(
            nombre
          ),

      bicSwift:
        BancoFieldRules
          .validarBicSwift(
            bicSwift,
            omitirBicSwift
          )
    };


    setErrores(
      nuevosErrores
    );


    return !Object.values(
      nuevosErrores
    ).some(
      Boolean
    );
  }


  // =====================================================
  // ESTADO CÓDIGO
  // =====================================================

  function estadoCodigo():
    EstadoVisual | null {

    if (
      errores.codigoBanco
    ) {

      return {
        texto:
          errores.codigoBanco,

        tipo:
          "ERROR"
      };
    }


    if (
      codigoValido &&
      evaluacionCodigo.tieneAdvertencias
    ) {

      return {
        texto:
          `⚠ ${evaluacionCodigo.mensajes[0]}`,

        tipo:
          "ADVERTENCIA"
      };
    }


    if (
      codigoValido
    ) {

      return {
        texto:
          "✓ Formato correcto",

        tipo:
          "VALIDO"
      };
    }


    if (
      campoActivo ===
      "codigoBanco"
    ) {

      return {
        texto:
          "Ej. BI, BAM o BANRURAL · Entre 2 y 10 caracteres · Solo letras y números",

        tipo:
          "NEUTRAL"
      };
    }


    return null;
  }


  // =====================================================
  // ESTADO NOMBRE
  // =====================================================

  function estadoNombre():
    EstadoVisual | null {

    if (
      errores.nombre
    ) {

      return {
        texto:
          errores.nombre,

        tipo:
          "ERROR"
      };
    }


    if (
      nombreValido &&
      evaluacionNombre.tieneAdvertencias
    ) {

      return {
        texto:
          `⚠ ${evaluacionNombre.mensajes[0]}`,

        tipo:
          "ADVERTENCIA"
      };
    }


    if (
      nombreValido
    ) {

      return {
        texto:
          "✓ Formato correcto",

        tipo:
          "VALIDO"
      };
    }


    if (
      campoActivo ===
      "nombre"
    ) {

      return {
        texto:
          "Ej. Banco Industrial, S. A. · Entre 3 y 100 caracteres",

        tipo:
          "NEUTRAL"
      };
    }


    return null;
  }


  // =====================================================
  // ESTADO BIC / SWIFT
  // =====================================================

  function estadoBicSwift():
    EstadoVisual | null {

    if (
      omitirBicSwift
    ) {

      return {
        texto:
          "No se registrará BIC / SWIFT para este banco.",

        tipo:
          "NEUTRAL"
      };
    }


    if (
      errores.bicSwift
    ) {

      return {
        texto:
          errores.bicSwift,

        tipo:
          "ERROR"
      };
    }


    if (
      bicSwiftValido &&
      evaluacionBicSwift.tieneAdvertencias
    ) {

      return {
        texto:
          `⚠ ${evaluacionBicSwift.mensajes[0]}`,

        tipo:
          "ADVERTENCIA"
      };
    }


    if (
      bicSwiftValido
    ) {

      return {
        texto:
          "✓ Formato BIC / SWIFT correcto",

        tipo:
          "VALIDO"
      };
    }


    if (
      campoActivo ===
      "bicSwift"
    ) {

      return {
        texto:
          "Ej. INDLGTGCXXX · 4 letras banco + 2 país + 2 ubicación + 3 de sucursal opcionales",

        tipo:
          "NEUTRAL"
      };
    }


    return null;
  }


  // =====================================================
  // RENDER ESTADO
  // =====================================================

  function renderEstado(
    estado:
      EstadoVisual | null
  ) {

    if (!estado) {
      return null;
    }


    let color =
      "#667085";


    if (
      estado.tipo ===
      "VALIDO"
    ) {
      color =
        "#16794A";
    }


    if (
      estado.tipo ===
      "ERROR"
    ) {
      color =
        "#B42318";
    }


    if (
      estado.tipo ===
      "ADVERTENCIA"
    ) {
      color =
        "#B54708";
    }


    return (
      <small
        style={{
          display:
            "block",

          marginTop:
            "5px",

          color,

          fontSize:
            "12px",

          lineHeight:
            "1.4"
        }}
      >
        {estado.texto}
      </small>
    );
  }


  // =====================================================
  // OMITIR BIC
  // =====================================================

  function manejarOmitirBicSwift(
    marcado:
      boolean
  ): void {

    setOmitirBicSwift(
      marcado
    );


    setErrorGuardado(
      undefined
    );


    if (
      marcado
    ) {

      setBicSwift(
        ""
      );


      setErrores(
        (
          actual
        ) => ({

          ...actual,

          bicSwift:
            undefined
        })
      );


      if (
        campoActivo ===
        "bicSwift"
      ) {

        setCampoActivo(
          null
        );
      }
    }
  }


  // =====================================================
  // PREPARAR CONFIRMACIÓN
  // =====================================================

  function manejarSubmit(
    event:
      FormEvent<HTMLFormElement>
  ): void {

    event.preventDefault();


    setErrorGuardado(
      undefined
    );


    if (
      !validarFormulario()
    ) {
      return;
    }


    const datos:
      BancoFormData = {

      codigoBanco:
        codigoBanco.trim(),

      nombre:
        nombre.trim(),

      bicSwift:
        omitirBicSwift
          ? null
          : bicSwift.trim()
    };


    const advertencias = [

      ...BancoFieldRules
        .evaluarCodigo(
          codigoBanco
        )
        .mensajes,

      ...BancoFieldRules
        .evaluarNombre(
          nombre
        )
        .mensajes,

      ...BancoFieldRules
        .evaluarBicSwift(
          bicSwift,
          omitirBicSwift
        )
        .mensajes
    ];


    const advertenciasUnicas =
      Array.from(
        new Set(
          advertencias
        )
      );


    setAdvertenciasPendientes(
      advertenciasUnicas
    );


    setDatosPendientes(
      datos
    );
  }


  // =====================================================
  // GUARDAR DEFINITIVO
  // =====================================================

  async function confirmarGuardado():
    Promise<void> {

    if (
      !datosPendientes ||
      guardando
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

      if (
        error instanceof
          BancoApiError
      ) {

        const campo =
          BancoBackendErrorRules
            .obtenerCampo(
              error.code
            );


        if (
          campo
        ) {

          setDatosPendientes(
            null
          );


          setAdvertenciasPendientes(
            []
          );


          setErrores(
            (
              actual
            ) => ({

              ...actual,

              [campo]:
                error.message
            })
          );


          setErrorGuardado(
            undefined
          );


          return;
        }


        setErrorGuardado(
          error.message
        );


        return;
      }


      if (
        error instanceof Error
      ) {

        setErrorGuardado(
          error.message
        );


        return;
      }


      setErrorGuardado(
        esEdicion
          ? "No fue posible actualizar el banco."
          : "No fue posible guardar el banco."
      );

    } finally {

      setGuardando(
        false
      );
    }
  }


  // =====================================================
  // VOLVER A EDITAR
  // =====================================================

  function volverAEditar():
    void {

    setDatosPendientes(
      null
    );


    setAdvertenciasPendientes(
      []
    );


    setErrorGuardado(
      undefined
    );
  }


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <>

      <form
        onSubmit={
          manejarSubmit
        }

        noValidate
      >

        {/* CÓDIGO */}

        <FormField
          label=
            "Código / sigla del banco"

          required
        >

          <div>

            <Input
              value={
                codigoBanco
              }

              onChange={(
                event
              ) => {

                const valor =
                  BancoFieldRules
                    .normalizarCodigo(
                      event.target.value
                    );


                setCodigoBanco(
                  valor
                );


                setErrorGuardado(
                  undefined
                );


                const errorFormato =
                  BancoFieldRules
                    .validarCodigo(
                      valor
                    );


                const errorDuplicado =
                  errorFormato
                    ? undefined
                    : obtenerErrorCodigoDuplicado(
                        valor
                      );


                setErrores(
                  (
                    actual
                  ) => ({

                    ...actual,

                    codigoBanco:
                      errorDuplicado
                  })
                );
              }}

              onFocus={() =>
                setCampoActivo(
                  "codigoBanco"
                )
              }

              onBlur={() => {

                setCampoActivo(
                  null
                );


                const errorFormato =
                  BancoFieldRules
                    .validarCodigo(
                      codigoBanco
                    );


                const errorDuplicado =
                  errorFormato
                    ? undefined
                    : obtenerErrorCodigoDuplicado(
                        codigoBanco
                      );


                setErrores(
                  (
                    actual
                  ) => ({

                    ...actual,

                    codigoBanco:
                      errorFormato ??
                      errorDuplicado
                  })
                );
              }}

              minLength={
                2
              }

              maxLength={
                10
              }

              required

              disabled={
                cargando ||
                guardando
              }

              placeholder=
                "Ej. BI"

              style={{
                width:
                  "100%",

                maxWidth:
                  "180px"
              }}
            />


            {renderEstado(
              estadoCodigo()
            )}

          </div>

        </FormField>


        {/* NOMBRE */}

        <FormField
          label=
            "Nombre del banco"

          required
        >

          <div>

            <Input
              value={
                nombre
              }

              onChange={(
                event
              ) => {

                const valor =
                  BancoFieldRules
                    .normalizarNombre(
                      event.target.value
                    );


                setNombre(
                  valor
                );


                setErrorGuardado(
                  undefined
                );


                setErrores(
                  (
                    actual
                  ) => ({

                    ...actual,

                    nombre:
                      undefined
                  })
                );
              }}

              onFocus={() =>
                setCampoActivo(
                  "nombre"
                )
              }

              onBlur={() => {

                const nombreLimpio =
                  nombre.trim();


                setNombre(
                  nombreLimpio
                );


                setCampoActivo(
                  null
                );


                setErrores(
                  (
                    actual
                  ) => ({

                    ...actual,

                    nombre:
                      BancoFieldRules
                        .validarNombre(
                          nombreLimpio
                        )
                  })
                );
              }}

              minLength={
                3
              }

              maxLength={
                100
              }

              required

              disabled={
                cargando ||
                guardando
              }

              placeholder=
                "Ej. Banco Industrial, S. A."

              style={{
                width:
                  "100%",

                maxWidth:
                  "520px"
              }}
            />


            {renderEstado(
              estadoNombre()
            )}

          </div>

        </FormField>


        {/* BIC / SWIFT */}

        <FormField
          label=
            "BIC / SWIFT"
        >

          <div>

            <Input
              value={
                bicSwift
              }

              onChange={(
                event
              ) => {

                const valor =
                  BancoFieldRules
                    .normalizarBicSwift(
                      event.target.value
                    );


                setBicSwift(
                  valor
                );


                setErrorGuardado(
                  undefined
                );


                setErrores(
                  (
                    actual
                  ) => ({

                    ...actual,

                    bicSwift:
                      undefined
                  })
                );
              }}

              onFocus={() =>
                setCampoActivo(
                  "bicSwift"
                )
              }

              onBlur={() => {

                setCampoActivo(
                  null
                );


                setErrores(
                  (
                    actual
                  ) => ({

                    ...actual,

                    bicSwift:
                      BancoFieldRules
                        .validarBicSwift(
                          bicSwift,
                          omitirBicSwift
                        )
                  })
                );
              }}

              maxLength={
                11
              }

              required={
                !omitirBicSwift
              }

              disabled={
                cargando ||
                guardando ||
                omitirBicSwift
              }

              placeholder={
                omitirBicSwift
                  ? "No se registrará"
                  : "Ej. INDLGTGCXXX"
              }

              style={{
                width:
                  "100%",

                maxWidth:
                  "210px"
              }}
            />


            <label
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "8px",

                marginTop:
                  "10px",

                fontSize:
                  "13px",

                cursor:
                  cargando ||
                  guardando
                    ? "default"
                    : "pointer"
              }}
            >

              <input
                type="checkbox"

                checked={
                  omitirBicSwift
                }

                onChange={(
                  event
                ) =>
                  manejarOmitirBicSwift(
                    event.target.checked
                  )
                }

                disabled={
                  cargando ||
                  guardando
                }
              />


              <span>
                No registrar BIC / SWIFT para este banco
              </span>

            </label>


            {renderEstado(
              estadoBicSwift()
            )}

          </div>

        </FormField>


        {/* ACCIONES */}

        <div>

          {onCancel ? (

            <Button
              type="button"

              variant="outline"

              onClick={
                onCancel
              }

              disabled={
                cargando ||
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
              cargando ||
              guardando
            }
          >
            {submitLabel}
          </Button>

        </div>

      </form>


      {/* CONFIRMACIÓN */}

      {datosPendientes ? (

        <BancoConfirmDialog
          datos={
            datosPendientes
          }

          modo={
            modo
          }

          bancoId={
            bancoId
          }

          estadoActual={
            estadoActual
          }

          advertencias={
            advertenciasPendientes
          }

          error={
            errorGuardado
          }

          cargando={
            cargando ||
            guardando
          }

          onCancel={
            volverAEditar
          }

          onConfirm={
            confirmarGuardado
          }
        />

      ) : null}

    </>
  );
}