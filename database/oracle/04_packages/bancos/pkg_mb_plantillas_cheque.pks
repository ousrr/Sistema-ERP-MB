-- Persona 4 - PACKAGE: PKG_MB_PLANTILLAS_CHEQUE
-- Extraído del esquema ERP_BANCOS exportado el 2026-09-11.

CREATE OR REPLACE EDITIONABLE PACKAGE "PKG_MB_PLANTILLAS_CHEQUE" AS

    ------------------------------------------------------------
    -- READ
    ------------------------------------------------------------
    PROCEDURE LISTAR(
        p_resultado OUT SYS_REFCURSOR
    );

    PROCEDURE LISTAR_POR_BANCO(
        p_banco_id   IN NUMBER,
        p_resultado  OUT SYS_REFCURSOR
    );

    PROCEDURE OBTENER(
        p_plantilla_id IN NUMBER,
        p_resultado    OUT SYS_REFCURSOR
    );


    ------------------------------------------------------------
    -- CREATE
    ------------------------------------------------------------
    PROCEDURE CREAR(
        p_banco_id             IN NUMBER,
        p_tipo_cuenta_id       IN NUMBER,
        p_nombre               IN VARCHAR2,
        p_tamano_papel         IN VARCHAR2,
        p_orientacion          IN VARCHAR2,
        p_margen_superior_mm   IN NUMBER,
        p_margen_inferior_mm   IN NUMBER,
        p_margen_izquierdo_mm  IN NUMBER,
        p_margen_derecho_mm    IN NUMBER,
        p_archivo_fondo_id     IN NUMBER,
        p_estado               IN VARCHAR2,
        p_plantilla_id         OUT NUMBER
    );


    ------------------------------------------------------------
    -- UPDATE
    ------------------------------------------------------------
    PROCEDURE ACTUALIZAR(
        p_plantilla_id         IN NUMBER,
        p_banco_id             IN NUMBER,
        p_tipo_cuenta_id       IN NUMBER,
        p_nombre               IN VARCHAR2,
        p_tamano_papel         IN VARCHAR2,
        p_orientacion          IN VARCHAR2,
        p_margen_superior_mm   IN NUMBER,
        p_margen_inferior_mm   IN NUMBER,
        p_margen_izquierdo_mm  IN NUMBER,
        p_margen_derecho_mm    IN NUMBER,
        p_archivo_fondo_id     IN NUMBER
    );


    ------------------------------------------------------------
    -- ESTADO
    ------------------------------------------------------------
    PROCEDURE CAMBIAR_ESTADO(
        p_plantilla_id IN NUMBER,
        p_estado       IN VARCHAR2
    );


    ------------------------------------------------------------
    -- DELETE LÓGICO
    ------------------------------------------------------------
    PROCEDURE DESACTIVAR(
        p_plantilla_id IN NUMBER
    );


    ------------------------------------------------------------
    -- CAMPOS DE LA PLANTILLA
    ------------------------------------------------------------
    PROCEDURE LISTAR_CAMPOS(
        p_plantilla_id IN NUMBER,
        p_resultado    OUT SYS_REFCURSOR
    );


    ------------------------------------------------------------
    -- CREATE CAMPO
    ------------------------------------------------------------
    PROCEDURE CREAR_CAMPO(
        p_plantilla_id       IN NUMBER,
        p_codigo_campo       IN VARCHAR2,
        p_posicion_x_mm      IN NUMBER,
        p_posicion_y_mm      IN NUMBER,
        p_ancho_mm           IN NUMBER,
        p_alto_mm            IN NUMBER,
        p_tamano_fuente      IN NUMBER,
        p_alineacion         IN VARCHAR2,
        p_estado             IN VARCHAR2,
        p_campo_plantilla_id OUT NUMBER
    );


    ------------------------------------------------------------
    -- UPDATE CAMPO
    ------------------------------------------------------------
    PROCEDURE ACTUALIZAR_CAMPO(
        p_campo_plantilla_id IN NUMBER,
        p_codigo_campo       IN VARCHAR2,
        p_posicion_x_mm      IN NUMBER,
        p_posicion_y_mm      IN NUMBER,
        p_ancho_mm           IN NUMBER,
        p_alto_mm            IN NUMBER,
        p_tamano_fuente      IN NUMBER,
        p_alineacion         IN VARCHAR2,
        p_estado             IN VARCHAR2
    );


    ------------------------------------------------------------
    -- DELETE LÓGICO DEL CAMPO
    ------------------------------------------------------------
    PROCEDURE ELIMINAR_CAMPO(
        p_campo_plantilla_id IN NUMBER
    );

END PKG_MB_PLANTILLAS_CHEQUE;

/
