import {
  useMemo,
  useState,
} from "react";

import {
  Ban,
  Clock3,
  Eye,
  Landmark,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import { Alert } from "../../../../../shared/feedback/Alert";
import { EmptyState } from "../../../../../shared/feedback/EmptyState";
import { SearchInput } from "../../../../../shared/forms/SearchInput";
import { Select } from "../../../../../shared/forms/Select";
import { PageContainer } from "../../../../../shared/layout/PageContainer";
import { PageHeader } from "../../../../../shared/layout/PageHeader";
import { DataTable } from "../../../../../shared/tables/DataTable";
import { Badge } from "../../../../../shared/ui/Badge";
import { Button } from "../../../../../shared/ui/Button";
import { Card } from "../../../../../shared/ui/Card";
import { IconButton } from "../../../../../shared/ui/IconButton";

import {
  CuentaProveedorFormDialog,
} from "../components/CuentaProveedorFormDialog";
import type {
  DependenciasCuentaProveedor,
} from "../components/CuentaProveedorFormDialog";
import { CuentaProveedorEstadoDialog } from "../components/CuentaProveedorEstadoDialog";
import { useCuentasProveedor } from "../hooks/useCuentasProveedor";
import type {
  ActualizarCuentaProveedorInput,
  CrearCuentaProveedorInput,
  CuentaProveedor,
  EstadoCuentaProveedor,
} from "../types/cuentas-proveedor.types";

import "./CuentasProveedorPage.css";

type FiltroEstado = "TODOS" | EstadoCuentaProveedor;

function obtenerEtiquetaEstado(estado: EstadoCuentaProveedor): string {
  const etiquetas: Record<EstadoCuentaProveedor, string> = {
    PENDIENTE: "Pendiente",
    EN_REVISION: "En revisión",
    VERIFICADA: "Verificada",
    RECHAZADA: "Rechazada",
    BLOQUEADA: "Bloqueada",
    INACTIVA: "Inactiva",
  };

  return etiquetas[estado];
}

function enmascararCuenta(numeroCuenta: string): string {
  const numero = numeroCuenta.trim();
  if (numero.length <= 4) return "••••";
  return `•••• ${numero.slice(-4)}`;
}

function formatearFecha(valor: string | null): string {
  if (!valor?.trim()) return "Sin fecha";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-GT", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(fecha);
}

function puedeEditarCuentaProveedor(
  estado: EstadoCuentaProveedor
): boolean {
  return (
    estado === "PENDIENTE" ||
    estado === "EN_REVISION" ||
    estado === "RECHAZADA"
  );
}

export function CuentasProveedorPage() {
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
  } = useCuentasProveedor();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("TODOS");
  const [cuentaSeleccionada, setCuentaSeleccionada] =
    useState<CuentaProveedor | null>(null);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<CuentaProveedor | null>(null);
  const [cambiandoEstado, setCambiandoEstado] =
    useState<CuentaProveedor | null>(null);

  const dependencias = useMemo<DependenciasCuentaProveedor>(() => {
    const proveedores = new Map<number, string>();
    const bancos = new Map<number, string>();
    const tiposCuenta = new Map<number, string>();
    const monedas = new Map<number, string>();
    const documentos = new Map<string, string>();
    const cuentasAnteriores = new Map<string, string>();

    for (const cuenta of cuentas) {
      proveedores.set(cuenta.proveedorId, `Proveedor #${cuenta.proveedorId}`);
      bancos.set(
        cuenta.bancoId,
        `${cuenta.codigoBanco} - ${cuenta.bancoNombre}`
      );
      tiposCuenta.set(
        cuenta.tipoCuentaId,
        `${cuenta.tipoCuentaCodigo} - ${cuenta.tipoCuentaNombre}`
      );
      monedas.set(cuenta.monedaId, `Moneda #${cuenta.monedaId}`);
      documentos.set(
        cuenta.cartaSolicitudDocId,
        `Documento #${cuenta.cartaSolicitudDocId}`
      );
      documentos.set(
        cuenta.constanciaBancoDocId,
        `Documento #${cuenta.constanciaBancoDocId}`
      );
      if (cuenta.representanteDocId) {
        documentos.set(
          cuenta.representanteDocId,
          `Documento #${cuenta.representanteDocId}`
        );
      }
      cuentasAnteriores.set(
        cuenta.ctaProveedorId,
        `#${cuenta.ctaProveedorId} · ${cuenta.titular} · ${enmascararCuenta(cuenta.numeroCuenta)}`
      );
    }

    return {
      proveedores: Array.from(proveedores, ([id, etiqueta]) => ({ id, etiqueta })),
      bancos: Array.from(bancos, ([id, etiqueta]) => ({ id, etiqueta })),
      tiposCuenta: Array.from(tiposCuenta, ([id, etiqueta]) => ({ id, etiqueta })),
      monedas: Array.from(monedas, ([id, etiqueta]) => ({ id, etiqueta })),
      documentos: Array.from(documentos, ([id, etiqueta]) => ({ id, etiqueta })),
      cuentasAnteriores: Array.from(cuentasAnteriores, ([id, etiqueta]) => ({ id, etiqueta })),
    };
  }, [cuentas]);

  const cuentasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");

    return cuentas.filter((cuenta) => {
      if (filtroEstado !== "TODOS" && cuenta.estado !== filtroEstado) {
        return false;
      }

      if (!termino) return true;

      return [
        cuenta.proveedorId,
        cuenta.bancoNombre,
        cuenta.codigoBanco,
        cuenta.tipoCuentaNombre,
        cuenta.tipoCuentaCodigo,
        cuenta.titular,
        cuenta.numeroCuenta,
        cuenta.estado,
        cuenta.monedaId,
        cuenta.ctaProveedorId,
      ]
        .join(" ")
        .toLocaleLowerCase("es")
        .includes(termino);
    });
  }, [cuentas, busqueda, filtroEstado]);

  const resumen = useMemo(() => ({
    verificadas: cuentas.filter((cuenta) => cuenta.estado === "VERIFICADA").length,
    pendientes: cuentas.filter(
      (cuenta) => cuenta.estado === "PENDIENTE" || cuenta.estado === "EN_REVISION"
    ).length,
    noDisponibles: cuentas.filter(
      (cuenta) =>
        cuenta.estado === "BLOQUEADA" ||
        cuenta.estado === "RECHAZADA" ||
        cuenta.estado === "INACTIVA"
    ).length,
  }), [cuentas]);

  async function guardarNueva(input: CrearCuentaProveedorInput): Promise<void> {
    const ok = await crear(input);
    if (ok) setCreando(false);
  }

  async function guardarEdicion(
    input: ActualizarCuentaProveedorInput
  ): Promise<void> {
    const ok = await actualizar(input);
    if (ok) {
      setEditando(null);
      setCuentaSeleccionada(null);
    }
  }

  async function guardarEstado(estado: EstadoCuentaProveedor): Promise<void> {
    if (!cambiandoEstado) return;

    const ok = await cambiarEstado({
      ctaProveedorId: cambiandoEstado.ctaProveedorId,
      estado,
    });

    if (ok) {
      setCambiandoEstado(null);
      setCuentaSeleccionada(null);
    }
  }

  function refrescar(): void {
    limpiarMensajes();
    void cargar();
  }

  return (
    <PageContainer>
      <div className="cuentas-proveedor-page">
        <PageHeader
          title="Cuentas bancarias de proveedores"
          description="Consulta y administra las cuentas bancarias registradas para proveedores."
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={refrescar}
                disabled={cargando || procesando}
              >
                <RefreshCw size={17} aria-hidden="true" />
                {cargando ? "Actualizando..." : "Actualizar"}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  limpiarMensajes();
                  setCreando(true);
                }}
                disabled={cargando || procesando}
              >
                <Plus size={17} aria-hidden="true" />
                Nueva cuenta
              </Button>
            </>
          }
        />

        <Alert>
          En esta copia local, proveedor/documentos y algunos maestros se obtienen únicamente de registros reales ya cargados. En la integración final deben sustituirse por Persona 3 y los maestros oficiales, sin hardcodes.
        </Alert>

        <div className="cuentas-proveedor-summary">
          <Card>
            <div className="cuentas-proveedor-stat">
              <div className="cuentas-proveedor-stat__icon"><Landmark size={20} /></div>
              <div><span>Total registradas</span><strong>{cuentas.length}</strong></div>
            </div>
          </Card>
          <Card>
            <div className="cuentas-proveedor-stat">
              <div className="cuentas-proveedor-stat__icon"><ShieldCheck size={20} /></div>
              <div><span>Verificadas</span><strong>{resumen.verificadas}</strong></div>
            </div>
          </Card>
          <Card>
            <div className="cuentas-proveedor-stat">
              <div className="cuentas-proveedor-stat__icon"><Clock3 size={20} /></div>
              <div><span>Pendientes / revisión</span><strong>{resumen.pendientes}</strong></div>
            </div>
          </Card>
          <Card>
            <div className="cuentas-proveedor-stat">
              <div className="cuentas-proveedor-stat__icon"><Ban size={20} /></div>
              <div><span>No disponibles</span><strong>{resumen.noDisponibles}</strong></div>
            </div>
          </Card>
        </div>

        {mensaje ? <Alert>{mensaje}</Alert> : null}
        {error ? <Alert>{error}</Alert> : null}

        <Card>
          <div className="cuentas-proveedor-toolbar">
            <SearchInput
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar proveedor, titular, banco o cuenta..."
              aria-label="Buscar cuentas de proveedores"
            />

            <Select
              value={filtroEstado}
              onChange={(event) => setFiltroEstado(event.target.value as FiltroEstado)}
              aria-label="Filtrar por estado"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_REVISION">En revisión</option>
              <option value="VERIFICADA">Verificada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="BLOQUEADA">Bloqueada</option>
              <option value="INACTIVA">Inactiva</option>
            </Select>
          </div>

          {cargando ? (
            <div className="cuentas-proveedor-loading">
              Cargando cuentas bancarias de proveedores...
            </div>
          ) : cuentasFiltradas.length === 0 ? (
            <EmptyState
              title="No hay cuentas para mostrar"
              description={
                cuentas.length === 0
                  ? "No existen cuentas bancarias de proveedores registradas."
                  : "No se encontraron cuentas que coincidan con la búsqueda o el filtro."
              }
            />
          ) : (
            <DataTable
              headers={[
                "Proveedor",
                "Banco",
                "Titular",
                "Cuenta",
                "Tipo",
                "Moneda",
                "Vigencia",
                "Estado",
                "Acciones",
              ]}
            >
              {cuentasFiltradas.map((cuenta) => (
                <tr key={cuenta.ctaProveedorId}>
                  <td>Proveedor #{cuenta.proveedorId}</td>
                  <td>
                    <div className="cuentas-proveedor-bank">
                      <Landmark size={16} aria-hidden="true" />
                      <div>
                        <strong>{cuenta.bancoNombre}</strong>
                        <span>{cuenta.codigoBanco}</span>
                      </div>
                    </div>
                  </td>
                  <td>{cuenta.titular}</td>
                  <td><span className="cuentas-proveedor-account">{enmascararCuenta(cuenta.numeroCuenta)}</span></td>
                  <td>{cuenta.tipoCuentaNombre}</td>
                  <td>Moneda #{cuenta.monedaId}</td>
                  <td>{formatearFecha(cuenta.fechaVigencia)}</td>
                  <td>
                    <span className={`cuentas-proveedor-status cuentas-proveedor-status--${cuenta.estado.toLowerCase()}`}>
                      <Badge>{obtenerEtiquetaEstado(cuenta.estado)}</Badge>
                    </span>
                  </td>
                  <td>
                    <div className="cuentas-proveedor-actions">
                      <IconButton
                        type="button"
                        icon={<Eye size={17} />}
                        label="Ver detalle"
                        onClick={() => setCuentaSeleccionada(cuenta)}
                      />
                      <IconButton
                        type="button"
                        icon={<Pencil size={17} />}
                        label={
                          puedeEditarCuentaProveedor(cuenta.estado)
                            ? "Editar cuenta"
                            : "La cuenta no puede editarse en su estado actual"
                        }
                        disabled={
                          procesando ||
                          !puedeEditarCuentaProveedor(cuenta.estado)
                        }
                        onClick={() => {
                          if (!puedeEditarCuentaProveedor(cuenta.estado)) {
                            return;
                          }

                          limpiarMensajes();
                          setEditando(cuenta);
                        }}
                      />
                      <IconButton
                        type="button"
                        icon={<RefreshCw size={17} />}
                        label="Cambiar estado"
                        onClick={() => {
                          limpiarMensajes();
                          setCambiandoEstado(cuenta);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}

          <div className="cuentas-proveedor-results">
            Mostrando <strong>{cuentasFiltradas.length}</strong> de <strong>{cuentas.length}</strong> cuentas
          </div>
        </Card>

        {cuentaSeleccionada ? (
          <Card>
            <div className="cuentas-proveedor-detail">
              <div className="cuentas-proveedor-detail__header">
                <div><span>Detalle de cuenta</span><h3>{cuentaSeleccionada.titular}</h3></div>
                <IconButton
                  type="button"
                  icon={<X size={18} />}
                  label="Cerrar detalle"
                  onClick={() => setCuentaSeleccionada(null)}
                />
              </div>

              <div className="cuentas-proveedor-detail__grid">
                <div><span>ID seguro</span><strong>{cuentaSeleccionada.ctaProveedorId}</strong></div>
                <div><span>Proveedor</span><strong>Proveedor #{cuentaSeleccionada.proveedorId}</strong></div>
                <div><span>Banco</span><strong>{cuentaSeleccionada.bancoNombre}</strong></div>
                <div><span>Número de cuenta</span><strong>{enmascararCuenta(cuentaSeleccionada.numeroCuenta)}</strong></div>
                <div><span>Tipo de cuenta</span><strong>{cuentaSeleccionada.tipoCuentaNombre}</strong></div>
                <div><span>Moneda</span><strong>Moneda #{cuentaSeleccionada.monedaId}</strong></div>
                <div><span>Estado</span><strong>{obtenerEtiquetaEstado(cuentaSeleccionada.estado)}</strong></div>
                <div><span>Fecha de vigencia</span><strong>{formatearFecha(cuentaSeleccionada.fechaVigencia)}</strong></div>
                <div><span>Cuenta anterior</span><strong>{cuentaSeleccionada.cuentaAnteriorId ?? "No aplica"}</strong></div>
                <div><span>Carta de solicitud</span><strong>Documento #{cuentaSeleccionada.cartaSolicitudDocId}</strong></div>
                <div><span>Constancia bancaria</span><strong>Documento #{cuentaSeleccionada.constanciaBancoDocId}</strong></div>
                <div><span>Documento representante</span><strong>{cuentaSeleccionada.representanteDocId ? `Documento #${cuentaSeleccionada.representanteDocId}` : "No aplica"}</strong></div>
                <div><span>Solicitado por</span><strong>Usuario #{cuentaSeleccionada.solicitadoPor}</strong></div>
              </div>

              <div className="cuentas-proveedor-detail__section">
                <span>Motivo del registro</span>
                <p>{cuentaSeleccionada.motivoRegistro}</p>
              </div>
              <div className="cuentas-proveedor-detail__section">
                <span>Observaciones</span>
                <p>{cuentaSeleccionada.observaciones?.trim() || "Sin observaciones."}</p>
              </div>
            </div>
          </Card>
        ) : null}

        {creando ? (
          <CuentaProveedorFormDialog
            mode="create"
            dependencias={dependencias}
            procesando={procesando}
            error={error}
            onCancel={() => {
              if (!procesando) setCreando(false);
            }}
            onSubmit={(input) => guardarNueva(input as CrearCuentaProveedorInput)}
          />
        ) : null}

        {editando ? (
          <CuentaProveedorFormDialog
            mode="edit"
            cuenta={editando}
            dependencias={dependencias}
            procesando={procesando}
            error={error}
            onCancel={() => {
              if (!procesando) setEditando(null);
            }}
            onSubmit={(input) => guardarEdicion(input as ActualizarCuentaProveedorInput)}
          />
        ) : null}

        {cambiandoEstado ? (
          <CuentaProveedorEstadoDialog
            cuenta={cambiandoEstado}
            procesando={procesando}
            error={error}
            onCancel={() => {
              if (!procesando) setCambiandoEstado(null);
            }}
            onConfirm={guardarEstado}
          />
        ) : null}
      </div>
    </PageContainer>
  );
}
