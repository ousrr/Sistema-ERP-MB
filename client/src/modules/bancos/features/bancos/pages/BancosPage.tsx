import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  PageHeader
} from "../../../../../shared/layout/PageHeader";

import {
  SearchInput
} from "../../../../../shared/forms/SearchInput";

import {
  DataTable
} from "../../../../../shared/tables/DataTable";

import {
  Badge
} from "../../../../../shared/ui/Badge";

import {
  Button
} from "../../../../../shared/ui/Button";

import {
  IconButton
} from "../../../../../shared/ui/IconButton";

import {
  ListFilterMenu
} from "../../../common/components/ListFilterMenu";

import {
  ListFilterRules,
  type EstadoListaFiltro,
  type OrdenAlfabetico
} from "../../../common/list/ListFilterRules";

import {
  BancoForm
} from "../components/BancoForm";

import {
  BancoModal
} from "../components/BancoModal";

import {
  BancoSuccessMessage
} from "../components/BancoSuccessMessage";

import {
  BancoLoadError
} from "../components/BancoLoadError";

import {
  EstadoActionButton
} from "../components/EstadoActionButton";

import {
  ConfirmStateDialog
} from "../components/ConfirmStateDialog";

import {
  EstadoActivoInactivoAction
} from "../rules/EstadoActivoInactivo";

import {
  BancoLifecycleRules
} from "../rules/BancoLifecycleRules";

import {
  BancoFeedbackMessages
} from "../rules/BancoFeedbackMessages";

import {
  BancoApiError,
  listarBancos,
  crearBanco,
  actualizarBanco,
  cambiarEstadoBanco,
  type BancoResponse
} from "../api/bancosApi";

import type {
  BancoFormData
} from "../types/BancoFormData";

import "./BancosPage.css";


