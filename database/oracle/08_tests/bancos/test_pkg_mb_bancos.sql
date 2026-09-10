-- ============================================================
-- PRUEBAS DEL PACKAGE: PKG_MB_BANCOS
-- Proyecto: ERP - Módulo de Bancos
--
-- Objetivo:
-- Verificar de forma repetible las operaciones públicas de
-- PKG_MB_BANCOS sin dejar bancos de prueba almacenados.
--
-- Operaciones verificadas:
-- 1. LISTAR
-- 2. OBTENER
-- 3. CREAR
-- 4. ACTUALIZAR
-- 5. CAMBIAR_ESTADO
--
-- Reglas verificadas:
-- - Oracle genera banco_id mediante SEQ_MB_BANCO.
-- - Un banco nuevo inicia en estado ACTIVO.
-- - Un banco INACTIVO no puede editarse.
-- - No se permite un código de banco duplicado.
-- - No se permite un estado distinto de ACTIVO/INACTIVO.
--
-- La prueba utiliza SAVEPOINT y ROLLBACK TO SAVEPOINT.
-- No realiza COMMIT.
-- ============================================================

SET SERVEROUTPUT ON;

VARIABLE v_test_banco_id NUMBER;


DECLARE

    v_banco_id          NUMBER;
    v_codigo_prueba     VARCHAR2(10);

    v_cursor            SYS_REFCURSOR;

    v_id_obtenido       MB_BANCO.banco_id%TYPE;
    v_codigo_obtenido   MB_BANCO.codigo_banco%TYPE;
    v_nombre_obtenido   MB_BANCO.nombre%TYPE;
    v_bic_obtenido      MB_BANCO.bic_swift%TYPE;
    v_estado_obtenido   MB_BANCO.estado%TYPE;
    v_creado_por        MB_BANCO.creado_por%TYPE;
    v_creado_en         MB_BANCO.creado_en%TYPE;

    v_encontrado_listar NUMBER := 0;
    v_id_duplicado      NUMBER;

