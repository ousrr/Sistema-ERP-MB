-- Persona 4 - PACKAGE BODY: PKG_MB_PLANTILLAS_CHEQUE
-- Extraído del esquema ERP_BANCOS exportado el 2026-09-11.

CREATE OR REPLACE EDITIONABLE PACKAGE BODY "PKG_MB_PLANTILLAS_CHEQUE" AS

    ------------------------------------------------------------------
    -- VALIDAR QUE EL BANCO EXISTA
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_BANCO(
        p_banco_id       IN NUMBER,
        p_requiere_activo IN BOOLEAN DEFAULT TRUE
    ) IS
        v_estado MB_BANCO.estado%TYPE;
    BEGIN

        SELECT estado
        INTO v_estado
        FROM MB_BANCO
        WHERE banco_id = p_banco_id;

        IF p_requiere_activo
           AND v_estado <> 'ACTIVO' THEN

            RAISE_APPLICATION_ERROR(
                -20101,
                'El banco debe estar ACTIVO.'
            );

        END IF;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(
                -20102,
                'El banco indicado no existe.'
            );

    END VALIDAR_BANCO;


    ------------------------------------------------------------------
    -- VALIDAR TIPO DE CUENTA
    -- Es opcional, pero si viene informado debe existir y pertenecer
    -- al grupo TIPO_CUENTA.
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_TIPO_CUENTA(
        p_tipo_cuenta_id IN NUMBER
    ) IS
        v_total NUMBER;
    BEGIN

        IF p_tipo_cuenta_id IS NULL THEN
            RETURN;
        END IF;

        SELECT COUNT(*)
        INTO v_total
        FROM MB_CATALOGO_BANCARIO
        WHERE catalogo_id = p_tipo_cuenta_id
          AND grupo = 'TIPO_CUENTA';

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20103,
                'El tipo de cuenta indicado no existe o no pertenece al grupo TIPO_CUENTA.'
            );

        END IF;

    END VALIDAR_TIPO_CUENTA;


    ------------------------------------------------------------------
    -- VALIDAR DOCUMENTO DE FONDO
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_ARCHIVO_FONDO(
        p_archivo_fondo_id IN NUMBER
    ) IS
        v_total NUMBER;
    BEGIN

        IF p_archivo_fondo_id IS NULL THEN
            RETURN;
        END IF;

        SELECT COUNT(*)
        INTO v_total
        FROM MB_DOCUMENTO_BANCARIO
        WHERE documento_id = p_archivo_fondo_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20104,
                'El archivo de fondo indicado no existe.'
            );

        END IF;

    END VALIDAR_ARCHIVO_FONDO;


    ------------------------------------------------------------------
    -- VALIDAR ORIENTACIÓN
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_ORIENTACION(
        p_orientacion IN VARCHAR2
    ) IS
        v_orientacion VARCHAR2(15);
    BEGIN

        v_orientacion := UPPER(TRIM(p_orientacion));

        IF v_orientacion IS NULL
           OR v_orientacion NOT IN (
                'HORIZONTAL',
                'VERTICAL'
           ) THEN

            RAISE_APPLICATION_ERROR(
                -20105,
                'La orientación debe ser HORIZONTAL o VERTICAL.'
            );

        END IF;

    END VALIDAR_ORIENTACION;


    ------------------------------------------------------------------
    -- VALIDAR ESTADO DE PLANTILLA
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_ESTADO_PLANTILLA(
        p_estado IN VARCHAR2
    ) IS
        v_estado VARCHAR2(15);
    BEGIN

        v_estado := UPPER(TRIM(p_estado));

        IF v_estado IS NULL
           OR v_estado NOT IN (
                'ACTIVA',
                'INACTIVA'
           ) THEN

            RAISE_APPLICATION_ERROR(
                -20106,
                'El estado de la plantilla debe ser ACTIVA o INACTIVA.'
            );

        END IF;

    END VALIDAR_ESTADO_PLANTILLA;


    ------------------------------------------------------------------
    -- VALIDAR DATOS GENERALES DE LA PLANTILLA
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_DATOS_PLANTILLA(
        p_nombre              IN VARCHAR2,
        p_tamano_papel        IN VARCHAR2,
        p_margen_superior_mm  IN NUMBER,
        p_margen_inferior_mm  IN NUMBER,
        p_margen_izquierdo_mm IN NUMBER,
        p_margen_derecho_mm   IN NUMBER
    ) IS
    BEGIN

        IF TRIM(p_nombre) IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20107,
                'El nombre de la plantilla es obligatorio.'
            );

        END IF;

        IF TRIM(p_tamano_papel) IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20108,
                'El tamaño de papel es obligatorio.'
            );

        END IF;

        IF p_margen_superior_mm IS NULL
           OR p_margen_inferior_mm IS NULL
           OR p_margen_izquierdo_mm IS NULL
           OR p_margen_derecho_mm IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20109,
                'Todos los márgenes son obligatorios.'
            );

        END IF;

        IF p_margen_superior_mm < 0
           OR p_margen_inferior_mm < 0
           OR p_margen_izquierdo_mm < 0
           OR p_margen_derecho_mm < 0 THEN

            RAISE_APPLICATION_ERROR(
                -20110,
                'Los márgenes no pueden ser negativos.'
            );

        END IF;

    END VALIDAR_DATOS_PLANTILLA;


    ------------------------------------------------------------------
    -- VALIDAR CÓDIGO DE CAMPO
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_CODIGO_CAMPO(
        p_codigo_campo IN VARCHAR2
    ) IS
        v_codigo VARCHAR2(30);
    BEGIN

        v_codigo := UPPER(TRIM(p_codigo_campo));

        IF v_codigo IS NULL
           OR v_codigo NOT IN (
                'FECHA',
                'BENEFICIARIO',
                'MONTO_NUM',
                'MONTO_LETRAS',
                'CONCEPTO'
           ) THEN

            RAISE_APPLICATION_ERROR(
                -20111,
                'Código de campo de cheque no válido.'
            );

        END IF;

    END VALIDAR_CODIGO_CAMPO;


    ------------------------------------------------------------------
    -- VALIDAR ALINEACIÓN
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_ALINEACION(
        p_alineacion IN VARCHAR2
    ) IS
        v_alineacion VARCHAR2(15);
    BEGIN

        v_alineacion := UPPER(TRIM(p_alineacion));

        IF v_alineacion IS NULL
           OR v_alineacion NOT IN (
                'IZQUIERDA',
                'CENTRO',
                'DERECHA'
           ) THEN

            RAISE_APPLICATION_ERROR(
                -20112,
                'La alineación debe ser IZQUIERDA, CENTRO o DERECHA.'
            );

        END IF;

    END VALIDAR_ALINEACION;


    ------------------------------------------------------------------
    -- VALIDAR ESTADO DE CAMPO
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_ESTADO_CAMPO(
        p_estado IN VARCHAR2
    ) IS
        v_estado VARCHAR2(15);
    BEGIN

        v_estado := UPPER(TRIM(p_estado));

        IF v_estado IS NULL
           OR v_estado NOT IN (
                'ACTIVO',
                'INACTIVO'
           ) THEN

            RAISE_APPLICATION_ERROR(
                -20113,
                'El estado del campo debe ser ACTIVO o INACTIVO.'
            );

        END IF;

    END VALIDAR_ESTADO_CAMPO;


    ------------------------------------------------------------------
    -- VALIDAR MEDIDAS DEL CAMPO
    ------------------------------------------------------------------
    PROCEDURE VALIDAR_MEDIDAS_CAMPO(
        p_posicion_x_mm IN NUMBER,
        p_posicion_y_mm IN NUMBER,
        p_ancho_mm      IN NUMBER,
        p_alto_mm       IN NUMBER,
        p_tamano_fuente IN NUMBER
    ) IS
    BEGIN

        IF p_posicion_x_mm IS NULL
           OR p_posicion_y_mm IS NULL
           OR p_ancho_mm IS NULL
           OR p_alto_mm IS NULL
           OR p_tamano_fuente IS NULL THEN

            RAISE_APPLICATION_ERROR(
                -20114,
                'Las posiciones, dimensiones y tamaño de fuente son obligatorios.'
            );

        END IF;

        IF p_posicion_x_mm < 0
           OR p_posicion_y_mm < 0
           OR p_ancho_mm <= 0
           OR p_alto_mm <= 0
           OR p_tamano_fuente <= 0 THEN

            RAISE_APPLICATION_ERROR(
                -20115,
                'Las posiciones no pueden ser negativas y las dimensiones deben ser mayores que cero.'
            );

        END IF;

    END VALIDAR_MEDIDAS_CAMPO;


    ------------------------------------------------------------------
    -- LISTAR
    ------------------------------------------------------------------
    PROCEDURE LISTAR(
        p_resultado OUT SYS_REFCURSOR
    ) IS
    BEGIN

        OPEN p_resultado FOR

            SELECT
                pc.plantilla_id,
                pc.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,

                pc.tipo_cuenta_id,
                cb.codigo AS tipo_cuenta_codigo,
                cb.nombre AS tipo_cuenta_nombre,

                pc.nombre,
                pc.tamano_papel,
                pc.orientacion,
                pc.margen_superior_mm,
                pc.margen_inferior_mm,
                pc.margen_izquierdo_mm,
                pc.margen_derecho_mm,
                pc.archivo_fondo_id,
                pc.estado

            FROM MB_PLANTILLA_CHEQUE pc

            JOIN MB_BANCO b
              ON b.banco_id = pc.banco_id

            LEFT JOIN MB_CATALOGO_BANCARIO cb
              ON cb.catalogo_id = pc.tipo_cuenta_id

            ORDER BY
                b.nombre,
                pc.nombre;

    END LISTAR;


    ------------------------------------------------------------------
    -- LISTAR POR BANCO
    ------------------------------------------------------------------
    PROCEDURE LISTAR_POR_BANCO(
        p_banco_id  IN NUMBER,
        p_resultado OUT SYS_REFCURSOR
    ) IS
    BEGIN

        VALIDAR_BANCO(
            p_banco_id       => p_banco_id,
            p_requiere_activo => FALSE
        );

        OPEN p_resultado FOR

            SELECT
                pc.plantilla_id,
                pc.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,

                pc.tipo_cuenta_id,
                cb.codigo AS tipo_cuenta_codigo,
                cb.nombre AS tipo_cuenta_nombre,

                pc.nombre,
                pc.tamano_papel,
                pc.orientacion,
                pc.margen_superior_mm,
                pc.margen_inferior_mm,
                pc.margen_izquierdo_mm,
                pc.margen_derecho_mm,
                pc.archivo_fondo_id,
                pc.estado

            FROM MB_PLANTILLA_CHEQUE pc

            JOIN MB_BANCO b
              ON b.banco_id = pc.banco_id

            LEFT JOIN MB_CATALOGO_BANCARIO cb
              ON cb.catalogo_id = pc.tipo_cuenta_id

            WHERE pc.banco_id = p_banco_id

            ORDER BY pc.nombre;

    END LISTAR_POR_BANCO;


    ------------------------------------------------------------------
    -- OBTENER
    ------------------------------------------------------------------
    PROCEDURE OBTENER(
        p_plantilla_id IN NUMBER,
        p_resultado    OUT SYS_REFCURSOR
    ) IS
        v_total NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CHEQUE
        WHERE plantilla_id = p_plantilla_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20116,
                'La plantilla indicada no existe.'
            );

        END IF;

        OPEN p_resultado FOR

            SELECT
                pc.plantilla_id,
                pc.banco_id,
                b.codigo_banco,
                b.nombre AS banco_nombre,

                pc.tipo_cuenta_id,
                cb.codigo AS tipo_cuenta_codigo,
                cb.nombre AS tipo_cuenta_nombre,

                pc.nombre,
                pc.tamano_papel,
                pc.orientacion,
                pc.margen_superior_mm,
                pc.margen_inferior_mm,
                pc.margen_izquierdo_mm,
                pc.margen_derecho_mm,
                pc.archivo_fondo_id,
                pc.estado

            FROM MB_PLANTILLA_CHEQUE pc

            JOIN MB_BANCO b
              ON b.banco_id = pc.banco_id

            LEFT JOIN MB_CATALOGO_BANCARIO cb
              ON cb.catalogo_id = pc.tipo_cuenta_id

            WHERE pc.plantilla_id = p_plantilla_id;

    END OBTENER;


    ------------------------------------------------------------------
    -- CREAR
    ------------------------------------------------------------------
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
    ) IS
        v_total NUMBER;
    BEGIN

        VALIDAR_BANCO(
            p_banco_id
        );

        VALIDAR_TIPO_CUENTA(
            p_tipo_cuenta_id
        );

        VALIDAR_ARCHIVO_FONDO(
            p_archivo_fondo_id
        );

        VALIDAR_ORIENTACION(
            p_orientacion
        );

        VALIDAR_ESTADO_PLANTILLA(
            p_estado
        );

        VALIDAR_DATOS_PLANTILLA(
            p_nombre,
            p_tamano_papel,
            p_margen_superior_mm,
            p_margen_inferior_mm,
            p_margen_izquierdo_mm,
            p_margen_derecho_mm
        );

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CHEQUE
        WHERE banco_id = p_banco_id
          AND UPPER(TRIM(nombre)) = UPPER(TRIM(p_nombre));

        IF v_total > 0 THEN

            RAISE_APPLICATION_ERROR(
                -20117,
                'Ya existe una plantilla con ese nombre para el banco seleccionado.'
            );

        END IF;

        SELECT SEQ_MB_PLANTILLA_CHEQUE.NEXTVAL
        INTO p_plantilla_id
        FROM DUAL;

        INSERT INTO MB_PLANTILLA_CHEQUE(
            plantilla_id,
            banco_id,
            tipo_cuenta_id,
            nombre,
            tamano_papel,
            orientacion,
            margen_superior_mm,
            margen_inferior_mm,
            margen_izquierdo_mm,
            margen_derecho_mm,
            archivo_fondo_id,
            estado
        )
        VALUES(
            p_plantilla_id,
            p_banco_id,
            p_tipo_cuenta_id,
            TRIM(p_nombre),
            UPPER(TRIM(p_tamano_papel)),
            UPPER(TRIM(p_orientacion)),
            p_margen_superior_mm,
            p_margen_inferior_mm,
            p_margen_izquierdo_mm,
            p_margen_derecho_mm,
            p_archivo_fondo_id,
            UPPER(TRIM(p_estado))
        );

    END CREAR;


    ------------------------------------------------------------------
    -- ACTUALIZAR
    ------------------------------------------------------------------
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
    ) IS
        v_total NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CHEQUE
        WHERE plantilla_id = p_plantilla_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20118,
                'La plantilla indicada no existe.'
            );

        END IF;

        VALIDAR_BANCO(
            p_banco_id
        );

        VALIDAR_TIPO_CUENTA(
            p_tipo_cuenta_id
        );

        VALIDAR_ARCHIVO_FONDO(
            p_archivo_fondo_id
        );

        VALIDAR_ORIENTACION(
            p_orientacion
        );

        VALIDAR_DATOS_PLANTILLA(
            p_nombre,
            p_tamano_papel,
            p_margen_superior_mm,
            p_margen_inferior_mm,
            p_margen_izquierdo_mm,
            p_margen_derecho_mm
        );

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CHEQUE
        WHERE banco_id = p_banco_id
          AND UPPER(TRIM(nombre)) = UPPER(TRIM(p_nombre))
          AND plantilla_id <> p_plantilla_id;

        IF v_total > 0 THEN

            RAISE_APPLICATION_ERROR(
                -20119,
                'Ya existe otra plantilla con ese nombre para el banco seleccionado.'
            );

        END IF;

        UPDATE MB_PLANTILLA_CHEQUE
        SET
            banco_id            = p_banco_id,
            tipo_cuenta_id      = p_tipo_cuenta_id,
            nombre              = TRIM(p_nombre),
            tamano_papel        = UPPER(TRIM(p_tamano_papel)),
            orientacion         = UPPER(TRIM(p_orientacion)),
            margen_superior_mm  = p_margen_superior_mm,
            margen_inferior_mm  = p_margen_inferior_mm,
            margen_izquierdo_mm = p_margen_izquierdo_mm,
            margen_derecho_mm   = p_margen_derecho_mm,
            archivo_fondo_id    = p_archivo_fondo_id

        WHERE plantilla_id = p_plantilla_id;

    END ACTUALIZAR;


    ------------------------------------------------------------------
    -- CAMBIAR ESTADO
    ------------------------------------------------------------------
    PROCEDURE CAMBIAR_ESTADO(
        p_plantilla_id IN NUMBER,
        p_estado       IN VARCHAR2
    ) IS
        v_total    NUMBER;
        v_banco_id NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CHEQUE
        WHERE plantilla_id = p_plantilla_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20120,
                'La plantilla indicada no existe.'
            );

        END IF;

        VALIDAR_ESTADO_PLANTILLA(
            p_estado
        );

        IF UPPER(TRIM(p_estado)) = 'ACTIVA' THEN

            SELECT banco_id
            INTO v_banco_id
            FROM MB_PLANTILLA_CHEQUE
            WHERE plantilla_id = p_plantilla_id;

            VALIDAR_BANCO(
                v_banco_id
            );

        END IF;

        UPDATE MB_PLANTILLA_CHEQUE
        SET estado = UPPER(TRIM(p_estado))
        WHERE plantilla_id = p_plantilla_id;

    END CAMBIAR_ESTADO;


    ------------------------------------------------------------------
    -- DELETE LÓGICO DE PLANTILLA
    ------------------------------------------------------------------
    PROCEDURE DESACTIVAR(
        p_plantilla_id IN NUMBER
    ) IS
    BEGIN

        CAMBIAR_ESTADO(
            p_plantilla_id => p_plantilla_id,
            p_estado       => 'INACTIVA'
        );

    END DESACTIVAR;


    ------------------------------------------------------------------
    -- LISTAR CAMPOS
    ------------------------------------------------------------------
    PROCEDURE LISTAR_CAMPOS(
        p_plantilla_id IN NUMBER,
        p_resultado    OUT SYS_REFCURSOR
    ) IS
        v_total NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CHEQUE
        WHERE plantilla_id = p_plantilla_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20121,
                'La plantilla indicada no existe.'
            );

        END IF;

        OPEN p_resultado FOR

            SELECT
                campo_plantilla_id,
                plantilla_id,
                codigo_campo,
                posicion_x_mm,
                posicion_y_mm,
                ancho_mm,
                alto_mm,
                tamano_fuente,
                alineacion,
                estado

            FROM MB_PLANTILLA_CAMPO_CHEQUE

            WHERE plantilla_id = p_plantilla_id

            ORDER BY
                codigo_campo;

    END LISTAR_CAMPOS;


    ------------------------------------------------------------------
    -- CREAR CAMPO
    ------------------------------------------------------------------
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
    ) IS
        v_total NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CHEQUE
        WHERE plantilla_id = p_plantilla_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20122,
                'La plantilla indicada no existe.'
            );

        END IF;

        VALIDAR_CODIGO_CAMPO(
            p_codigo_campo
        );

        VALIDAR_ALINEACION(
            p_alineacion
        );

        VALIDAR_ESTADO_CAMPO(
            p_estado
        );

        VALIDAR_MEDIDAS_CAMPO(
            p_posicion_x_mm,
            p_posicion_y_mm,
            p_ancho_mm,
            p_alto_mm,
            p_tamano_fuente
        );

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CAMPO_CHEQUE
        WHERE plantilla_id = p_plantilla_id
          AND codigo_campo = UPPER(TRIM(p_codigo_campo));

        IF v_total > 0 THEN

            RAISE_APPLICATION_ERROR(
                -20123,
                'Ese campo ya está definido para la plantilla.'
            );

        END IF;

        SELECT SEQ_MB_PLANTILLA_CAMPO_CHEQUE.NEXTVAL
        INTO p_campo_plantilla_id
        FROM DUAL;

        INSERT INTO MB_PLANTILLA_CAMPO_CHEQUE(
            campo_plantilla_id,
            plantilla_id,
            codigo_campo,
            posicion_x_mm,
            posicion_y_mm,
            ancho_mm,
            alto_mm,
            tamano_fuente,
            alineacion,
            estado
        )
        VALUES(
            p_campo_plantilla_id,
            p_plantilla_id,
            UPPER(TRIM(p_codigo_campo)),
            p_posicion_x_mm,
            p_posicion_y_mm,
            p_ancho_mm,
            p_alto_mm,
            p_tamano_fuente,
            UPPER(TRIM(p_alineacion)),
            UPPER(TRIM(p_estado))
        );

    END CREAR_CAMPO;


    ------------------------------------------------------------------
    -- ACTUALIZAR CAMPO
    ------------------------------------------------------------------
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
    ) IS
        v_total        NUMBER;
        v_plantilla_id NUMBER;
    BEGIN

        BEGIN

            SELECT plantilla_id
            INTO v_plantilla_id
            FROM MB_PLANTILLA_CAMPO_CHEQUE
            WHERE campo_plantilla_id = p_campo_plantilla_id;

        EXCEPTION
            WHEN NO_DATA_FOUND THEN

                RAISE_APPLICATION_ERROR(
                    -20124,
                    'El campo de plantilla indicado no existe.'
                );

        END;

        VALIDAR_CODIGO_CAMPO(
            p_codigo_campo
        );

        VALIDAR_ALINEACION(
            p_alineacion
        );

        VALIDAR_ESTADO_CAMPO(
            p_estado
        );

        VALIDAR_MEDIDAS_CAMPO(
            p_posicion_x_mm,
            p_posicion_y_mm,
            p_ancho_mm,
            p_alto_mm,
            p_tamano_fuente
        );

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CAMPO_CHEQUE
        WHERE plantilla_id = v_plantilla_id
          AND codigo_campo = UPPER(TRIM(p_codigo_campo))
          AND campo_plantilla_id <> p_campo_plantilla_id;

        IF v_total > 0 THEN

            RAISE_APPLICATION_ERROR(
                -20125,
                'Ya existe otro campo con ese código en la plantilla.'
            );

        END IF;

        UPDATE MB_PLANTILLA_CAMPO_CHEQUE
        SET
            codigo_campo  = UPPER(TRIM(p_codigo_campo)),
            posicion_x_mm = p_posicion_x_mm,
            posicion_y_mm = p_posicion_y_mm,
            ancho_mm      = p_ancho_mm,
            alto_mm       = p_alto_mm,
            tamano_fuente = p_tamano_fuente,
            alineacion    = UPPER(TRIM(p_alineacion)),
            estado        = UPPER(TRIM(p_estado))

        WHERE campo_plantilla_id = p_campo_plantilla_id;

    END ACTUALIZAR_CAMPO;


    ------------------------------------------------------------------
    -- DELETE LÓGICO DEL CAMPO
    ------------------------------------------------------------------
    PROCEDURE ELIMINAR_CAMPO(
        p_campo_plantilla_id IN NUMBER
    ) IS
        v_total NUMBER;
    BEGIN

        SELECT COUNT(*)
        INTO v_total
        FROM MB_PLANTILLA_CAMPO_CHEQUE
        WHERE campo_plantilla_id = p_campo_plantilla_id;

        IF v_total = 0 THEN

            RAISE_APPLICATION_ERROR(
                -20126,
                'El campo de plantilla indicado no existe.'
            );

        END IF;

        UPDATE MB_PLANTILLA_CAMPO_CHEQUE
        SET estado = 'INACTIVO'
        WHERE campo_plantilla_id = p_campo_plantilla_id;

    END ELIMINAR_CAMPO;


END PKG_MB_PLANTILLAS_CHEQUE;

/
