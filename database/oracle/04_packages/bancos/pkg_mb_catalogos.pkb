-- ============================================================
-- MODULO DE BANCOS
-- PACKAGE BODY: PKG_MB_CATALOGOS
--
-- Responsabilidad:
-- Implementar las operaciones de MB_CATALOGO_BANCARIO.
--
-- Reglas implementadas:
-- - catalogo_id se genera mediante MB_SEQ_CATALOGO_BANCARIO.
-- - grupo + codigo no pueden duplicarse.
-- - Los indicadores solo permiten S o N.
-- - naturaleza solo permite D, C o NULL.
-- - TIPO_MOVIMIENTO requiere naturaleza D o C.
-- - Solo se permiten estados ACTIVO e INACTIVO.
-- - El estado no puede ser NULL.
-- - ACTUALIZAR requiere que el catálogo exista.
-- - CAMBIAR_ESTADO requiere que el catálogo exista.
-- - No se realiza COMMIT ni ROLLBACK dentro del Package.
-- ============================================================

CREATE OR REPLACE PACKAGE BODY PKG_MB_CATALOGOS AS


    -- ========================================================
    -- VALIDAR FLAGS
    --
    -- Valida los indicadores reutilizados por
    -- CREAR y ACTUALIZAR.
    -- ========================================================

    PROCEDURE VALIDAR_FLAGS(
        p_requiere_comentario IN CHAR,
        p_requiere_evidencia  IN CHAR,
        p_permite_reversion   IN CHAR
    ) AS
    BEGIN

        IF NVL(p_requiere_comentario, '?') NOT IN ('S', 'N')
           OR NVL(p_requiere_evidencia, '?') NOT IN ('S', 'N')
           OR NVL(p_permite_reversion, '?') NOT IN ('S', 'N') THEN

            RAISE_APPLICATION_ERROR(
                -20034,
                'Los indicadores deben contener únicamente S o N.'
            );

        END IF;

    END VALIDAR_FLAGS;


    -- ========================================================
    -- VALIDAR NATURALEZA
    --
    -- Reglas:
    -- - Solo se permiten D, C o NULL.
    -- - TIPO_MOVIMIENTO requiere naturaleza obligatoriamente.
    -- ========================================================

    PROCEDURE VALIDAR_NATURALEZA(
        p_grupo      IN VARCHAR2,
        p_naturaleza IN CHAR
    ) AS
    BEGIN

        IF p_naturaleza IS NOT NULL
           AND p_naturaleza NOT IN ('D', 'C') THEN

            RAISE_APPLICATION_ERROR(
                -20035,
                'La naturaleza debe ser D, C o estar vacía.'
            );

        END IF;


        IF p_grupo = 'TIPO_MOVIMIENTO'
           AND p_naturaleza IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20036,
                'Los catálogos de tipo movimiento requieren una naturaleza D o C.'
            );

        END IF;

    END VALIDAR_NATURALEZA;


    -- ========================================================
    -- VALIDAR ESTADO
    --
    -- Reglas:
    -- - El estado es obligatorio.
    -- - Solo se permiten ACTIVO e INACTIVO.
    -- ========================================================

    PROCEDURE VALIDAR_ESTADO(
        p_estado IN VARCHAR2
    ) AS
    BEGIN

        IF p_estado IS NULL
           OR p_estado NOT IN ('ACTIVO', 'INACTIVO') THEN

            RAISE_APPLICATION_ERROR(
                -20033,
                'El estado indicado no es válido.'
            );

        END IF;

    END VALIDAR_ESTADO;


    -- ========================================================
    -- LISTAR
    -- ========================================================

    PROCEDURE LISTAR(
        p_resultado OUT SYS_REFCURSOR
    ) AS
    BEGIN

        OPEN p_resultado FOR
            SELECT
                catalogo_id,
                grupo,
                codigo,
                nombre,
                descripcion,
                aplica_a,
                naturaleza,
                requiere_comentario,
                requiere_evidencia,
                permite_reversion,
                estado
            FROM MB_CATALOGO_BANCARIO
            ORDER BY grupo, codigo;

    END LISTAR;


    -- ========================================================
    -- OBTENER
    -- ========================================================

    PROCEDURE OBTENER(
        p_catalogo_id IN NUMBER,
        p_resultado   OUT SYS_REFCURSOR
    ) AS
    BEGIN

        OPEN p_resultado FOR
            SELECT
                catalogo_id,
                grupo,
                codigo,
                nombre,
                descripcion,
                aplica_a,
                naturaleza,
                requiere_comentario,
                requiere_evidencia,
                permite_reversion,
                estado
            FROM MB_CATALOGO_BANCARIO
            WHERE catalogo_id = p_catalogo_id;

    END OBTENER;


    -- ========================================================
    -- LISTAR POR GRUPO
    --
    -- Devuelve únicamente registros ACTIVO.
    -- ========================================================

    PROCEDURE LISTAR_POR_GRUPO(
        p_grupo     IN VARCHAR2,
        p_resultado OUT SYS_REFCURSOR
    ) AS
    BEGIN

        OPEN p_resultado FOR
            SELECT
                catalogo_id,
                codigo,
                nombre,
                descripcion,
                naturaleza
            FROM MB_CATALOGO_BANCARIO
            WHERE grupo = p_grupo
              AND estado = 'ACTIVO'
            ORDER BY nombre;

    END LISTAR_POR_GRUPO;


    -- ========================================================
    -- CREAR
    --
    -- Reglas:
    -- - El ID se genera dentro de Oracle.
    -- - No se recibe catalogo_id desde frontend ni backend.
    -- - Se validan flags, naturaleza y estado.
    -- - grupo + codigo no pueden duplicarse.
    -- ========================================================

    PROCEDURE CREAR(
        p_grupo                 IN VARCHAR2,
        p_codigo                IN VARCHAR2,
        p_nombre                IN VARCHAR2,
        p_descripcion           IN VARCHAR2,
        p_aplica_a              IN VARCHAR2,
        p_naturaleza            IN CHAR,
        p_requiere_comentario   IN CHAR,
        p_requiere_evidencia    IN CHAR,
        p_permite_reversion     IN CHAR,
        p_estado                IN VARCHAR2,
        p_catalogo_id           OUT NUMBER
    ) AS
    BEGIN

        VALIDAR_FLAGS(
            p_requiere_comentario,
            p_requiere_evidencia,
            p_permite_reversion
        );


        VALIDAR_NATURALEZA(
            p_grupo,
            p_naturaleza
        );


        VALIDAR_ESTADO(
            p_estado
        );


        p_catalogo_id :=
            MB_SEQ_CATALOGO_BANCARIO.NEXTVAL;


        INSERT INTO MB_CATALOGO_BANCARIO (
            catalogo_id,
            grupo,
            codigo,
            nombre,
            descripcion,
            aplica_a,
            naturaleza,
            requiere_comentario,
            requiere_evidencia,
            permite_reversion,
            estado
        )
        VALUES (
            p_catalogo_id,
            p_grupo,
            p_codigo,
            p_nombre,
            p_descripcion,
            p_aplica_a,
            p_naturaleza,
            p_requiere_comentario,
            p_requiere_evidencia,
            p_permite_reversion,
            p_estado
        );


    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN

            RAISE_APPLICATION_ERROR(
                -20031,
                'Ya existe un catálogo con el grupo y código indicados.'
            );

    END CREAR;


    -- ========================================================
    -- ACTUALIZAR
    --
    -- Reglas:
    -- - El catálogo debe existir.
    -- - grupo, codigo y estado no se modifican.
    -- - Se validan flags y naturaleza.
    -- ========================================================

    PROCEDURE ACTUALIZAR(
        p_catalogo_id           IN NUMBER,
        p_nombre                IN VARCHAR2,
        p_descripcion           IN VARCHAR2,
        p_aplica_a              IN VARCHAR2,
        p_naturaleza            IN CHAR,
        p_requiere_comentario   IN CHAR,
        p_requiere_evidencia    IN CHAR,
        p_permite_reversion     IN CHAR
    ) AS

        v_grupo MB_CATALOGO_BANCARIO.grupo%TYPE;

    BEGIN

        BEGIN

            SELECT grupo
              INTO v_grupo
              FROM MB_CATALOGO_BANCARIO
             WHERE catalogo_id = p_catalogo_id;

        EXCEPTION
            WHEN NO_DATA_FOUND THEN

                RAISE_APPLICATION_ERROR(
                    -20032,
                    'El catálogo indicado no existe.'
                );

        END;


        VALIDAR_FLAGS(
            p_requiere_comentario,
            p_requiere_evidencia,
            p_permite_reversion
        );


        VALIDAR_NATURALEZA(
            v_grupo,
            p_naturaleza
        );


        UPDATE MB_CATALOGO_BANCARIO
           SET nombre               = p_nombre,
               descripcion          = p_descripcion,
               aplica_a             = p_aplica_a,
               naturaleza           = p_naturaleza,
               requiere_comentario  = p_requiere_comentario,
               requiere_evidencia   = p_requiere_evidencia,
               permite_reversion    = p_permite_reversion
         WHERE catalogo_id = p_catalogo_id;


        IF SQL%ROWCOUNT = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20032,
                'El catálogo indicado no existe.'
            );

        END IF;

    END ACTUALIZAR;


    -- ========================================================
    -- CAMBIAR ESTADO
    --
    -- Reglas:
    -- - Solo se permiten ACTIVO e INACTIVO.
    -- - El estado no puede ser NULL.
    -- - El catálogo debe existir.
    -- ========================================================

    PROCEDURE CAMBIAR_ESTADO(
        p_catalogo_id IN NUMBER,
        p_estado      IN VARCHAR2
    ) AS
    BEGIN

        VALIDAR_ESTADO(
            p_estado
        );


        UPDATE MB_CATALOGO_BANCARIO
           SET estado = p_estado
         WHERE catalogo_id = p_catalogo_id;


        IF SQL%ROWCOUNT = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20032,
                'El catálogo indicado no existe.'
            );

        END IF;

    END CAMBIAR_ESTADO;


END PKG_MB_CATALOGOS;
/