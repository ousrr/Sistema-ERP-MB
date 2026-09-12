import type {
  IBancoRepository
} from "../repositories/IBancoRepository.js";

import type {
  Banco,
  EstadoBanco,
  CrearBancoData,
  ActualizarBancoData
} from "../models/Banco.js";

import {
  BancoRules
} from "../rules/BancoRules.js";

import {
  BancoLifecycleRules
} from "../rules/BancoLifecycleRules.js";

import {
  BancoNotFoundError
} from "../rules/BancoNotFoundError.js";


export class BancoService {

  constructor(
    private readonly bancoRepository:
      IBancoRepository
  ) {}


  // =====================================================
  // LISTAR
  // =====================================================

  async listar():
    Promise<Banco[]> {

    return this.bancoRepository
      .listar();
  }


  // =====================================================
  // OBTENER POR ID
  // =====================================================

  async obtenerPorId(
    bancoId: number
  ): Promise<Banco | null> {

    return this.bancoRepository
      .obtenerPorId(
        bancoId
      );
  }


  // =====================================================
  // CREAR
  // =====================================================

  async crear(
    datos: CrearBancoData
  ): Promise<number> {

    /*
      1. Normaliza los datos.
      2. Aplica las validaciones del modelo.
      3. Solo entonces pasa al Repository.
    */
    const datosPreparados =
      BancoRules.prepararCreacion(
        datos
      );


    return this.bancoRepository
      .crear(
        datosPreparados
      );
  }


  // =====================================================
  // ACTUALIZAR
  // =====================================================

  async actualizar(
    bancoId: number,
    datos: ActualizarBancoData
  ): Promise<void> {

    /*
      Primero obtenemos el estado REAL almacenado
      actualmente en Oracle.

      No confiamos en el frontend para decidir
      si un banco puede editarse.
    */
    const bancoActual =
      await this.bancoRepository
        .obtenerPorId(
          bancoId
        );


    if (
      !bancoActual
    ) {

      throw new BancoNotFoundError(
        bancoId
      );
    }


    /*
      Regla del ciclo de vida:

      ACTIVO   -> puede editarse.
      INACTIVO -> debe activarse antes de editarse.
    */
    BancoLifecycleRules
      .validarPuedeEditar(
        bancoActual
      );


    /*
      Después de validar el estado,
      aplicamos las reglas de contenido
      sobre los nuevos datos.
    */
    const datosPreparados =
      BancoRules.prepararActualizacion(
        datos
      );


    await this.bancoRepository
      .actualizar(
        bancoId,
        datosPreparados
      );
  }


  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  async cambiarEstado(
    bancoId: number,
    estado: EstadoBanco
  ): Promise<void> {

    await this.bancoRepository
      .cambiarEstado(
        bancoId,
        estado
      );
  }
}