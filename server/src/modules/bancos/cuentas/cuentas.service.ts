import {
  CuentaBancariaRepository
} from './cuentas.repository.js';

import type {
  CuentaBancariaActiva,
  FiltrosCuentaBancariaActiva,
  ActualizarCuentaBancariaInput,
  CambiarEstadoCuentaBancariaInput,
  CrearCuentaBancariaInput,
  CuentaBancaria,
  EstadoCuentaBancaria,
  FiltrosCuentaBancaria
} from './cuentas.types.js';


const ESTADOS_VALIDOS:
  readonly EstadoCuentaBancaria[] = [
    'BORRADOR',
    'ACTIVA',
    'INACTIVA',
    'CERRADA'
  ];


const ESTADOS_INICIALES_VALIDOS:
  readonly EstadoCuentaBancaria[] = [
    'BORRADOR',
    'ACTIVA'
  ];


export class CuentaBancariaValidationError
  extends Error {

  constructor(
    message: string
  ) {
    super(message);

    this.name =
      'CuentaBancariaValidationError';
  }
}


export class CuentaBancariaNotFoundError
  extends Error {

  constructor(
    message: string
  ) {
    super(message);

    this.name =
      'CuentaBancariaNotFoundError';
  }
}


export class CuentaBancariaConflictError
  extends Error {

  constructor(
    message: string
  ) {
    super(message);

    this.name =
      'CuentaBancariaConflictError';
  }
}


interface OracleErrorLike {
  errorNum?: number;
  code?: string;
  message?: string;
}


function obtenerCodigoOracle(
  error: unknown
): number | null {

  if (
    typeof error !== 'object' ||
    error === null
  ) {
    return null;
  }


  const oracleError =
    error as OracleErrorLike;


  if (
    typeof oracleError.errorNum ===
      'number' &&
    Number.isInteger(
      oracleError.errorNum
    )
  ) {
    return Math.abs(
      oracleError.errorNum
    );
  }


  if (
    typeof oracleError.code ===
      'string'
  ) {

    const coincidenciaCodigo =
      oracleError.code.match(
        /ORA-(\d+)/i
      );


    if (
      coincidenciaCodigo?.[1]
    ) {
      return Number(
        coincidenciaCodigo[1]
      );
    }
  }


  if (
    typeof oracleError.message ===
      'string'
  ) {

    const coincidenciaMensaje =
      oracleError.message.match(
        /ORA-(\d+)/i
      );


    if (
      coincidenciaMensaje?.[1]
    ) {
      return Number(
        coincidenciaMensaje[1]
      );
    }
  }


  return null;
}


function esEnteroPositivo(
  valor: number
): boolean {

  return (
    Number.isInteger(
      valor
    ) &&
    valor > 0
  );
}


function validarId(
  valor: number,
  nombre: string
): void {

  if (
    !esEnteroPositivo(
      valor
    )
  ) {

    throw new CuentaBancariaValidationError(
      `${nombre} debe ser un nÃƒÆ’Ã‚Âºmero entero positivo.`
    );
  }
}


export class CuentaBancariaService {

  constructor(
    private readonly repository:
      CuentaBancariaRepository =
        new CuentaBancariaRepository()
  ) {}


  async listar(
    filtros:
      FiltrosCuentaBancaria = {}
  ): Promise<CuentaBancaria[]> {

    this.validarFiltros(
      filtros
    );


    return this.repository.listar(
      filtros
    );
  }


  async obtenerPorId(
    cuentaId: number
  ): Promise<CuentaBancaria> {

    validarId(
      cuentaId,
      'El identificador de la cuenta'
    );


    try {

      return await this.repository
        .obtenerPorId(
          cuentaId
        );

    } catch (error) {

      const codigo =
        obtenerCodigoOracle(
          error
        );


      if (
        codigo === 20003
      ) {

        throw new CuentaBancariaValidationError(
          'Debe indicar el identificador de la cuenta bancaria.'
        );
      }


      if (
        codigo === 20004
      ) {

        throw new CuentaBancariaNotFoundError(
          'La cuenta bancaria indicada no existe.'
        );
      }


      throw error;
    }
  }


