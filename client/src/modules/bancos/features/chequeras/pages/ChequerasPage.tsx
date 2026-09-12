import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Banknote,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pencil,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";

import { PageContainer } from "../../../../../shared/layout/PageContainer";
import { Card } from "../../../../../shared/ui/Card";
import { Button } from "../../../../../shared/ui/Button";
import { IconButton } from "../../../../../shared/ui/IconButton";
import { Badge } from "../../../../../shared/ui/Badge";
import { SearchInput } from "../../../../../shared/forms/SearchInput";
import { Select } from "../../../../../shared/forms/Select";
import { DataTable } from "../../../../../shared/tables/DataTable";
import { Alert } from "../../../../../shared/feedback/Alert";
import { EmptyState } from "../../../../../shared/feedback/EmptyState";

import {
  desactivarChequera,
  listarChequeras,
} from "../api/chequeras.api";

import { ChequeraCreateModal } from "../components/ChequeraCreateModal";
import { BancosChequerasSidebar } from "../components/BancosChequerasSidebar";

import type {
  Chequera,
  EstadoChequera,
} from "../types/chequera.types";

import "../chequeras.css";

type FiltroEstado =
  | "TODOS"
  | EstadoChequera;

const PAGE_SIZE_OPTIONS =
  [10, 20, 50] as const;

function formatearNumeroCheque(
  numero: number
): string {
  return String(numero).padStart(
    6,
    "0"
  );
}

function etiquetaEstado(
  estado: EstadoChequera
): string {
  switch (estado) {
    case "ACTIVA":
      return "Activa";

    case "BORRADOR":
      return "Borrador";

    case "AGOTADA":
      return "Agotada";

    case "INACTIVA":
      return "Inactiva";

    default:
      return estado;
  }
}

function claseEstado(
  estado: EstadoChequera
): string {
  return (
    "chequera-status " +
    `chequera-status--${estado.toLowerCase()}`
  );
}

/*
 * Convierte cualquier valor a texto
 * buscable.
 *
 * También elimina diferencias entre:
 * - mayúsculas/minúsculas
 * - tildes
 * - espacios al inicio/final
 */
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

/*
 * Construye un índice de búsqueda
 * completo para cada chequera.
 *
 * De esta forma ningún campo depende
 * de .toLowerCase() directamente y
 * tampoco falla si Oracle devuelve
 * algún campo nulo.
 */
function obtenerTextoBuscable(
  chequera: Chequera
): string {
  const disponibles =
    chequera.numeroFinal -
    chequera.numeroInicial +
    1;

  const acciones =
    chequera.estado ===
    "ACTIVA"
      ? [
          "editar",
          "actualizar",
          "lapiz",
          "eliminar",
          "inactivar",
          "papelera",
          "basurero",
        ]
      : [
          "editar",
          "actualizar",
          "lapiz",
        ];

  const valores = [
    /*
     * CUENTA BANCARIA
     */
    chequera.nombreInterno,
    chequera.numeroCuenta,
    chequera.codigoCuenta,
    chequera.cuentaId,

    /*
     * BANCO
     */
    chequera.bancoNombre,
    chequera.codigoBanco,
    chequera.bancoId,

    /*
     * SERIE
     */
    chequera.serie,

    /*
     * NÚMERO INICIAL
     */
    chequera.numeroInicial,
    formatearNumeroCheque(
      chequera.numeroInicial
    ),

    /*
     * NÚMERO FINAL
     */
    chequera.numeroFinal,
    formatearNumeroCheque(
      chequera.numeroFinal
    ),

    /*
     * DISPONIBLES
     */
    disponibles,

    /*
     * ESTADO
     */
    chequera.estado,
    etiquetaEstado(
      chequera.estado
    ),

    /*
     * ACCIONES
     */
    ...acciones,
  ];

  return normalizarTexto(
    valores.join(" ")
  );
}

