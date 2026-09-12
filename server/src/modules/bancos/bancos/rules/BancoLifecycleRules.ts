import type {
  Banco
} from "../models/Banco.js";

import {
  BancoConflictError
} from "./BancoConflictError.js";


export class BancoLifecycleRules {

  // =====================================================
  // VALIDAR SI EL BANCO PUEDE EDITARSE
  // =====================================================

  static validarPuedeEditar(
    banco: Banco
  ): void {

    if (
      banco.estado === "INACTIVO"
    ) {

      throw BancoConflictError
        .bancoInactivoNoEditable(
          banco.nombre
        );
    }
  }
}