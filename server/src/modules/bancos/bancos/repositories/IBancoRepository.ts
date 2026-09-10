import {
  Banco,
  EstadoBanco,
  CrearBancoData,
  ActualizarBancoData
} from '../models/Banco.js';

export interface IBancoRepository {

  listar(): Promise<Banco[]>;

  obtenerPorId(
    bancoId: number
  ): Promise<Banco | null>;

  crear(
    datos: CrearBancoData
  ): Promise<number>;

  actualizar(
    bancoId: number,
    datos: ActualizarBancoData
  ): Promise<void>;

  cambiarEstado(
    bancoId: number,
    estado: EstadoBanco
  ): Promise<void>;
}