export function BancosPage() {

  // =====================================================
  // DATOS
  // =====================================================

  const [
    bancos,
    setBancos
  ] = useState<BancoResponse[]>(
    []
  );


  const [
    cargando,
    setCargando
  ] = useState(
    true
  );


  const [
    errorCarga,
    setErrorCarga
  ] = useState<string | null>(
    null
  );


  // =====================================================
  // MENSAJE DE ÉXITO
  // =====================================================

  const [
    mensajeExito,
    setMensajeExito
  ] = useState<string | null>(
    null
  );


  // =====================================================
  // BÚSQUEDA + FILTRO REUTILIZABLE
  // =====================================================

  const [
    busqueda,
    setBusqueda
  ] = useState(
    ""
  );


  const [
    filtroEstado,
    setFiltroEstado
  ] = useState<EstadoListaFiltro>(
    "TODOS"
  );


  const [
    ordenAlfabetico,
    setOrdenAlfabetico
  ] = useState<OrdenAlfabetico>(
    "AZ"
  );


  // =====================================================
  // PAGINACIÓN
  // =====================================================

  const [
    paginaActual,
    setPaginaActual
  ] = useState(
    1
  );


  const [
    registrosPorPagina,
    setRegistrosPorPagina
  ] = useState(
    20
  );


  // =====================================================
  // FORMULARIO
  // =====================================================

  const [
    mostrarFormulario,
    setMostrarFormulario
  ] = useState(
    false
  );


  const [
    guardando,
    setGuardando
  ] = useState(
    false
  );


  const [
    bancoEditando,
    setBancoEditando
  ] = useState<BancoResponse | null>(
    null
  );


  // =====================================================
  // CAMBIO DE ESTADO
  // =====================================================

  const [
    bancoCambioEstado,
    setBancoCambioEstado
  ] = useState<BancoResponse | null>(
    null
  );


  const [
    cambiandoEstado,
    setCambiandoEstado
  ] = useState(
    false
  );


  const [
    errorEstado,
    setErrorEstado
  ] = useState<string | undefined>(
    undefined
  );


  // =====================================================
  // CARGAR BANCOS
  // =====================================================

  async function cargarBancos():
    Promise<void> {

    try {

      setCargando(
        true
      );


      setErrorCarga(
        null
      );


      const datos =
        await listarBancos();


      setBancos(
        datos
      );

    } catch (
      error
    ) {

      console.error(
        "Error al cargar bancos:",
        error
      );


      if (
        error instanceof BancoApiError
      ) {

        setErrorCarga(
          error.message
        );

      } else {

        setErrorCarga(
          "No fue posible cargar los bancos. Verifica la conexión e inténtalo nuevamente."
        );
      }

    } finally {

      setCargando(
        false
      );
    }
  }


  useEffect(
    () => {

      void cargarBancos();

    },
    []
  );


  // =====================================================
  // FILTRADO + ORDEN
  //
  // 1. Búsqueda propia de la feature.
  // 2. Estado + orden reutilizable mediante ListFilterRules.
  // =====================================================

  const bancosFiltrados =
    useMemo(
      () => {

        const texto =
          busqueda
            .trim()
            .toLocaleLowerCase();


        const resultadosBusqueda =
          bancos.filter(
            (
              banco
            ) => {

              return (
                texto === "" ||

                banco.codigoBanco
                  .toLocaleLowerCase()
                  .includes(
                    texto
                  ) ||

                banco.nombre
                  .toLocaleLowerCase()
                  .includes(
                    texto
                  ) ||

                (
                  banco.bicSwift
                    ?.toLocaleLowerCase()
                    .includes(
                      texto
                    ) ??
                  false
                )
              );
            }
          );


        return ListFilterRules
          .aplicar(
            resultadosBusqueda,
            {
              estado:
                filtroEstado,

              orden:
                ordenAlfabetico,

              obtenerEstado:
                (
                  banco
                ) =>
                  banco.estado,

              obtenerTextoOrden:
                (
                  banco
                ) =>
                  banco.nombre
            }
          );
      },
      [
        bancos,
        busqueda,
        filtroEstado,
        ordenAlfabetico
      ]
    );


  // =====================================================
  // REINICIAR PAGINACIÓN AL CAMBIAR FILTROS
  // =====================================================

  useEffect(
    () => {

      setPaginaActual(
        1
      );

    },
    [
      busqueda,
      filtroEstado,
      ordenAlfabetico,
      registrosPorPagina
    ]
  );


  // =====================================================
  // PAGINACIÓN CALCULADA
  // =====================================================

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        bancosFiltrados.length /
        registrosPorPagina
      )
    );


  const paginaSegura =
    Math.min(
      paginaActual,
      totalPaginas
    );


  const indiceInicial =
    (
      paginaSegura -
      1
    ) *
    registrosPorPagina;


  const bancosVisibles =
    bancosFiltrados.slice(
      indiceInicial,
      indiceInicial +
      registrosPorPagina
    );


  const primerRegistro =
    bancosFiltrados.length === 0
      ? 0
      : indiceInicial + 1;


  const ultimoRegistro =
    Math.min(
      indiceInicial +
      registrosPorPagina,
      bancosFiltrados.length
    );


  // =====================================================
  // NUEVO BANCO
  // =====================================================

  function abrirNuevoBanco():
    void {

    setMensajeExito(
      null
    );


    setBancoEditando(
      null
    );


    setMostrarFormulario(
      true
    );
  }


  // =====================================================
  // EDITAR BANCO
  // =====================================================

  function abrirEditarBanco(
    banco:
      BancoResponse
  ): void {

    if (
      !BancoLifecycleRules
        .puedeEditar(
          banco.estado
        )
    ) {
      return;
    }


    setMensajeExito(
      null
    );


    setBancoEditando(
      banco
    );


    setMostrarFormulario(
      true
    );
  }


  // =====================================================
  // CERRAR FORMULARIO
  // =====================================================

  function cerrarFormulario():
    void {

    if (
      guardando
    ) {
      return;
    }


    setMostrarFormulario(
      false
    );


    setBancoEditando(
      null
    );
  }


  // =====================================================
  // GUARDAR BANCO
  // =====================================================

  async function manejarGuardarBanco(
    datos:
      BancoFormData
  ): Promise<void> {

    setGuardando(
      true
    );


    setMensajeExito(
      null
    );


    try {

      if (
        bancoEditando
      ) {

        const codigoBanco =
          bancoEditando
            .codigoBanco;


        await actualizarBanco(
          bancoEditando.bancoId,
          datos
        );


        setMostrarFormulario(
          false
        );


        setBancoEditando(
          null
        );


        await cargarBancos();


        setMensajeExito(
          BancoFeedbackMessages
            .actualizado(
              codigoBanco
            )
        );


        return;
      }


      await crearBanco(
        datos
      );


      setMostrarFormulario(
        false
      );


      setBancoEditando(
        null
      );


      await cargarBancos();


      setMensajeExito(
        BancoFeedbackMessages
          .creado(
            datos.codigoBanco
          )
      );

    } finally {

      setGuardando(
        false
      );
    }
  }


  // =====================================================
  // ABRIR CAMBIO DE ESTADO
  // =====================================================

  function abrirCambioEstado(
    banco:
      BancoResponse
  ): void {

    setMensajeExito(
      null
    );


    setErrorEstado(
      undefined
    );


    setBancoCambioEstado(
      banco
    );
  }


  // =====================================================
  // CERRAR CAMBIO DE ESTADO
  // =====================================================

  function cerrarCambioEstado():
    void {

    if (
      cambiandoEstado
    ) {
      return;
    }


    setBancoCambioEstado(
      null
    );


    setErrorEstado(
      undefined
    );
  }


  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  async function manejarCambiarEstado():
    Promise<void> {

    if (
      !bancoCambioEstado ||
      cambiandoEstado
    ) {
      return;
    }


    const banco =
      bancoCambioEstado;


    const configuracion =
      EstadoActivoInactivoAction
        .desde(
          banco.estado
        );


    setCambiandoEstado(
      true
    );


    setErrorEstado(
      undefined
    );


    setMensajeExito(
      null
    );


    try {

      await cambiarEstadoBanco(
        banco.bancoId,
        configuracion.estadoSiguiente
      );


      setBancoCambioEstado(
        null
      );


      await cargarBancos();


      setMensajeExito(
        BancoFeedbackMessages
          .estadoActualizado(
            banco.codigoBanco,
            configuracion.estadoSiguiente
          )
      );

    } catch (
      errorCambio
    ) {

      const mensaje =
        errorCambio instanceof Error
          ? errorCambio.message
          : "No fue posible cambiar el estado del banco.";


      setErrorEstado(
        mensaje
      );

    } finally {

      setCambiandoEstado(
        false
      );
    }
  }


  // =====================================================
  // VISTA
  // =====================================================

  return (

    <div
      className=
        "bancos-page"
    >

      <PageHeader
        title=
          "Bancos"

        description=
          "Este modelo administra los bancos disponibles en la empresa."

        actions={

          <div
            className=
              "bancos-toolbar"
          >

            <SearchInput
              value={
                busqueda
              }

              placeholder=
                "Buscar bancos..."

              aria-label=
                "Buscar bancos"

              onChange={(
                event
              ) =>
                setBusqueda(
                  event.target.value
                )
              }
            />


            <ListFilterMenu
              estado={
                filtroEstado
              }

              orden={
                ordenAlfabetico
              }

              onEstadoChange={
                setFiltroEstado
              }

              onOrdenChange={
                setOrdenAlfabetico
              }
            />


            <Button
              type=
                "button"

              variant=
                "primary"

              disabled={
                guardando ||
                cambiandoEstado
              }

              onClick={
                abrirNuevoBanco
              }
            >
              + Nuevo banco
            </Button>

          </div>
        }
      />


      <div
        className=
          "bancos-info"
      >

        <div
          className=
            "bancos-info__icon"

          aria-hidden=
            "true"
        >
          i
        </div>


        <div>

          <strong>
            Información del modelo
          </strong>


          <p>
            Este catálogo alimenta el selector Banco
            en cuentas, formatos, conciliación y plantillas.
          </p>

        </div>

      </div>


      {mensajeExito ? (

        <BancoSuccessMessage
          message={
            mensajeExito
          }

          onClose={() =>
            setMensajeExito(
              null
            )
          }
        />

      ) : null}


      <section
        className=
          "bancos-table-card"
      >

        {errorCarga && !cargando ? (

          <BancoLoadError
            message={
              errorCarga
            }

            cargando={
              cargando
            }

            onRetry={() =>
              void cargarBancos()
            }
          />

        ) : (

          <>

            <DataTable
              headers={[
                "CÓDIGO",
                "NOMBRE DEL BANCO",
                "BIC / SWIFT",
                "ESTADO",
                "ACCIONES"
              ]}
            >

              {cargando ? (

                <tr>

                  <td
                    colSpan={
                      5
                    }
                  >
                    Cargando bancos...
                  </td>

                </tr>

              ) : bancosVisibles.length === 0 ? (

                <tr>

                  <td
                    colSpan={
                      5
                    }

                    className=
                      "bancos-empty"
                  >
                    No se encontraron bancos.
                  </td>

                </tr>

              ) : (

                bancosVisibles.map(
                  (
                    banco
                  ) => (

                    <tr
                      key={
                        banco.bancoId
                      }
                    >

                      <td
                        className=
                          "bancos-code"
                      >
                        {banco.codigoBanco}
                      </td>


                      <td>
                        {banco.nombre}
                      </td>


                      <td>
                        {banco.bicSwift ??
                          "—"}
                      </td>


                      <td>

                        <span
                          className={
                            banco.estado ===
                              "ACTIVO"

                              ? "banco-status banco-status--activo"

                              : "banco-status banco-status--inactivo"
                          }
                        >

                          <Badge>

                            {banco.estado ===
                              "ACTIVO"

                              ? "Activo"

                              : "Inactivo"}

                          </Badge>

                        </span>

                      </td>


                      <td>

                        <div
                          className=
                            "bancos-actions"
                        >

                          <IconButton
                            label={
                              BancoLifecycleRules
                                .obtenerMensajeEdicion(
                                  banco.estado
                                )
                            }

                            title={
                              BancoLifecycleRules
                                .obtenerMensajeEdicion(
                                  banco.estado
                                )
                            }

                            disabled={
                              guardando ||
                              cambiandoEstado ||
                              !BancoLifecycleRules
                                .puedeEditar(
                                  banco.estado
                                )
                            }

                            onClick={() =>
                              abrirEditarBanco(
                                banco
                              )
                            }

                            icon={

                              <svg
                                viewBox=
                                  "0 0 24 24"

                                aria-hidden=
                                  "true"
                              >

                                <path
                                  d=
                                    "M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5Zm16.7-9.8a1 1 0 0 0 0-1.4l-2-2a1 1 0 0 0-1.4 0L15.7 4.9l3.5 3.5 1.5-1.7Z"

                                  fill=
                                    "currentColor"
                                />

                              </svg>
                            }
                          />


                          <EstadoActionButton
                            estado={
                              banco.estado
                            }

                            disabled={
                              guardando ||
                              cambiandoEstado
                            }

                            onClick={() =>
                              abrirCambioEstado(
                                banco
                              )
                            }
                          />

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </DataTable>


            <div
              className=
                "bancos-table-footer"
            >

              <div
                className=
                  "bancos-result-count"
              >

                Mostrando{" "}

                {primerRegistro}

                {" a "}

                {ultimoRegistro}

                {" de "}

                {bancosFiltrados.length}

                {" registros"}

              </div>


              <div
                className=
                  "bancos-pagination-area"
              >

                <div
                  className=
                    "bancos-pagination"
                >

                  <button
                    type=
                      "button"

                    aria-label=
                      "Página anterior"

                    disabled={
                      paginaSegura <=
                      1
                    }

                    onClick={() =>
                      setPaginaActual(
                        paginaSegura -
                        1
                      )
                    }
                  >
                    ‹
                  </button>


                  <span>
                    {paginaSegura}
                  </span>


                  <button
                    type=
                      "button"

                    aria-label=
                      "Página siguiente"

                    disabled={
                      paginaSegura >=
                      totalPaginas
                    }

                    onClick={() =>
                      setPaginaActual(
                        paginaSegura +
                        1
                      )
                    }
                  >
                    ›
                  </button>

                </div>


                <select
                  className=
                    "bancos-page-size"

                  value={
                    registrosPorPagina
                  }

                  aria-label=
                    "Registros por página"

                  onChange={(
                    event
                  ) =>
                    setRegistrosPorPagina(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >

                  <option
                    value={
                      10
                    }
                  >
                    10 por página
                  </option>


                  <option
                    value={
                      20
                    }
                  >
                    20 por página
                  </option>


                  <option
                    value={
                      50
                    }
                  >
                    50 por página
                  </option>

                </select>

              </div>

            </div>

          </>

        )}

      </section>


      <BancoModal
        abierto={
          mostrarFormulario
        }

        titulo={
          bancoEditando
            ? "Editar banco"
            : "Nuevo banco"
        }

        descripcion={
          bancoEditando

            ? "Modifica la información del banco seleccionado."

            : "Registra un banco para utilizarlo en los procesos del módulo."
        }

        bloqueado={
          guardando
        }

        onClose={
          cerrarFormulario
        }
      >

        <BancoForm
          key={
            bancoEditando
              ?.bancoId ??
            "nuevo"
          }

          modo={
            bancoEditando
              ? "EDITAR"
              : "CREAR"
          }

          bancoId={
            bancoEditando
              ?.bancoId
          }

          estadoActual={
            bancoEditando
              ?.estado ??
            "ACTIVO"
          }

          bancosExistentes={
            bancos
          }

          initialValues={
            bancoEditando

              ? {
                  codigoBanco:
                    bancoEditando.codigoBanco,

                  nombre:
                    bancoEditando.nombre,

                  bicSwift:
                    bancoEditando.bicSwift
                }

              : undefined
          }

          submitLabel={
            bancoEditando
              ? "Guardar cambios"
              : "Guardar banco"
          }

          cargando={
            guardando
          }

          onSubmit={
            manejarGuardarBanco
          }

          onCancel={
            cerrarFormulario
          }
        />

      </BancoModal>


      <ConfirmStateDialog
        abierto={
          bancoCambioEstado !==
          null
        }

        nombreBanco={
          bancoCambioEstado
            ?.nombre ??
          ""
        }

        estadoActual={
          bancoCambioEstado
            ?.estado ??
          "ACTIVO"
        }

        cargando={
          cambiandoEstado
        }

        error={
          errorEstado
        }

        onConfirm={() =>
          void manejarCambiarEstado()
        }

        onCancel={
          cerrarCambioEstado
        }
      />

    </div>
  );
}
