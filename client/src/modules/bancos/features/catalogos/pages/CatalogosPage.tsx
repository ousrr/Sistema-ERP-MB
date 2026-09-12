import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Info,
  Pencil,
  Plus,
  Power
} from "lucide-react";

import {
  SearchInput
} from "../../../../../shared/forms/SearchInput";

import {
  Select
} from "../../../../../shared/forms/Select";

import {
  DataTable
} from "../../../../../shared/tables/DataTable";

import {
  Button
} from "../../../../../shared/ui/Button";

import {
  FeedbackMessage
} from "../../../common/components/FeedbackMessage";

import {
  ResponsiveLayout
} from "../../../common/layout/ResponsiveLayout";

import {
  ListFilterMenu
} from "../../../common/components/ListFilterMenu";

import {
  ListFilterRules,
  type EstadoListaFiltro,
  type OrdenAlfabetico
} from "../../../common/list/ListFilterRules";

import {
  actualizarCatalogo,
  cambiarEstadoCatalogo,
  crearCatalogo,
  listarCatalogos
} from "../api/catalogosApi";

import {
  CatalogoForm
} from "../components/CatalogoForm";

import {
  CatalogoModal
} from "../components/CatalogoModal";

import {
  CatalogoLoadError
} from "../components/CatalogoLoadError";

import {
  CatalogoSuccessMessage
} from "../components/CatalogoSuccessMessage";

import {
  CatalogoConfirmStateDialog
} from "../components/CatalogoConfirmStateDialog";

import {
  CatalogoGrupoChip
} from "../components/CatalogoGrupoChip";

import {
  CatalogoBadge
} from "../components/CatalogoBadge";

import {
  CatalogoActionButton
} from "../components/CatalogoActionButton";

import {
  CatalogoPresentation
} from "../presentation/CatalogoPresentation";

import {
  CatalogoFeedbackMessages
} from "../rules/CatalogoFeedbackMessages";

import type {
  ActualizarCatalogoRequest,
  CatalogoFormData,
  CatalogoResponse,
  CrearCatalogoRequest,
  EstadoCatalogo
} from "../types/CatalogoBancario";


const TAMANIOS_PAGINA = [
  10,
  25,
  50
];