export function ChequerasPage() {
  const [
    chequeras,
    setChequeras,
  ] = useState<Chequera[]>([]);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    estado,
    setEstado,
  ] =
    useState<FiltroEstado>(
      "TODOS"
    );

  const [
    filtroAbierto,
    setFiltroAbierto,
  ] = useState(false);

  const [
    cargando,
    setCargando,
  ] = useState(true);

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

  const [
    modalRegistroAbierto,
    setModalRegistroAbierto,
  ] = useState(false);

  const [
    chequeraEditar,
    setChequeraEditar,
  ] =
    useState<Chequera | null>(
      null
    );

  const [
    chequeraAInactivar,
    setChequeraAInactivar,
  ] =
    useState<Chequera | null>(
      null
    );

  const [
    procesandoId,
    setProcesandoId,
  ] =
    useState<number | null>(
      null
    );

  const [
    pagina,
    setPagina,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(20);

  /*
   * Mantiene los estilos específicos
   * de esta pantalla.
   */
  useEffect(() => {
    document.body.classList.add(
      "chequeras-route"
    );

    return () => {
      document.body.classList.remove(
        "chequeras-route"
      );
    };
  }, []);

  /*
   * Carga TODOS los registros que
   * devuelve el backend.
   */
  async function cargarChequeras() {
    try {
      setCargando(true);
      setError(null);

      const data =
        await listarChequeras();

      setChequeras(data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No fue posible cargar las chequeras."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarChequeras();
  }, []);

  /*
   * Al escribir una nueva búsqueda
   * regresamos automáticamente a
   * la primera página.
   */
  useEffect(() => {
    setPagina(1);
  }, [
    busqueda,
    estado,
    pageSize,
  ]);

  /*
   * =====================================================
   * BÚSQUEDA REAL
   * =====================================================
   *
   * Primero busca en TODA la colección
   * recibida del backend.
   *
   * Después se aplica la paginación.
   *
   * Eso significa que puede encontrar
   * un registro aunque originalmente
   * estuviera en la página 2, 3, etc.
   */
  const chequerasFiltradas =
    useMemo(() => {
      const texto =
        normalizarTexto(
          busqueda
        );

      return chequeras.filter(
        (chequera) => {
          /*
           * Filtro independiente
           * del botón Filtrar.
           */
          const coincideEstado =
            estado === "TODOS" ||
            chequera.estado ===
              estado;

          if (!coincideEstado) {
            return false;
          }

          /*
           * Sin texto mostramos todos
           * los registros permitidos
           * por el filtro de estado.
           */
          if (texto === "") {
            return true;
          }

          /*
           * Índice completo del
           * registro.
           */
          const textoRegistro =
            obtenerTextoBuscable(
              chequera
            );

          return textoRegistro.includes(
            texto
          );
        }
      );
    }, [
      chequeras,
      busqueda,
      estado,
    ]);

  /*
   * KPIs
   */
  const chequerasActivas =
    chequeras.filter(
      (chequera) =>
        chequera.estado ===
        "ACTIVA"
    ).length;

  const chequesDisponibles =
    chequeras.reduce(
      (
        total,
        chequera
      ) => {
        if (
          chequera.estado !==
          "ACTIVA"
        ) {
          return total;
        }

        return (
          total +
          chequera.numeroFinal -
          chequera.numeroInicial +
          1
        );
      },
      0
    );

  /*
   * =====================================================
   * PAGINACIÓN
   * =====================================================
   *
   * Se calcula DESPUÉS de buscar.
   */
  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        chequerasFiltradas.length /
          pageSize
      )
    );

  const paginaSegura =
    Math.min(
      pagina,
      totalPaginas
    );

  const desde =
    chequerasFiltradas.length ===
    0
      ? 0
      : (
          paginaSegura -
          1
        ) *
          pageSize +
        1;

  const hasta =
    Math.min(
      paginaSegura *
        pageSize,
      chequerasFiltradas.length
    );

  const chequerasPagina =
    chequerasFiltradas.slice(
      (
        paginaSegura -
        1
      ) * pageSize,
      paginaSegura *
        pageSize
    );

  /*
   * REGISTRAR
   */
  function abrirRegistro() {
    setMensajeExito(null);
    setError(null);

    setChequeraEditar(null);

    setModalRegistroAbierto(
      true
    );
  }

  /*
   * EDITAR
   */
  function abrirEdicion(
    chequera: Chequera
  ) {
    setMensajeExito(null);
    setError(null);

    setChequeraEditar(
      chequera
    );

    setModalRegistroAbierto(
      true
    );
  }

  function cerrarFormulario() {
    setModalRegistroAbierto(
      false
    );

    setChequeraEditar(
      null
    );
  }

  /*
   * REGISTRO / ACTUALIZACIÓN
   */
  function handleChequeraGuardada(
    chequera: Chequera
  ) {
    const eraEdicion =
      chequeraEditar !==
      null;

    setMensajeExito(
      eraEdicion
        ? `Chequera ${
            chequera.serie ??
            chequera.chequeraId
          } actualizada correctamente.`
        : `Chequera ${
            chequera.serie ??
            chequera.chequeraId
          } registrada correctamente.`
    );

    setError(null);

    /*
     * Volvemos a consultar Oracle
     * mediante el backend.
     */
    void cargarChequeras();
  }

  /*
   * INACTIVAR
   */
  function solicitarInactivacion(
    chequera: Chequera
  ) {
    if (
      chequera.estado !==
      "ACTIVA"
    ) {
      return;
    }

    setMensajeExito(null);
    setError(null);

    setChequeraAInactivar(
      chequera
    );
  }

  async function confirmarInactivacion() {
    if (
      !chequeraAInactivar
    ) {
      return;
    }

    try {
      setProcesandoId(
        chequeraAInactivar
          .chequeraId
      );

      setError(null);

      const actualizada =
        await desactivarChequera(
          chequeraAInactivar
            .chequeraId
        );

      setChequeras(
        (actuales) =>
          actuales.map(
            (chequera) =>
              chequera.chequeraId ===
              actualizada.chequeraId
                ? actualizada
                : chequera
          )
      );

      setMensajeExito(
        `Chequera ${
          actualizada.serie ??
          actualizada.chequeraId
        } inactivada correctamente.`
      );

      setChequeraAInactivar(
        null
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No fue posible inactivar la chequera."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <>
      <BancosChequerasSidebar />

      <PageContainer>
        <section className="chequeras-screen">
          <div className="chequeras-page-header">
            <div>
              <h2>
                Chequeras
              </h2>

              <p>
                Gestiona las chequeras asignadas a las cuentas bancarias.
              </p>
            </div>

            <div className="chequeras-page-header__actions">
              <div className="chequeras-search">
                <SearchInput
                  value={
                    busqueda
                  }

                  /*
                   * onInput garantiza
                   * actualización inmediata
                   * con cada tecla.
                   */
                  onInput={(
                    event
                  ) => {
                    setBusqueda(
                      event.currentTarget
                        .value
                    );
                  }}

                  placeholder="Buscar chequeras..."
                  aria-label="Buscar chequeras"
                  autoComplete="off"

                  /*
                   * Escape limpia la
                   * búsqueda inmediatamente.
                   */
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Escape"
                    ) {
                      setBusqueda("");
                    }
                  }}
                />
              </div>

              <button
                type="button"
                className="chequeras-notification"
                aria-label="Notificaciones"
              >
                <Bell
                  size={15}
                />

                <span />
              </button>
            </div>
          </div>

          {mensajeExito ? (
            <div className="chequeras-alert chequeras-alert--success">
              <Alert>
                {mensajeExito}
              </Alert>
            </div>
          ) : null}

          {error ? (
            <div className="chequeras-alert">
              <Alert>
                {error}
              </Alert>
            </div>
          ) : null}

          <div className="chequeras-summary-row">
            <div className="chequeras-kpis">
              <Card>
                <div className="chequeras-kpi-icon chequeras-kpi-icon--green">
                  <Banknote
                    size={18}
                  />
                </div>

                <div className="chequeras-kpi-copy">
                  <span>
                    Cheques disponibles
                  </span>

                  <strong>
                    {chequesDisponibles.toLocaleString(
                      "es-GT"
                    )}
                  </strong>

                  <small>
                    En todas las chequeras activas
                  </small>
                </div>
              </Card>

              <Card>
                <div className="chequeras-kpi-icon chequeras-kpi-icon--blue">
                  <WalletCards
                    size={18}
                  />
                </div>

                <div className="chequeras-kpi-copy">
                  <span>
                    Chequeras activas
                  </span>

                  <strong>
                    {chequerasActivas}
                  </strong>

                  <small>
                    De{" "}
                    {chequeras.length}{" "}
                    chequeras registradas
                  </small>
                </div>
              </Card>
            </div>

            <div className="chequeras-main-actions">
              <div className="chequeras-filter-wrap">
                <Button
                  type="button"
                  variant="outline"
                  className="chequeras-filter-button"
                  onClick={() =>
                    setFiltroAbierto(
                      (actual) =>
                        !actual
                    )
                  }
                >
                  <Filter
                    size={14}
                  />

                  Filtrar

                  <ChevronDown
                    size={13}
                  />
                </Button>

                {filtroAbierto ? (
                  <div className="chequeras-filter-menu">
                    {[
                      [
                        "TODOS",
                        "Todos",
                      ],

                      [
                        "ACTIVA",
                        "Activas",
                      ],

                      [
                        "BORRADOR",
                        "Borrador",
                      ],

                      [
                        "AGOTADA",
                        "Agotadas",
                      ],

                      [
                        "INACTIVA",
                        "Inactivas",
                      ],
                    ].map(
                      ([
                        value,
                        label,
                      ]) => (
                        <button
                          key={
                            value
                          }
                          type="button"
                          className={
                            estado ===
                            value
                              ? "chequeras-filter-option chequeras-filter-option--active"
                              : "chequeras-filter-option"
                          }
                          onClick={() => {
                            setEstado(
                              value as FiltroEstado
                            );

                            setFiltroAbierto(
                              false
                            );
                          }}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                ) : null}
              </div>

              <Button
                type="button"
                className="chequeras-register-button"
                onClick={
                  abrirRegistro
                }
              >
                <Plus
                  size={15}
                />

                Registrar chequera
              </Button>
            </div>
          </div>

          <div className="chequeras-table-card">
            {cargando ? (
              <div className="chequeras-loading">
                Cargando chequeras...
              </div>
            ) : chequerasFiltradas.length ===
              0 ? (
              <EmptyState
                title="No se encontraron chequeras"
                description={
                  busqueda.trim() !==
                  ""
                    ? `No hay registros que coincidan con "${busqueda}".`
                    : chequeras.length ===
                        0
                      ? "No existen chequeras registradas."
                      : "No hay resultados para los filtros seleccionados."
                }
              />
            ) : (
              <>
                <DataTable
                  headers={[
                    "Cuenta bancaria",
                    "Banco",
                    "Serie",
                    "No. inicial",
                    "No. final",
                    "Disponibles",
                    "Estado",
                    "Acciones",
                  ]}
                >
                  {chequerasPagina.map(
                    (
                      chequera
                    ) => {
                      const puedeInactivar =
                        chequera.estado ===
                        "ACTIVA";

                      const procesando =
                        procesandoId ===
                        chequera
                          .chequeraId;

                      const disponibles =
                        chequera.numeroFinal -
                        chequera.numeroInicial +
                        1;

                      return (
                        <tr
                          key={
                            chequera
                              .chequeraId
                          }
                        >
                          <td>
                            <span className="chequera-account-name">
                              {
                                chequera
                                  .nombreInterno
                              }
                            </span>

                            <small className="chequera-account-number">
                              {
                                chequera
                                  .numeroCuenta
                              }
                            </small>
                          </td>

                          <td>
                            {
                              chequera
                                .bancoNombre
                            }
                          </td>

                          <td>
                            {chequera
                              .serie ??
                              "—"}
                          </td>

                          <td className="chequera-number">
                            {formatearNumeroCheque(
                              chequera
                                .numeroInicial
                            )}
                          </td>

                          <td className="chequera-number">
                            {formatearNumeroCheque(
                              chequera
                                .numeroFinal
                            )}
                          </td>

                          <td>
                            {disponibles}
                          </td>

                          <td>
                            <span
                              className={claseEstado(
                                chequera
                                  .estado
                              )}
                            >
                              <Badge>
                                {etiquetaEstado(
                                  chequera
                                    .estado
                                )}
                              </Badge>
                            </span>
                          </td>

                          <td>
                            <div className="chequera-row-actions">
                              <IconButton
                                type="button"
                                icon={
                                  <Pencil
                                    size={
                                      13
                                    }
                                  />
                                }
                                label="Editar chequera"
                                onClick={() =>
                                  abrirEdicion(
                                    chequera
                                  )
                                }
                              />

                              <span className="chequera-delete-action">
                                <IconButton
                                  type="button"
                                  icon={
                                    <Trash2
                                      size={
                                        13
                                      }
                                    />
                                  }
                                  label={
                                    puedeInactivar
                                      ? "Inactivar chequera"
                                      : "Solo se puede inactivar una chequera activa"
                                  }
                                  disabled={
                                    !puedeInactivar ||
                                    procesando
                                  }
                                  onClick={() =>
                                    solicitarInactivacion(
                                      chequera
                                    )
                                  }
                                />
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </DataTable>

                <div className="chequeras-table-footer">
                  <span>
                    Mostrando{" "}
                    {desde} a{" "}
                    {hasta} de{" "}
                    {
                      chequerasFiltradas.length
                    }{" "}
                    chequeras
                  </span>

                  <div className="chequeras-pagination-controls">
                    <button
                      type="button"
                      aria-label="Página anterior"
                      disabled={
                        paginaSegura <=
                        1
                      }
                      onClick={() =>
                        setPagina(
                          (actual) =>
                            Math.max(
                              1,
                              actual -
                                1
                            )
                        )
                      }
                    >
                      <ChevronLeft
                        size={13}
                      />
                    </button>

                    <button
                      type="button"
                      className="chequeras-page-number"
                    >
                      {paginaSegura}
                    </button>

                    <button
                      type="button"
                      aria-label="Página siguiente"
                      disabled={
                        paginaSegura >=
                        totalPaginas
                      }
                      onClick={() =>
                        setPagina(
                          (actual) =>
                            Math.min(
                              totalPaginas,
                              actual +
                                1
                            )
                        )
                      }
                    >
                      <ChevronRight
                        size={13}
                      />
                    </button>

                    <div className="chequeras-page-size">
                      <Select
                        value={
                          pageSize
                        }
                        onChange={(
                          event
                        ) =>
                          setPageSize(
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                        aria-label="Registros por página"
                      >
                        {PAGE_SIZE_OPTIONS.map(
                          (
                            size
                          ) => (
                            <option
                              key={
                                size
                              }
                              value={
                                size
                              }
                            >
                              {size} por página
                            </option>
                          )
                        )}
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </PageContainer>

      <ChequeraCreateModal
        open={
          modalRegistroAbierto
        }
        chequeraEditar={
          chequeraEditar
        }
        onClose={
          cerrarFormulario
        }
        onSaved={
          handleChequeraGuardada
        }
      />

      {chequeraAInactivar ? (
        <div className="chequeras-dialog-backdrop">
          <div
            className="chequeras-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inactivar-chequera-title"
          >
            <div className="chequeras-dialog__icon chequeras-dialog__icon--danger">
              <AlertTriangle
                size={20}
              />
            </div>

            <h3 id="inactivar-chequera-title">
              Inactivar chequera
            </h3>

            <p>
              La chequera se conservará en el sistema y cambiará su estado a Inactiva.
            </p>

            <div className="chequeras-dialog__data">
              <span>
                Cuenta
              </span>

              <strong>
                {
                  chequeraAInactivar
                    .numeroCuenta
                }
              </strong>

              <span>
                Serie
              </span>

              <strong>
                {chequeraAInactivar
                  .serie ??
                  "Sin serie"}
              </strong>
            </div>

            <div className="chequeras-dialog__actions">
              <Button
                type="button"
                variant="outline"
                disabled={
                  procesandoId !==
                  null
                }
                onClick={() =>
                  setChequeraAInactivar(
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
    </>
  );
}