BEGIN

    SAVEPOINT inicio_test_pkg_mb_bancos;


    -- ========================================================
    -- GENERAR CÓDIGO TEMPORAL
    -- ========================================================

    v_codigo_prueba :=
        SUBSTR(
            'T' ||
            TO_CHAR(
                SYSTIMESTAMP,
                'HH24MISSFF3'
            ),
            1,
            10
        );


    DBMS_OUTPUT.PUT_LINE(
        '============================================================'
    );

    DBMS_OUTPUT.PUT_LINE(
        'INICIO TEST PKG_MB_BANCOS'
    );

    DBMS_OUTPUT.PUT_LINE(
        'Código temporal: ' || v_codigo_prueba
    );


    -- ========================================================
    -- 1. CREAR
    -- Oracle debe generar banco_id.
    -- ========================================================

    PKG_MB_BANCOS.CREAR(
        p_codigo_banco => v_codigo_prueba,
        p_nombre       => 'Banco Temporal Prueba Package',
        p_bic_swift    => 'TESTGTGCXXX',
        p_creado_por   => 1,
        p_banco_id     => v_banco_id
    );


    :v_test_banco_id := v_banco_id;


    IF v_banco_id IS NULL THEN

        RAISE_APPLICATION_ERROR(
            -20990,
            'ERROR: CREAR no devolvió banco_id.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - CREAR generó banco_id = ' || v_banco_id
    );


    -- ========================================================
    -- 2. OBTENER
    -- ========================================================

    PKG_MB_BANCOS.OBTENER(
        p_banco_id  => v_banco_id,
        p_resultado => v_cursor
    );


    FETCH v_cursor
    INTO
        v_id_obtenido,
        v_codigo_obtenido,
        v_nombre_obtenido,
        v_bic_obtenido,
        v_estado_obtenido,
        v_creado_por,
        v_creado_en;


    IF v_cursor%NOTFOUND THEN

        CLOSE v_cursor;

        RAISE_APPLICATION_ERROR(
            -20991,
            'ERROR: OBTENER no devolvió el banco creado.'
        );

    END IF;


    CLOSE v_cursor;


    IF v_id_obtenido <> v_banco_id THEN

        RAISE_APPLICATION_ERROR(
            -20992,
            'ERROR: OBTENER devolvió un banco_id incorrecto.'
        );

    END IF;


    IF v_codigo_obtenido <> v_codigo_prueba THEN

        RAISE_APPLICATION_ERROR(
            -20993,
            'ERROR: OBTENER devolvió un código incorrecto.'
        );

    END IF;


    IF v_estado_obtenido <> 'ACTIVO' THEN

        RAISE_APPLICATION_ERROR(
            -20994,
            'ERROR: El banco nuevo no inició en estado ACTIVO.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - OBTENER recuperó correctamente el banco.'
    );

    DBMS_OUTPUT.PUT_LINE(
        'OK - El banco fue creado en estado ACTIVO.'
    );


    -- ========================================================
    -- 3. ACTUALIZAR
    -- ========================================================

    PKG_MB_BANCOS.ACTUALIZAR(
        p_banco_id     => v_banco_id,
        p_codigo_banco => v_codigo_prueba,
        p_nombre       => 'Banco Temporal Package Actualizado',
        p_bic_swift    => 'TESTGTGCXXX'
    );


    PKG_MB_BANCOS.OBTENER(
        p_banco_id  => v_banco_id,
        p_resultado => v_cursor
    );


    FETCH v_cursor
    INTO
        v_id_obtenido,
        v_codigo_obtenido,
        v_nombre_obtenido,
        v_bic_obtenido,
        v_estado_obtenido,
        v_creado_por,
        v_creado_en;


    CLOSE v_cursor;


    IF v_nombre_obtenido <>
       'Banco Temporal Package Actualizado' THEN

        RAISE_APPLICATION_ERROR(
            -20995,
            'ERROR: ACTUALIZAR no modificó el nombre.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - ACTUALIZAR modificó correctamente el banco.'
    );


    -- ========================================================
    -- 4. LISTAR
    -- Comprobar que el registro creado aparece una sola vez.
    -- ========================================================

    PKG_MB_BANCOS.LISTAR(
        p_resultado => v_cursor
    );


    LOOP

        FETCH v_cursor
        INTO
            v_id_obtenido,
            v_codigo_obtenido,
            v_nombre_obtenido,
            v_bic_obtenido,
            v_estado_obtenido,
            v_creado_por,
            v_creado_en;


        EXIT WHEN v_cursor%NOTFOUND;


        IF v_id_obtenido = v_banco_id THEN

            v_encontrado_listar :=
                v_encontrado_listar + 1;

        END IF;

    END LOOP;


    CLOSE v_cursor;


    IF v_encontrado_listar <> 1 THEN

        RAISE_APPLICATION_ERROR(
            -20996,
            'ERROR: LISTAR no devolvió exactamente una vez el banco creado.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - LISTAR incluyó correctamente el banco creado.'
    );


    -- ========================================================
    -- 5. CAMBIAR ESTADO A INACTIVO
    -- ========================================================

    PKG_MB_BANCOS.CAMBIAR_ESTADO(
        p_banco_id => v_banco_id,
        p_estado   => 'INACTIVO'
    );


    PKG_MB_BANCOS.OBTENER(
        p_banco_id  => v_banco_id,
        p_resultado => v_cursor
    );


    FETCH v_cursor
    INTO
        v_id_obtenido,
        v_codigo_obtenido,
        v_nombre_obtenido,
        v_bic_obtenido,
        v_estado_obtenido,
        v_creado_por,
        v_creado_en;


    CLOSE v_cursor;


    IF v_estado_obtenido <> 'INACTIVO' THEN

        RAISE_APPLICATION_ERROR(
            -20997,
            'ERROR: CAMBIAR_ESTADO no dejó el banco INACTIVO.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - CAMBIAR_ESTADO dejó el banco INACTIVO.'
    );


    -- ========================================================
    -- 6. RESISTENCIA:
    -- UN BANCO INACTIVO NO PUEDE EDITARSE
    -- Debe devolver ORA-20022.
    -- ========================================================

    BEGIN

        PKG_MB_BANCOS.ACTUALIZAR(
            p_banco_id     => v_banco_id,
            p_codigo_banco => v_codigo_prueba,
            p_nombre       => 'ESTE CAMBIO NO DEBE APLICARSE',
            p_bic_swift    => 'TESTGTGCXXX'
        );


        RAISE_APPLICATION_ERROR(
            -20998,
            'ERROR: Se permitió editar un banco INACTIVO.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20022 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - Banco INACTIVO rechazó edición con ORA-20022.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 7. REACTIVAR BANCO
    -- ========================================================

    PKG_MB_BANCOS.CAMBIAR_ESTADO(
        p_banco_id => v_banco_id,
        p_estado   => 'ACTIVO'
    );


    DBMS_OUTPUT.PUT_LINE(
        'OK - Banco temporal reactivado.'
    );


    -- ========================================================
    -- 8. RESISTENCIA:
    -- ESTADO INVÁLIDO
    -- Debe devolver ORA-20024.
    -- ========================================================

    BEGIN

        PKG_MB_BANCOS.CAMBIAR_ESTADO(
            p_banco_id => v_banco_id,
            p_estado   => 'ELIMINADO'
        );


        RAISE_APPLICATION_ERROR(
            -20999,
            'ERROR: Se aceptó un estado inválido.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20024 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - Estado inválido rechazado con ORA-20024.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 9. RESISTENCIA:
    -- CÓDIGO DUPLICADO
    -- Debe devolver ORA-20023.
    -- ========================================================

    BEGIN

        PKG_MB_BANCOS.CREAR(
            p_codigo_banco => v_codigo_prueba,
            p_nombre       => 'Banco Duplicado No Permitido',
            p_bic_swift    => 'TESTGTGCXXX',
            p_creado_por   => 1,
            p_banco_id     => v_id_duplicado
        );


        RAISE_APPLICATION_ERROR(
            -20989,
            'ERROR: Se permitió crear un código duplicado.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20023 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - Código duplicado rechazado con ORA-20023.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 10. LIMPIEZA
    -- No debe permanecer el banco temporal.
    -- ========================================================

    ROLLBACK TO inicio_test_pkg_mb_bancos;


    DBMS_OUTPUT.PUT_LINE(
        'OK - ROLLBACK realizado.'
    );

    DBMS_OUTPUT.PUT_LINE(
        'OK - No se dejaron bancos de prueba almacenados.'
    );

    DBMS_OUTPUT.PUT_LINE(
        'FIN TEST PKG_MB_BANCOS'
    );

    DBMS_OUTPUT.PUT_LINE(
        '============================================================'
    );


EXCEPTION

    WHEN OTHERS THEN

        IF v_cursor%ISOPEN THEN
            CLOSE v_cursor;
        END IF;


        ROLLBACK TO inicio_test_pkg_mb_bancos;


        DBMS_OUTPUT.PUT_LINE(
            'ERROR EN TEST PKG_MB_BANCOS: ' ||
            SQLERRM
        );


        RAISE;

END;
/


-- ============================================================
-- VERIFICACIÓN POSTERIOR AL ROLLBACK
--
-- El resultado esperado es:
-- REGISTROS_TEMPORALES_RESTANTES = 0
-- ============================================================

SELECT
    COUNT(*) AS registros_temporales_restantes
FROM MB_BANCO
WHERE banco_id = :v_test_banco_id;