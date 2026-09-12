-- ============================================================
-- MODULO DE BANCOS
-- PACKAGE SPECIFICATION: PKG_MB_BANCOS
--
-- Responsabilidad:
-- Definir el contrato publico para las operaciones de MB_BANCO.
--
-- El identificador del banco se genera dentro de Oracle
-- mediante SEQ_MB_BANCO.
--
-- Este Package no administra transacciones.
-- No contiene COMMIT ni ROLLBACK.
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_MB_BANCOS AS

    -- ========================================================
    -- LISTAR TODOS LOS BANCOS
    -- ========================================================

    PROCEDURE LISTAR (
        p_resultado OUT SYS_REFCURSOR
    );

    -- ========================================================
    -- OBTENER BANCO POR ID
    -- ========================================================

    PROCEDURE OBTENER (
        p_banco_id  IN NUMBER,
        p_resultado OUT SYS_REFCURSOR
    );

    -- ========================================================
    -- CREAR BANCO
    -- ========================================================

    PROCEDURE CREAR (
        p_codigo_banco IN VARCHAR2,
        p_nombre       IN VARCHAR2,
        p_bic_swift    IN VARCHAR2,
        p_creado_por   IN NUMBER,
        p_banco_id     OUT NUMBER
    );

    -- ========================================================
    -- ACTUALIZAR BANCO
    -- ========================================================

    PROCEDURE ACTUALIZAR (
        p_banco_id     IN NUMBER,
        p_codigo_banco IN VARCHAR2,
        p_nombre       IN VARCHAR2,
        p_bic_swift    IN VARCHAR2
    );

    -- ========================================================
    -- CAMBIAR ESTADO DEL BANCO
    -- ========================================================

    PROCEDURE CAMBIAR_ESTADO (
        p_banco_id IN NUMBER,
        p_estado   IN VARCHAR2
    );

END PKG_MB_BANCOS;
/