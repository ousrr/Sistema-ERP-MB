-- ============================================================
-- PRUEBAS DEL PACKAGE: PKG_MB_CATALOGOS
-- Proyecto: ERP - Módulo de Bancos
--
-- Objetivo:
-- Verificar de forma repetible todas las operaciones públicas
-- de PKG_MB_CATALOGOS sin dejar datos de prueba almacenados.
--
-- Operaciones verificadas:
-- 1. LISTAR
-- 2. OBTENER
-- 3. LISTAR_POR_GRUPO
-- 4. CREAR
-- 5. ACTUALIZAR
-- 6. CAMBIAR_ESTADO
--
-- Reglas verificadas:
-- - Oracle genera catalogo_id automáticamente.
-- - grupo + codigo no pueden duplicarse.
-- - Los indicadores solamente permiten S/N.
-- - naturaleza solamente permite D/C/NULL.
-- - TIPO_MOVIMIENTO requiere naturaleza.
-- - estado solamente permite ACTIVO/INACTIVO.
-- - ACTUALIZAR requiere que el catálogo exista.
-- - CAMBIAR_ESTADO requiere que el catálogo exista.
-- - LISTAR_POR_GRUPO devuelve solamente registros ACTIVO.
--
-- La prueba utiliza SAVEPOINT y ROLLBACK TO SAVEPOINT.
-- No realiza COMMIT.
-- ============================================================

SET SERVEROUTPUT ON;

VARIABLE v_test_catalogo_id NUMBER;


DECLARE

    v_catalogo_id        NUMBER;
    v_id_duplicado       NUMBER;

    v_grupo_prueba       VARCHAR2(30);
    v_codigo_prueba      VARCHAR2(30);

    v_cursor             SYS_REFCURSOR;

    -- Columnas de LISTAR / OBTENER
    v_id_obtenido        MB_CATALOGO_BANCARIO.catalogo_id%TYPE;
    v_grupo_obtenido     MB_CATALOGO_BANCARIO.grupo%TYPE;
    v_codigo_obtenido    MB_CATALOGO_BANCARIO.codigo%TYPE;
    v_nombre_obtenido    MB_CATALOGO_BANCARIO.nombre%TYPE;
    v_descripcion        MB_CATALOGO_BANCARIO.descripcion%TYPE;
    v_aplica_a           MB_CATALOGO_BANCARIO.aplica_a%TYPE;
    v_naturaleza         MB_CATALOGO_BANCARIO.naturaleza%TYPE;
    v_req_comentario     MB_CATALOGO_BANCARIO.requiere_comentario%TYPE;
    v_req_evidencia      MB_CATALOGO_BANCARIO.requiere_evidencia%TYPE;
    v_permite_reversion  MB_CATALOGO_BANCARIO.permite_reversion%TYPE;
    v_estado             MB_CATALOGO_BANCARIO.estado%TYPE;

    -- Control de resultados
    v_encontrado_listar  NUMBER := 0;
    v_encontrado_grupo   NUMBER := 0;

    -- LISTAR_POR_GRUPO devuelve solamente cinco columnas
    v_lp_id              MB_CATALOGO_BANCARIO.catalogo_id%TYPE;
    v_lp_codigo          MB_CATALOGO_BANCARIO.codigo%TYPE;
    v_lp_nombre          MB_CATALOGO_BANCARIO.nombre%TYPE;
    v_lp_descripcion     MB_CATALOGO_BANCARIO.descripcion%TYPE;
    v_lp_naturaleza      MB_CATALOGO_BANCARIO.naturaleza%TYPE;

