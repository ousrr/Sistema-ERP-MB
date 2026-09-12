CREATE OR REPLACE EDITIONABLE PACKAGE BODY "ERP_BANCOS"."PKG_MB_CUENTAS" AS

    ------------------------------------------------------------------
    -- VALIDACIONES INTERNAS
    -- Estas funciones solo se utilizan dentro del Package.
    -- No aparecen en la Specification porque no son pÃºblicas.
    ------------------------------------------------------------------

    FUNCTION EXISTE_BANCO (
        p_banco_id IN MB_BANCO.banco_id%TYPE
    ) RETURN BOOLEAN AS
        v_total NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO v_total
        FROM MB_BANCO
        WHERE banco_id = p_banco_id;

        RETURN v_total > 0;
    END EXISTE_BANCO;

    FUNCTION BANCO_ESTA_ACTIVO (
        p_banco_id IN MB_BANCO.banco_id%TYPE
    ) RETURN BOOLEAN AS
        v_total NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO v_total
        FROM MB_BANCO
        WHERE banco_id = p_banco_id
        AND estado = 'ACTIVO';

        RETURN v_total > 0;
    END BANCO_ESTA_ACTIVO;


    FUNCTION EXISTE_TIPO_CUENTA (
        p_tipo_cuenta_id IN MB_CATALOGO_BANCARIO.catalogo_id%TYPE
    ) RETURN BOOLEAN AS
        v_total NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO v_total
        FROM MB_CATALOGO_BANCARIO
        WHERE catalogo_id = p_tipo_cuenta_id
        AND grupo = 'TIPO_CUENTA';

        RETURN v_total > 0;
    END EXISTE_TIPO_CUENTA;


    FUNCTION TIPO_CUENTA_ESTA_ACTIVO (
        p_tipo_cuenta_id IN MB_CATALOGO_BANCARIO.catalogo_id%TYPE
    ) RETURN BOOLEAN AS
        v_total NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO v_total
        FROM MB_CATALOGO_BANCARIO
        WHERE catalogo_id = p_tipo_cuenta_id
          AND grupo = 'TIPO_CUENTA'
          AND estado = 'ACTIVO';

        RETURN v_total > 0;
    END TIPO_CUENTA_ESTA_ACTIVO;


    FUNCTION EXISTE_CUENTA (
        p_cuenta_id IN MB_CUENTA_BANCARIA.cuenta_id%TYPE
    ) RETURN BOOLEAN AS
        v_total NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO v_total
        FROM MB_CUENTA_BANCARIA
        WHERE cuenta_id = p_cuenta_id;

        RETURN v_total > 0;
    END EXISTE_CUENTA;


    FUNCTION EXISTE_CUENTA_PROVEEDOR (
        p_cta_proveedor_id
            IN MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE
    ) RETURN BOOLEAN AS
        v_total NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO v_total
        FROM MB_CUENTA_BANCARIA_PROVEEDOR
        WHERE cta_proveedor_id = p_cta_proveedor_id;

        RETURN v_total > 0;
    END EXISTE_CUENTA_PROVEEDOR;


        PROCEDURE VALIDAR_ESTADO_CUENTA (
        p_estado IN MB_CUENTA_BANCARIA.estado%TYPE
    ) AS
    BEGIN
        IF p_estado IS NULL
           OR p_estado NOT IN (
                'BORRADOR',
                'ACTIVA',
                'INACTIVA',
                'CERRADA'
           ) THEN
            RAISE_APPLICATION_ERROR(
                -20001,
                'Estado de cuenta bancaria no valido.'
            );
        END IF;
    END VALIDAR_ESTADO_CUENTA;


        PROCEDURE VALIDAR_ESTADO_CUENTA_PROV (
        p_estado IN MB_CUENTA_BANCARIA_PROVEEDOR.estado%TYPE
    ) AS
    BEGIN
        IF p_estado IS NULL
           OR p_estado NOT IN (
                'PENDIENTE',
                'EN_REVISION',
                'VERIFICADA',
                'RECHAZADA',
                'BLOQUEADA',
                'INACTIVA'
           ) THEN
            RAISE_APPLICATION_ERROR(
                -20002,
                'Estado de cuenta bancaria de proveedor no valido.'
            );
        END IF;
    END VALIDAR_ESTADO_CUENTA_PROV;

    ------------------------------------------------------------------
    -- CUENTAS BANCARIAS EMPRESARIALES
    ------------------------------------------------------------------

    PROCEDURE LISTAR_CUENTAS (
        p_estado     IN MB_CUENTA_BANCARIA.estado%TYPE,
        p_banco_id   IN MB_CUENTA_BANCARIA.banco_id%TYPE,
        p_moneda_id  IN MB_CUENTA_BANCARIA.moneda_id%TYPE,
        p_resultado  OUT SYS_REFCURSOR
    ) AS
    BEGIN
        OPEN p_resultado FOR
            SELECT
                c.cuenta_id,
                c.empresa_id,
                c.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,
                c.moneda_id,
                c.tipo_cuenta_id,
                tc.codigo AS tipo_cuenta_codigo,
                tc.nombre AS tipo_cuenta_nombre,
                c.responsable_id,
                c.codigo_cuenta,
                c.numero_cuenta,
                c.nombre_interno,
                c.saldo_inicial,
                c.fecha_apertura,
                c.uso_principal,
                c.permite_cobros,
                c.permite_pagos,
                c.permite_cheques,
                c.permite_transferencias,
                c.fecha_cierre,
                c.estado,
                c.observaciones,
                c.creado_por,
                c.creado_en,
                c.modificado_por,
                c.modificado_en
            FROM MB_CUENTA_BANCARIA c
            INNER JOIN MB_BANCO b
                ON b.banco_id = c.banco_id
            INNER JOIN MB_CATALOGO_BANCARIO tc
                ON tc.catalogo_id = c.tipo_cuenta_id
            WHERE (p_estado IS NULL OR c.estado = p_estado)
              AND (p_banco_id IS NULL OR c.banco_id = p_banco_id)
              AND (p_moneda_id IS NULL OR c.moneda_id = p_moneda_id)
            ORDER BY c.nombre_interno, c.cuenta_id;
    END LISTAR_CUENTAS;

    PROCEDURE LISTAR_CUENTAS_ACTIVAS (
        p_banco_id   IN MB_CUENTA_BANCARIA.banco_id%TYPE,
        p_moneda_id  IN MB_CUENTA_BANCARIA.moneda_id%TYPE,
        p_resultado  OUT SYS_REFCURSOR
    ) AS
    BEGIN
        OPEN p_resultado FOR
            SELECT
                c.cuenta_id,
                c.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,
                c.moneda_id,
                c.tipo_cuenta_id,
                tc.codigo AS tipo_cuenta_codigo,
                tc.nombre AS tipo_cuenta_nombre,
                c.codigo_cuenta,
                c.numero_cuenta,
                c.nombre_interno,
                c.uso_principal,
                c.permite_cobros,
                c.permite_pagos,
                c.permite_cheques,
                c.permite_transferencias,
                c.estado
            FROM MB_CUENTA_BANCARIA c
            INNER JOIN MB_BANCO b
                ON b.banco_id = c.banco_id
            INNER JOIN MB_CATALOGO_BANCARIO tc
                ON tc.catalogo_id = c.tipo_cuenta_id
            WHERE c.estado = 'ACTIVA'
              AND (p_banco_id IS NULL OR c.banco_id = p_banco_id)
              AND (p_moneda_id IS NULL OR c.moneda_id = p_moneda_id)
            ORDER BY b.nombre, c.nombre_interno;
    END LISTAR_CUENTAS_ACTIVAS;

    PROCEDURE OBTENER_CUENTA (
        p_cuenta_id  IN MB_CUENTA_BANCARIA.cuenta_id%TYPE,
        p_resultado  OUT SYS_REFCURSOR
    ) AS
    BEGIN
        IF p_cuenta_id IS NULL THEN
            RAISE_APPLICATION_ERROR(
                -20003,
                'Debe indicar el identificador de la cuenta bancaria.'
            );
        END IF;

        IF NOT EXISTE_CUENTA(p_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20004,
                'La cuenta bancaria indicada no existe.'
            );
        END IF;

        OPEN p_resultado FOR
            SELECT
                c.cuenta_id,
                c.empresa_id,
                c.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,
                c.moneda_id,
                c.tipo_cuenta_id,
                tc.codigo AS tipo_cuenta_codigo,
                tc.nombre AS tipo_cuenta_nombre,
                c.responsable_id,
                c.codigo_cuenta,
                c.numero_cuenta,
                c.nombre_interno,
                c.saldo_inicial,
                c.fecha_apertura,
                c.uso_principal,
                c.permite_cobros,
                c.permite_pagos,
                c.permite_cheques,
                c.permite_transferencias,
                c.fecha_cierre,
                c.estado,
                c.observaciones,
                c.creado_por,
                c.creado_en,
                c.modificado_por,
                c.modificado_en
            FROM MB_CUENTA_BANCARIA c
            INNER JOIN MB_BANCO b
                ON b.banco_id = c.banco_id
            INNER JOIN MB_CATALOGO_BANCARIO tc
                ON tc.catalogo_id = c.tipo_cuenta_id
            WHERE c.cuenta_id = p_cuenta_id;
    END OBTENER_CUENTA;

    PROCEDURE CREAR_CUENTA (
        p_empresa_id              IN MB_CUENTA_BANCARIA.empresa_id%TYPE,
        p_banco_id                IN MB_CUENTA_BANCARIA.banco_id%TYPE,
        p_moneda_id               IN MB_CUENTA_BANCARIA.moneda_id%TYPE,
        p_tipo_cuenta_id          IN MB_CUENTA_BANCARIA.tipo_cuenta_id%TYPE,
        p_responsable_id          IN MB_CUENTA_BANCARIA.responsable_id%TYPE,
        p_numero_cuenta           IN MB_CUENTA_BANCARIA.numero_cuenta%TYPE,
        p_nombre_interno          IN MB_CUENTA_BANCARIA.nombre_interno%TYPE,
        p_saldo_inicial           IN MB_CUENTA_BANCARIA.saldo_inicial%TYPE,
        p_fecha_apertura          IN MB_CUENTA_BANCARIA.fecha_apertura%TYPE,
        p_uso_principal           IN MB_CUENTA_BANCARIA.uso_principal%TYPE,
        p_permite_cobros          IN MB_CUENTA_BANCARIA.permite_cobros%TYPE,
        p_permite_pagos           IN MB_CUENTA_BANCARIA.permite_pagos%TYPE,
        p_permite_cheques         IN MB_CUENTA_BANCARIA.permite_cheques%TYPE,
        p_permite_transferencias  IN MB_CUENTA_BANCARIA.permite_transferencias%TYPE,
        p_estado                  IN MB_CUENTA_BANCARIA.estado%TYPE,
        p_observaciones           IN MB_CUENTA_BANCARIA.observaciones%TYPE,
        p_creado_por              IN MB_CUENTA_BANCARIA.creado_por%TYPE,
        p_cuenta_id               OUT MB_CUENTA_BANCARIA.cuenta_id%TYPE
    ) AS
        v_total          NUMBER;
        v_codigo_cuenta  MB_CUENTA_BANCARIA.codigo_cuenta%TYPE;
    BEGIN
        ------------------------------------------------------------------
        -- Validaciones de referencias administradas por Bancos
        ------------------------------------------------------------------

        IF p_banco_id IS NULL OR NOT EXISTE_BANCO(p_banco_id) THEN
            RAISE_APPLICATION_ERROR(
                -20007,
                'El banco indicado no existe.'
            );
        END IF;

        IF NOT BANCO_ESTA_ACTIVO(p_banco_id) THEN
            RAISE_APPLICATION_ERROR(
                -20042,
                'El banco indicado se encuentra inactivo y no puede asignarse a una cuenta nueva.'
            );
        END IF;

        IF p_tipo_cuenta_id IS NULL
           OR NOT EXISTE_TIPO_CUENTA(p_tipo_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20008,
                'El tipo de cuenta indicado no existe.'
            );
        END IF;

        IF NOT TIPO_CUENTA_ESTA_ACTIVO(p_tipo_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20054,
                'El tipo de cuenta indicado se encuentra inactivo y no puede asignarse a una cuenta nueva.'
            );
        END IF;

        VALIDAR_ESTADO_CUENTA(p_estado);

        -- BAN-CTA-01 solo permite crear en BORRADOR o ACTIVA.
        IF p_estado NOT IN ('BORRADOR', 'ACTIVA') THEN
            RAISE_APPLICATION_ERROR(
                -20053,
                'El estado inicial de una cuenta bancaria solo puede ser BORRADOR o ACTIVA.'
            );
        END IF;


        ------------------------------------------------------------------
        -- ValidaciÃ³n de combinaciÃ³n Ãºnica:
        -- empresa + banco + nÃºmero de cuenta
        ------------------------------------------------------------------

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CUENTA_BANCARIA
        WHERE empresa_id = p_empresa_id
          AND banco_id = p_banco_id
          AND numero_cuenta = p_numero_cuenta;

        IF v_total > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20010,
                'La cuenta bancaria ya se encuentra registrada para la empresa y banco indicados.'
            );
        END IF;


        ------------------------------------------------------------------
        -- Identificador y cÃ³digo automÃ¡ticos
        --
        -- El frontend/backend no generan cuenta_id.
        -- Oracle usa la secuencia y deriva un cÃ³digo tÃ©cnico Ãºnico.
        ------------------------------------------------------------------

        p_cuenta_id :=
            SEQ_MB_CUENTA_BANCARIA.NEXTVAL;

        v_codigo_cuenta :=
            'CTA-' || TO_CHAR(p_cuenta_id);


        ------------------------------------------------------------------
        -- InserciÃ³n
        --
        -- fecha_cierre siempre inicia NULL porque una cuenta nueva
        -- Ãºnicamente puede nacer en BORRADOR o ACTIVA.
        ------------------------------------------------------------------

        INSERT INTO MB_CUENTA_BANCARIA (
            cuenta_id,
            empresa_id,
            banco_id,
            moneda_id,
            tipo_cuenta_id,
            responsable_id,
            codigo_cuenta,
            numero_cuenta,
            nombre_interno,
            saldo_inicial,
            fecha_apertura,
            uso_principal,
            permite_cobros,
            permite_pagos,
            permite_cheques,
            permite_transferencias,
            fecha_cierre,
            estado,
            observaciones,
            creado_por,
            creado_en
        )
        VALUES (
            p_cuenta_id,
            p_empresa_id,
            p_banco_id,
            p_moneda_id,
            p_tipo_cuenta_id,
            p_responsable_id,
            v_codigo_cuenta,
            p_numero_cuenta,
            p_nombre_interno,
            p_saldo_inicial,
            p_fecha_apertura,
            p_uso_principal,
            p_permite_cobros,
            p_permite_pagos,
            p_permite_cheques,
            p_permite_transferencias,
            NULL,
            p_estado,
            p_observaciones,
            p_creado_por,
            SYSTIMESTAMP
        );

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            RAISE_APPLICATION_ERROR(
                -20011,
                'No se pudo crear la cuenta porque existe un registro duplicado.'
            );

    END CREAR_CUENTA;

    PROCEDURE ACTUALIZAR_CUENTA (
        p_cuenta_id               IN MB_CUENTA_BANCARIA.cuenta_id%TYPE,
        p_empresa_id              IN MB_CUENTA_BANCARIA.empresa_id%TYPE,
        p_banco_id                IN MB_CUENTA_BANCARIA.banco_id%TYPE,
        p_moneda_id               IN MB_CUENTA_BANCARIA.moneda_id%TYPE,
        p_tipo_cuenta_id          IN MB_CUENTA_BANCARIA.tipo_cuenta_id%TYPE,
        p_responsable_id          IN MB_CUENTA_BANCARIA.responsable_id%TYPE,
        p_codigo_cuenta           IN MB_CUENTA_BANCARIA.codigo_cuenta%TYPE,
        p_numero_cuenta           IN MB_CUENTA_BANCARIA.numero_cuenta%TYPE,
        p_nombre_interno          IN MB_CUENTA_BANCARIA.nombre_interno%TYPE,
        p_saldo_inicial           IN MB_CUENTA_BANCARIA.saldo_inicial%TYPE,
        p_fecha_apertura          IN MB_CUENTA_BANCARIA.fecha_apertura%TYPE,
        p_uso_principal           IN MB_CUENTA_BANCARIA.uso_principal%TYPE,
        p_permite_cobros          IN MB_CUENTA_BANCARIA.permite_cobros%TYPE,
        p_permite_pagos           IN MB_CUENTA_BANCARIA.permite_pagos%TYPE,
        p_permite_cheques         IN MB_CUENTA_BANCARIA.permite_cheques%TYPE,
        p_permite_transferencias  IN MB_CUENTA_BANCARIA.permite_transferencias%TYPE,
        p_fecha_cierre            IN MB_CUENTA_BANCARIA.fecha_cierre%TYPE,
        p_observaciones           IN MB_CUENTA_BANCARIA.observaciones%TYPE,
        p_modificado_por          IN MB_CUENTA_BANCARIA.modificado_por%TYPE
    ) AS
        v_total          NUMBER;
        v_estado_actual  MB_CUENTA_BANCARIA.estado%TYPE;
        v_banco_actual        MB_CUENTA_BANCARIA.banco_id%TYPE;
        v_moneda_actual       MB_CUENTA_BANCARIA.moneda_id%TYPE;
        v_numero_actual       MB_CUENTA_BANCARIA.numero_cuenta%TYPE;
        v_tipo_cuenta_actual  MB_CUENTA_BANCARIA.tipo_cuenta_id%TYPE;
    BEGIN
        ------------------------------------------------------------------
        -- Validar existencia de la cuenta
        ------------------------------------------------------------------

        IF p_cuenta_id IS NULL THEN
            RAISE_APPLICATION_ERROR(
                -20012,
                'Debe indicar el identificador de la cuenta bancaria.'
            );
        END IF;

        IF NOT EXISTE_CUENTA(p_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20013,
                'La cuenta bancaria que desea actualizar no existe.'
            );
        END IF;


        ------------------------------------------------------------------
        -- Obtener y bloquear la cuenta real antes de actualizarla.
        --
        -- La protecciÃ³n se aplica tambiÃ©n dentro del Package para que
        -- no dependa Ãºnicamente de la capa Service.
        ------------------------------------------------------------------

        SELECT
            estado,
            banco_id,
            moneda_id,
            numero_cuenta,
            tipo_cuenta_id
        INTO
            v_estado_actual,
            v_banco_actual,
            v_moneda_actual,
            v_numero_actual,
            v_tipo_cuenta_actual
        FROM MB_CUENTA_BANCARIA
        WHERE cuenta_id = p_cuenta_id
        FOR UPDATE;


        ------------------------------------------------------------------
        -- Una cuenta INACTIVA o CERRADA no puede editarse.
        ------------------------------------------------------------------

        IF v_estado_actual IN ('INACTIVA', 'CERRADA') THEN
            RAISE_APPLICATION_ERROR(
                -20051,
                'Una cuenta bancaria INACTIVA o CERRADA no puede editarse.'
            );
        END IF;


        ------------------------------------------------------------------
        -- Validar relaciones existentes en Oracle
        ------------------------------------------------------------------

        IF p_banco_id IS NULL OR NOT EXISTE_BANCO(p_banco_id) THEN
            RAISE_APPLICATION_ERROR(
                -20014,
                'El banco indicado no existe.'
            );
        END IF;

        IF p_tipo_cuenta_id IS NULL
           OR NOT EXISTE_TIPO_CUENTA(p_tipo_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20015,
                'El tipo de cuenta indicado no existe.'
            );
        END IF;

        IF NVL(v_tipo_cuenta_actual, -1) <> NVL(p_tipo_cuenta_id, -1)
           AND NOT TIPO_CUENTA_ESTA_ACTIVO(p_tipo_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20054,
                'El tipo de cuenta indicado se encuentra inactivo y no puede asignarse a la cuenta.'
            );
        END IF;


        ------------------------------------------------------------------
        -- DespuÃ©s del primer movimiento no se permite cambiar:
        -- banco, nÃºmero de cuenta o moneda.
        ------------------------------------------------------------------

        SELECT COUNT(*)
        INTO v_total
        FROM MB_MOVIMIENTO_BANCARIO
        WHERE cuenta_id = p_cuenta_id;

        IF v_total > 0
           AND (
                NVL(v_banco_actual, -1) <> NVL(p_banco_id, -1)
                OR NVL(v_moneda_actual, -1) <> NVL(p_moneda_id, -1)
                OR NVL(v_numero_actual, '#NULL#')
                   <> NVL(p_numero_cuenta, '#NULL#')
           ) THEN
            RAISE_APPLICATION_ERROR(
                -20052,
                'No se puede cambiar banco, numero de cuenta o moneda despues del primer movimiento.'
            );
        END IF;


        ------------------------------------------------------------------
        -- Validar cÃ³digo Ãºnico excluyendo el registro actual
        ------------------------------------------------------------------

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CUENTA_BANCARIA
        WHERE codigo_cuenta = p_codigo_cuenta
          AND cuenta_id <> p_cuenta_id;

        IF v_total > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20016,
                'El codigo de cuenta bancaria ya pertenece a otra cuenta.'
            );
        END IF;


        ------------------------------------------------------------------
        -- Validar combinaciÃ³n Ãºnica excluyendo la cuenta actual
        -- empresa + banco + nÃºmero de cuenta
        ------------------------------------------------------------------

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CUENTA_BANCARIA
        WHERE empresa_id = p_empresa_id
          AND banco_id = p_banco_id
          AND numero_cuenta = p_numero_cuenta
          AND cuenta_id <> p_cuenta_id;

        IF v_total > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20017,
                'Ya existe otra cuenta con la misma empresa, banco y numero de cuenta.'
            );
        END IF;


        ------------------------------------------------------------------
        -- ActualizaciÃ³n
        --
        -- fecha_cierre no se modifica aquÃ­: es un dato de control que
        -- Ãºnicamente administra CAMBIAR_ESTADO_CUENTA al cerrar.
        ------------------------------------------------------------------

        UPDATE MB_CUENTA_BANCARIA
        SET
            empresa_id = p_empresa_id,
            banco_id = p_banco_id,
            moneda_id = p_moneda_id,
            tipo_cuenta_id = p_tipo_cuenta_id,
            responsable_id = p_responsable_id,
            codigo_cuenta = p_codigo_cuenta,
            numero_cuenta = p_numero_cuenta,
            nombre_interno = p_nombre_interno,
            saldo_inicial = p_saldo_inicial,
            fecha_apertura = p_fecha_apertura,
            uso_principal = p_uso_principal,
            permite_cobros = p_permite_cobros,
            permite_pagos = p_permite_pagos,
            permite_cheques = p_permite_cheques,
            permite_transferencias = p_permite_transferencias,
            observaciones = p_observaciones,
            modificado_por = p_modificado_por,
            modificado_en = SYSTIMESTAMP
        WHERE cuenta_id = p_cuenta_id;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            RAISE_APPLICATION_ERROR(
                -20018,
                'No se pudo actualizar la cuenta porque existe un registro duplicado.'
            );

    END ACTUALIZAR_CUENTA;

    PROCEDURE CAMBIAR_ESTADO_CUENTA (
        p_cuenta_id       IN MB_CUENTA_BANCARIA.cuenta_id%TYPE,
        p_estado          IN MB_CUENTA_BANCARIA.estado%TYPE,
        p_modificado_por  IN MB_CUENTA_BANCARIA.modificado_por%TYPE
    ) AS
        v_estado_actual MB_CUENTA_BANCARIA.estado%TYPE;
        v_total         NUMBER;
    BEGIN
        ------------------------------------------------------------------
        -- Validaciones bÃ¡sicas
        ------------------------------------------------------------------

        IF p_cuenta_id IS NULL THEN
            RAISE_APPLICATION_ERROR(
                -20019,
                'Debe indicar el identificador de la cuenta bancaria.'
            );
        END IF;

        IF NOT EXISTE_CUENTA(p_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20020,
                'La cuenta bancaria indicada no existe.'
            );
        END IF;

        VALIDAR_ESTADO_CUENTA(p_estado);

        ------------------------------------------------------------------
        -- Obtener y bloquear el estado real de la cuenta
        ------------------------------------------------------------------

        SELECT estado
        INTO v_estado_actual
        FROM MB_CUENTA_BANCARIA
        WHERE cuenta_id = p_cuenta_id
        FOR UPDATE;

        IF v_estado_actual = p_estado THEN
            RAISE_APPLICATION_ERROR(
                -20044,
                'La cuenta ya se encuentra en el estado indicado.'
            );
        END IF;

        ------------------------------------------------------------------
        -- Transiciones permitidas
        --
        -- BORRADOR -> ACTIVA
        -- BORRADOR -> INACTIVA
        -- ACTIVA   -> INACTIVA
        -- ACTIVA   -> CERRADA
        -- INACTIVA -> ACTIVA
        --
        -- CERRADA es el Ãºnico estado terminal en este flujo.
        ------------------------------------------------------------------

        IF NOT (
            (v_estado_actual = 'BORRADOR'
             AND p_estado IN ('ACTIVA', 'INACTIVA'))
            OR
            (v_estado_actual = 'ACTIVA'
             AND p_estado IN ('INACTIVA', 'CERRADA'))
            OR
            (v_estado_actual = 'INACTIVA'
             AND p_estado = 'ACTIVA')
        ) THEN
            RAISE_APPLICATION_ERROR(
                -20045,
                'La transiciÃ³n de estado solicitada no estÃ¡ permitida para esta cuenta.'
            );
        END IF;

        ------------------------------------------------------------------
        -- Para CERRAR deben resolverse primero los pendientes.
        ------------------------------------------------------------------

        IF p_estado = 'CERRADA' THEN

            --------------------------------------------------------------
            -- Fondos comprometidos activos
            --------------------------------------------------------------

            SELECT COUNT(*)
            INTO v_total
            FROM MB_FONDO_COMPROMETIDO
            WHERE cuenta_id = p_cuenta_id
              AND estado = 'ACTIVO';

            IF v_total > 0 THEN
                RAISE_APPLICATION_ERROR(
                    -20046,
                    'No se puede cerrar la cuenta porque tiene fondos comprometidos activos.'
                );
            END IF;

            --------------------------------------------------------------
            -- Movimientos todavÃ­a registrados y no aplicados
            --------------------------------------------------------------

            SELECT COUNT(*)
            INTO v_total
            FROM MB_MOVIMIENTO_BANCARIO
            WHERE cuenta_id = p_cuenta_id
              AND estado = 'REGISTRADO';

            IF v_total > 0 THEN
                RAISE_APPLICATION_ERROR(
                    -20047,
                    'No se puede cerrar la cuenta porque tiene movimientos pendientes de aplicar.'
                );
            END IF;

            --------------------------------------------------------------
            -- Transferencias propias pendientes
            --
            -- Se bloquea el cierre si la cuenta participa como origen
            -- o destino en una transferencia todavÃ­a no finalizada.
            --------------------------------------------------------------

            SELECT COUNT(*)
            INTO v_total
            FROM MB_TRANSFERENCIA_BANCARIA
            WHERE (
                    cuenta_origen_id = p_cuenta_id
                    OR cuenta_destino_id = p_cuenta_id
                  )
              AND estado IN (
                    'BORRADOR',
                    'PROGRAMADA'
              );

            IF v_total > 0 THEN
                RAISE_APPLICATION_ERROR(
                    -20050,
                    'No se puede cerrar la cuenta porque tiene transferencias pendientes.'
                );
            END IF;

            --------------------------------------------------------------
            -- Cheques pendientes o todavÃ­a en circulaciÃ³n
            --------------------------------------------------------------

            SELECT COUNT(*)
            INTO v_total
            FROM MB_CHEQUE ch
            INNER JOIN MB_CHEQUERA cq
                ON cq.chequera_id = ch.chequera_id
            WHERE cq.cuenta_id = p_cuenta_id
              AND ch.estado IN (
                    'RESERVADO',
                    'EMITIDO',
                    'IMPRESO',
                    'ENTREGADO',
                    'EXTRAVIADO'
              );

            IF v_total > 0 THEN
                RAISE_APPLICATION_ERROR(
                    -20048,
                    'No se puede cerrar la cuenta porque tiene cheques pendientes o en circulaciÃ³n.'
                );
            END IF;

            --------------------------------------------------------------
            -- Conciliaciones abiertas, en proceso o reabiertas
            --------------------------------------------------------------

            SELECT COUNT(*)
            INTO v_total
            FROM MB_CONCILIACION_BANCARIA cb
            INNER JOIN MB_ESTADO_CUENTA ec
                ON ec.estado_cuenta_id = cb.estado_cuenta_id
            WHERE ec.cuenta_id = p_cuenta_id
              AND cb.estado IN (
                    'ABIERTA',
                    'EN_PROCESO',
                    'REABIERTA'
              );

            IF v_total > 0 THEN
                RAISE_APPLICATION_ERROR(
                    -20049,
                    'No se puede cerrar la cuenta porque tiene conciliaciones pendientes.'
                );
            END IF;
        END IF;

        ------------------------------------------------------------------
        -- Cambio de estado
        --
        -- fecha_cierre Ãºnicamente se registra cuando el estado pasa
        -- definitivamente a CERRADA.
        ------------------------------------------------------------------

        UPDATE MB_CUENTA_BANCARIA
        SET
            estado = p_estado,
            fecha_cierre =
                CASE
                    WHEN p_estado = 'CERRADA'
                    THEN TRUNC(SYSDATE)
                    ELSE fecha_cierre
                END,
            modificado_por = p_modificado_por,
            modificado_en = SYSTIMESTAMP
        WHERE cuenta_id = p_cuenta_id;

    END CAMBIAR_ESTADO_CUENTA;

    ------------------------------------------------------------------
    -- CUENTAS BANCARIAS DE PROVEEDORES
    ------------------------------------------------------------------

    PROCEDURE LISTAR_CUENTAS_PROVEEDOR (
        p_proveedor_id  IN MB_CUENTA_BANCARIA_PROVEEDOR.proveedor_id%TYPE,
        p_estado        IN MB_CUENTA_BANCARIA_PROVEEDOR.estado%TYPE,
        p_banco_id      IN MB_CUENTA_BANCARIA_PROVEEDOR.banco_id%TYPE,
        p_moneda_id     IN MB_CUENTA_BANCARIA_PROVEEDOR.moneda_id%TYPE,
        p_resultado     OUT SYS_REFCURSOR
    ) AS
    BEGIN
        OPEN p_resultado FOR
            SELECT
                TO_CHAR(cp.cta_proveedor_id) AS cta_proveedor_id,
                cp.proveedor_id,
                cp.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,
                cp.tipo_cuenta_id,
                tc.codigo AS tipo_cuenta_codigo,
                tc.nombre AS tipo_cuenta_nombre,
                cp.moneda_id,
                TO_CHAR(cp.cuenta_anterior_id) AS cuenta_anterior_id,
                cp.titular,
                cp.numero_cuenta,
                TO_CHAR(cp.carta_solicitud_doc_id) AS carta_solicitud_doc_id,
                TO_CHAR(cp.constancia_banco_doc_id) AS constancia_banco_doc_id,
                TO_CHAR(cp.representante_doc_id) AS representante_doc_id,
                cp.motivo_registro,
                cp.fecha_vigencia,
                cp.estado,
                cp.observaciones,
                cp.solicitado_por,
                cp.solicitado_en
            FROM MB_CUENTA_BANCARIA_PROVEEDOR cp
            INNER JOIN MB_BANCO b
                ON b.banco_id = cp.banco_id
            INNER JOIN MB_CATALOGO_BANCARIO tc
                ON tc.catalogo_id = cp.tipo_cuenta_id
            WHERE (p_proveedor_id IS NULL
                   OR cp.proveedor_id = p_proveedor_id)
              AND (p_estado IS NULL
                   OR cp.estado = p_estado)
              AND (p_banco_id IS NULL
                   OR cp.banco_id = p_banco_id)
              AND (p_moneda_id IS NULL
                   OR cp.moneda_id = p_moneda_id)
            ORDER BY cp.solicitado_en DESC,
                     cp.cta_proveedor_id DESC;

    END LISTAR_CUENTAS_PROVEEDOR;

    PROCEDURE LISTAR_CUENTAS_PROV_VERIFICADAS (
        p_proveedor_id  IN MB_CUENTA_BANCARIA_PROVEEDOR.proveedor_id%TYPE,
        p_resultado     OUT SYS_REFCURSOR
    ) AS
    BEGIN
        IF p_proveedor_id IS NULL THEN
            RAISE_APPLICATION_ERROR(
                -20021,
                'Debe indicar el proveedor para consultar sus cuentas verificadas.'
            );
        END IF;

        OPEN p_resultado FOR
            SELECT
                TO_CHAR(cp.cta_proveedor_id) AS cta_proveedor_id,
                cp.proveedor_id,
                cp.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,
                cp.tipo_cuenta_id,
                tc.codigo AS tipo_cuenta_codigo,
                tc.nombre AS tipo_cuenta_nombre,
                cp.moneda_id,
                cp.titular,
                cp.numero_cuenta,
                cp.fecha_vigencia,
                cp.estado
            FROM MB_CUENTA_BANCARIA_PROVEEDOR cp
            INNER JOIN MB_BANCO b
                ON b.banco_id = cp.banco_id
            INNER JOIN MB_CATALOGO_BANCARIO tc
                ON tc.catalogo_id = cp.tipo_cuenta_id
            WHERE cp.proveedor_id = p_proveedor_id
              AND cp.estado = 'VERIFICADA'
            ORDER BY b.nombre,
                     cp.titular,
                     cp.cta_proveedor_id;

    END LISTAR_CUENTAS_PROV_VERIFICADAS;

    PROCEDURE OBTENER_CUENTA_PROVEEDOR (
        p_cta_proveedor_id
            IN MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE,
        p_resultado
            OUT SYS_REFCURSOR
    ) AS
    BEGIN
        IF p_cta_proveedor_id IS NULL THEN
            RAISE_APPLICATION_ERROR(
                -20022,
                'Debe indicar el identificador de la cuenta bancaria del proveedor.'
            );
        END IF;

        IF NOT EXISTE_CUENTA_PROVEEDOR(p_cta_proveedor_id) THEN
            RAISE_APPLICATION_ERROR(
                -20023,
                'La cuenta bancaria del proveedor indicada no existe.'
            );
        END IF;

        OPEN p_resultado FOR
            SELECT
                TO_CHAR(cp.cta_proveedor_id) AS cta_proveedor_id,
                cp.proveedor_id,
                cp.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,
                cp.tipo_cuenta_id,
                tc.codigo AS tipo_cuenta_codigo,
                tc.nombre AS tipo_cuenta_nombre,
                cp.moneda_id,
                TO_CHAR(cp.cuenta_anterior_id) AS cuenta_anterior_id,
                cp.titular,
                cp.numero_cuenta,
                TO_CHAR(cp.carta_solicitud_doc_id) AS carta_solicitud_doc_id,
                TO_CHAR(cp.constancia_banco_doc_id) AS constancia_banco_doc_id,
                TO_CHAR(cp.representante_doc_id) AS representante_doc_id,
                cp.motivo_registro,
                cp.fecha_vigencia,
                cp.estado,
                cp.observaciones,
                cp.solicitado_por,
                cp.solicitado_en
            FROM MB_CUENTA_BANCARIA_PROVEEDOR cp
            INNER JOIN MB_BANCO b
                ON b.banco_id = cp.banco_id
            INNER JOIN MB_CATALOGO_BANCARIO tc
                ON tc.catalogo_id = cp.tipo_cuenta_id
            WHERE cp.cta_proveedor_id = p_cta_proveedor_id;

    END OBTENER_CUENTA_PROVEEDOR;

    PROCEDURE CREAR_CUENTA_PROVEEDOR (
        p_proveedor_id             IN MB_CUENTA_BANCARIA_PROVEEDOR.proveedor_id%TYPE,
        p_banco_id                 IN MB_CUENTA_BANCARIA_PROVEEDOR.banco_id%TYPE,
        p_tipo_cuenta_id           IN MB_CUENTA_BANCARIA_PROVEEDOR.tipo_cuenta_id%TYPE,
        p_moneda_id                IN MB_CUENTA_BANCARIA_PROVEEDOR.moneda_id%TYPE,
        p_cuenta_anterior_id       IN MB_CUENTA_BANCARIA_PROVEEDOR.cuenta_anterior_id%TYPE,
        p_titular                  IN MB_CUENTA_BANCARIA_PROVEEDOR.titular%TYPE,
        p_numero_cuenta            IN MB_CUENTA_BANCARIA_PROVEEDOR.numero_cuenta%TYPE,
        p_carta_solicitud_doc_id   IN MB_CUENTA_BANCARIA_PROVEEDOR.carta_solicitud_doc_id%TYPE,
        p_constancia_banco_doc_id  IN MB_CUENTA_BANCARIA_PROVEEDOR.constancia_banco_doc_id%TYPE,
        p_representante_doc_id     IN MB_CUENTA_BANCARIA_PROVEEDOR.representante_doc_id%TYPE,
        p_motivo_registro          IN MB_CUENTA_BANCARIA_PROVEEDOR.motivo_registro%TYPE,
        p_fecha_vigencia           IN MB_CUENTA_BANCARIA_PROVEEDOR.fecha_vigencia%TYPE,
        p_estado                   IN MB_CUENTA_BANCARIA_PROVEEDOR.estado%TYPE,
        p_observaciones            IN MB_CUENTA_BANCARIA_PROVEEDOR.observaciones%TYPE,
        p_solicitado_por           IN MB_CUENTA_BANCARIA_PROVEEDOR.solicitado_por%TYPE,
        p_cta_proveedor_id         OUT MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE
    ) AS
        v_total NUMBER;

        e_fk_no_existe EXCEPTION;
        PRAGMA EXCEPTION_INIT(e_fk_no_existe, -2291);

    BEGIN
        ------------------------------------------------------------------
        -- Validaciones bÃ¡sicas
        ------------------------------------------------------------------

        IF p_banco_id IS NULL OR NOT EXISTE_BANCO(p_banco_id) THEN
            RAISE_APPLICATION_ERROR(
                -20026,
                'El banco indicado no existe.'
            );
        END IF;

        IF NOT BANCO_ESTA_ACTIVO(p_banco_id) THEN
            RAISE_APPLICATION_ERROR(
                -20043,
                'El banco indicado se encuentra inactivo y no puede asignarse a una cuenta nueva de proveedor.'
            );
        END IF;

        IF p_tipo_cuenta_id IS NULL
           OR NOT EXISTE_TIPO_CUENTA(p_tipo_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20027,
                'El tipo de cuenta indicado no existe.'
            );
        END IF;

        IF NOT TIPO_CUENTA_ESTA_ACTIVO(p_tipo_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20054,
                'El tipo de cuenta indicado se encuentra inactivo y no puede asignarse a una cuenta nueva de proveedor.'
            );
        END IF;

        IF p_cuenta_anterior_id IS NOT NULL
           AND NOT EXISTE_CUENTA_PROVEEDOR(p_cuenta_anterior_id) THEN
            RAISE_APPLICATION_ERROR(
                -20028,
                'La cuenta bancaria anterior indicada no existe.'
            );
        END IF;

        VALIDAR_ESTADO_CUENTA_PROV(p_estado);


        ------------------------------------------------------------------
        -- RestricciÃ³n UNIQUE real:
        -- proveedor + banco + nÃºmero de cuenta + moneda
        ------------------------------------------------------------------

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CUENTA_BANCARIA_PROVEEDOR
        WHERE proveedor_id = p_proveedor_id
          AND banco_id = p_banco_id
          AND numero_cuenta = p_numero_cuenta
          AND moneda_id = p_moneda_id;

        IF v_total > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20029,
                'La cuenta bancaria ya se encuentra registrada para este proveedor, banco y moneda.'
            );
        END IF;


        ------------------------------------------------------------------
        -- Identificador generado por Oracle
        ------------------------------------------------------------------

        p_cta_proveedor_id :=
            SEQ_MB_CUENTA_PROVEEDOR.NEXTVAL;

        ------------------------------------------------------------------
        -- InserciÃ³n
        ------------------------------------------------------------------

        INSERT INTO MB_CUENTA_BANCARIA_PROVEEDOR (
            cta_proveedor_id,
            proveedor_id,
            banco_id,
            tipo_cuenta_id,
            moneda_id,
            cuenta_anterior_id,
            titular,
            numero_cuenta,
            carta_solicitud_doc_id,
            constancia_banco_doc_id,
            representante_doc_id,
            motivo_registro,
            fecha_vigencia,
            estado,
            observaciones,
            solicitado_por,
            solicitado_en
        )
        VALUES (
            p_cta_proveedor_id,
            p_proveedor_id,
            p_banco_id,
            p_tipo_cuenta_id,
            p_moneda_id,
            p_cuenta_anterior_id,
            p_titular,
            p_numero_cuenta,
            p_carta_solicitud_doc_id,
            p_constancia_banco_doc_id,
            p_representante_doc_id,
            p_motivo_registro,
            p_fecha_vigencia,
            p_estado,
            p_observaciones,
            p_solicitado_por,
            SYSTIMESTAMP
        );

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            RAISE_APPLICATION_ERROR(
                -20030,
                'No se pudo crear la cuenta bancaria del proveedor porque existe un registro duplicado.'
            );

        WHEN e_fk_no_existe THEN
            RAISE_APPLICATION_ERROR(
                -20031,
                'No se pudo crear la cuenta porque una referencia asociada no existe.'
            );

    END CREAR_CUENTA_PROVEEDOR;

    PROCEDURE ACTUALIZAR_CUENTA_PROVEEDOR (
        p_cta_proveedor_id         IN MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE,
        p_proveedor_id             IN MB_CUENTA_BANCARIA_PROVEEDOR.proveedor_id%TYPE,
        p_banco_id                 IN MB_CUENTA_BANCARIA_PROVEEDOR.banco_id%TYPE,
        p_tipo_cuenta_id           IN MB_CUENTA_BANCARIA_PROVEEDOR.tipo_cuenta_id%TYPE,
        p_moneda_id                IN MB_CUENTA_BANCARIA_PROVEEDOR.moneda_id%TYPE,
        p_cuenta_anterior_id       IN MB_CUENTA_BANCARIA_PROVEEDOR.cuenta_anterior_id%TYPE,
        p_titular                  IN MB_CUENTA_BANCARIA_PROVEEDOR.titular%TYPE,
        p_numero_cuenta            IN MB_CUENTA_BANCARIA_PROVEEDOR.numero_cuenta%TYPE,
        p_carta_solicitud_doc_id   IN MB_CUENTA_BANCARIA_PROVEEDOR.carta_solicitud_doc_id%TYPE,
        p_constancia_banco_doc_id  IN MB_CUENTA_BANCARIA_PROVEEDOR.constancia_banco_doc_id%TYPE,
        p_representante_doc_id     IN MB_CUENTA_BANCARIA_PROVEEDOR.representante_doc_id%TYPE,
        p_motivo_registro          IN MB_CUENTA_BANCARIA_PROVEEDOR.motivo_registro%TYPE,
        p_fecha_vigencia           IN MB_CUENTA_BANCARIA_PROVEEDOR.fecha_vigencia%TYPE,
        p_observaciones            IN MB_CUENTA_BANCARIA_PROVEEDOR.observaciones%TYPE
    ) AS
        v_total              NUMBER;
        v_tipo_cuenta_actual MB_CUENTA_BANCARIA_PROVEEDOR.tipo_cuenta_id%TYPE;

        e_fk_no_existe EXCEPTION;
        PRAGMA EXCEPTION_INIT(e_fk_no_existe, -2291);

    BEGIN
        ------------------------------------------------------------------
        -- Validar existencia
        ------------------------------------------------------------------

        IF p_cta_proveedor_id IS NULL THEN
            RAISE_APPLICATION_ERROR(
                -20032,
                'Debe indicar el identificador de la cuenta bancaria del proveedor.'
            );
        END IF;

        IF NOT EXISTE_CUENTA_PROVEEDOR(p_cta_proveedor_id) THEN
            RAISE_APPLICATION_ERROR(
                -20033,
                'La cuenta bancaria del proveedor que desea actualizar no existe.'
            );
        END IF;

        SELECT tipo_cuenta_id
        INTO v_tipo_cuenta_actual
        FROM MB_CUENTA_BANCARIA_PROVEEDOR
        WHERE cta_proveedor_id = p_cta_proveedor_id
        FOR UPDATE;


        ------------------------------------------------------------------
        -- Validar relaciones
        ------------------------------------------------------------------

        IF p_banco_id IS NULL OR NOT EXISTE_BANCO(p_banco_id) THEN
            RAISE_APPLICATION_ERROR(
                -20034,
                'El banco indicado no existe.'
            );
        END IF;

        IF p_tipo_cuenta_id IS NULL
           OR NOT EXISTE_TIPO_CUENTA(p_tipo_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20035,
                'El tipo de cuenta indicado no existe.'
            );
        END IF;

        IF NVL(v_tipo_cuenta_actual, -1) <> NVL(p_tipo_cuenta_id, -1)
           AND NOT TIPO_CUENTA_ESTA_ACTIVO(p_tipo_cuenta_id) THEN
            RAISE_APPLICATION_ERROR(
                -20054,
                'El tipo de cuenta indicado se encuentra inactivo y no puede asignarse a la cuenta del proveedor.'
            );
        END IF;

        IF p_cuenta_anterior_id IS NOT NULL
           AND NOT EXISTE_CUENTA_PROVEEDOR(p_cuenta_anterior_id) THEN
            RAISE_APPLICATION_ERROR(
                -20036,
                'La cuenta bancaria anterior indicada no existe.'
            );
        END IF;


        ------------------------------------------------------------------
        -- Evitar duplicados excluyendo el registro actual
        ------------------------------------------------------------------

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CUENTA_BANCARIA_PROVEEDOR
        WHERE proveedor_id = p_proveedor_id
          AND banco_id = p_banco_id
          AND numero_cuenta = p_numero_cuenta
          AND moneda_id = p_moneda_id
          AND cta_proveedor_id <> p_cta_proveedor_id;

        IF v_total > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20037,
                'Ya existe otra cuenta bancaria con el mismo proveedor, banco, numero y moneda.'
            );
        END IF;


        ------------------------------------------------------------------
        -- ActualizaciÃ³n
        ------------------------------------------------------------------

        UPDATE MB_CUENTA_BANCARIA_PROVEEDOR
        SET
            proveedor_id = p_proveedor_id,
            banco_id = p_banco_id,
            tipo_cuenta_id = p_tipo_cuenta_id,
            moneda_id = p_moneda_id,
            cuenta_anterior_id = p_cuenta_anterior_id,
            titular = p_titular,
            numero_cuenta = p_numero_cuenta,
            carta_solicitud_doc_id = p_carta_solicitud_doc_id,
            constancia_banco_doc_id = p_constancia_banco_doc_id,
            representante_doc_id = p_representante_doc_id,
            motivo_registro = p_motivo_registro,
            fecha_vigencia = p_fecha_vigencia,
            observaciones = p_observaciones
        WHERE cta_proveedor_id = p_cta_proveedor_id;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            RAISE_APPLICATION_ERROR(
                -20038,
                'No se pudo actualizar la cuenta bancaria porque existe un registro duplicado.'
            );

        WHEN e_fk_no_existe THEN
            RAISE_APPLICATION_ERROR(
                -20039,
                'No se pudo actualizar la cuenta porque una referencia asociada no existe.'
            );

    END ACTUALIZAR_CUENTA_PROVEEDOR;

    PROCEDURE CAMBIAR_ESTADO_CUENTA_PROVEEDOR (
        p_cta_proveedor_id
            IN MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE,
        p_estado
            IN MB_CUENTA_BANCARIA_PROVEEDOR.estado%TYPE
    ) AS
    BEGIN
        IF p_cta_proveedor_id IS NULL THEN
            RAISE_APPLICATION_ERROR(
                -20040,
                'Debe indicar el identificador de la cuenta bancaria del proveedor.'
            );
        END IF;

        IF NOT EXISTE_CUENTA_PROVEEDOR(p_cta_proveedor_id) THEN
            RAISE_APPLICATION_ERROR(
                -20041,
                'La cuenta bancaria del proveedor indicada no existe.'
            );
        END IF;

        VALIDAR_ESTADO_CUENTA_PROV(p_estado);


        UPDATE MB_CUENTA_BANCARIA_PROVEEDOR
        SET estado = p_estado
        WHERE cta_proveedor_id = p_cta_proveedor_id;

    END CAMBIAR_ESTADO_CUENTA_PROVEEDOR;

END PKG_MB_CUENTAS;
/