  async crear(
    input:
      CrearCuentaBancariaInput
  ): Promise<number> {

    this.validarCreacion(
      input
    );


    try {

      return await this.repository.crear(
        input
      );

    } catch (error) {

      const codigo =
        obtenerCodigoOracle(
          error
        );


      switch (
        codigo
      ) {

        case 20007:

          throw new CuentaBancariaValidationError(
            'El banco indicado no existe.'
          );


        case 20008:

          throw new CuentaBancariaValidationError(
            'El tipo de cuenta indicado no existe.'
          );



        case 20054:

          throw new CuentaBancariaValidationError(
            'El tipo de cuenta indicado se encuentra inactivo.'
          );
        case 20010:

          throw new CuentaBancariaConflictError(
            'La cuenta bancaria ya se encuentra registrada para la empresa y banco indicados.'
          );


        case 20011:

          throw new CuentaBancariaConflictError(
            'No se pudo crear la cuenta porque existe un registro duplicado.'
          );


        case 20001:

          throw new CuentaBancariaValidationError(
            'El estado indicado no es vÃƒÆ’Ã‚Â¡lido.'
          );


        case 20042:

          throw new CuentaBancariaValidationError(
            'El banco indicado se encuentra inactivo y no puede asignarse a una cuenta nueva.'
          );


        case 20053:

          throw new CuentaBancariaValidationError(
            'El estado inicial de la cuenta solo puede ser BORRADOR o ACTIVA.'
          );


        default:

          throw error;
      }
    }
  }

  async actualizar(
    input:
      ActualizarCuentaBancariaInput
  ): Promise<void> {

    /*
      Primero validamos la estructura
      y los datos recibidos.
    */
    this.validarActualizacion(
      input
    );


    /*
      DespuÃƒÆ’Ã‚Â©s consultamos el estado REAL
      de la cuenta almacenado en Oracle.

      No confiamos en el estado visual
      del frontend para decidir si puede
      modificarse.
    */
    const cuentaActual =
      await this.obtenerPorId(
        input.cuentaId
      );


    this.validarPuedeEditar(
      cuentaActual
    );


    try {

      await this.repository.actualizar(
        input
      );

    } catch (error) {

      const codigo =
        obtenerCodigoOracle(
          error
        );


      switch (
        codigo
      ) {

        case 20012:

          throw new CuentaBancariaValidationError(
            'Debe indicar el identificador de la cuenta bancaria.'
          );


        case 20013:

          throw new CuentaBancariaNotFoundError(
            'La cuenta bancaria que desea actualizar no existe.'
          );


        case 20014:

          throw new CuentaBancariaValidationError(
            'El banco indicado no existe.'
          );


        case 20015:

          throw new CuentaBancariaValidationError(
            'El tipo de cuenta indicado no existe.'
          );


        case 20016:

          throw new CuentaBancariaConflictError(
            'El cÃƒÆ’Ã‚Â³digo de cuenta bancaria ya pertenece a otra cuenta.'
          );


        case 20017:

          throw new CuentaBancariaConflictError(
            'Ya existe otra cuenta con la misma empresa, banco y nÃƒÆ’Ã‚Âºmero de cuenta.'
          );


        case 20018:

          throw new CuentaBancariaConflictError(
            'No se pudo actualizar la cuenta porque existe un registro duplicado.'
          );


        case 20051:

          throw new CuentaBancariaValidationError(
            'Una cuenta bancaria INACTIVA o CERRADA no puede editarse.'
          );


        case 20052:

          throw new CuentaBancariaValidationError(
            'No se puede cambiar banco, nÃƒÆ’Ã‚Âºmero de cuenta o moneda despuÃƒÆ’Ã‚Â©s del primer movimiento.'
          );


        default:

          throw error;
      }
    }
  }


  async cambiarEstado(
    input:
      CambiarEstadoCuentaBancariaInput
  ): Promise<void> {

    validarId(
      input.cuentaId,
      'El identificador de la cuenta'
    );


    validarId(
      input.modificadoPor,
      'El identificador del usuario modificador'
    );


    if (
      !ESTADOS_VALIDOS.includes(
        input.estado
      )
    ) {

      throw new CuentaBancariaValidationError(
        'El estado indicado no es vÃƒÆ’Ã‚Â¡lido.'
      );
    }


    /*
      Consultamos Oracle antes del cambio.

      El estado anterior nunca se toma
      del frontend.
    */
    const cuentaActual =
      await this.obtenerPorId(
        input.cuentaId
      );


    this.validarTransicionEstado(
      cuentaActual.estado,
      input.estado
    );


    try {

      await this.repository
        .cambiarEstado(
          input
        );

    } catch (error) {

      const codigo =
        obtenerCodigoOracle(
          error
        );


      switch (
        codigo
      ) {

        case 20019:

          throw new CuentaBancariaValidationError(
            'Debe indicar el identificador de la cuenta bancaria.'
          );


        case 20020:

          throw new CuentaBancariaNotFoundError(
            'La cuenta bancaria indicada no existe.'
          );


        case 20001:

          throw new CuentaBancariaValidationError(
            'El estado indicado no es vÃƒÆ’Ã‚Â¡lido.'
          );


        case 20044:

          throw new CuentaBancariaValidationError(
            'La cuenta ya se encuentra en el estado indicado.'
          );


        case 20045:

          throw new CuentaBancariaValidationError(
            'La transiciÃƒÆ’Ã‚Â³n de estado solicitada no estÃƒÆ’Ã‚Â¡ permitida para esta cuenta.'
          );


        case 20046:

          throw new CuentaBancariaValidationError(
            'No se puede cerrar la cuenta porque tiene fondos comprometidos activos.'
          );


        case 20047:

          throw new CuentaBancariaValidationError(
            'No se puede cerrar la cuenta porque tiene movimientos pendientes de aplicar.'
          );


        case 20048:

          throw new CuentaBancariaValidationError(
            'No se puede cerrar la cuenta porque tiene cheques pendientes o en circulaciÃƒÆ’Ã‚Â³n.'
          );


        case 20049:

          throw new CuentaBancariaValidationError(
            'No se puede cerrar la cuenta porque tiene conciliaciones pendientes.'
          );


        case 20050:

          throw new CuentaBancariaValidationError(
            'No se puede cerrar la cuenta porque tiene transferencias pendientes.'
          );


        default:

          throw error;
      }
    }
  }