export function CatalogosPage() {

  const [
    catalogos,
    setCatalogos
  ] = useState<CatalogoResponse[]>(
    []
  );


  const [
    cargando,
    setCargando
  ] = useState(
    true
  );


  const [
    error,
    setError
  ] = useState<string | null>(
    null
  );


  const [
    errorCarga,
    setErrorCarga
  ] = useState<string | null>(
    null
  );


  const [
    mensajeExito,
    setMensajeExito
  ] = useState<string | null>(
    null
  );


  const [
    busqueda,
    setBusqueda
  ] = useState(
    ""
  );


  const [
    grupoSeleccionado,
    setGrupoSeleccionado
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


  const [
    paginaActual,
    setPaginaActual
  ] = useState(
    1
  );


  const [
    tamanioPagina,
    setTamanioPagina
  ] = useState(
    10
  );


  const [
    modalAbierto,
    setModalAbierto
  ] = useState(
    false
  );


  const [
    catalogoEditando,
    setCatalogoEditando
  ] = useState<CatalogoResponse | null>(
    null
  );


  const [
    catalogoEstado,
    setCatalogoEstado
  ] = useState<CatalogoResponse | null>(
    null
  );


  const [
    procesandoEstado,
    setProcesandoEstado
  ] = useState(
    false
  );


  const [
    errorEstado,
    setErrorEstado
  ] = useState<string | null>(
    null
  );


  // =====================================================
  // CARGAR CATÁLOGOS
  // =====================================================

  async function cargarCatalogos() {

    setCargando(
      true
    );

    setErrorCarga(
      null
    );


    try {

      const datos =
        await listarCatalogos();


      setCatalogos(
        datos
      );

    } catch (
      errorCarga
    ) {

      setErrorCarga(
        errorCarga instanceof Error
          ? errorCarga.message
          : "No fue posible cargar los catálogos bancarios."
      );

    } finally {

      setCargando(
        false
      );
    }
  }


  useEffect(
    () => {

      void cargarCatalogos();

    },
    []
  );


  // =====================================================
  // GRUPOS
  //
  // Datos reales desde Oracle.
  // Solo el orden es responsabilidad de presentación.
  // =====================================================

  const grupos =
    useMemo(
      () => {

        return Array.from(
          new Set(
            catalogos.map(
              (
                catalogo
              ) =>
                catalogo.grupo
            )
          )
        ).sort(
          (
            grupoA,
            grupoB
          ) =>
            CatalogoPresentation
              .compararGrupos(
                grupoA,
                grupoB
              )
        );

      },
      [
        catalogos
      ]
    );


  useEffect(
    () => {

      if (
        grupos.length === 0
      ) {

        setGrupoSeleccionado(
          ""
        );

        return;
      }


      if (
        !grupoSeleccionado ||
        !grupos.includes(
          grupoSeleccionado
        )
      ) {

        setGrupoSeleccionado(
          grupos[0]
        );
      }

    },
    [
      grupos,
      grupoSeleccionado
    ]
  );


  // =====================================================
  // FILTRADO
  // =====================================================

  const catalogosFiltrados =
    useMemo(
      () => {

        const texto =
          busqueda
            .trim()
            .toUpperCase();


        const resultadosBase =
          catalogos.filter(
            (
              catalogo
            ) => {

              const coincideGrupo =
                catalogo.grupo ===
                  grupoSeleccionado;


              const coincideBusqueda =
                !texto ||
                [
                  catalogo.codigo,
                  catalogo.nombre,
                  catalogo.descripcion ?? ""
                ].some(
                  (
                    valor
                  ) =>
                    valor
                      .toUpperCase()
                      .includes(
                        texto
                      )
                );


              return (
                coincideGrupo &&
                coincideBusqueda
              );
            }
          );


        return ListFilterRules
          .aplicar(
            resultadosBase,
            {
              estado:
                filtroEstado,

              orden:
                ordenAlfabetico,

              obtenerEstado:
                (
                  catalogo
                ) =>
                  catalogo.estado,

              obtenerTextoOrden:
                (
                  catalogo
                ) =>
                  catalogo.nombre
            }
          );

      },
      [
        catalogos,
        grupoSeleccionado,
        busqueda,
        filtroEstado,
        ordenAlfabetico
      ]
    );


  // =====================================================
  // PAGINACIÓN
  // =====================================================

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        catalogosFiltrados.length /
          tamanioPagina
      )
    );


  useEffect(
    () => {

      setPaginaActual(
        1
      );

    },
    [
      busqueda,
      grupoSeleccionado,
      filtroEstado,
      ordenAlfabetico,
      tamanioPagina
    ]
  );


  useEffect(
    () => {

      if (
        paginaActual >
          totalPaginas
      ) {

        setPaginaActual(
          totalPaginas
        );
      }

    },
    [
      paginaActual,
      totalPaginas
    ]
  );


  const catalogosPagina =
    useMemo(
      () => {

        const inicio =
          (
            paginaActual -
            1
          ) *
          tamanioPagina;


        return catalogosFiltrados.slice(
          inicio,
          inicio +
            tamanioPagina
        );

      },
      [
        catalogosFiltrados,
        paginaActual,
        tamanioPagina
      ]
    );


  const inicioMostrado =
    catalogosFiltrados.length === 0
      ? 0
      : (
          paginaActual -
          1
        ) *
          tamanioPagina +
        1;


  const finMostrado =
    Math.min(
      paginaActual *
        tamanioPagina,
      catalogosFiltrados.length
    );


  // =====================================================
  // CREAR / EDITAR
  // =====================================================

  function abrirCrear() {

    setMensajeExito(
      null
    );

    setError(
      null
    );

    setCatalogoEditando(
      null
    );

    setModalAbierto(
      true
    );
  }


  function abrirEditar(
    catalogo:
      CatalogoResponse
  ) {

    setMensajeExito(
      null
    );

    setError(
      null
    );

    setCatalogoEditando(
      catalogo
    );

    setModalAbierto(
      true
    );
  }


  function cerrarModal() {

    setModalAbierto(
      false
    );

    setCatalogoEditando(
      null
    );
  }


  // =====================================================
  // DATOS DEL FORMULARIO
  // =====================================================

  const valoresFormulario =
    useMemo<CatalogoFormData>(
      () => {

        if (
          catalogoEditando
        ) {

          return {

            grupo:
              catalogoEditando.grupo,

            codigo:
              catalogoEditando.codigo,

            nombre:
              catalogoEditando.nombre,

            descripcion:
              catalogoEditando.descripcion ??
              "",

            aplicaA:
              catalogoEditando.aplicaA ??
              "",

            naturaleza:
              catalogoEditando.naturaleza,

            requiereComentario:
              catalogoEditando.requiereComentario,

            requiereEvidencia:
              catalogoEditando.requiereEvidencia,

            permiteReversion:
              catalogoEditando.permiteReversion
          };
        }


        return {

          grupo:
            grupoSeleccionado,

          codigo:
            "",

          nombre:
            "",

          descripcion:
            "",

          aplicaA:
            "",

          naturaleza:
            null,

          requiereComentario:
            "N",

          requiereEvidencia:
            "N",

          permiteReversion:
            "N"
        };

      },
      [
        catalogoEditando,
        grupoSeleccionado
      ]
    );


  // =====================================================
  // GUARDAR
  // =====================================================

  async function guardarCatalogo(
    datos:
      CatalogoFormData
  ) {

    setMensajeExito(
      null
    );

    setError(
      null
    );


    if (
      catalogoEditando
    ) {

      const catalogo =
        catalogoEditando;


      const request:
        ActualizarCatalogoRequest = {

        nombre:
          datos.nombre,

        descripcion:
          datos.descripcion ||
          null,

        aplicaA:
          datos.aplicaA ||
          null,

        naturaleza:
          datos.naturaleza,

        requiereComentario:
          datos.requiereComentario,

        requiereEvidencia:
          datos.requiereEvidencia,

        permiteReversion:
          datos.permiteReversion
      };


      await actualizarCatalogo(
        catalogo.catalogoId,
        request
      );


      cerrarModal();


      await cargarCatalogos();


      setMensajeExito(
        CatalogoFeedbackMessages
          .actualizado(
            `${catalogo.grupo} / ${catalogo.codigo}`
          )
      );


      return;
    }


    const request:
      CrearCatalogoRequest = {

      grupo:
        datos.grupo,

      codigo:
        datos.codigo,

      nombre:
        datos.nombre,

      descripcion:
        datos.descripcion ||
        null,

      aplicaA:
        datos.aplicaA ||
        null,

      naturaleza:
        datos.naturaleza,

      requiereComentario:
        datos.requiereComentario,

      requiereEvidencia:
        datos.requiereEvidencia,

      permiteReversion:
        datos.permiteReversion,

      estado:
        "ACTIVO"
    };


    await crearCatalogo(
      request
    );


    setGrupoSeleccionado(
      datos.grupo
    );


    cerrarModal();


    await cargarCatalogos();


    setMensajeExito(
      CatalogoFeedbackMessages
        .creado(
          `${datos.grupo} / ${datos.codigo}`
        )
    );
  }


  // =====================================================
  // CAMBIO DE ESTADO
  // =====================================================

  async function confirmarEstado(
    nuevoEstado:
      EstadoCatalogo
  ) {

    if (
      !catalogoEstado
    ) {

      return;
    }


    const catalogo =
      catalogoEstado;


    setProcesandoEstado(
      true
    );


    setMensajeExito(
      null
    );


    setErrorEstado(
      null
    );


    try {

      await cambiarEstadoCatalogo(
        catalogo.catalogoId,
        nuevoEstado
      );


      setCatalogoEstado(
        null
      );


      await cargarCatalogos();


      setMensajeExito(
        CatalogoFeedbackMessages
          .estadoActualizado(
            `${catalogo.grupo} / ${catalogo.codigo}`,
            nuevoEstado
          )
      );

    } catch (
      errorCambioEstado
    ) {

      setErrorEstado(
        errorCambioEstado instanceof Error
          ? errorCambioEstado.message
          : "No fue posible cambiar el estado del catálogo."
      );

    } finally {

      setProcesandoEstado(
        false
      );
    }
  }


  // =====================================================
  // VISTA
  // =====================================================

  return (

    <ResponsiveLayout.Page>

      <ResponsiveLayout.Header
        title=
          "Catálogos bancarios"

        description=
          "Este modelo almacena valores configurables que se reutilizan en todo el módulo bancario a través de listas desplegables (selects)."
      />


      {/* GRUPO + BÚSQUEDA + NUEVO */}

      <ResponsiveLayout.Toolbar>

        <ResponsiveLayout.ToolbarItem>

          <ResponsiveLayout.Field
            label=
              "Grupo"

            htmlFor=
              "catalogo-grupo"
          >

            <Select
              id=
                "catalogo-grupo"

              value={
                grupoSeleccionado
              }

              onChange={(
                event
              ) =>
                setGrupoSeleccionado(
                  event.target.value
                )
              }

              disabled={
                cargando ||
                grupos.length === 0
              }

              style={{
                minHeight:
                  "46px"
              }}
            >

              {grupos.map(
                (
                  grupo
                ) => (

                  <option
                    key={
                      grupo
                    }

                    value={
                      grupo
                    }
                  >
                    {
                      CatalogoPresentation
                        .obtenerGrupoVisual(
                          grupo
                        )
                        .etiqueta
                    }
                  </option>

                )
              )}

            </Select>

          </ResponsiveLayout.Field>

        </ResponsiveLayout.ToolbarItem>


        <ResponsiveLayout.ToolbarItem
          kind=
            "search"
        >

          <div
            style={{
              minWidth:
                0,

              display:
                "grid",

              gridTemplateColumns:
                "minmax(0, 1fr) auto",

              alignItems:
                "center",

              gap:
                "10px"
            }}
          >

            <SearchInput
              value={
                busqueda
              }

              onChange={(
                event
              ) =>
                setBusqueda(
                  event.target.value
                )
              }

              placeholder=
                "Buscar registros..."
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

          </div>

        </ResponsiveLayout.ToolbarItem>


        <ResponsiveLayout.ToolbarItem
          kind=
            "action"
        >

          <Button
            type=
              "button"

            variant=
              "primary"

            onClick={
              abrirCrear
            }

            disabled={
              !grupoSeleccionado
            }
          >

            <Plus
              size={
                18
              }
            />

            Nuevo registro

          </Button>

        </ResponsiveLayout.ToolbarItem>

      </ResponsiveLayout.Toolbar>


      {/* BLOQUE INFORMATIVO */}

      <ResponsiveLayout.InfoPanel>

        <ResponsiveLayout.InfoSection>

          <div
            style={{
              display:
                "flex",

              alignItems:
                "flex-start",

              gap:
                "18px"
            }}
          >

            <Info
              size={
                28
              }

              color=
                "#1570EF"

              style={{
                flexShrink:
                  0
              }}
            />


            <div
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
                    "9px",

                  color:
                    "#101828",

                  fontSize:
                    "14px",

                  fontWeight:
                    600
                }}
              >
                Valores reutilizables en todo el módulo
              </strong>


              <p
                style={{
                  margin:
                    0,

                  maxWidth:
                    "520px",

                  color:
                    "#667085",

                  fontSize:
                    "13px",

                  lineHeight:
                    1.75
                }}
              >
                Los valores definidos en este catálogo se utilizan en
                diferentes pantallas y procesos del módulo bancario como
                opciones en listas desplegables, filtros y validaciones.
              </p>

            </div>

          </div>

        </ResponsiveLayout.InfoSection>


        <ResponsiveLayout.InfoSection>

          <strong
            style={{
              display:
                "block",

              marginBottom:
                "12px",

              color:
                "#101828",

              fontSize:
                "13px",

              fontWeight:
                600
            }}
          >
            Grupos disponibles
          </strong>


          <div
            style={{
              display:
                "flex",

              flexWrap:
                "wrap",

              gap:
                "10px"
            }}
          >

            {grupos.map(
              (
                grupo
              ) => (

                <CatalogoGrupoChip
                  key={
                    grupo
                  }

                  grupo={
                    grupo
                  }

                  activo={
                    grupo ===
                      grupoSeleccionado
                  }

                  onClick={() =>
                    setGrupoSeleccionado(
                      grupo
                    )
                  }
                />

              )
            )}

          </div>

        </ResponsiveLayout.InfoSection>

      </ResponsiveLayout.InfoPanel>


      {/* MENSAJE DE ÉXITO */}

      {mensajeExito ? (

        <CatalogoSuccessMessage
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


      {/* ERROR GENERAL */}

      {error ? (

        <FeedbackMessage
          message={
            error
          }

          tone=
            "error"

          onClose={() =>
            setError(
              null
            )
          }
        />

      ) : null}


      {/* TABLA */}

      {errorCarga && !cargando ? (

        <CatalogoLoadError
          message={
            errorCarga
          }

          cargando={
            cargando
          }

          onRetry={() =>
            void cargarCatalogos()
          }
        />

      ) : (

        <div
          style={{
            width:
              "100%",

            minWidth:
              0
          }}
        >

          {cargando ? (

            <div
              style={{
                padding:
                  "40px",

                textAlign:
                  "center",

                color:
                  "#667085"
              }}
            >
              Cargando registros...
            </div>

          ) : (

            <ResponsiveLayout.TableScroll
              minTableWidth={
                860
              }
            >

              <DataTable
                headers={[
                  "Código",
                  "Nombre",
                  "Descripción",
                  "Naturaleza",
                  "Estado",
                  "Acciones"
                ]}
              >

                {catalogosPagina.length === 0 ? (

                  <tr>

                    <td
                      colSpan={
                        6
                      }

                      style={{
                        padding:
                          "40px",

                        textAlign:
                          "center",

                        color:
                          "#667085"
                      }}
                    >
                      No se encontraron registros.
                    </td>

                  </tr>

                ) : (

                  catalogosPagina.map(
                    (
                      catalogo
                    ) => {

                      const naturaleza =
                        CatalogoPresentation
                          .obtenerNaturalezaVisual(
                            catalogo.naturaleza
                          );


                      const estado =
                        CatalogoPresentation
                          .obtenerEstadoVisual(
                            catalogo.estado
                          );


                      return (

                        <tr
                          key={
                            catalogo.catalogoId
                          }
                        >

                          <td>

                            <strong
                              style={{
                                color:
                                  "#101828",

                                fontSize:
                                  "13px"
                              }}
                            >
                              {catalogo.codigo}
                            </strong>

                          </td>


                          <td
                            style={{
                              color:
                                "#344054",

                              fontSize:
                                "13px"
                            }}
                          >
                            {catalogo.nombre}
                          </td>


                          <td>

                            <span
                              style={{
                                color:
                                  "#667085",

                                fontSize:
                                  "13px",

                                lineHeight:
                                  1.5
                              }}
                            >
                              {catalogo.descripcion ??
                                "—"}
                            </span>

                          </td>


                          <td>

                            <CatalogoBadge
                              label={
                                naturaleza.etiqueta
                              }

                              tone={
                                naturaleza.tono
                              }
                            />

                          </td>


                          <td>

                            <CatalogoBadge
                              label={
                                estado.etiqueta
                              }

                              tone={
                                estado.tono
                              }
                            />

                          </td>


                          <td>

                            <div
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap:
                                  "10px"
                              }}
                            >

                              <CatalogoActionButton
                                label={
                                  catalogo.estado ===
                                    "ACTIVO"
                                    ? "Editar registro"
                                    : "Reactive el registro para poder editarlo"
                                }

                                tone=
                                  "edit"

                                disabled={
                                  catalogo.estado ===
                                    "INACTIVO"
                                }

                                icon={

                                  <Pencil
                                    size={
                                      17
                                    }
                                  />

                                }

                                onClick={() =>
                                  abrirEditar(
                                    catalogo
                                  )
                                }
                              />


                              <CatalogoActionButton
                                label={
                                  catalogo.estado ===
                                    "ACTIVO"
                                    ? "Inactivar registro"
                                    : "Activar registro"
                                }

                                tone={
                                  catalogo.estado ===
                                    "ACTIVO"
                                    ? "danger"
                                    : "success"
                                }

                                icon={

                                  <Power
                                    size={
                                      17
                                    }
                                  />

                                }

                                onClick={() => {

                                  setMensajeExito(
                                    null
                                  );

                                  setError(
                                    null
                                  );

                                  setErrorEstado(
                                    null
                                  );

                                  setCatalogoEstado(
                                    catalogo
                                  );
                                }}
                              />

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </DataTable>

            </ResponsiveLayout.TableScroll>

          )}


          {!cargando ? (

            <ResponsiveLayout.Footer>

              <span
                style={{
                  color:
                    "#667085",

                  fontSize:
                    "13px"
                }}
              >
                Mostrando {inicioMostrado} a {finMostrado} de{" "}
                {catalogosFiltrados.length} registros
              </span>


              <ResponsiveLayout.FooterActions>

                <button
                  type=
                    "button"

                  aria-label=
                    "Página anterior"

                  disabled={
                    paginaActual <=
                      1
                  }

                  onClick={() =>
                    setPaginaActual(
                      (
                        actual
                      ) =>
                        Math.max(
                          1,
                          actual - 1
                        )
                    )
                  }

                  style={{
                    width:
                      "36px",

                    height:
                      "36px",

                    display:
                      "grid",

                    placeItems:
                      "center",

                    border:
                      "1px solid #D0D5DD",

                    borderRadius:
                      "8px",

                    background:
                      "#FFFFFF",

                    cursor:
                      paginaActual <= 1
                        ? "default"
                        : "pointer"
                  }}
                >

                  <ChevronLeft
                    size={
                      17
                    }
                  />

                </button>


                <span
                  style={{
                    width:
                      "36px",

                    height:
                      "36px",

                    display:
                      "grid",

                    placeItems:
                      "center",

                    flex:
                      "0 0 auto",

                    borderRadius:
                      "8px",

                    background:
                      "#1570EF",

                    color:
                      "#FFFFFF",

                    fontSize:
                      "13px",

                    fontWeight:
                      600
                  }}
                >
                  {paginaActual}
                </span>


                <button
                  type=
                    "button"

                  aria-label=
                    "Página siguiente"

                  disabled={
                    paginaActual >=
                      totalPaginas
                  }

                  onClick={() =>
                    setPaginaActual(
                      (
                        actual
                      ) =>
                        Math.min(
                          totalPaginas,
                          actual + 1
                        )
                    )
                  }

                  style={{
                    width:
                      "36px",

                    height:
                      "36px",

                    display:
                      "grid",

                    placeItems:
                      "center",

                    border:
                      "1px solid #D0D5DD",

                    borderRadius:
                      "8px",

                    background:
                      "#FFFFFF",

                    cursor:
                      paginaActual >=
                        totalPaginas
                        ? "default"
                        : "pointer"
                  }}
                >

                  <ChevronRight
                    size={
                      17
                    }
                  />

                </button>


                <Select
                  value={
                    String(
                      tamanioPagina
                    )
                  }

                  onChange={(
                    event
                  ) =>
                    setTamanioPagina(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >

                  {TAMANIOS_PAGINA.map(
                    (
                      cantidad
                    ) => (

                      <option
                        key={
                          cantidad
                        }

                        value={
                          cantidad
                        }
                      >
                        {cantidad} por página
                      </option>

                    )
                  )}

                </Select>

              </ResponsiveLayout.FooterActions>

            </ResponsiveLayout.Footer>

          ) : null}

        </div>

      )}


      {/* FORMULARIO */}

      <CatalogoModal
        abierto={
          modalAbierto
        }

        titulo={(() => {

          const grupo =
            catalogoEditando?.grupo ??
            grupoSeleccionado;


          const presentacion =
            CatalogoPresentation
              .obtenerFormularioVisual(
                grupo
              );


          return catalogoEditando
            ? `Editar registro de ${presentacion.etiquetaGrupo}`
            : `Registro de ${presentacion.etiquetaGrupo}`;

        })()}

        onClose={
          cerrarModal
        }
      >

        <CatalogoForm
          modo={
            catalogoEditando
              ? "editar"
              : "crear"
          }

          valoresIniciales={
            valoresFormulario
          }

          catalogosExistentes={
            catalogos
          }

          onCancel={
            cerrarModal
          }

          onSubmit={
            guardarCatalogo
          }
        />

      </CatalogoModal>


      {/* ESTADO */}

      <CatalogoConfirmStateDialog
        catalogo={
          catalogoEstado
        }

        cargando={
          procesandoEstado
        }

        error={
          errorEstado
        }

        onCancel={() => {

          setCatalogoEstado(
            null
          );

          setErrorEstado(
            null
          );
        }}

        onConfirm={
          confirmarEstado
        }
      />

    </ResponsiveLayout.Page>
  );
}
