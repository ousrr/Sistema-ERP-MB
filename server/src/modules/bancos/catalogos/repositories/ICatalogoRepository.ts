import type {
  CatalogoBancario,
  CatalogoOpcion,
  EstadoCatalogo,
  CrearCatalogoData,
  ActualizarCatalogoData
} from "../models/CatalogoBancario.js";


export interface ICatalogoRepository {

  listar():
    Promise<CatalogoBancario[]>;


  obtenerPorId(
    catalogoId: number
  ): Promise<CatalogoBancario | null>;


  listarPorGrupo(
    grupo: string
  ): Promise<CatalogoOpcion[]>;


  crear(
    datos: CrearCatalogoData
  ): Promise<number>;


  actualizar(
    catalogoId: number,
    datos: ActualizarCatalogoData
  ): Promise<void>;


  cambiarEstado(
    catalogoId: number,
    estado: EstadoCatalogo
  ): Promise<void>;
}
