import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { PageContainer } from "../../../../../shared/layout/PageContainer";
import { Button } from "../../../../../shared/ui/Button";
import { IconButton } from "../../../../../shared/ui/IconButton";
import { Badge } from "../../../../../shared/ui/Badge";
import { Card } from "../../../../../shared/ui/Card";
import { SearchInput } from "../../../../../shared/forms/SearchInput";
import { Select } from "../../../../../shared/forms/Select";
import { DataTable } from "../../../../../shared/tables/DataTable";
import { Alert } from "../../../../../shared/feedback/Alert";
import { EmptyState } from "../../../../../shared/feedback/EmptyState";

import {
  desactivarPlantillaCheque,
  listarPlantillasCheque,
} from "../api/plantillas-cheque.api";

import {
  PlantillaChequeFormModal,
} from "../components/PlantillaChequeFormModal";

import type {
  EstadoPlantillaCheque,
  PlantillaCheque,
} from "../types/plantilla-cheque.types";

import "../plantillas-cheque.css";


type FiltroEstado =
  | "TODOS"
  | EstadoPlantillaCheque;


function normalizarTexto(
  valor: unknown
): string {
  return String(
    valor ?? ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();
}


function etiquetaOrientacion(
  orientacion:
    PlantillaCheque["orientacion"]
): string {
  return orientacion ===
    "HORIZONTAL"
    ? "Horizontal"
    : "Vertical";
}


function etiquetaEstado(
  estado:
    PlantillaCheque["estado"]
): string {
  return estado ===
    "ACTIVA"
    ? "Activa"
    : "Inactiva";
}


function textoBuscable(
  plantilla:
    PlantillaCheque
): string {
  const acciones =
    plantilla.estado ===
    "ACTIVA"
      ? "editar actualizar lapiz eliminar inactivar papelera basurero"
      : "editar actualizar lapiz";

  return normalizarTexto(
    [
      plantilla.plantillaId,

      plantilla.nombre,

      plantilla.bancoId,
      plantilla.codigoBanco,
      plantilla.bancoNombre,

      plantilla.tipoCuentaId,
      plantilla.tipoCuentaCodigo,
      plantilla.tipoCuentaNombre,

      plantilla.tamanoPapel,

      plantilla.orientacion,
      etiquetaOrientacion(
        plantilla.orientacion
      ),

      plantilla.estado,
      etiquetaEstado(
        plantilla.estado
      ),

      acciones,
    ].join(" ")
  );
}


export function PlantillasChequePage() {
  const [
    plantillas,
    setPlantillas,
  ] =
    useState<PlantillaCheque[]>(
      []
    );

  const [
    plantillaSeleccionada,
    setPlantillaSeleccionada,
  ] =
    useState<PlantillaCheque | null>(
      null
    );

  const [
    plantillaEditar,
    setPlantillaEditar,
  ] =
    useState<PlantillaCheque | null>(
      null
    );

  const [
    plantillaAInactivar,
    setPlantillaAInactivar,
  ] =
    useState<PlantillaCheque | null>(
      null
    );

  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    filtroEstado,
    setFiltroEstado,
  ] =
    useState<FiltroEstado>(
      "TODOS"
    );

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    procesandoId,
    setProcesandoId,
  ] =
    useState<number | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    mensajeExito,
    setMensajeExito,
  ] =
    useState<string | null>(
      null
    );


  /*
   * Solo en esta pantalla ocultamos
   * el Header general del ERP.
   *
   * No se modifica ERPLayout ni Header.
   */
  useEffect(() => {
    document.body.classList.add(
      "plantillas-cheque-route"
    );

    return () => {
      document.body.classList.remove(
        "plantillas-cheque-route"
      );
    };
  }, []);


  async function cargarPlantillas() {
    try {
      setCargando(
        true
      );

      setError(
        null
      );

      const data =
        await listarPlantillasCheque();

      setPlantillas(
        data
      );

      setPlantillaSeleccionada(
        (actual) => {
          if (actual) {
            const encontrada =
              data.find(
                (plantilla) =>
                  plantilla.plantillaId ===
                  actual.plantillaId
              );

            if (
              encontrada
            ) {
              return encontrada;
            }
          }

          return (
            data[0] ??
            null
          );
        }
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No fue posible cargar las plantillas de cheque."
      );
    } finally {
      setCargando(
        false
      );
    }
  }


  useEffect(() => {
    void cargarPlantillas();
  }, []);


  /*
   * Opciones de Banco obtenidas
   * de los datos reales devueltos
   * por el package.
   */
  const bancosDisponibles =
    useMemo(() => {
      const mapa =
        new Map<
          number,
          {
            bancoId: number;
            codigoBanco: string;
            bancoNombre: string;
          }
        >();

      plantillas.forEach(
        (plantilla) => {
          mapa.set(
            plantilla.bancoId,
            {
              bancoId:
                plantilla.bancoId,

              codigoBanco:
                plantilla.codigoBanco,

              bancoNombre:
                plantilla.bancoNombre,
            }
          );
        }
      );

      return Array.from(
        mapa.values()
      );
    }, [
      plantillas,
    ]);


  /*
   * Opciones de tipo de cuenta
   * obtenidas de los registros reales.
   */
  const tiposCuentaDisponibles =
    useMemo(() => {
      const mapa =
        new Map<
          number,
          {
            tipoCuentaId: number;
            tipoCuentaCodigo:
              | string
              | null;
            tipoCuentaNombre:
              | string
              | null;
          }
        >();

      plantillas.forEach(
        (plantilla) => {
          if (
            plantilla.tipoCuentaId ===
            null
          ) {
            return;
          }

          mapa.set(
            plantilla.tipoCuentaId,
            {
              tipoCuentaId:
                plantilla.tipoCuentaId,

              tipoCuentaCodigo:
                plantilla.tipoCuentaCodigo,

              tipoCuentaNombre:
                plantilla.tipoCuentaNombre,
            }
          );
        }
      );

      return Array.from(
        mapa.values()
      );
    }, [
      plantillas,
    ]);


  /*
   * Una sola búsqueda.
   *
   * Busca sobre TODOS los registros
   * antes de mostrarlos.
   */
  const plantillasFiltradas =
    useMemo(() => {
      const texto =
        normalizarTexto(
          busqueda
        );

      return plantillas.filter(
        (plantilla) => {
          const coincideEstado =
            filtroEstado ===
              "TODOS" ||
            plantilla.estado ===
              filtroEstado;

          if (
            !coincideEstado
          ) {
            return false;
          }

          if (
            texto === ""
          ) {
            return true;
          }

          return textoBuscable(
            plantilla
          ).includes(
            texto
          );
        }
      );
    }, [
      plantillas,
      busqueda,
      filtroEstado,
    ]);


  function abrirNuevaPlantilla() {
    setMensajeExito(
      null
    );

    setError(
      null
    );

    setPlantillaEditar(
      null
    );

    setModalAbierto(
      true
    );
  }


  function abrirEdicion(
    plantilla:
      PlantillaCheque
  ) {
    setPlantillaSeleccionada(
      plantilla
    );

    setPlantillaEditar(
      plantilla
    );

    setMensajeExito(
      null
    );

    setError(
      null
    );

    setModalAbierto(
      true
    );
  }


  function cerrarFormulario() {
    setModalAbierto(
      false
    );

    setPlantillaEditar(
      null
    );
  }


  function handleGuardada(
    plantilla:
      PlantillaCheque
  ) {
    const eraEdicion =
      plantillaEditar !==
      null;

    setPlantillaSeleccionada(
      plantilla
    );

    setMensajeExito(
      eraEdicion
        ? `Plantilla "${plantilla.nombre}" actualizada correctamente.`
        : `Plantilla "${plantilla.nombre}" registrada correctamente.`
    );

    setError(
      null
    );

    void cargarPlantillas();
  }


  function solicitarInactivacion(
    plantilla:
      PlantillaCheque
  ) {
    if (
      plantilla.estado !==
      "ACTIVA"
    ) {
      return;
    }

    setPlantillaSeleccionada(
      plantilla
    );

    setPlantillaAInactivar(
      plantilla
    );

    setMensajeExito(
      null
    );

    setError(
      null
    );
  }


  async function confirmarInactivacion() {
    if (
      !plantillaAInactivar
    ) {
      return;
    }

    try {
      setProcesandoId(
        plantillaAInactivar
          .plantillaId
      );

      setError(
        null
      );

      const actualizada =
        await desactivarPlantillaCheque(
          plantillaAInactivar
            .plantillaId
        );

      setPlantillas(
        (actuales) =>
          actuales.map(
            (plantilla) =>
              plantilla.plantillaId ===
              actualizada.plantillaId
                ? actualizada
                : plantilla
          )
      );

      setPlantillaSeleccionada(
        (actual) =>
          actual?.plantillaId ===
          actualizada.plantillaId
            ? actualizada
            : actual
      );

      setMensajeExito(
        `Plantilla "${actualizada.nombre}" inactivada correctamente.`
      );

      setPlantillaAInactivar(
        null
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No fue posible inactivar la plantilla."
      );
    } finally {
      setProcesandoId(
        null
      );
    }
  }


  return (
    <PageContainer>
      <section className="plantillas-page">
        <div className="plantillas-breadcrumb">
          <span>
            Bancos
          </span>

          <span>
            ›
          </span>

          <span>
            Configuración y auditoría
          </span>

          <span>
            ›
          </span>

          <strong>
            Plantillas de cheque
          </strong>
        </div>


        <div className="plantillas-title-row">
          <div>
            <h2>
              Plantillas de cheque
            </h2>

            <p>
              Modelo que configura el diseño y la disposición utilizados para imprimir cheques por banco y tipo de cuenta.
            </p>
          </div>

          <Button
            type="button"
            onClick={
              abrirNuevaPlantilla
            }
          >
            <Plus
              size={15}
            />

            Nueva plantilla
          </Button>
        </div>


        {mensajeExito ? (
          <div className="plantillas-alert plantillas-alert--success">
            <Alert>
              {mensajeExito}
            </Alert>
          </div>
        ) : null}


        {error ? (
          <div className="plantillas-alert">
            <Alert>
              {error}
            </Alert>
          </div>
        ) : null}


        <div className="plantillas-main-grid">
          <div className="plantillas-table-wrap">
            <Card>
              <div className="plantillas-toolbar">
                <div className="plantillas-state-filter">
                  <Select
                    value={
                      filtroEstado
                    }
                    onChange={(
                      event
                    ) =>
                      setFiltroEstado(
                        event.target
                          .value as FiltroEstado
                      )
                    }
                    aria-label="Filtrar por estado"
                  >
                    <option value="TODOS">
                      Todos los estados
                    </option>

                    <option value="ACTIVA">
                      Activas
                    </option>

                    <option value="INACTIVA">
                      Inactivas
                    </option>
                  </Select>
                </div>

                <div className="plantillas-search">
                  <SearchInput
                    value={
                      busqueda
                    }
                    onInput={(
                      event
                    ) =>
                      setBusqueda(
                        event
                          .currentTarget
                          .value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                        "Escape"
                      ) {
                        setBusqueda(
                          ""
                        );
                      }
                    }}
                    placeholder="Buscar plantilla..."
                    aria-label="Buscar plantilla"
                    autoComplete="off"
                  />
                </div>
              </div>


              {cargando ? (
                <div className="plantillas-loading">
                  Cargando plantillas...
                </div>
              ) : plantillasFiltradas.length ===
                0 ? (
                <EmptyState
                  title="No se encontraron plantillas"
                  description={
                    busqueda.trim() !==
                    ""
                      ? `No hay registros que coincidan con "${busqueda}".`
                      : plantillas.length ===
                          0
                        ? "No existen plantillas registradas."
                        : "No hay registros para el estado seleccionado."
                  }
                />
              ) : (
                <DataTable
                  headers={[
                    "Nombre",
                    "Banco",
                    "Tipo de cuenta",
                    "Tamaño papel",
                    "Orientación",
                    "Estado",
                    "Acciones",
                  ]}
                >
                  {plantillasFiltradas.map(
                    (
                      plantilla
                    ) => {
                      const puedeInactivar =
                        plantilla.estado ===
                        "ACTIVA";

                      const procesando =
                        procesandoId ===
                        plantilla.plantillaId;

                      return (
                        <tr
                          key={
                            plantilla.plantillaId
                          }
                          className={
                            plantillaSeleccionada?.plantillaId ===
                            plantilla.plantillaId
                              ? "plantillas-row plantillas-row--selected"
                              : "plantillas-row"
                          }
                          onClick={() =>
                            setPlantillaSeleccionada(
                              plantilla
                            )
                          }
                        >
                          <td>
                            <strong className="plantilla-name">
                              {
                                plantilla.nombre
                              }
                            </strong>
                          </td>

                          <td>
                            <strong className="plantilla-bank-code">
                              {
                                plantilla.codigoBanco
                              }
                            </strong>

                            <small className="plantilla-bank-name">
                              {
                                plantilla.bancoNombre
                              }
                            </small>
                          </td>

                          <td>
                            {plantilla.tipoCuentaNombre ??
                              plantilla.tipoCuentaCodigo ??
                              "Todos"}
                          </td>

                          <td>
                            {
                              plantilla.tamanoPapel
                            }
                          </td>

                          <td>
                            {etiquetaOrientacion(
                              plantilla.orientacion
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                plantilla.estado ===
                                "ACTIVA"
                                  ? "plantilla-status plantilla-status--active"
                                  : "plantilla-status plantilla-status--inactive"
                              }
                            >
                              <Badge>
                                {etiquetaEstado(
                                  plantilla.estado
                                )}
                              </Badge>
                            </span>
                          </td>

                          <td>
                            <div className="plantilla-row-actions">
                              <IconButton
                                type="button"
                                icon={
                                  <Pencil
                                    size={14}
                                  />
                                }
                                label="Editar plantilla"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  abrirEdicion(
                                    plantilla
                                  );
                                }}
                              />

                              <span className="plantilla-delete-action">
                                <IconButton
                                  type="button"
                                  icon={
                                    <Trash2
                                      size={14}
                                    />
                                  }
                                  label={
                                    puedeInactivar
                                      ? "Inactivar plantilla"
                                      : "La plantilla ya está inactiva"
                                  }
                                  disabled={
                                    !puedeInactivar ||
                                    procesando
                                  }
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();

                                    solicitarInactivacion(
                                      plantilla
                                    );
                                  }}
                                />
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </DataTable>
              )}


              {!cargando &&
              plantillasFiltradas.length >
                0 ? (
                <div className="plantillas-results">
                  Mostrando 1 a{" "}
                  {
                    plantillasFiltradas.length
                  }{" "}
                  de{" "}
                  {
                    plantillasFiltradas.length
                  }{" "}
                  resultados
                </div>
              ) : null}
            </Card>
          </div>


          <div className="plantillas-preview-wrap">
            <Card>
              <h3>
                Vista previa de cheque
              </h3>

              {plantillaSeleccionada ? (
                <>
                  <div className="plantillas-cheque-preview">
                    <div className="plantillas-cheque-preview__header">
                      <div>
                        <strong>
                          {
                            plantillaSeleccionada.codigoBanco
                          }
                        </strong>

                        <small>
                          {
                            plantillaSeleccionada.bancoNombre
                          }
                        </small>
                      </div>

                      <span>
                        {
                          plantillaSeleccionada.nombre
                        }
                      </span>
                    </div>

                    <div className="plantillas-cheque-line" />

                    <div className="plantillas-cheque-line" />

                    <div className="plantillas-cheque-line" />
                  </div>


                  <div className="plantillas-preview-info">
                    <h4>
                      Uso del modelo
                    </h4>

                    <p>
                      Este modelo se utiliza en el proceso de emisión del cheque para definir el formato, la alineación y los elementos que se imprimirán según el banco y tipo de cuenta seleccionados.
                    </p>

                    <span>
                      Banco:{" "}
                      <strong>
                        {
                          plantillaSeleccionada.bancoNombre
                        }
                      </strong>
                    </span>

                    <span>
                      Tipo:{" "}
                      <strong>
                        {plantillaSeleccionada.tipoCuentaNombre ??
                          "Todos"}
                      </strong>
                    </span>

                    <span>
                      Papel:{" "}
                      <strong>
                        {
                          plantillaSeleccionada.tamanoPapel
                        }
                      </strong>
                    </span>

                    <span>
                      Orientación:{" "}
                      <strong>
                        {etiquetaOrientacion(
                          plantillaSeleccionada.orientacion
                        )}
                      </strong>
                    </span>

                    <span>
                      Estado:{" "}
                      <strong>
                        {etiquetaEstado(
                          plantillaSeleccionada.estado
                        )}
                      </strong>
                    </span>
                  </div>
                </>
              ) : (
                <p className="plantillas-preview-empty">
                  Selecciona una plantilla del listado.
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>


      <PlantillaChequeFormModal
        open={
          modalAbierto
        }
        plantillaEditar={
          plantillaEditar
        }
        bancos={
          bancosDisponibles
        }
        tiposCuenta={
          tiposCuentaDisponibles
        }
        onClose={
          cerrarFormulario
        }
        onSaved={
          handleGuardada
        }
      />


      {plantillaAInactivar ? (
        <div className="plantilla-confirm-backdrop">
          <div
            className="plantilla-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inactivar-plantilla-title"
          >
            <div className="plantilla-confirm-dialog__icon">
              <AlertTriangle
                size={20}
              />
            </div>

            <h3
              id="inactivar-plantilla-title"
            >
              Inactivar plantilla
            </h3>

            <p>
              La plantilla no se eliminará físicamente. Se conservará en el sistema y cambiará su estado a Inactiva.
            </p>

            <div className="plantilla-confirm-dialog__record">
              <span>
                Plantilla
              </span>

              <strong>
                {
                  plantillaAInactivar.nombre
                }
              </strong>

              <span>
                Banco
              </span>

              <strong>
                {
                  plantillaAInactivar.bancoNombre
                }
              </strong>
            </div>

            <div className="plantilla-confirm-dialog__actions">
              <Button
                type="button"
                variant="outline"
                disabled={
                  procesandoId !==
                  null
                }
                onClick={() =>
                  setPlantillaAInactivar(
                    null
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="danger"
                disabled={
                  procesandoId !==
                  null
                }
                onClick={() =>
                  void confirmarInactivacion()
                }
              >
                <Trash2
                  size={14}
                />

                {procesandoId !==
                null
                  ? "Inactivando..."
                  : "Inactivar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}