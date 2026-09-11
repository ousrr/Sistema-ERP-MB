import {
  Fragment,
  useEffect,
  useState,
} from "react";

import {
  FileSpreadsheet,
  Search,
} from "lucide-react";

import { Alert } from "../../../../../shared/feedback/Alert";
import { EmptyState } from "../../../../../shared/feedback/EmptyState";
import { SearchInput } from "../../../../../shared/forms/SearchInput";
import { PageContainer } from "../../../../../shared/layout/PageContainer";
import { PageHeader } from "../../../../../shared/layout/PageHeader";
import { DataTable } from "../../../../../shared/tables/DataTable";
import { Button } from "../../../../../shared/ui/Button";

import {
  actualizarFormato,
  cambiarEstadoFormato,
  crearFormato,
} from "../api/formatos-importacion.api";

import { FormatoImportacionForm } from "../components/FormatoImportacionForm";
import { MapeoColumnas } from "../components/MapeoColumnas";
import { useFormatosImportacion } from "../hooks/useFormatosImportacion";

import type {
  CrearFormatoImportacion,
  FormatoImportacion,
} from "../types/formatos-importacion.types";

export function FormatosImportacionPage() {
  const {
    formatosFiltrados,
    busqueda,
    setBusqueda,
    cargando,
    error,
    cargarFormatos,
  } = useFormatosImportacion();

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    formatoEditando,
    setFormatoEditando,
  ] = useState<FormatoImportacion | null>(
    null
  );

  const [
    formatoMapeos,
    setFormatoMapeos,
  ] = useState<FormatoImportacion | null>(
    null
  );

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    mensaje,
    setMensaje,
  ] = useState<string | null>(null);

  const [
    errorFormulario,
    setErrorFormulario,
  ] = useState<string | null>(null);

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
     BLOQUEAR SCROLL CUANDO EL MODAL ESTÁ ABIERTO
     ================================================ */

  useEffect(() => {
    if (!mostrarFormulario) {
      return;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        overflowAnterior;
    };
  }, [mostrarFormulario]);

  /* ================================================
     ABRIR NUEVO FORMATO
     ================================================ */

  function abrirNuevoFormato() {
    setFormatoEditando(null);
    setFormatoMapeos(null);
    setMostrarFormulario(true);
    setMensaje(null);
    setErrorFormulario(null);
  }

  /* ================================================
     EDITAR FORMATO
     ================================================ */

  function abrirEditarFormato(
    formato: FormatoImportacion
  ) {
    setFormatoMapeos(null);
    setFormatoEditando(formato);
    setMostrarFormulario(true);
    setMensaje(null);
    setErrorFormulario(null);
  }

  /* ================================================
     CONFIGURAR MAPEOS
     ================================================ */

  function abrirMapeos(
    formato: FormatoImportacion
  ) {
    /*
     * Si ya está abierto el mismo formato,
     * presionar nuevamente lo cierra.
     */
    if (
      formatoMapeos?.formatoId ===
      formato.formatoId
    ) {
      setFormatoMapeos(null);
      return;
    }

    setMostrarFormulario(false);
    setFormatoEditando(null);

    setFormatoMapeos(
      formato
    );

    setMensaje(null);
    setErrorFormulario(null);
  }

  function cerrarMapeos() {
    setFormatoMapeos(null);
  }

  /* ================================================
     CERRAR FORMULARIO
     ================================================ */

  function cerrarFormulario() {
    if (guardando) {
      return;
    }

    setMostrarFormulario(false);
    setFormatoEditando(null);
    setErrorFormulario(null);
  }

  /* ================================================
     GUARDAR FORMATO
     ================================================ */

  async function manejarGuardarFormato(
    data: CrearFormatoImportacion
  ) {
    try {
      setGuardando(true);
      setMensaje(null);
      setErrorFormulario(null);

      if (formatoEditando) {
        await actualizarFormato(
          formatoEditando.formatoId,
          data
        );

        if (
          data.estado !==
          formatoEditando.estado
        ) {
          await cambiarEstadoFormato(
            formatoEditando.formatoId,
            data.estado
          );
        }

        setMensaje(
          "Formato actualizado correctamente."
        );
      } else {
        await crearFormato(data);

        setMensaje(
          "Formato creado correctamente."
        );
      }

      setMostrarFormulario(false);
      setFormatoEditando(null);
      setErrorFormulario(null);

      await cargarFormatos();
    } catch (err) {
      const mensajeError =
        err instanceof Error
          ? err.message
          : "No se pudo guardar el formato.";

      setErrorFormulario(
        mensajeError
      );
    } finally {
      setGuardando(false);
    }
  }

  /* ================================================
     VALORES DE EDICIÓN
     ================================================ */

  const valoresEdicion:
    | CrearFormatoImportacion
    | undefined =
    formatoEditando
      ? {
          bancoId:
            formatoEditando.bancoId,

          nombre:
            formatoEditando.nombre,

          version:
            formatoEditando.version,

          tipoArchivo:
            formatoEditando.tipoArchivo,

          delimitador:
            formatoEditando.delimitador ??
            "",

          formatoFecha:
            formatoEditando.formatoFecha ??
            "",

          filaEncabezado:
            formatoEditando.filaEncabezado,

          archivoEjemploId:
            formatoEditando.archivoEjemploId,

          estado:
            formatoEditando.estado,
        }
      : undefined;

  /* ================================================
     COLOR ICONO ARCHIVO
     ================================================ */

  function obtenerColorTipoArchivo(
    tipoArchivo: string
  ) {
    switch (
      tipoArchivo.toUpperCase()
    ) {
      case "CSV":
        return "#16a34a";

      case "XLS":
      case "XLSX":
        return "#15803d";

      default:
        return "#64748b";
    }
  }

  /* ================================================
     CLASE VISUAL DE LA FILA
     ================================================ */

  function obtenerClaseFila(
    formato: FormatoImportacion
  ) {
    if (!formatoMapeos) {
      return "formato-row";
    }

    if (
      formato.formatoId ===
      formatoMapeos.formatoId
    ) {
      return "formato-row formato-row--seleccionado";
    }

    return "formato-row formato-row--desenfocado";
  }

  return (
    <PageContainer>
      <style>
        {`
          /* =============================================
             MENSAJE
             ============================================= */

          .mensaje-formato {
            margin-bottom: 20px;

            animation:
              mensajeEntrada 0.25s ease-out,
              mensajeSalida 0.8s ease 3.2s forwards;
          }

          @keyframes mensajeEntrada {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes mensajeSalida {
            from {
              opacity: 1;
            }

            to {
              opacity: 0;
            }
          }


          /* =============================================
             TOOLBAR
             ============================================= */

          .formatos-toolbar {
            display: flex;
            align-items: center;
            justify-content: flex-start;

            gap: 12px;

            margin-bottom: 18px;

            flex-wrap: wrap;

            transition:
              opacity 0.2s ease;
          }

          .formatos-toolbar--bloqueado {
            opacity: 0.55;
          }

          .formatos-search-wrapper {
            position: relative;

            width: 340px;
            max-width: 100%;
          }

          .formatos-search-icon {
            position: absolute;

            left: 12px;
            top: 50%;

            transform:
              translateY(-50%);

            width: 17px;
            height: 17px;

            color: #94a3b8;

            pointer-events: none;

            z-index: 1;
          }

          .formatos-search-wrapper input {
            width: 100%;

            padding-left: 38px;
          }


          /* =============================================
             MODAL DE FORMATO
             ============================================= */

          .formato-modal-overlay {
            position: fixed;

            inset: 0;

            z-index: 1000;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 24px;

            background:
              rgba(15, 23, 42, 0.58);

            backdrop-filter:
              blur(2px);

            animation:
              modalFondoEntrada
              0.18s ease-out;
          }

          .formato-modal {
            width:
              min(
                1200px,
                96vw
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
                0.28
              );

            animation:
              modalEntrada
              0.2s ease-out;
          }

          .formato-modal__header {
            margin:
              -24px
              -24px
              22px
              -24px;

            padding:
              20px 24px;

            background:
              #2563eb;

            border-bottom:
              1px solid #dbe3ef;

            border-radius:
              16px
              16px
              0
              0;
          }

          .formato-modal__title {
            margin:
              0 0 6px 0;

            color:
              #ffffff;

            font-size:
              20px;

            font-weight:
              700;
          }

          .formato-modal__description {
            margin: 0;

            color:
              #dbeafe;

            font-size:
              14px;
          }

          @keyframes modalFondoEntrada {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes modalEntrada {
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
             CAMPOS OBLIGATORIOS MODAL
             ============================================= */

          .formato-modal
          .form-field:has(
            input[required],
            select[required]
          )
          .form-field__label {
            color: #2563eb;

            font-weight: 700;
          }

          .formato-modal
          .form-field:has(
            input[required],
            select[required]
          )
          input,
          .formato-modal
          .form-field:has(
            input[required],
            select[required]
          )
          select {
            border-color:
              #bfdbfe;

            background:
              #f8fbff;
          }


          /* =============================================
             TABLA PRINCIPAL
             ============================================= */

          .formatos-table-wrapper {
            border:
              2px solid #2563eb;

            border-radius:
              14px;

            overflow:
              hidden;

            background:
              #ffffff;

            box-shadow:
              0 2px 8px
              rgba(
                15,
                23,
                42,
                0.05
              );
          }

          .formatos-table-wrapper table {
            width: 100%;

            border-collapse:
              collapse;
          }

          .formatos-table-wrapper thead {
            background:
              #2563eb;
          }

          .formatos-table-wrapper th {
            background:
              #2563eb;

            color:
              #ffffff;

            font-weight:
              700;

            letter-spacing:
              0.05em;

            padding-top:
              17px;

            padding-bottom:
              17px;

            border-bottom:
              1px solid #dbe3ef;
          }

          .formatos-table-wrapper
          th:not(:last-child) {
            border-right:
              1px solid #dbe3ef;
          }

          .formatos-table-wrapper td {
            padding-top:
              15px;

            padding-bottom:
              15px;
          }

          .formatos-table-wrapper
          td:not(:last-child) {
            border-right:
              1px solid #dbe3ef;
          }

          .formatos-table-wrapper
          tbody
          tr:not(:last-child)
          td {
            border-bottom:
              1px solid #edf1f7;
          }


          /* =============================================
             FILAS
             ============================================= */

          .formato-row {
            transition:
              opacity 0.22s ease,
              filter 0.22s ease,
              background-color 0.22s ease,
              box-shadow 0.22s ease;
          }

          .formato-row:hover {
            background:
              #f8fbff;
          }


          /* =============================================
             FILA SELECCIONADA
             ============================================= */

          .formato-row--seleccionado {
            background:
              #eff6ff !important;

            box-shadow:
              inset 5px 0 0
              #2563eb;

            opacity: 1;

            filter: none;
          }

          .formato-row--seleccionado td {
            background:
              #eff6ff !important;
          }


          /* =============================================
             FILAS DESENFOCADAS
             ============================================= */

          .formato-row--desenfocado {
            opacity:
              0.38;

            filter:
              grayscale(0.25)
              saturate(0.45)
              blur(0.35px);

            pointer-events:
              none;
          }


          /* =============================================
             FILA EXPANDIDA DE MAPEO
             ============================================= */

          .mapeo-expanded-row td {
            padding:
              0 !important;

            border-right:
              0 !important;

            background:
              #ffffff;
          }

          .mapeo-expanded-panel {
            padding:
              22px
              24px
              26px;

            background:
              linear-gradient(
                180deg,
                #eff6ff 0%,
                #ffffff 48%
              );

            border-top:
              2px solid
              #60a5fa;

            border-bottom:
              2px solid
              #bfdbfe;

            animation:
              desplegarMapeo
              0.22s ease-out;
          }

          @keyframes desplegarMapeo {
            from {
              opacity: 0;

              transform:
                translateY(-8px);
            }

            to {
              opacity: 1;

              transform:
                translateY(0);
            }
          }


          /* =============================================
             CABECERA DE CONFIGURACIÓN
             ============================================= */

          .mapeo-expanded-header {
            display:
              flex;

            justify-content:
              space-between;

            align-items:
              center;

            gap:
              16px;

            margin-bottom:
              20px;

            padding-bottom:
              16px;

            border-bottom:
              1px solid
              #dbe3ef;
          }

          .mapeo-expanded-title {
            margin:
              0 0 5px 0;

            color:
              #1e40af;

            font-size:
              18px;

            font-weight:
              700;
          }

          .mapeo-expanded-description {
            margin: 0;

            color:
              #64748b;

            font-size:
              14px;
          }


          /* =============================================
             TIPO ARCHIVO
             ============================================= */

          .tipo-archivo {
            display:
              inline-flex;

            align-items:
              center;

            gap:
              8px;

            font-weight:
              500;
          }

          .tipo-archivo__icon {
            display:
              inline-flex;

            align-items:
              center;

            justify-content:
              center;
          }


          /* =============================================
             ESTADOS
             ============================================= */

          .estado-formato {
            display:
              inline-flex;

            align-items:
              center;

            justify-content:
              center;

            min-width:
              76px;

            padding:
              5px 10px;

            border-radius:
              999px;

            font-size:
              12px;

            font-weight:
              700;

            letter-spacing:
              0.02em;

            border:
              1px solid
              transparent;
          }

          .estado-formato--activo {
            color:
              #15803d;

            background:
              #f0fdf4;

            border-color:
              #bbf7d0;
          }

          .estado-formato--inactivo {
            color:
              #b91c1c;

            background:
              #fef2f2;

            border-color:
              #fecaca;
          }


          /* =============================================
             RESPONSIVE
             ============================================= */

          @media (
            max-width: 640px
          ) {
            .formatos-toolbar {
              align-items:
                stretch;
            }

            .formatos-search-wrapper {
              width: 100%;
            }

            .formato-modal-overlay {
              padding: 12px;
            }

            .formato-modal {
              width: 100%;

              max-height:
                94vh;

              padding:
                18px;
            }

            .formato-modal__header {
              margin:
                -18px
                -18px
                20px
                -18px;

              padding:
                18px;
            }

            .mapeo-expanded-panel {
              padding:
                18px;
            }

            .mapeo-expanded-header {
              align-items:
                flex-start;

              flex-direction:
                column;
            }
          }
        `}
      </style>


      {/* ================================================
          ENCABEZADO
          ================================================ */}

      <PageHeader
        title="Formatos de importación"
        description="Administra los formatos utilizados para importar archivos bancarios."
      />


      {/* ================================================
          MENSAJE TEMPORAL
          ================================================ */}

      {mensaje ? (
        <div className="mensaje-formato">
          <Alert>
            {mensaje}
          </Alert>
        </div>
      ) : null}


      {/* ================================================
          BUSCADOR + NUEVO FORMATO
          ================================================ */}

      <div
        className={
          formatoMapeos
            ? "formatos-toolbar formatos-toolbar--bloqueado"
            : "formatos-toolbar"
        }
      >
        <div className="formatos-search-wrapper">
          <Search
            className="formatos-search-icon"
            strokeWidth={2}
          />

          <SearchInput
            placeholder="Buscar formato..."
            value={busqueda}
            disabled={
              formatoMapeos !==
              null
            }
            onChange={(event) =>
              setBusqueda(
                event.target.value
              )
            }
          />
        </div>

        <Button
          type="button"
          onClick={
            abrirNuevoFormato
          }
          disabled={
            formatoMapeos !==
            null
          }
        >
          Nuevo formato
        </Button>
      </div>


      {/* ================================================
          MODAL CREAR / EDITAR
          ================================================ */}

      {mostrarFormulario ? (
        <div
          className="formato-modal-overlay"
          role="presentation"
        >
          <div
            className="formato-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formato-modal"
          >
            <div className="formato-modal__header">
              <h3
                id="titulo-formato-modal"
                className="formato-modal__title"
              >
                {formatoEditando
                  ? "Editar formato de importación"
                  : "Nuevo formato de importación"}
              </h3>

              <p className="formato-modal__description">
                {formatoEditando
                  ? "Modifica la configuración del formato seleccionado."
                  : "Define la configuración que utilizará el sistema para interpretar el archivo bancario."}
              </p>
            </div>

            {errorFormulario ? (
              <Alert>
                {errorFormulario}
              </Alert>
            ) : null}

            <FormatoImportacionForm
              initialValues={
                valoresEdicion
              }
              onSubmit={
                manejarGuardarFormato
              }
              onCancel={
                cerrarFormulario
              }
              guardando={
                guardando
              }
              submitLabel={
                formatoEditando
                  ? "Actualizar formato"
                  : "Guardar formato"
              }
            />
          </div>
        </div>
      ) : null}


      {/* ================================================
          ERROR GENERAL
          ================================================ */}

      {error ? (
        <Alert>
          <p>
            {error}
          </p>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              void cargarFormatos()
            }
          >
            Reintentar
          </Button>
        </Alert>
      ) : null}


      {/* ================================================
          TABLA
          ================================================ */}

      {cargando ? (
        <p>
          Cargando formatos...
        </p>
      ) : formatosFiltrados.length ===
        0 ? (
        <EmptyState
          title="Sin formatos de importación"
          description="No se encontraron formatos de importación."
        />
      ) : (
        <div className="formatos-table-wrapper">
          <DataTable
            headers={[
              "Banco",
              "Nombre",
              "Versión",
              "Tipo de archivo",
              "Formato de fecha",
              "Estado",
              "Acciones",
            ]}
          >
            {formatosFiltrados.map(
              (formato) => {
                const seleccionado =
                  formatoMapeos?.formatoId ===
                  formato.formatoId;

                return (
                  <Fragment
                    key={
                      formato.formatoId
                    }
                  >
                    {/* =============================
                        FILA DEL FORMATO
                        ============================= */}

                    <tr
                      className={
                        obtenerClaseFila(
                          formato
                        )
                      }
                    >
                      <td>
                        {
                          formato.banco
                        }
                      </td>

                      <td>
                        <strong>
                          {
                            formato.nombre
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          formato.version
                        }
                      </td>

                      <td>
                        <span className="tipo-archivo">
                          <span
                            className="tipo-archivo__icon"
                            style={{
                              color:
                                obtenerColorTipoArchivo(
                                  formato.tipoArchivo
                                ),
                            }}
                          >
                            <FileSpreadsheet
                              size={20}
                              strokeWidth={
                                1.8
                              }
                            />
                          </span>

                          <span>
                            {
                              formato.tipoArchivo
                            }
                          </span>
                        </span>
                      </td>

                      <td>
                        {
                          formato.formatoFecha ??
                          "-"
                        }
                      </td>

                      <td>
                        <span
                          className={
                            formato.estado ===
                            "ACTIVO"
                              ? "estado-formato estado-formato--activo"
                              : "estado-formato estado-formato--inactivo"
                          }
                        >
                          {
                            formato.estado
                          }
                        </span>
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
                              formatoMapeos !==
                                null &&
                              !seleccionado
                            }
                            onClick={() =>
                              abrirEditarFormato(
                                formato
                              )
                            }
                          >
                            Editar
                          </Button>

                          <Button
                            type="button"
                            variant={
                              seleccionado
                                ? "primary"
                                : "secondary"
                            }
                            disabled={
                              formatoMapeos !==
                                null &&
                              !seleccionado
                            }
                            onClick={() =>
                              abrirMapeos(
                                formato
                              )
                            }
                          >
                            {seleccionado
                              ? "Cerrar mapeos"
                              : "Configurar mapeos"}
                          </Button>
                        </div>
                      </td>
                    </tr>


                    {/* =============================
                        MAPEO DEBAJO DE LA FILA
                        ============================= */}

                    {seleccionado ? (
                      <tr className="mapeo-expanded-row">
                        <td colSpan={7}>
                          <div className="mapeo-expanded-panel">

                            <div className="mapeo-expanded-header">
                              <div>
                                <h3 className="mapeo-expanded-title">
                                  Configuración de mapeos
                                </h3>

                                <p className="mapeo-expanded-description">
                                  Configurando{" "}
                                  <strong>
                                    {
                                      formato.nombre
                                    }
                                  </strong>
                                  {" · "}
                                  Versión{" "}
                                  {
                                    formato.version
                                  }
                                </p>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                onClick={
                                  cerrarMapeos
                                }
                              >
                                Cerrar configuración
                              </Button>
                            </div>

                            <MapeoColumnas
                              formatoId={
                                formato.formatoId
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              }
            )}
          </DataTable>
        </div>
      )}
    </PageContainer>
  );
}