import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  X,
} from "lucide-react";

import { Button } from "../../../../../shared/ui/Button";
import { FormField } from "../../../../../shared/forms/FormField";
import { Input } from "../../../../../shared/forms/Input";
import { Select } from "../../../../../shared/forms/Select";
import { Alert } from "../../../../../shared/feedback/Alert";

import {
  actualizarPlantillaCheque,
  cambiarEstadoPlantillaCheque,
  crearPlantillaCheque,
} from "../api/plantillas-cheque.api";

import type {
  EstadoPlantillaCheque,
  OrientacionPlantillaCheque,
  PlantillaCheque,
} from "../types/plantilla-cheque.types";


type BancoOption = {
  bancoId: number;
  codigoBanco: string;
  bancoNombre: string;
};


type TipoCuentaOption = {
  tipoCuentaId: number;
  tipoCuentaCodigo: string | null;
  tipoCuentaNombre: string | null;
};


type PlantillaChequeFormModalProps = {
  open: boolean;

  plantillaEditar?:
    | PlantillaCheque
    | null;

  bancos: BancoOption[];

  tiposCuenta: TipoCuentaOption[];

  onClose: () => void;

  onSaved: (
    plantilla: PlantillaCheque
  ) => void;
};


export function PlantillaChequeFormModal({
  open,
  plantillaEditar = null,
  bancos,
  tiposCuenta,
  onClose,
  onSaved,
}: PlantillaChequeFormModalProps) {
  const esEdicion =
    plantillaEditar !== null;

  const [
    bancoId,
    setBancoId,
  ] = useState("");

  const [
    tipoCuentaId,
    setTipoCuentaId,
  ] = useState("");

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    tamanoPapel,
    setTamanoPapel,
  ] = useState("CARTA");

  const [
    orientacion,
    setOrientacion,
  ] =
    useState<OrientacionPlantillaCheque>(
      "HORIZONTAL"
    );

  const [
    margenSuperiorMm,
    setMargenSuperiorMm,
  ] = useState("10");

  const [
    margenInferiorMm,
    setMargenInferiorMm,
  ] = useState("10");

  const [
    margenIzquierdoMm,
    setMargenIzquierdoMm,
  ] = useState("10");

  const [
    margenDerechoMm,
    setMargenDerechoMm,
  ] = useState("10");

  const [
    archivoFondoId,
    setArchivoFondoId,
  ] = useState("");

  const [
    estado,
    setEstado,
  ] =
    useState<EstadoPlantillaCheque>(
      "ACTIVA"
    );

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  function limpiarFormulario() {
    setBancoId(
      bancos.length > 0
        ? String(
            bancos[0].bancoId
          )
        : ""
    );

    setTipoCuentaId("");

    setNombre("");

    setTamanoPapel(
      "CARTA"
    );

    setOrientacion(
      "HORIZONTAL"
    );

    setMargenSuperiorMm(
      "10"
    );

    setMargenInferiorMm(
      "10"
    );

    setMargenIzquierdoMm(
      "10"
    );

    setMargenDerechoMm(
      "10"
    );

    setArchivoFondoId("");

    setEstado(
      "ACTIVA"
    );

    setError(null);
  }


  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (plantillaEditar) {
      setBancoId(
        String(
          plantillaEditar.bancoId
        )
      );

      setTipoCuentaId(
        plantillaEditar.tipoCuentaId ===
          null
          ? ""
          : String(
              plantillaEditar.tipoCuentaId
            )
      );

      setNombre(
        plantillaEditar.nombre
      );

      setTamanoPapel(
        plantillaEditar.tamanoPapel
      );

      setOrientacion(
        plantillaEditar.orientacion
      );

      setMargenSuperiorMm(
        String(
          plantillaEditar.margenSuperiorMm
        )
      );

      setMargenInferiorMm(
        String(
          plantillaEditar.margenInferiorMm
        )
      );

      setMargenIzquierdoMm(
        String(
          plantillaEditar.margenIzquierdoMm
        )
      );

      setMargenDerechoMm(
        String(
          plantillaEditar.margenDerechoMm
        )
      );

      setArchivoFondoId(
        plantillaEditar.archivoFondoId ===
          null
          ? ""
          : String(
              plantillaEditar.archivoFondoId
            )
      );

      setEstado(
        plantillaEditar.estado
      );

      return;
    }

    limpiarFormulario();
  }, [
    open,
    plantillaEditar,
    bancos,
  ]);


  if (!open) {
    return null;
  }


  function cerrar() {
    if (guardando) {
      return;
    }

    setError(null);

    onClose();
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    const banco =
      Number(bancoId);

    const tipoCuenta =
      tipoCuentaId === ""
        ? null
        : Number(
            tipoCuentaId
          );

    const margenSuperior =
      Number(
        margenSuperiorMm
      );

    const margenInferior =
      Number(
        margenInferiorMm
      );

    const margenIzquierdo =
      Number(
        margenIzquierdoMm
      );

    const margenDerecho =
      Number(
        margenDerechoMm
      );

    const archivoFondo =
      archivoFondoId === ""
        ? null
        : Number(
            archivoFondoId
          );


    if (
      !Number.isInteger(
        banco
      ) ||
      banco <= 0
    ) {
      setError(
        "Debe seleccionar un banco válido."
      );

      return;
    }


    if (
      tipoCuenta !== null &&
      (
        !Number.isInteger(
          tipoCuenta
        ) ||
        tipoCuenta <= 0
      )
    ) {
      setError(
        "El tipo de cuenta seleccionado no es válido."
      );

      return;
    }


    if (
      nombre.trim() === ""
    ) {
      setError(
        "El nombre de la plantilla es obligatorio."
      );

      return;
    }


    if (
      tamanoPapel.trim() === ""
    ) {
      setError(
        "El tamaño de papel es obligatorio."
      );

      return;
    }


    const margenes = [
      margenSuperior,
      margenInferior,
      margenIzquierdo,
      margenDerecho,
    ];


    if (
      margenes.some(
        (margen) =>
          !Number.isFinite(
            margen
          ) ||
          margen < 0
      )
    ) {
      setError(
        "Los márgenes deben ser números mayores o iguales a cero."
      );

      return;
    }


    if (
      archivoFondo !== null &&
      (
        !Number.isInteger(
          archivoFondo
        ) ||
        archivoFondo <= 0
      )
    ) {
      setError(
        "El archivo de fondo debe ser un identificador válido."
      );

      return;
    }


    try {
      setGuardando(true);

      /*
       * ==========================
       * ACTUALIZAR
       * ==========================
       */
      if (
        esEdicion &&
        plantillaEditar
      ) {
        let actualizada =
          await actualizarPlantillaCheque(
            plantillaEditar.plantillaId,
            {
              bancoId:
                banco,

              tipoCuentaId:
                tipoCuenta,

              nombre:
                nombre.trim(),

              tamanoPapel:
                tamanoPapel
                  .trim(),

              orientacion,

              margenSuperiorMm:
                margenSuperior,

              margenInferiorMm:
                margenInferior,

              margenIzquierdoMm:
                margenIzquierdo,

              margenDerechoMm:
                margenDerecho,

              archivoFondoId:
                archivoFondo,
            }
          );


        /*
         * El estado tiene su propia
         * operación PATCH.
         */
        if (
          estado !==
          plantillaEditar.estado
        ) {
          actualizada =
            await cambiarEstadoPlantillaCheque(
              plantillaEditar.plantillaId,
              {
                estado,
              }
            );
        }


        onSaved(
          actualizada
        );

        onClose();

        return;
      }


      /*
       * ==========================
       * CREAR
       * ==========================
       */
      const nueva =
        await crearPlantillaCheque(
          {
            bancoId:
              banco,

            tipoCuentaId:
              tipoCuenta,

            nombre:
              nombre.trim(),

            tamanoPapel:
              tamanoPapel
                .trim(),

            orientacion,

            margenSuperiorMm:
              margenSuperior,

            margenInferiorMm:
              margenInferior,

            margenIzquierdoMm:
              margenIzquierdo,

            margenDerechoMm:
              margenDerecho,

            archivoFondoId:
              archivoFondo,

            estado,
          }
        );


      onSaved(
        nueva
      );

      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : esEdicion
            ? "No fue posible actualizar la plantilla."
            : "No fue posible registrar la plantilla."
      );
    } finally {
      setGuardando(
        false
      );
    }
  }


  return (
    <div
      className="plantilla-form-backdrop"
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
        className="plantilla-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plantilla-form-title"
      >
        <div className="plantilla-form-modal__header">
          <div>
            <h2
              id="plantilla-form-title"
            >
              {esEdicion
                ? "Actualizar plantilla"
                : "Nueva plantilla"}
            </h2>

            <p>
              {esEdicion
                ? "Modifica la configuración de la plantilla seleccionada."
                : "Configura una nueva plantilla para impresión de cheques."}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={
              cerrar
            }
            disabled={
              guardando
            }
            aria-label="Cerrar formulario"
          >
            <X
              size={18}
            />
          </Button>
        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="plantilla-form-modal__body"
        >
          {error ? (
            <div className="plantilla-form-error">
              <Alert>
                {error}
              </Alert>
            </div>
          ) : null}


          <div className="plantilla-form-grid">
            <FormField
              label="Banco"
              required
            >
              <Select
                value={
                  bancoId
                }
                onChange={(
                  event
                ) =>
                  setBancoId(
                    event.target.value
                  )
                }
                disabled={
                  guardando
                }
              >
                <option value="">
                  Seleccione un banco
                </option>

                {bancos.map(
                  (banco) => (
                    <option
                      key={
                        banco.bancoId
                      }
                      value={
                        banco.bancoId
                      }
                    >
                      {banco.codigoBanco} -{" "}
                      {banco.bancoNombre}
                    </option>
                  )
                )}
              </Select>
            </FormField>


            <FormField
              label="Tipo de cuenta"
              help="Puede dejarse sin seleccionar."
            >
              <Select
                value={
                  tipoCuentaId
                }
                onChange={(
                  event
                ) =>
                  setTipoCuentaId(
                    event.target.value
                  )
                }
                disabled={
                  guardando
                }
              >
                <option value="">
                  Todos / No específico
                </option>

                {tiposCuenta.map(
                  (tipo) => (
                    <option
                      key={
                        tipo.tipoCuentaId
                      }
                      value={
                        tipo.tipoCuentaId
                      }
                    >
                      {tipo.tipoCuentaNombre ??
                        tipo.tipoCuentaCodigo ??
                        `Tipo ${tipo.tipoCuentaId}`}
                    </option>
                  )
                )}
              </Select>
            </FormField>


            <FormField
              label="Nombre"
              required
            >
              <Input
                value={
                  nombre
                }
                onChange={(
                  event
                ) =>
                  setNombre(
                    event.target.value
                  )
                }
                placeholder="Ej. Plantilla BAM Monetaria"
                disabled={
                  guardando
                }
              />
            </FormField>


            <FormField
              label="Tamaño de papel"
              required
            >
              <Input
                value={
                  tamanoPapel
                }
                onChange={(
                  event
                ) =>
                  setTamanoPapel(
                    event.target.value
                  )
                }
                placeholder="Ej. CARTA"
                disabled={
                  guardando
                }
              />
            </FormField>


            <FormField
              label="Orientación"
              required
            >
              <Select
                value={
                  orientacion
                }
                onChange={(
                  event
                ) =>
                  setOrientacion(
                    event.target
                      .value as OrientacionPlantillaCheque
                  )
                }
                disabled={
                  guardando
                }
              >
                <option value="HORIZONTAL">
                  Horizontal
                </option>

                <option value="VERTICAL">
                  Vertical
                </option>
              </Select>
            </FormField>


            <FormField
              label="Estado"
              required
            >
              <Select
                value={
                  estado
                }
                onChange={(
                  event
                ) =>
                  setEstado(
                    event.target
                      .value as EstadoPlantillaCheque
                  )
                }
                disabled={
                  guardando
                }
              >
                <option value="ACTIVA">
                  Activa
                </option>

                <option value="INACTIVA">
                  Inactiva
                </option>
              </Select>
            </FormField>


            <FormField
              label="Margen superior (mm)"
              required
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  margenSuperiorMm
                }
                onChange={(
                  event
                ) =>
                  setMargenSuperiorMm(
                    event.target.value
                  )
                }
                disabled={
                  guardando
                }
              />
            </FormField>


            <FormField
              label="Margen inferior (mm)"
              required
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  margenInferiorMm
                }
                onChange={(
                  event
                ) =>
                  setMargenInferiorMm(
                    event.target.value
                  )
                }
                disabled={
                  guardando
                }
              />
            </FormField>


            <FormField
              label="Margen izquierdo (mm)"
              required
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  margenIzquierdoMm
                }
                onChange={(
                  event
                ) =>
                  setMargenIzquierdoMm(
                    event.target.value
                  )
                }
                disabled={
                  guardando
                }
              />
            </FormField>


            <FormField
              label="Margen derecho (mm)"
              required
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  margenDerechoMm
                }
                onChange={(
                  event
                ) =>
                  setMargenDerechoMm(
                    event.target.value
                  )
                }
                disabled={
                  guardando
                }
              />
            </FormField>


            <div className="plantilla-form-span">
              <FormField
                label="Archivo de fondo"
                help="Identificador opcional del documento bancario utilizado como fondo."
              >
                <Input
                  type="number"
                  min="1"
                  value={
                    archivoFondoId
                  }
                  onChange={(
                    event
                  ) =>
                    setArchivoFondoId(
                      event.target.value
                    )
                  }
                  placeholder="Opcional"
                  disabled={
                    guardando
                  }
                />
              </FormField>
            </div>
          </div>


          <div className="plantilla-form-modal__footer">
            <Button
              type="button"
              variant="outline"
              onClick={
                cerrar
              }
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
                  : "Registrar plantilla"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}