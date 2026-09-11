import {
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  CheckCircle2,
  CircleOff,
  Eye,
  FileText,
  Info,
  Landmark,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import {
  Alert,
} from "../../../../../shared/feedback/Alert";

import {
  EmptyState,
} from "../../../../../shared/feedback/EmptyState";

import {
  SearchInput,
} from "../../../../../shared/forms/SearchInput";

import {
  Select,
} from "../../../../../shared/forms/Select";

import {
  PageContainer,
} from "../../../../../shared/layout/PageContainer";

import {
  PageHeader,
} from "../../../../../shared/layout/PageHeader";

import {
  DataTable,
} from "../../../../../shared/tables/DataTable";

import {
  Badge,
} from "../../../../../shared/ui/Badge";

import {
  Button,
} from "../../../../../shared/ui/Button";

import {
  Card,
} from "../../../../../shared/ui/Card";

import {
  IconButton,
} from "../../../../../shared/ui/IconButton";

import {
  CuentaCreateDialog,
} from "../components/CuentaCreateDialog";

import {
  CuentaEditDialog,
} from "../components/CuentaEditDialog";

import type {
  CuentaEditFormData,
} from "../components/CuentaEditDialog";

import {
  CuentaEstadoDialog,
} from "../components/CuentaEstadoDialog";

import {
  useCuentas,
} from "../hooks/useCuentas";

import type {
  CrearCuentaBancariaInput,
  CuentaBancaria,
  EstadoCuentaBancaria,
  UsoPrincipalCuenta,
} from "../types/cuentas.types";

import "./CuentasPage.css";


type EstadoFiltro =
  | ""
  | EstadoCuentaBancaria;


type EstadoObjetivoCuenta =
  | "ACTIVA"
  | "INACTIVA"
  | "CERRADA";


type CambioEstadoCuenta = {
  cuenta:
    CuentaBancaria;

  nuevoEstado:
    EstadoObjetivoCuenta;
};


const ENCABEZADOS = [
  "Banco",
  "Número de cuenta",
  "Moneda",
  "Tipo de cuenta",
  "Nombre interno",
  "Uso principal",
  "Estado",
  "Acciones",
];


function normalizarTexto(
  valor: string
): string {

  return valor
    .trim()
    .toLocaleLowerCase(
      "es"
    );
}


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


  const ultimosCuatro =
    numero.slice(
      -4
    );


  const cantidadOculta =
    Math.max(
      numero.length - 4,
      4
    );


  return `${"•".repeat(cantidadOculta)}${ultimosCuatro}`;
}


function obtenerEtiquetaEstado(
  estado: EstadoCuentaBancaria
): string {

  switch (
    estado
  ) {

    case "BORRADOR":
      return "Borrador";

    case "ACTIVA":
      return "Activa";

    case "INACTIVA":
      return "Inactiva";

    case "CERRADA":
      return "Cerrada";
  }
}


function obtenerClaseEstado(
  estado: EstadoCuentaBancaria
): string {

  return `cuentas-status cuentas-status--${estado.toLowerCase()}`;
}


function obtenerEtiquetaUso(
  usoPrincipal: UsoPrincipalCuenta
): string {

  switch (
    usoPrincipal
  ) {

    case "COBROS":
      return "Cobros";

    case "PAGOS":
      return "Pagos";

    case "AMBOS":
      return "Cobros y pagos";
  }
}


function formatearSaldo(
  saldo: number
): string {

  return new Intl.NumberFormat(
    "es-GT",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(
    saldo
  );
}


function formatearFecha(
  fecha: string | null
): string {

  if (!fecha) {

    return "—";
  }


  const valor =
    new Date(
      fecha
    );


  if (
    Number.isNaN(
      valor.getTime()
    )
  ) {

    return fecha;
  }


  return new Intl.DateTimeFormat(
    "es-GT",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }
  ).format(
    valor
  );
}


function puedeEditarCuenta(
  cuenta: CuentaBancaria
): boolean {

  return (
    cuenta.estado ===
      "BORRADOR" ||
    cuenta.estado ===
      "ACTIVA"
  );
}