BEGIN

    SAVEPOINT inicio_test_pkg_mb_catalogos;


    -- ========================================================
    -- GENERAR DATOS TEMPORALES
    -- ========================================================

    v_grupo_prueba := 'PRUEBA_P3';

    v_codigo_prueba :=
        SUBSTR(
            'T' ||
            TO_CHAR(
                SYSTIMESTAMP,
                'HH24MISSFF3'
            ),
            1,
            30
        );


    DBMS_OUTPUT.PUT_LINE(
        '============================================================'
    );

    DBMS_OUTPUT.PUT_LINE(
        'INICIO TEST PKG_MB_CATALOGOS'
    );

    DBMS_OUTPUT.PUT_LINE(
        'Grupo temporal: ' || v_grupo_prueba
    );

    DBMS_OUTPUT.PUT_LINE(
        'Código temporal: ' || v_codigo_prueba
    );


    -- ========================================================
    -- 1. CREAR
    -- ========================================================

    PKG_MB_CATALOGOS.CREAR(
        p_grupo               => v_grupo_prueba,
        p_codigo              => v_codigo_prueba,
        p_nombre              => 'Catalogo Temporal Package',
        p_descripcion         => 'Registro temporal para prueba automatizada',
        p_aplica_a            => 'PRUEBA',
        p_naturaleza          => NULL,
        p_requiere_comentario => 'N',
        p_requiere_evidencia  => 'N',
        p_permite_reversion   => 'S',
        p_estado              => 'ACTIVO',
        p_catalogo_id         => v_catalogo_id
    );


    :v_test_catalogo_id := v_catalogo_id;


    IF v_catalogo_id IS NULL THEN

        RAISE_APPLICATION_ERROR(
            -20980,
            'ERROR: CREAR no devolvió catalogo_id.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - CREAR generó catalogo_id = ' || v_catalogo_id
    );


    -- ========================================================
    -- 2. OBTENER
    -- ========================================================

    PKG_MB_CATALOGOS.OBTENER(
        p_catalogo_id => v_catalogo_id,
        p_resultado   => v_cursor
    );


    FETCH v_cursor
    INTO
        v_id_obtenido,
        v_grupo_obtenido,
        v_codigo_obtenido,
        v_nombre_obtenido,
        v_descripcion,
        v_aplica_a,
        v_naturaleza,
        v_req_comentario,
        v_req_evidencia,
        v_permite_reversion,
        v_estado;


    IF v_cursor%NOTFOUND THEN

        CLOSE v_cursor;

        RAISE_APPLICATION_ERROR(
            -20981,
            'ERROR: OBTENER no devolvió el catálogo creado.'
        );

    END IF;


    CLOSE v_cursor;


    IF v_id_obtenido <> v_catalogo_id THEN

        RAISE_APPLICATION_ERROR(
            -20982,
            'ERROR: OBTENER devolvió catalogo_id incorrecto.'
        );

    END IF;


    IF v_grupo_obtenido <> v_grupo_prueba
       OR v_codigo_obtenido <> v_codigo_prueba THEN

        RAISE_APPLICATION_ERROR(
            -20983,
            'ERROR: OBTENER devolvió grupo/código incorrectos.'
        );

    END IF;


    IF v_estado <> 'ACTIVO' THEN

        RAISE_APPLICATION_ERROR(
            -20984,
            'ERROR: El catálogo no fue creado ACTIVO.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - OBTENER recuperó correctamente el catálogo.'
    );


    -- ========================================================
    -- 3. LISTAR
    -- ========================================================

    PKG_MB_CATALOGOS.LISTAR(
        p_resultado => v_cursor
    );


    LOOP

        FETCH v_cursor
        INTO
            v_id_obtenido,
            v_grupo_obtenido,
            v_codigo_obtenido,
            v_nombre_obtenido,
            v_descripcion,
            v_aplica_a,
            v_naturaleza,
            v_req_comentario,
            v_req_evidencia,
            v_permite_reversion,
            v_estado;


        EXIT WHEN v_cursor%NOTFOUND;


        IF v_id_obtenido = v_catalogo_id THEN

            v_encontrado_listar :=
                v_encontrado_listar + 1;

        END IF;

    END LOOP;


    CLOSE v_cursor;


    IF v_encontrado_listar <> 1 THEN

        RAISE_APPLICATION_ERROR(
            -20985,
            'ERROR: LISTAR no devolvió exactamente una vez el catálogo.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - LISTAR incluyó correctamente el catálogo creado.'
    );


    -- ========================================================
    -- 4. LISTAR_POR_GRUPO CON REGISTRO ACTIVO
    -- ========================================================

    v_encontrado_grupo := 0;


    PKG_MB_CATALOGOS.LISTAR_POR_GRUPO(
        p_grupo     => v_grupo_prueba,
        p_resultado => v_cursor
    );


    LOOP

        FETCH v_cursor
        INTO
            v_lp_id,
            v_lp_codigo,
            v_lp_nombre,
            v_lp_descripcion,
            v_lp_naturaleza;


        EXIT WHEN v_cursor%NOTFOUND;


        IF v_lp_id = v_catalogo_id THEN

            v_encontrado_grupo :=
                v_encontrado_grupo + 1;

        END IF;

    END LOOP;


    CLOSE v_cursor;


    IF v_encontrado_grupo <> 1 THEN

        RAISE_APPLICATION_ERROR(
            -20986,
            'ERROR: LISTAR_POR_GRUPO no devolvió el catálogo ACTIVO.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - LISTAR_POR_GRUPO devolvió el catálogo ACTIVO.'
    );


    -- ========================================================
    -- 5. ACTUALIZAR
    -- ========================================================

    PKG_MB_CATALOGOS.ACTUALIZAR(
        p_catalogo_id         => v_catalogo_id,
        p_nombre              => 'Catalogo Temporal Actualizado',
        p_descripcion         => 'Descripcion actualizada desde test',
        p_aplica_a            => 'PRUEBA_ACTUALIZADA',
        p_naturaleza          => NULL,
        p_requiere_comentario => 'S',
        p_requiere_evidencia  => 'N',
        p_permite_reversion   => 'S'
    );


    PKG_MB_CATALOGOS.OBTENER(
        p_catalogo_id => v_catalogo_id,
        p_resultado   => v_cursor
    );


    FETCH v_cursor
    INTO
        v_id_obtenido,
        v_grupo_obtenido,
        v_codigo_obtenido,
        v_nombre_obtenido,
        v_descripcion,
        v_aplica_a,
        v_naturaleza,
        v_req_comentario,
        v_req_evidencia,
        v_permite_reversion,
        v_estado;


    CLOSE v_cursor;


    IF v_nombre_obtenido <>
       'Catalogo Temporal Actualizado' THEN

        RAISE_APPLICATION_ERROR(
            -20987,
            'ERROR: ACTUALIZAR no modificó el nombre.'
        );

    END IF;


    IF v_req_comentario <> 'S' THEN

        RAISE_APPLICATION_ERROR(
            -20988,
            'ERROR: ACTUALIZAR no modificó requiere_comentario.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - ACTUALIZAR modificó correctamente el catálogo.'
    );


    -- ========================================================
    -- 6. CAMBIAR ESTADO A INACTIVO
    -- ========================================================

    PKG_MB_CATALOGOS.CAMBIAR_ESTADO(
        p_catalogo_id => v_catalogo_id,
        p_estado      => 'INACTIVO'
    );


    PKG_MB_CATALOGOS.OBTENER(
        p_catalogo_id => v_catalogo_id,
        p_resultado   => v_cursor
    );


    FETCH v_cursor
    INTO
        v_id_obtenido,
        v_grupo_obtenido,
        v_codigo_obtenido,
        v_nombre_obtenido,
        v_descripcion,
        v_aplica_a,
        v_naturaleza,
        v_req_comentario,
        v_req_evidencia,
        v_permite_reversion,
        v_estado;


    CLOSE v_cursor;


    IF v_estado <> 'INACTIVO' THEN

        RAISE_APPLICATION_ERROR(
            -20989,
            'ERROR: CAMBIAR_ESTADO no dejó el catálogo INACTIVO.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - CAMBIAR_ESTADO dejó el catálogo INACTIVO.'
    );


    -- ========================================================
    -- 7. LISTAR_POR_GRUPO NO DEBE MOSTRAR INACTIVOS
    -- ========================================================

    v_encontrado_grupo := 0;


    PKG_MB_CATALOGOS.LISTAR_POR_GRUPO(
        p_grupo     => v_grupo_prueba,
        p_resultado => v_cursor
    );


    LOOP

        FETCH v_cursor
        INTO
            v_lp_id,
            v_lp_codigo,
            v_lp_nombre,
            v_lp_descripcion,
            v_lp_naturaleza;


        EXIT WHEN v_cursor%NOTFOUND;


        IF v_lp_id = v_catalogo_id THEN

            v_encontrado_grupo :=
                v_encontrado_grupo + 1;

        END IF;

    END LOOP;


    CLOSE v_cursor;


    IF v_encontrado_grupo <> 0 THEN

        RAISE_APPLICATION_ERROR(
            -20990,
            'ERROR: LISTAR_POR_GRUPO devolvió un catálogo INACTIVO.'
        );

    END IF;


    DBMS_OUTPUT.PUT_LINE(
        'OK - LISTAR_POR_GRUPO excluyó el catálogo INACTIVO.'
    );


    -- ========================================================
    -- 8. REACTIVAR
    -- ========================================================

    PKG_MB_CATALOGOS.CAMBIAR_ESTADO(
        p_catalogo_id => v_catalogo_id,
        p_estado      => 'ACTIVO'
    );


    DBMS_OUTPUT.PUT_LINE(
        'OK - Catálogo temporal reactivado.'
    );


    -- ========================================================
    -- 9. RESISTENCIA: GRUPO + CÓDIGO DUPLICADO
    -- Debe devolver ORA-20031.
    -- ========================================================

    BEGIN

        PKG_MB_CATALOGOS.CREAR(
            p_grupo               => v_grupo_prueba,
            p_codigo              => v_codigo_prueba,
            p_nombre              => 'Catalogo Duplicado',
            p_descripcion         => 'No debe ser creado',
            p_aplica_a            => 'PRUEBA',
            p_naturaleza          => NULL,
            p_requiere_comentario => 'N',
            p_requiere_evidencia  => 'N',
            p_permite_reversion   => 'N',
            p_estado              => 'ACTIVO',
            p_catalogo_id         => v_id_duplicado
        );


        RAISE_APPLICATION_ERROR(
            -20991,
            'ERROR: Se permitió grupo + código duplicado.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20031 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - Duplicado rechazado con ORA-20031.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 10. RESISTENCIA: ESTADO INVÁLIDO
    -- Debe devolver ORA-20033.
    -- ========================================================

    BEGIN

        PKG_MB_CATALOGOS.CAMBIAR_ESTADO(
            p_catalogo_id => v_catalogo_id,
            p_estado      => 'ELIMINADO'
        );


        RAISE_APPLICATION_ERROR(
            -20992,
            'ERROR: Se aceptó un estado inválido.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20033 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - Estado inválido rechazado con ORA-20033.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 11. RESISTENCIA: FLAG INVÁLIDO
    -- Debe devolver ORA-20034.
    -- ========================================================

    BEGIN

        PKG_MB_CATALOGOS.ACTUALIZAR(
            p_catalogo_id         => v_catalogo_id,
            p_nombre              => 'Catalogo Flag Invalido',
            p_descripcion         => 'No debe actualizarse',
            p_aplica_a            => 'PRUEBA',
            p_naturaleza          => NULL,
            p_requiere_comentario => 'X',
            p_requiere_evidencia  => 'N',
            p_permite_reversion   => 'N'
        );


        RAISE_APPLICATION_ERROR(
            -20993,
            'ERROR: Se aceptó un indicador inválido.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20034 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - Flag inválido rechazado con ORA-20034.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 12. RESISTENCIA: NATURALEZA INVÁLIDA
    -- Debe devolver ORA-20035.
    -- ========================================================

    BEGIN

        PKG_MB_CATALOGOS.ACTUALIZAR(
            p_catalogo_id         => v_catalogo_id,
            p_nombre              => 'Catalogo Naturaleza Invalida',
            p_descripcion         => 'No debe actualizarse',
            p_aplica_a            => 'PRUEBA',
            p_naturaleza          => 'X',
            p_requiere_comentario => 'N',
            p_requiere_evidencia  => 'N',
            p_permite_reversion   => 'N'
        );


        RAISE_APPLICATION_ERROR(
            -20994,
            'ERROR: Se aceptó una naturaleza inválida.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20035 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - Naturaleza inválida rechazada con ORA-20035.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 13. RESISTENCIA:
    -- TIPO_MOVIMIENTO SIN NATURALEZA
    -- Debe devolver ORA-20036.
    -- ========================================================

    BEGIN

        PKG_MB_CATALOGOS.CREAR(
            p_grupo               => 'TIPO_MOVIMIENTO',
            p_codigo              => v_codigo_prueba,
            p_nombre              => 'Movimiento Sin Naturaleza',
            p_descripcion         => 'No debe ser creado',
            p_aplica_a            => 'MOVIMIENTO_BANCARIO',
            p_naturaleza          => NULL,
            p_requiere_comentario => 'N',
            p_requiere_evidencia  => 'N',
            p_permite_reversion   => 'N',
            p_estado              => 'ACTIVO',
            p_catalogo_id         => v_id_duplicado
        );


        RAISE_APPLICATION_ERROR(
            -20995,
            'ERROR: Se permitió TIPO_MOVIMIENTO sin naturaleza.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20036 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - TIPO_MOVIMIENTO sin naturaleza rechazado con ORA-20036.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 14. RESISTENCIA: ACTUALIZAR ID INEXISTENTE
    -- Debe devolver ORA-20032.
    -- ========================================================

    BEGIN

        PKG_MB_CATALOGOS.ACTUALIZAR(
            p_catalogo_id         => -999999,
            p_nombre              => 'No Existe',
            p_descripcion         => 'No debe actualizarse',
            p_aplica_a            => 'PRUEBA',
            p_naturaleza          => NULL,
            p_requiere_comentario => 'N',
            p_requiere_evidencia  => 'N',
            p_permite_reversion   => 'N'
        );


        RAISE_APPLICATION_ERROR(
            -20996,
            'ERROR: Se permitió actualizar un catálogo inexistente.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20032 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - ACTUALIZAR inexistente rechazado con ORA-20032.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 15. RESISTENCIA: CAMBIAR ESTADO DE ID INEXISTENTE
    -- Debe devolver ORA-20032.
    -- ========================================================

    BEGIN

        PKG_MB_CATALOGOS.CAMBIAR_ESTADO(
            p_catalogo_id => -999999,
            p_estado      => 'ACTIVO'
        );


        RAISE_APPLICATION_ERROR(
            -20997,
            'ERROR: Se permitió cambiar estado a catálogo inexistente.'
        );


    EXCEPTION

        WHEN OTHERS THEN

            IF SQLCODE = -20032 THEN

                DBMS_OUTPUT.PUT_LINE(
                    'OK - CAMBIAR_ESTADO inexistente rechazado con ORA-20032.'
                );

            ELSE

                RAISE;

            END IF;

    END;


    -- ========================================================
    -- 16. LIMPIEZA
    -- ========================================================

    ROLLBACK TO inicio_test_pkg_mb_catalogos;


    DBMS_OUTPUT.PUT_LINE(
        'OK - ROLLBACK realizado.'
    );

    DBMS_OUTPUT.PUT_LINE(
        'OK - No se dejaron catálogos de prueba almacenados.'
    );

    DBMS_OUTPUT.PUT_LINE(
        'FIN TEST PKG_MB_CATALOGOS'
    );

    DBMS_OUTPUT.PUT_LINE(
        '============================================================'
    );


EXCEPTION

    WHEN OTHERS THEN

        BEGIN

            IF v_cursor%ISOPEN THEN
                CLOSE v_cursor;
            END IF;

        EXCEPTION

            WHEN INVALID_CURSOR THEN
                NULL;

        END;


        ROLLBACK TO inicio_test_pkg_mb_catalogos;


        DBMS_OUTPUT.PUT_LINE(
            'ERROR EN TEST PKG_MB_CATALOGOS: ' ||
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
FROM MB_CATALOGO_BANCARIO
WHERE catalogo_id = :v_test_catalogo_id;