  async listarActivas(
    filtros:
      FiltrosCuentaBancariaActiva = {}
  ): Promise<CuentaBancariaActiva[]> {

    if (
      filtros.bancoId != null
    ) {

      validarId(
        filtros.bancoId,
        'El identificador del banco'
      );
    }


    if (
      filtros.monedaId != null
    ) {

      validarId(
        filtros.monedaId,
        'El identificador de la moneda'
      );
    }


    return this.repository.listarActivas(
      filtros
    );
  }


  private validarPuedeEditar(
    cuenta:
      CuentaBancaria
  ): void {

    if (
      cuenta.estado ===
      'INACTIVA'
    ) {

      throw new CuentaBancariaValidationError(
        'Una cuenta bancaria INACTIVA no puede editarse.'
      );
    }


    if (
      cuenta.estado ===
      'CERRADA'
    ) {

      throw new CuentaBancariaValidationError(
        'Una cuenta bancaria CERRADA no puede editarse.'
      );
    }
  }


  private validarTransicionEstado(
    estadoActual:
      EstadoCuentaBancaria,

    nuevoEstado:
      EstadoCuentaBancaria
  ): void {

    if (
      estadoActual ===
      nuevoEstado
    ) {

      throw new CuentaBancariaValidationError(
        `La cuenta ya se encuentra en estado ${estadoActual}.`
      );
    }


    if (
      estadoActual ===
        'BORRADOR' &&
      (
        nuevoEstado ===
          'ACTIVA' ||
        nuevoEstado ===
          'INACTIVA'
      )
    ) {

      return;
    }


    if (
      estadoActual ===
        'ACTIVA' &&
      (
        nuevoEstado ===
          'INACTIVA' ||
        nuevoEstado ===
          'CERRADA'
      )
    ) {

      return;
    }


    if (
      estadoActual ===
        'INACTIVA' &&
      nuevoEstado ===
        'ACTIVA'
    ) {

      return;
    }


    if (
      estadoActual ===
      'INACTIVA'
    ) {

      throw new CuentaBancariaValidationError(
        `No se permite cambiar una cuenta de INACTIVA a ${nuevoEstado}.`
      );
    }


    if (
      estadoActual ===
      'CERRADA'
    ) {

      throw new CuentaBancariaValidationError(
        'Una cuenta bancaria CERRADA es un estado final y no permite nuevos cambios.'
      );
    }


    throw new CuentaBancariaValidationError(
      `No se permite cambiar una cuenta de ${estadoActual} a ${nuevoEstado}.`
    );
  }

  private validarFiltros(
    filtros:
      FiltrosCuentaBancaria
  ): void {

    if (
      filtros.estado != null &&
      !ESTADOS_VALIDOS.includes(
        filtros.estado
      )
    ) {

      throw new CuentaBancariaValidationError(
        'El estado indicado no es vÃƒÆ’Ã‚Â¡lido.'
      );
    }


    if (
      filtros.bancoId != null
    ) {

      validarId(
        filtros.bancoId,
        'El identificador del banco'
      );
    }


    if (
      filtros.monedaId != null
    ) {

      validarId(
        filtros.monedaId,
        'El identificador de la moneda'
      );
    }
  }