function puedeCambiarEstadoCuenta(
  cuenta: CuentaBancaria,
  nuevoEstado: EstadoObjetivoCuenta
): boolean {

  if (
    cuenta.estado ===
    "BORRADOR"
  ) {

    return (
      nuevoEstado ===
        "ACTIVA" ||
      nuevoEstado ===
        "INACTIVA"
    );
  }


  if (
    cuenta.estado ===
    "ACTIVA"
  ) {

    return (
      nuevoEstado ===
        "INACTIVA" ||
      nuevoEstado ===
        "CERRADA"
    );
  }


  if (
    cuenta.estado ===
    "INACTIVA"
  ) {

    return (
      nuevoEstado ===
      "ACTIVA"
    );
  }


  return false;
}


export function CuentasPage() {

  const {
    cuentas,
    cargando,
    procesando,
    error,
    mensaje,
    cargar,
    crear,
    actualizar,
    cambiarEstado,
    limpiarMensajes,
  } =
    useCuentas();


  const [
    busqueda,
    setBusqueda,
  ] =
    useState(
      ""
    );


  const [
    estado,
    setEstado,
  ] =
    useState<EstadoFiltro>(
      ""
    );


  const [
    creandoCuenta,
    setCreandoCuenta,
  ] =
    useState(
      false
    );


  const [
    cuentaSeleccionada,
    setCuentaSeleccionada,
  ] =
    useState<CuentaBancaria | null>(
      null
    );


  const [
    cuentaEditando,
    setCuentaEditando,
  ] =
    useState<CuentaBancaria | null>(
      null
    );


  const [
    cambioEstado,
    setCambioEstado,
  ] =
    useState<CambioEstadoCuenta | null>(
      null
    );


  const cuentasFiltradas =
    useMemo(
      () => {

        const texto =
          normalizarTexto(
            busqueda
          );


        return cuentas.filter(
          (
            cuenta
          ) => {

            if (
              estado !== "" &&
              cuenta.estado !==
                estado
            ) {

              return false;
            }


            if (
              texto === ""
            ) {

              return true;
            }


            const contenido = [
              cuenta.codigoBanco,
              cuenta.bancoNombre,
              cuenta.codigoCuenta,
              cuenta.numeroCuenta,
              cuenta.nombreInterno,
              cuenta.tipoCuentaCodigo,
              cuenta.tipoCuentaNombre,
              cuenta.usoPrincipal,
              cuenta.estado,
            ]
              .join(
                " "
              )
              .toLocaleLowerCase(
                "es"
              );


            return contenido.includes(
              texto
            );
          }
        );
      },
      [
        cuentas,
        busqueda,
        estado,
      ]
    );


  const resumen =
    useMemo(
      () => {

        return {
          total:
            cuentas.length,

          activas:
            cuentas.filter(
              (
                cuenta
              ) =>
                cuenta.estado ===
                "ACTIVA"
            ).length,

          borrador:
            cuentas.filter(
              (
                cuenta
              ) =>
                cuenta.estado ===
                "BORRADOR"
            ).length,

          noOperativas:
            cuentas.filter(
              (
                cuenta
              ) =>
                cuenta.estado ===
                  "INACTIVA" ||
                cuenta.estado ===
                  "CERRADA"
            ).length,
        };
      },
      [
        cuentas,
      ]
    );


  /*
    Compatibilidad local temporal para Nueva cuenta.

    Mientras esta copia todavía no contiene los maestros de Persona 3
    se aprovechan únicamente valores reales ya presentes en las cuentas
    cargadas.

    No se hardcodean identificadores. Si existen varias empresas, el
    formulario seguirá bloqueando el guardado hasta contar con el contexto
    real del ERP.
  */
  const opcionesCreacion =
    useMemo(
      () => {

        const bancos =
          new Map<number, string>();

        const monedas =
          new Map<number, string>();

        const tiposCuenta =
          new Map<number, string>();

        const responsables =
          new Map<number, string>();

        const empresas =
          new Set<number>();

        for (
          const cuenta of cuentas
        ) {

          bancos.set(
            cuenta.bancoId,
            cuenta.bancoNombre ===
              cuenta.codigoBanco
              ? cuenta.bancoNombre
              : `${cuenta.codigoBanco} - ${cuenta.bancoNombre}`
          );

          monedas.set(
            cuenta.monedaId,
            `Moneda #${cuenta.monedaId}`
          );

          tiposCuenta.set(
            cuenta.tipoCuentaId,
            cuenta.tipoCuentaNombre ===
              cuenta.tipoCuentaCodigo
              ? cuenta.tipoCuentaNombre
              : `${cuenta.tipoCuentaCodigo} - ${cuenta.tipoCuentaNombre}`
          );

          responsables.set(
            cuenta.responsableId,
            `Responsable #${cuenta.responsableId}`
          );

          if (
            Number.isInteger(
              cuenta.empresaId
            ) &&
            cuenta.empresaId > 0
          ) {

            empresas.add(
              cuenta.empresaId
            );
          }


        }


        const empresaId =
          empresas.size === 1
            ? Array.from(
                empresas
              )[0]
            : null;


        return {
          bancos:
            Array.from(
              bancos,
              (
                [
                  id,
                  etiqueta,
                ]
              ) => ({
                id,
                etiqueta,
              })
            ),

          monedas:
            Array.from(
              monedas,
              (
                [
                  id,
                  etiqueta,
                ]
              ) => ({
                id,
                etiqueta,
              })
            ),

          tiposCuenta:
            Array.from(
              tiposCuenta,
              (
                [
                  id,
                  etiqueta,
                ]
              ) => ({
                id,
                etiqueta,
              })
            ),

          responsables:
            Array.from(
              responsables,
              (
                [
                  id,
                  etiqueta,
                ]
              ) => ({
                id,
                etiqueta,
              })
            ),

          empresaId,
        };
      },
      [
        cuentas,
      ]
    );


  function abrirCreacion():
    void {

    limpiarMensajes();

    setCreandoCuenta(
      true
    );
  }


  function cerrarCreacion():
    void {

    if (
      procesando
    ) {

      return;
    }


    setCreandoCuenta(
      false
    );

    limpiarMensajes();
  }


  async function guardarCreacion(
    datos:
      CrearCuentaBancariaInput
  ): Promise<void> {

    const guardado =
      await crear(
        datos
      );


    if (
      !guardado
    ) {

      return;
    }


    setCreandoCuenta(
      false
    );
  }


  function abrirEdicion(
    cuenta: CuentaBancaria
  ): void {

    if (
      !puedeEditarCuenta(
        cuenta
      )
    ) {

      return;
    }


    limpiarMensajes();

    setCuentaEditando(
      cuenta
    );
  }


  function cerrarEdicion():
    void {

    if (
      procesando
    ) {

      return;
    }


    setCuentaEditando(
      null
    );

    limpiarMensajes();
  }


  function abrirCambioEstado(
    cuenta: CuentaBancaria,
    nuevoEstado: EstadoObjetivoCuenta
  ): void {

    if (
      !puedeCambiarEstadoCuenta(
        cuenta,
        nuevoEstado
      )
    ) {

      return;
    }


    limpiarMensajes();

    setCambioEstado(
      {
        cuenta,
        nuevoEstado,
      }
    );
  }


  function cerrarCambioEstado():
    void {

    if (
      procesando
    ) {

      return;
    }


    setCambioEstado(
      null
    );

    limpiarMensajes();
  }


  async function guardarEdicion(
    datos:
      CuentaEditFormData
  ): Promise<void> {

    if (
      !cuentaEditando
    ) {

      return;
    }


    const cuenta =
      cuentaEditando;


    if (
      !puedeEditarCuenta(
        cuenta
      )
    ) {

      return;
    }


    const guardado =
      await actualizar(
        cuenta.cuentaId,
        {
          empresaId:
            cuenta.empresaId,

          bancoId:
            cuenta.bancoId,

          monedaId:
            cuenta.monedaId,

          tipoCuentaId:
            cuenta.tipoCuentaId,

          responsableId:
            cuenta.responsableId,

          codigoCuenta:
            cuenta.codigoCuenta,

          numeroCuenta:
            cuenta.numeroCuenta,

          nombreInterno:
            datos.nombreInterno,

          saldoInicial:
            cuenta.saldoInicial,

          fechaApertura:
            cuenta.fechaApertura.slice(0, 10),

          usoPrincipal:
            datos.usoPrincipal,

          permiteCobros:
            datos.permiteCobros,

          permitePagos:
            datos.permitePagos,

          permiteCheques:
            datos.permiteCheques,

          permiteTransferencias:
            datos.permiteTransferencias,

          fechaCierre:
            cuenta.fechaCierre,

          observaciones:
            datos.observaciones,
        }
      );


    if (
      !guardado
    ) {

      return;
    }


    if (
      cuentaSeleccionada?.cuentaId ===
      cuenta.cuentaId
    ) {

      setCuentaSeleccionada(
        null
      );
    }


    setCuentaEditando(
      null
    );
  }


  async function confirmarCambioEstado():
    Promise<void> {

    if (
      !cambioEstado
    ) {

      return;
    }


    const {
      cuenta,
      nuevoEstado,
    } =
      cambioEstado;


    if (
      !puedeCambiarEstadoCuenta(
        cuenta,
        nuevoEstado
      )
    ) {

      return;
    }


    const cambiado =
      await cambiarEstado(
        cuenta.cuentaId,
        {
          estado:
            nuevoEstado,
        }
      );


    if (
      !cambiado
    ) {

      return;
    }


    if (
      cuentaSeleccionada?.cuentaId ===
      cuenta.cuentaId
    ) {

      setCuentaSeleccionada(
        null
      );
    }


    setCambioEstado(
      null
    );
  }


  return (
    <PageContainer>

      <div
        className="cuentas-page"
      >

        <PageHeader
          title="Cuentas bancarias"
          description="Administra las cuentas bancarias empresariales, su configuración y disponibilidad operativa."
          actions={
            <Button
              type="button"
              disabled={
                procesando
              }
              onClick={
                abrirCreacion
              }
            >
              <Plus
                size={16}
              />

              Nueva cuenta
            </Button>
          }
        />


        {mensaje ? (

          <div
            style={{
              marginBottom:
                "16px",
            }}
          >
            <Alert>
              {mensaje}
            </Alert>
          </div>

        ) : null}


        <div
          className="cuentas-summary"
        >

          <ResumenCard
            clase="cuentas-summary-card--total"
            icono={
              <Landmark
                size={21}
              />
            }
            etiqueta="Total de cuentas"
            valor={resumen.total}
            ayuda="Cuentas registradas"
          />


          <ResumenCard
            clase="cuentas-summary-card--active"
            icono={
              <CheckCircle2
                size={21}
              />
            }
            etiqueta="Cuentas activas"
            valor={resumen.activas}
            ayuda="Disponibles para operar"
          />


          <ResumenCard
            clase="cuentas-summary-card--draft"
            icono={
              <FileText
                size={21}
              />
            }
            etiqueta="En borrador"
            valor={resumen.borrador}
            ayuda="Pendientes de activación"
          />


          <ResumenCard
            clase="cuentas-summary-card--inactive"
            icono={
              <CircleOff
                size={21}
              />
            }
            etiqueta="Inactivas o cerradas"
            valor={resumen.noOperativas}
            ayuda="Sin operación disponible"
          />

        </div>


        <div
          className="cuentas-info"
        >

          <Alert>

            <span
              className="cuentas-info__icon"
              aria-hidden="true"
            >
              <Info
                size={14}
              />
            </span>


            <div
              className="cuentas-info__content"
            >

              <strong>
                Control de cuentas bancarias empresariales
              </strong>

              <p>
                Los números de cuenta se muestran enmascarados para proteger
                la información bancaria. Las operaciones disponibles dependen
                del estado actual de cada cuenta.
              </p>

            </div>

          </Alert>

        </div>


        <div
          className="cuentas-table-card"
        >

          <Card>

            <div
              className="cuentas-toolbar"
            >

              <div
                className="cuentas-toolbar__search"
              >

                <SearchInput
                  value={busqueda}
                  onChange={(
                    event
                  ) =>
                    setBusqueda(
                      event.target.value
                    )
                  }
                  placeholder="Buscar por banco, cuenta, tipo o nombre..."
                  aria-label="Buscar cuentas bancarias"
                />

              </div>


              <div
                className="cuentas-toolbar__filter"
              >

                <Select
                  value={estado}
                  onChange={(
                    event
                  ) =>
                    setEstado(
                      event.target
                        .value as
                        EstadoFiltro
                    )
                  }
                  aria-label="Filtrar cuentas por estado"
                >

                  <option
                    value=""
                  >
                    Todos los estados
                  </option>

                  <option
                    value="ACTIVA"
                  >
                    Activa
                  </option>

                  <option
                    value="BORRADOR"
                  >
                    Borrador
                  </option>

                  <option
                    value="INACTIVA"
                  >
                    Inactiva
                  </option>

                  <option
                    value="CERRADA"
                  >
                    Cerrada
                  </option>

                </Select>

              </div>


              <div
                className="cuentas-toolbar__actions"
              >

                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    cargando ||
                    procesando
                  }
                  onClick={() =>
                    void cargar()
                  }
                >

                  <RefreshCw
                    size={16}
                  />

                  Actualizar

                </Button>

              </div>

            </div>


            {error &&
            !creandoCuenta &&
            !cuentaEditando &&
            !cambioEstado ? (

              <div
                className="cuentas-message cuentas-message--error"
                role="alert"
              >
                {error}
              </div>

            ) : null}


            {cargando ? (

              <div
                className="cuentas-loading"
              >
                Cargando cuentas bancarias...
              </div>

            ) : cuentasFiltradas.length ===
              0 ? (

              <div
                className="cuentas-message"
              >

                <EmptyState
                  title="No se encontraron cuentas bancarias"
                  description={
                    busqueda !== "" ||
                    estado !== ""
                      ? "No hay registros que coincidan con los filtros aplicados."
                      : "Todavía no existen cuentas bancarias registradas."
                  }
                />

              </div>

            ) : (

              <DataTable
                headers={
                  ENCABEZADOS
                }
              >

                {cuentasFiltradas.map(
                  (
                    cuenta
                  ) => {

                    const editable =
                      puedeEditarCuenta(
                        cuenta
                      );


                    const activable =
                      puedeCambiarEstadoCuenta(
                        cuenta,
                        "ACTIVA"
                      );


                    const inactivable =
                      puedeCambiarEstadoCuenta(
                        cuenta,
                        "INACTIVA"
                      );


                    const cerrable =
                      puedeCambiarEstadoCuenta(
                        cuenta,
                        "CERRADA"
                      );


                    return (

                      <tr
                        key={
                          cuenta.cuentaId
                        }
                      >

                        <td>

                          <div
                            className="cuentas-bank"
                          >

                            <span
                              className="cuentas-bank__icon"
                              aria-hidden="true"
                            >
                              <Landmark
                                size={15}
                              />
                            </span>


                            <div
                              className="cuentas-bank__data"
                            >

                              <span
                                className="cuentas-bank__code"
                              >
                                {cuenta.codigoBanco}
                              </span>


                              {cuenta.bancoNombre !==
                              cuenta.codigoBanco ? (

                                <span
                                  className="cuentas-bank__name"
                                >
                                  {cuenta.bancoNombre}
                                </span>

                              ) : null}

                            </div>

                          </div>

                        </td>


                        <td>

                          <span
                            className="cuentas-number"
                            title="Número de cuenta protegido"
                          >
                            {enmascararNumeroCuenta(
                              cuenta.numeroCuenta
                            )}
                          </span>

                        </td>


                        <td
                          title="Identificador del maestro externo de moneda"
                        >
                          Moneda #{cuenta.monedaId}
                        </td>


                        <td>
                          {cuenta.tipoCuentaNombre}
                        </td>


                        <td>

                          <span
                            className="cuentas-name"
                          >
                            {cuenta.nombreInterno}
                          </span>

                        </td>


                        <td>

                          <span
                            className="cuentas-usage"
                          >
                            {obtenerEtiquetaUso(
                              cuenta.usoPrincipal
                            )}
                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              obtenerClaseEstado(
                                cuenta.estado
                              )
                            }
                          >

                            <Badge>
                              {obtenerEtiquetaEstado(
                                cuenta.estado
                              )}
                            </Badge>

                          </span>

                        </td>


                        <td>

                          <div
                            className="cuentas-actions"
                          >

                            <IconButton
                              type="button"
                              label="Ver cuenta"
                              icon={
                                <Eye
                                  size={15}
                                />
                              }
                              onClick={() =>
                                setCuentaSeleccionada(
                                  cuenta
                                )
                              }
                            />


                            <IconButton
                              type="button"
                              label={
                                editable
                                  ? "Editar cuenta"
                                  : "La cuenta no puede editarse en su estado actual"
                              }
                              icon={
                                <Pencil
                                  size={15}
                                />
                              }
                              disabled={
                                procesando ||
                                !editable
                              }
                              onClick={() =>
                                abrirEdicion(
                                  cuenta
                                )
                              }
                            />


                            {activable ? (

                              <IconButton
                                type="button"
                                label="Activar cuenta"
                                icon={
                                  <CheckCircle2
                                    size={15}
                                  />
                                }
                                disabled={
                                  procesando
                                }
                                onClick={() =>
                                  abrirCambioEstado(
                                    cuenta,
                                    "ACTIVA"
                                  )
                                }
                              />

                            ) : null}


                            {inactivable ? (

                              <IconButton
                                type="button"
                                label="Inactivar cuenta"
                                icon={
                                  <CircleOff
                                    size={15}
                                  />
                                }
                                disabled={
                                  procesando
                                }
                                onClick={() =>
                                  abrirCambioEstado(
                                    cuenta,
                                    "INACTIVA"
                                  )
                                }
                              />

                            ) : null}


                            {cerrable ? (

                              <IconButton
                                type="button"
                                label="Cerrar cuenta"
                                icon={
                                  <Lock
                                    size={15}
                                  />
                                }
                                disabled={
                                  procesando
                                }
                                onClick={() =>
                                  abrirCambioEstado(
                                    cuenta,
                                    "CERRADA"
                                  )
                                }
                              />

                            ) : null}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </DataTable>
            )}


            <div
              className="cuentas-table-footer"
            >

              <span
                className="cuentas-result-count"
              >
                Mostrando{" "}
                <strong>
                  {cuentasFiltradas.length}
                </strong>{" "}
                de{" "}
                <strong>
                  {cuentas.length}
                </strong>{" "}
                cuentas.
              </span>

            </div>

          </Card>

        </div>


        {cuentaSeleccionada ? (

          <div
            className="cuentas-detail"
          >

            <Card>

              <div
                className="cuentas-detail__header"
              >

                <div>

                  <span
                    className="cuentas-detail__eyebrow"
                  >
                    Información bancaria
                  </span>

                  <h3
                    className="cuentas-detail__title"
                  >
                    Detalle de cuenta
                  </h3>

                  <p
                    className="cuentas-detail__subtitle"
                  >
                    {cuentaSeleccionada.nombreInterno}
                  </p>

                </div>


                <IconButton
                  type="button"
                  label="Cerrar detalle"
                  icon={
                    <X
                      size={16}
                    />
                  }
                  onClick={() =>
                    setCuentaSeleccionada(
                      null
                    )
                  }
                />

              </div>


              <div
                className="cuentas-detail__grid"
              >

                <DatoDetalle
                  etiqueta="Banco"
                  valor={
                    cuentaSeleccionada.bancoNombre
                  }
                />

                <DatoDetalle
                  etiqueta="Código de cuenta"
                  valor={
                    cuentaSeleccionada.codigoCuenta
                  }
                />

                <DatoDetalle
                  etiqueta="Número de cuenta"
                  valor={
                    enmascararNumeroCuenta(
                      cuentaSeleccionada.numeroCuenta
                    )
                  }
                />

                <DatoDetalle
                  etiqueta="Tipo de cuenta"
                  valor={
                    cuentaSeleccionada.tipoCuentaNombre
                  }
                />

                <DatoDetalle
                  etiqueta="Uso principal"
                  valor={
                    obtenerEtiquetaUso(
                      cuentaSeleccionada.usoPrincipal
                    )
                  }
                />

                <DatoDetalle
                  etiqueta="Estado"
                  valor={
                    obtenerEtiquetaEstado(
                      cuentaSeleccionada.estado
                    )
                  }
                />

                <DatoDetalle
                  etiqueta="Saldo inicial"
                  valor={
                    formatearSaldo(
                      cuentaSeleccionada.saldoInicial
                    )
                  }
                />

                <DatoDetalle
                  etiqueta="Fecha de apertura"
                  valor={
                    formatearFecha(
                      cuentaSeleccionada.fechaApertura
                    )
                  }
                />

                <DatoDetalle
                  etiqueta="Fecha de cierre"
                  valor={
                    formatearFecha(
                      cuentaSeleccionada.fechaCierre
                    )
                  }
                />

              </div>


              {cuentaSeleccionada.observaciones ? (

                <div
                  className="cuentas-detail__observations"
                >

                  <DatoDetalle
                    etiqueta="Observaciones"
                    valor={
                      cuentaSeleccionada.observaciones
                    }
                  />

                </div>

              ) : null}

            </Card>

          </div>

        ) : null}


        {creandoCuenta ? (

          <CuentaCreateDialog
            bancos={
              opcionesCreacion.bancos
            }
            monedas={
              opcionesCreacion.monedas
            }
            tiposCuenta={
              opcionesCreacion.tiposCuenta
            }
            responsables={
              opcionesCreacion.responsables
            }
            empresaId={
              opcionesCreacion.empresaId
            }
            procesando={
              procesando
            }
            error={
              error
            }
            onCancel={
              cerrarCreacion
            }
            onSubmit={
              guardarCreacion
            }
          />

        ) : null}


        {cuentaEditando ? (

          <CuentaEditDialog
            cuenta={
              cuentaEditando
            }
            procesando={
              procesando
            }
            error={
              error
            }
            onCancel={
              cerrarEdicion
            }
            onSubmit={
              guardarEdicion
            }
          />

        ) : null}


        {cambioEstado ? (

          <CuentaEstadoDialog
            cuenta={
              cambioEstado.cuenta
            }
            nuevoEstado={
              cambioEstado.nuevoEstado
            }
            procesando={
              procesando
            }
            error={
              error
            }
            onCancel={
              cerrarCambioEstado
            }
            onConfirm={
              confirmarCambioEstado
            }
          />

        ) : null}

      </div>

    </PageContainer>
  );
}


type ResumenCardProps = {
  clase:
    string;

  icono:
    ReactNode;

  etiqueta:
    string;

  valor:
    number;

  ayuda:
    string;
};


function ResumenCard({
  clase,
  icono,
  etiqueta,
  valor,
  ayuda,
}: ResumenCardProps) {

  return (
    <div
      className={
        `cuentas-summary-card ${clase}`
      }
    >

      <Card>

        <div
          className="cuentas-summary-card__content"
        >

          <span
            className="cuentas-summary-card__icon"
            aria-hidden="true"
          >
            {icono}
          </span>


          <div
            className="cuentas-summary-card__body"
          >

            <span
              className="cuentas-summary-card__label"
            >
              {etiqueta}
            </span>

            <strong
              className="cuentas-summary-card__value"
            >
              {valor}
            </strong>

            <span
              className="cuentas-summary-card__helper"
            >
              {ayuda}
            </span>

          </div>

        </div>

      </Card>

    </div>
  );
}


type DatoDetalleProps = {
  etiqueta:
    string;

  valor:
    string;
};


function DatoDetalle({
  etiqueta,
  valor,
}: DatoDetalleProps) {

  return (
    <div
      className="cuentas-detail__item"
    >

      <span
        className="cuentas-detail__label"
      >
        {etiqueta}
      </span>

      <div
        className="cuentas-detail__value"
      >
        {valor}
      </div>

    </div>
  );
}
