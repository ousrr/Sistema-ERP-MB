-- Persona 4 - PACKAGE: PKG_MB_CHEQUERAS
-- Extraído del esquema ERP_BANCOS exportado el 2026-09-11.

CREATE OR REPLACE EDITIONABLE PACKAGE "PKG_MB_CHEQUERAS" AS

    PROCEDURE LISTAR(
        p_resultado OUT SYS_REFCURSOR
    );

    PROCEDURE LISTAR_POR_CUENTA(
        p_cuenta_id IN NUMBER,
        p_resultado OUT SYS_REFCURSOR
    );

    PROCEDURE OBTENER(
        p_chequera_id IN NUMBER,
        p_resultado OUT SYS_REFCURSOR
    );

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
    );

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
    );

    PROCEDURE CAMBIAR_ESTADO(
        p_chequera_id IN NUMBER,
        p_estado IN VARCHAR2
    );

    -- DELETE lógico
    PROCEDURE DESACTIVAR(
        p_chequera_id IN NUMBER
    );

END PKG_MB_CHEQUERAS;

/
