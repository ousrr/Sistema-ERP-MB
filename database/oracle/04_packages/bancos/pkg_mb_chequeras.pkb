-- Persona 4 - PACKAGE BODY: PKG_MB_CHEQUERAS
-- Extraído del esquema ERP_BANCOS exportado el 2026-09-11.

CREATE OR REPLACE EDITIONABLE PACKAGE BODY "PKG_MB_CHEQUERAS" AS

    ------------------------------------------------------------
    -- VALIDAR CUENTA
    ------------------------------------------------------------
    PROCEDURE VALIDAR_CUENTA(
        p_cuenta_id IN NUMBER
    ) IS
        v_estado  MB_CUENTA_BANCARIA.estado%TYPE;
        v_cheques MB_CUENTA_BANCARIA.permite_cheques%TYPE;
    BEGIN

        SELECT estado,
               permite_cheques
        INTO   v_estado,
               v_cheques
        FROM MB_CUENTA_BANCARIA
        WHERE cuenta_id = p_cuenta_id;

        IF v_estado <> 'ACTIVA' THEN
            RAISE_APPLICATION_ERROR(
                -20001,
                'La cuenta bancaria debe estar ACTIVA para utilizar chequeras.'
            );
        END IF;

        IF v_cheques <> 'S' THEN
            RAISE_APPLICATION_ERROR(
                -20002,
                'La cuenta bancaria seleccionada no permite cheques.'
            );
        END IF;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(
                -20003,
                'La cuenta bancaria indicada no existe.'
            );

    END VALIDAR_CUENTA;


    ------------------------------------------------------------
    -- VALIDAR RANGO
    ------------------------------------------------------------
    PROCEDURE VALIDAR_RANGO(
        p_cuenta_id      IN NUMBER,
        p_serie          IN VARCHAR2,
        p_numero_inicial IN NUMBER,
        p_numero_final   IN NUMBER,
        p_chequera_id    IN NUMBER DEFAULT NULL
    ) IS
        v_total NUMBER;
    BEGIN

        IF p_numero_inicial IS NULL
           OR p_numero_final IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20004,
                'El número inicial y el número final son obligatorios.'
            );

        END IF;

        IF p_numero_inicial > p_numero_final THEN

            RAISE_APPLICATION_ERROR(
                -20005,
                'El número inicial no puede ser mayor que el número final.'
            );

        END IF;

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CHEQUERA
        WHERE cuenta_id = p_cuenta_id

          AND NVL(
                UPPER(TRIM(serie)),
                '#SIN_SERIE#'
              )
              =
              NVL(
                UPPER(TRIM(p_serie)),
                '#SIN_SERIE#'
              )

          AND p_numero_inicial <= numero_final
          AND p_numero_final >= numero_inicial

          AND (
                p_chequera_id IS NULL
                OR chequera_id <> p_chequera_id
              );

        IF v_total > 0 THEN

            RAISE_APPLICATION_ERROR(
                -20006,
                'El rango de cheques se superpone con otra chequera de la misma cuenta y serie.'
            );

        END IF;

    END VALIDAR_RANGO;


    ------------------------------------------------------------
    -- VALIDAR ESTADO
    ------------------------------------------------------------
    PROCEDURE VALIDAR_ESTADO(
        p_estado IN VARCHAR2
    ) IS
        v_estado VARCHAR2(15);
    BEGIN

        v_estado := UPPER(TRIM(p_estado));

        IF v_estado IS NULL
           OR v_estado NOT IN (
                'BORRADOR',
                'ACTIVA',
                'AGOTADA',
                'INACTIVA'
           ) THEN

            RAISE_APPLICATION_ERROR(
                -20007,
                'Estado de chequera no válido.'
            );

        END IF;

    END VALIDAR_ESTADO;


    ------------------------------------------------------------
    -- LISTAR
    ------------------------------------------------------------
    PROCEDURE LISTAR(
        p_resultado OUT SYS_REFCURSOR
    ) IS
    BEGIN

        OPEN p_resultado FOR

            SELECT
                ch.chequera_id,
                ch.cuenta_id,
                cb.codigo_cuenta,
                cb.numero_cuenta,
                cb.nombre_interno,
                b.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,
                ch.serie,
                ch.numero_inicial,
                ch.numero_final,
                ch.fecha_recepcion,
                ch.custodio_id,
                ch.ubicacion_fisica,
                ch.documento_recepcion_id,
                ch.estado,
                ch.observaciones

            FROM MB_CHEQUERA ch

            JOIN MB_CUENTA_BANCARIA cb
              ON cb.cuenta_id = ch.cuenta_id

            JOIN MB_BANCO b
              ON b.banco_id = cb.banco_id

            ORDER BY
                b.nombre,
                cb.nombre_interno,
                ch.serie,
                ch.numero_inicial;

    END LISTAR;


    ------------------------------------------------------------
    -- LISTAR POR CUENTA
    ------------------------------------------------------------
    PROCEDURE LISTAR_POR_CUENTA(
        p_cuenta_id IN NUMBER,
        p_resultado OUT SYS_REFCURSOR
    ) IS
        v_total NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CUENTA_BANCARIA
        WHERE cuenta_id = p_cuenta_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20008,
                'La cuenta bancaria indicada no existe.'
            );

        END IF;

        OPEN p_resultado FOR

            SELECT
                ch.chequera_id,
                ch.cuenta_id,
                cb.codigo_cuenta,
                cb.numero_cuenta,
                cb.nombre_interno,
                b.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,
                ch.serie,
                ch.numero_inicial,
                ch.numero_final,
                ch.fecha_recepcion,
                ch.custodio_id,
                ch.ubicacion_fisica,
                ch.documento_recepcion_id,
                ch.estado,
                ch.observaciones

            FROM MB_CHEQUERA ch

            JOIN MB_CUENTA_BANCARIA cb
              ON cb.cuenta_id = ch.cuenta_id

            JOIN MB_BANCO b
              ON b.banco_id = cb.banco_id

            WHERE ch.cuenta_id = p_cuenta_id

            ORDER BY
                ch.serie,
                ch.numero_inicial;

    END LISTAR_POR_CUENTA;


    ------------------------------------------------------------
    -- OBTENER
    ------------------------------------------------------------
    PROCEDURE OBTENER(
        p_chequera_id IN NUMBER,
        p_resultado OUT SYS_REFCURSOR
    ) IS
        v_total NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CHEQUERA
        WHERE chequera_id = p_chequera_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20009,
                'La chequera indicada no existe.'
            );

        END IF;

        OPEN p_resultado FOR

            SELECT
                ch.chequera_id,
                ch.cuenta_id,
                cb.codigo_cuenta,
                cb.numero_cuenta,
                cb.nombre_interno,
                b.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,
                ch.serie,
                ch.numero_inicial,
                ch.numero_final,
                ch.fecha_recepcion,
                ch.custodio_id,
                ch.ubicacion_fisica,
                ch.documento_recepcion_id,
                ch.estado,
                ch.observaciones

            FROM MB_CHEQUERA ch

            JOIN MB_CUENTA_BANCARIA cb
              ON cb.cuenta_id = ch.cuenta_id

            JOIN MB_BANCO b
              ON b.banco_id = cb.banco_id

            WHERE ch.chequera_id = p_chequera_id;

    END OBTENER;


    ------------------------------------------------------------
    -- CREAR
    ------------------------------------------------------------
    PROCEDURE CREAR(
        p_cuenta_id IN NUMBER,
        p_serie IN VARCHAR2,
        p_numero_inicial IN NUMBER,
        p_numero_final IN NUMBER,
        p_fecha_recepcion IN DATE,
        p_custodio_id IN NUMBER,
        p_ubicacion_fisica IN VARCHAR2,
        p_documento_recepcion_id IN NUMBER,
        p_estado IN VARCHAR2,
        p_observaciones IN VARCHAR2,
        p_chequera_id OUT NUMBER
    ) IS
    BEGIN

        VALIDAR_CUENTA(
            p_cuenta_id
        );

        VALIDAR_RANGO(
            p_cuenta_id,
            p_serie,
            p_numero_inicial,
            p_numero_final,
            NULL
        );

        VALIDAR_ESTADO(
            p_estado
        );

        IF p_fecha_recepcion IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20010,
                'La fecha de recepción es obligatoria.'
            );

        END IF;

        IF p_custodio_id IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20011,
                'El custodio de la chequera es obligatorio.'
            );

        END IF;

        SELECT SEQ_MB_CHEQUERA.NEXTVAL
        INTO p_chequera_id
        FROM DUAL;

        INSERT INTO MB_CHEQUERA(
            chequera_id,
            cuenta_id,
            serie,
            numero_inicial,
            numero_final,
            fecha_recepcion,
            custodio_id,
            ubicacion_fisica,
            documento_recepcion_id,
            estado,
            observaciones
        )
        VALUES(
            p_chequera_id,
            p_cuenta_id,
            UPPER(TRIM(p_serie)),
            p_numero_inicial,
            p_numero_final,
            p_fecha_recepcion,
            p_custodio_id,
            TRIM(p_ubicacion_fisica),
            p_documento_recepcion_id,
            UPPER(TRIM(p_estado)),
            TRIM(p_observaciones)
        );

    END CREAR;


    ------------------------------------------------------------
    -- ACTUALIZAR
    ------------------------------------------------------------
    PROCEDURE ACTUALIZAR(
        p_chequera_id IN NUMBER,
        p_cuenta_id IN NUMBER,
        p_serie IN VARCHAR2,
        p_numero_inicial IN NUMBER,
        p_numero_final IN NUMBER,
        p_fecha_recepcion IN DATE,
        p_custodio_id IN NUMBER,
        p_ubicacion_fisica IN VARCHAR2,
        p_documento_recepcion_id IN NUMBER,
        p_observaciones IN VARCHAR2
    ) IS
        v_total NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CHEQUERA
        WHERE chequera_id = p_chequera_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20012,
                'La chequera indicada no existe.'
            );

        END IF;

        VALIDAR_CUENTA(
            p_cuenta_id
        );

        VALIDAR_RANGO(
            p_cuenta_id,
            p_serie,
            p_numero_inicial,
            p_numero_final,
            p_chequera_id
        );

        IF p_fecha_recepcion IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20013,
                'La fecha de recepción es obligatoria.'
            );

        END IF;

        IF p_custodio_id IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20014,
                'El custodio de la chequera es obligatorio.'
            );

        END IF;

        UPDATE MB_CHEQUERA
        SET
            cuenta_id = p_cuenta_id,
            serie = UPPER(TRIM(p_serie)),
            numero_inicial = p_numero_inicial,
            numero_final = p_numero_final,
            fecha_recepcion = p_fecha_recepcion,
            custodio_id = p_custodio_id,
            ubicacion_fisica = TRIM(p_ubicacion_fisica),
            documento_recepcion_id = p_documento_recepcion_id,
            observaciones = TRIM(p_observaciones)

        WHERE chequera_id = p_chequera_id;

    END ACTUALIZAR;


    ------------------------------------------------------------
    -- CAMBIAR ESTADO
    ------------------------------------------------------------
    PROCEDURE CAMBIAR_ESTADO(
        p_chequera_id IN NUMBER,
        p_estado IN VARCHAR2
    ) IS
        v_total  NUMBER;
        v_cuenta NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CHEQUERA
        WHERE chequera_id = p_chequera_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20015,
                'La chequera indicada no existe.'
            );

        END IF;

        VALIDAR_ESTADO(
            p_estado
        );

        IF UPPER(TRIM(p_estado)) = 'ACTIVA' THEN

            SELECT cuenta_id
            INTO v_cuenta
            FROM MB_CHEQUERA
            WHERE chequera_id = p_chequera_id;

            VALIDAR_CUENTA(
                v_cuenta
            );

        END IF;

        UPDATE MB_CHEQUERA
        SET estado = UPPER(TRIM(p_estado))
        WHERE chequera_id = p_chequera_id;

    END CAMBIAR_ESTADO;


    ------------------------------------------------------------
    -- DELETE LÓGICO
    ------------------------------------------------------------
    PROCEDURE DESACTIVAR(
        p_chequera_id IN NUMBER
    ) IS
    BEGIN

        CAMBIAR_ESTADO(
            p_chequera_id => p_chequera_id,
            p_estado      => 'INACTIVA'
        );

    END DESACTIVAR;


END PKG_MB_CHEQUERAS;

/