  private validarCreacion(
    input:
      CrearCuentaBancariaInput
  ): void {

    this.validarDatosComunes(
      input
    );


    validarId(
      input.creadoPor,
      'El identificador del usuario creador'
    );


    if (
      !ESTADOS_INICIALES_VALIDOS
        .includes(
          input.estado
        )
    ) {

      throw new CuentaBancariaValidationError(
        'El estado inicial de la cuenta solo puede ser BORRADOR o ACTIVA.'
      );
    }
  }


  private validarActualizacion(
    input:
      ActualizarCuentaBancariaInput
  ): void {

    this.validarDatosComunes(
      input
    );


    validarId(
      input.cuentaId,
      'El identificador de la cuenta'
    );


    if (
      typeof input.codigoCuenta !==
        'string' ||
      input.codigoCuenta.trim() ===
        '' ||
      input.codigoCuenta.length >
        20
    ) {

      throw new CuentaBancariaValidationError(
        'El cÃƒÆ’Ã‚Â³digo de cuenta es obligatorio y no puede superar 20 caracteres.'
      );
    }


    if (
      input.fechaCierre !==
        null &&
      (
        !(
          input.fechaCierre
            instanceof Date
        ) ||
        Number.isNaN(
          input.fechaCierre
            .getTime()
        )
      )
    ) {

      throw new CuentaBancariaValidationError(
        'La fecha de cierre no es vÃƒÆ’Ã‚Â¡lida.'
      );
    }


    validarId(
      input.modificadoPor,
      'El identificador del usuario modificador'
    );
  }


  private validarDatosComunes(
    input:
      | CrearCuentaBancariaInput
      | ActualizarCuentaBancariaInput
  ): void {

    validarId(
      input.empresaId,
      'El identificador de la empresa'
    );


    validarId(
      input.bancoId,
      'El identificador del banco'
    );


    validarId(
      input.monedaId,
      'El identificador de la moneda'
    );


    validarId(
      input.tipoCuentaId,
      'El identificador del tipo de cuenta'
    );


    validarId(
      input.responsableId,
      'El identificador del responsable'
    );


    if (
      typeof input.numeroCuenta !==
        'string' ||
      !/^[0-9]{6,20}$/.test(
        input.numeroCuenta
      )
    ) {

      throw new CuentaBancariaValidationError(
        'El nÃƒÆ’Ã‚Âºmero de cuenta debe contener ÃƒÆ’Ã‚Âºnicamente entre 6 y 20 dÃƒÆ’Ã‚Â­gitos.'
      );
    }


    if (
      typeof input.nombreInterno !==
        'string' ||
      input.nombreInterno.trim() ===
        '' ||
      input.nombreInterno.length >
        80
    ) {

      throw new CuentaBancariaValidationError(
        'El nombre interno es obligatorio y no puede superar 80 caracteres.'
      );
    }


    if (
      typeof input.saldoInicial !==
        'number' ||
      !Number.isFinite(
        input.saldoInicial
      )
    ) {

      throw new CuentaBancariaValidationError(
        'El saldo inicial debe ser un nÃƒÆ’Ã‚Âºmero vÃƒÆ’Ã‚Â¡lido.'
      );
    }


    if (
      !(
        input.fechaApertura
          instanceof Date
      ) ||
      Number.isNaN(
        input.fechaApertura
          .getTime()
      )
    ) {

      throw new CuentaBancariaValidationError(
        'La fecha de apertura no es vÃƒÆ’Ã‚Â¡lida.'
      );
    }


    const ahora =
      new Date();


    if (
      input.fechaApertura
        .getTime() >
      ahora.getTime()
    ) {

      throw new CuentaBancariaValidationError(
        'La fecha de apertura no puede ser posterior a la fecha actual.'
      );
    }


    if (
      ![
        'COBROS',
        'PAGOS',
        'AMBOS'
      ].includes(
        input.usoPrincipal
      )
    ) {

      throw new CuentaBancariaValidationError(
        'El uso principal indicado no es vÃƒÆ’Ã‚Â¡lido.'
      );
    }


    const indicadores = [
      input.permiteCobros,
      input.permitePagos,
      input.permiteCheques,
      input.permiteTransferencias
    ];


    if (
      indicadores.some(
        indicador =>
          ![
            'S',
            'N'
          ].includes(
            indicador
          )
      )
    ) {

      throw new CuentaBancariaValidationError(
        'Los indicadores de permisos solo admiten S o N.'
      );
    }


    if (
      input.observaciones !==
        null &&
      (
        typeof input.observaciones !==
          'string' ||
        input.observaciones.length >
          500
      )
    ) {

      throw new CuentaBancariaValidationError(
        'Las observaciones no pueden superar 500 caracteres.'
      );
    }
  }
}
