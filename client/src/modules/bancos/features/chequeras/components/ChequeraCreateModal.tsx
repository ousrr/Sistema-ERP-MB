import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { X } from "lucide-react";

import { Button } from "../../../../../shared/ui/Button";
import { FormField } from "../../../../../shared/forms/FormField";
import { Input } from "../../../../../shared/forms/Input";
import { Select } from "../../../../../shared/forms/Select";
import { Alert } from "../../../../../shared/feedback/Alert";

import {
  actualizarChequera,
  cambiarEstadoChequera,
  crearChequera,
} from "../api/chequeras.api";

import type {
  Chequera,
  EstadoChequera,
} from "../types/chequera.types";

type ChequeraCreateModalProps = {
  open: boolean;
  chequeraEditar?: Chequera | null;
  onClose: () => void;
  onSaved: (chequera: Chequera) => void;
};

function fechaParaInput(
  fecha: string
): string {
  return fecha.length >= 10
    ? fecha.substring(0, 10)
    : fecha;
}

export function ChequeraCreateModal({
  open,
  chequeraEditar = null,
  onClose,
  onSaved,
}: ChequeraCreateModalProps) {
  const esEdicion =
    chequeraEditar !== null;

  const [
    cuentaId,
    setCuentaId,
  ] = useState("");

  const [
    serie,
    setSerie,
  ] = useState("");

  const [
    numeroInicial,
    setNumeroInicial,
  ] = useState("");

  const [
    numeroFinal,
    setNumeroFinal,
  ] = useState("");

  const [
    fechaRecepcion,
    setFechaRecepcion,
  ] = useState("");

  const [
    custodioId,
    setCustodioId,
  ] = useState("");

  const [
    ubicacionFisica,
    setUbicacionFisica,
  ] = useState("");

  const [
    estado,
    setEstado,
  ] = useState<EstadoChequera>(
    "BORRADOR"
  );

  const [
    observaciones,
    setObservaciones,
  ] = useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  function limpiarFormulario() {
    setCuentaId("");
    setSerie("");
    setNumeroInicial("");
    setNumeroFinal("");
    setFechaRecepcion("");
    setCustodioId("");
    setUbicacionFisica("");
    setEstado("BORRADOR");
    setObservaciones("");
    setError(null);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (chequeraEditar) {
      setCuentaId(
        String(
          chequeraEditar.cuentaId
        )
      );

      setSerie(
        chequeraEditar.serie ?? ""
      );

      setNumeroInicial(
        String(
          chequeraEditar.numeroInicial
        )
      );

      setNumeroFinal(
        String(
          chequeraEditar.numeroFinal
        )
      );

      setFechaRecepcion(
        fechaParaInput(
          chequeraEditar.fechaRecepcion
        )
      );

      setCustodioId(
        String(
          chequeraEditar.custodioId
        )
      );

      setUbicacionFisica(
        chequeraEditar
          .ubicacionFisica ?? ""
      );

      setEstado(
        chequeraEditar.estado
      );

      setObservaciones(
        chequeraEditar
          .observaciones ?? ""
      );

      return;
    }

    limpiarFormulario();
  }, [
    open,
    chequeraEditar,
  ]);

  if (!open) {
    return null;
  }

  function cerrar() {
    if (guardando) {
      return;
    }

    limpiarFormulario();
    onClose();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    const cuenta =
      Number(cuentaId);

    const inicial =
      Number(numeroInicial);

    const final =
      Number(numeroFinal);

    const custodio =
      Number(custodioId);

    if (
      !Number.isInteger(cuenta) ||
      cuenta <= 0
    ) {
      setError(
        "La cuenta bancaria debe ser un identificador válido."
      );

      return;
    }

    if (
      !Number.isInteger(custodio) ||
      custodio <= 0
    ) {
      setError(
        "El custodio debe ser un identificador válido."
      );

      return;
    }

    if (
      !Number.isInteger(inicial) ||
      inicial < 0
    ) {
      setError(
        "El número inicial debe ser válido."
      );

      return;
    }

    if (
      !Number.isInteger(final) ||
      final < 0
    ) {
      setError(
        "El número final debe ser válido."
      );

      return;
    }

    if (inicial > final) {
      setError(
        "El número inicial no puede ser mayor que el número final."
      );

      return;
    }

    if (!fechaRecepcion) {
      setError(
        "La fecha de recepción es obligatoria."
      );

      return;
    }

    try {
      setGuardando(true);

      /*
       * MODO EDICIÓN
       *
       * PUT actualiza los datos.
       * PATCH actualiza el estado.
       */
      if (
        esEdicion &&
        chequeraEditar
      ) {
        let actualizada =
          await actualizarChequera(
            chequeraEditar.chequeraId,
            {
              cuentaId: cuenta,

              serie:
                serie.trim() === ""
                  ? null
                  : serie.trim(),

              numeroInicial:
                inicial,

              numeroFinal:
                final,

              fechaRecepcion,

              custodioId:
                custodio,

              ubicacionFisica:
                ubicacionFisica
                  .trim() === ""
                  ? null
                  : ubicacionFisica
                      .trim(),

              documentoRecepcionId:
                chequeraEditar
                  .documentoRecepcionId,

              observaciones:
                observaciones
                  .trim() === ""
                  ? null
                  : observaciones
                      .trim(),
            }
          );

        /*
         * El estado tiene su propia
         * operación en el backend.
         */
        if (
          estado !==
          chequeraEditar.estado
        ) {
          actualizada =
            await cambiarEstadoChequera(
              chequeraEditar
                .chequeraId,
              {
                estado,
              }
            );
        }

        onSaved(actualizada);

        limpiarFormulario();

        onClose();

        return;
      }

      /*
       * MODO REGISTRO
       */
      const nueva =
        await crearChequera({
          cuentaId: cuenta,

          serie:
            serie.trim() === ""
              ? null
              : serie.trim(),

          numeroInicial:
            inicial,

          numeroFinal:
            final,

          fechaRecepcion,

          custodioId:
            custodio,

          ubicacionFisica:
            ubicacionFisica
              .trim() === ""
              ? null
              : ubicacionFisica
                  .trim(),

          documentoRecepcionId:
            null,

          estado,

          observaciones:
            observaciones
              .trim() === ""
              ? null
              : observaciones
                  .trim(),
        });

      onSaved(nueva);

      limpiarFormulario();

      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : esEdicion
            ? "No fue posible actualizar la chequera."
            : "No fue posible registrar la chequera."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent:
          "center",
        padding: "24px",
        background:
          "rgba(15, 23, 42, 0.45)",
      }}
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          cerrar();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chequera-form-title"
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "14px",
          background: "#ffffff",
          boxShadow:
            "0 24px 60px rgba(15, 23, 42, 0.24)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            padding:
              "20px 24px",
            borderBottom:
              "1px solid #e2e8f0",
          }}
        >
          <div>
            <h2
              id="chequera-form-title"
              style={{
                margin: 0,
                fontSize: "20px",
                color: "#0f172a",
              }}
            >
              {esEdicion
                ? "Actualizar chequera"
                : "Registrar chequera"}
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              {esEdicion
                ? "Modifica los datos del registro seleccionado."
                : "Ingresa los datos de la nueva chequera."}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={cerrar}
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            <X size={18} />
          </Button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          style={{
            padding: "24px",
          }}
        >
          {error ? (
            <div
              style={{
                marginBottom:
                  "18px",
              }}
            >
              <Alert>
                {error}
              </Alert>
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <FormField
              label="Cuenta bancaria"
              required
              help="Identificador de la cuenta bancaria."
            >
              <Input
                type="number"
                min="1"
                value={
                  cuentaId
                }
                onChange={(
                  event
                ) =>
                  setCuentaId(
                    event.target
                      .value
                  )
                }
                placeholder="Ej. 1"
                disabled={
                  guardando
                }
              />
            </FormField>

            <FormField
              label="Serie"
            >
              <Input
                value={serie}
                onChange={(
                  event
                ) =>
                  setSerie(
                    event.target
                      .value
                  )
                }
                placeholder="Ej. A"
                disabled={
                  guardando
                }
              />
            </FormField>

            <FormField
              label="Número inicial"
              required
            >
              <Input
                type="number"
                min="0"
                value={
                  numeroInicial
                }
                onChange={(
                  event
                ) =>
                  setNumeroInicial(
                    event.target
                      .value
                  )
                }
                placeholder="Ej. 1001"
                disabled={
                  guardando
                }
              />
            </FormField>

            <FormField
              label="Número final"
              required
            >
              <Input
                type="number"
                min="0"
                value={
                  numeroFinal
                }
                onChange={(
                  event
                ) =>
                  setNumeroFinal(
                    event.target
                      .value
                  )
                }
                placeholder="Ej. 1100"
                disabled={
                  guardando
                }
              />
            </FormField>

            <FormField
              label="Fecha de recepción"
              required
            >
              <Input
                type="date"
                value={
                  fechaRecepcion
                }
                onChange={(
                  event
                ) =>
                  setFechaRecepcion(
                    event.target
                      .value
                  )
                }
                disabled={
                  guardando
                }
              />
            </FormField>

            <FormField
              label="Custodio"
              required
              help="Identificador del custodio responsable."
            >
              <Input
                type="number"
                min="1"
                value={
                  custodioId
                }
                onChange={(
                  event
                ) =>
                  setCustodioId(
                    event.target
                      .value
                  )
                }
                placeholder="Ej. 1"
                disabled={
                  guardando
                }
              />
            </FormField>

            <FormField
              label="Ubicación física"
            >
              <Input
                value={
                  ubicacionFisica
                }
                onChange={(
                  event
                ) =>
                  setUbicacionFisica(
                    event.target
                      .value
                  )
                }
                placeholder="Ej. Caja fuerte principal"
                disabled={
                  guardando
                }
              />
            </FormField>

            <FormField
              label="Estado"
              required
            >
              <Select
                value={estado}
                onChange={(
                  event
                ) =>
                  setEstado(
                    event.target
                      .value as EstadoChequera
                  )
                }
                disabled={
                  guardando
                }
              >
                <option value="BORRADOR">
                  Borrador
                </option>

                <option value="ACTIVA">
                  Activa
                </option>

                {esEdicion ? (
                  <>
                    <option value="AGOTADA">
                      Agotada
                    </option>

                    <option value="INACTIVA">
                      Inactiva
                    </option>
                  </>
                ) : null}
              </Select>
            </FormField>
          </div>

          <div
            style={{
              marginTop:
                "18px",
            }}
          >
            <FormField
              label="Observaciones"
            >
              <textarea
                className="form-input"
                rows={4}
                value={
                  observaciones
                }
                onChange={(
                  event
                ) =>
                  setObservaciones(
                    event.target
                      .value
                  )
                }
                placeholder="Observaciones opcionales"
                disabled={
                  guardando
                }
                style={{
                  resize:
                    "vertical",
                  minHeight:
                    "90px",
                }}
              />
            </FormField>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: "10px",
              marginTop:
                "24px",
              paddingTop:
                "20px",
              borderTop:
                "1px solid #e2e8f0",
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={cerrar}
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
                ? esEdicion
                  ? "Actualizando..."
                  : "Registrando..."
                : esEdicion
                  ? "Actualizar registro"
                  : "Registrar chequera"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}