-- ============================================================
-- MODULO DE BANCOS
-- PACKAGE SPECIFICATION: PKG_MB_CATALOGOS
--
-- Responsabilidad:
-- Definir el contrato público para las operaciones del
-- catálogo bancario genérico.
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_MB_CATALOGOS AS


    -- ========================================================
    -- LISTAR TODOS LOS CATÁLOGOS
    -- ========================================================

    PROCEDURE LISTAR(
        p_resultado OUT SYS_REFCURSOR
    );


    -- ========================================================
    -- OBTENER CATÁLOGO POR ID
    -- ========================================================

    PROCEDURE OBTENER(
        p_catalogo_id IN NUMBER,
        p_resultado   OUT SYS_REFCURSOR
    );


    -- ========================================================
    -- LISTAR CATÁLOGOS ACTIVOS POR GRUPO
    --
    -- Utilizado por componentes reutilizables como CatalogSelect.
    -- ========================================================

    PROCEDURE LISTAR_POR_GRUPO(
        p_grupo     IN VARCHAR2,
        p_resultado OUT SYS_REFCURSOR
    );


    -- ========================================================
    -- CREAR CATÁLOGO
    --
    -- catalogo_id NO se recibe desde frontend/backend.
    -- Oracle lo genera con MB_SEQ_CATALOGO_BANCARIO.
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
    );


    -- ========================================================
    -- ACTUALIZAR CATÁLOGO
    --
    -- grupo, codigo y estado no se modifican aquí.
    -- El estado se administra mediante CAMBIAR_ESTADO.
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
    );


    -- ========================================================
    -- ACTIVAR / INACTIVAR CATÁLOGO
    -- ========================================================

    PROCEDURE CAMBIAR_ESTADO(
        p_catalogo_id IN NUMBER,
        p_estado      IN VARCHAR2
    );


END PKG_MB_CATALOGOS;
/