-- ============================================================
-- MODULO DE BANCOS
-- PACKAGE BODY: PKG_MB_BANCOS
--
-- Responsabilidad:
-- Implementar las operaciones de MB_BANCO.
--
-- Reglas principales:
-- - El banco debe existir para poder actualizarse.
-- - Un banco INACTIVO no puede editarse.
-- - No se permiten codigos de banco duplicados.
-- - No se realiza COMMIT ni ROLLBACK dentro del Package.
-- ============================================================

CREATE OR REPLACE PACKAGE BODY PKG_MB_BANCOS AS


    -- ========================================================
    -- LISTAR
    -- ========================================================

    PROCEDURE LISTAR (
        p_resultado OUT SYS_REFCURSOR
    ) AS
    BEGIN

        OPEN p_resultado FOR
            SELECT
                banco_id,
                codigo_banco,
                nombre,
                bic_swift,
                estado,
                creado_por,
                creado_en
            FROM MB_BANCO
            ORDER BY nombre;

    END LISTAR;


    -- ========================================================
    -- OBTENER
    -- ========================================================

    PROCEDURE OBTENER (
        p_banco_id  IN NUMBER,
        p_resultado OUT SYS_REFCURSOR
    ) AS
    BEGIN

        OPEN p_resultado FOR
            SELECT
                banco_id,
                codigo_banco,
                nombre,
                bic_swift,
                estado,
                creado_por,
                creado_en
            FROM MB_BANCO
            WHERE banco_id = p_banco_id;

    END OBTENER;


    -- ========================================================
    -- CREAR
    --
    -- El ID se genera dentro de Oracle.
    -- El banco se crea inicialmente con estado ACTIVO.
    -- ========================================================

    PROCEDURE CREAR (
        p_codigo_banco IN VARCHAR2,
        p_nombre       IN VARCHAR2,
        p_bic_swift    IN VARCHAR2,
        p_creado_por   IN NUMBER,
        p_banco_id     OUT NUMBER
    ) AS
    BEGIN

        p_banco_id := SEQ_MB_BANCO.NEXTVAL;

        INSERT INTO MB_BANCO (
            banco_id,
            codigo_banco,
            nombre,
            bic_swift,
            estado,
            creado_por,
            creado_en
        )
        VALUES (
            p_banco_id,
            p_codigo_banco,
            p_nombre,
            p_bic_swift,
            'ACTIVO',
            p_creado_por,
            SYSTIMESTAMP
        );

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            RAISE_APPLICATION_ERROR(
                -20023,
                'Ya existe un banco con el código indicado.'
            );

    END CREAR;


    -- ========================================================
    -- ACTUALIZAR
    --
    -- Reglas:
    -- - El banco debe existir.
    -- - Un banco INACTIVO no puede editarse.
    -- - No se permite duplicar codigo_banco.
    -- ========================================================

    PROCEDURE ACTUALIZAR (
        p_banco_id     IN NUMBER,
        p_codigo_banco IN VARCHAR2,
        p_nombre       IN VARCHAR2,
        p_bic_swift    IN VARCHAR2
    ) AS

        v_estado MB_BANCO.estado%TYPE;

    BEGIN

        -- Verificar existencia y obtener estado actual.
        BEGIN

            SELECT estado
              INTO v_estado
              FROM MB_BANCO
             WHERE banco_id = p_banco_id;

        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(
                    -20021,
                    'El banco indicado no existe.'
                );
        END;


        -- Un banco inactivo conserva su informacion,
        -- pero no puede ser editado.
        IF v_estado = 'INACTIVO' THEN
            RAISE_APPLICATION_ERROR(
                -20022,
                'El banco indicado se encuentra inactivo y no puede editarse.'
            );
        END IF;


        UPDATE MB_BANCO
           SET codigo_banco = p_codigo_banco,
               nombre       = p_nombre,
               bic_swift    = p_bic_swift
         WHERE banco_id = p_banco_id;


    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            RAISE_APPLICATION_ERROR(
                -20023,
                'Ya existe un banco con el código indicado.'
            );

    END ACTUALIZAR;

    -- ========================================================
    -- CAMBIAR ESTADO
    -- ========================================================

    PROCEDURE CAMBIAR_ESTADO (
        p_banco_id IN NUMBER,
        p_estado   IN VARCHAR2
    ) AS
    BEGIN

        IF p_estado NOT IN ('ACTIVO', 'INACTIVO') THEN
            RAISE_APPLICATION_ERROR(
                -20024,
                'El estado indicado no es válido.'
            );
        END IF;

        UPDATE MB_BANCO
           SET estado = p_estado
         WHERE banco_id = p_banco_id;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(
                -20021,
                'El banco indicado no existe.'
            );
        END IF;

    END CAMBIAR_ESTADO;


END PKG_MB_BANCOS;
/