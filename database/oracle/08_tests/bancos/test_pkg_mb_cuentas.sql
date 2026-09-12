-- ============================================================
-- PRUEBA INTEGRAL REPRODUCIBLE - PKG_MB_CUENTAS
-- Persona 1 - Cuentas bancarias de empresa y proveedores
-- ============================================================
-- Cubre las 12 operaciones publicas del Package:
--   1. LISTAR_CUENTAS
--   2. LISTAR_CUENTAS_ACTIVAS
--   3. OBTENER_CUENTA
--   4. CREAR_CUENTA
--   5. ACTUALIZAR_CUENTA
--   6. CAMBIAR_ESTADO_CUENTA
--   7. LISTAR_CUENTAS_PROVEEDOR
--   8. LISTAR_CUENTAS_PROV_VERIFICADAS
--   9. OBTENER_CUENTA_PROVEEDOR
--  10. CREAR_CUENTA_PROVEEDOR
--  11. ACTUALIZAR_CUENTA_PROVEEDOR
--  12. CAMBIAR_ESTADO_CUENTA_PROVEEDOR
--
-- REQUISITOS DEL ESQUEMA COMUN:
-- - Al menos una cuenta empresarial existente cuyo banco este ACTIVO.
--   Se usa solo como fuente de empresa/moneda/responsable/usuario reales.
-- - Al menos una cuenta de proveedor existente cuyo banco este ACTIVO.
--   Se usa solo como fuente de proveedor/documentos/moneda reales.
-- - PKG_MB_CUENTAS y sus dos secuencias compilados/creados.
--
-- Este script NO deja datos: usa SAVEPOINT y ROLLBACK.
-- No contiene IDs maestros inventados.
-- ============================================================

SET SERVEROUTPUT ON;

DECLARE
    v_cursor SYS_REFCURSOR;

    -- Plantilla real para cuenta empresarial.
    v_empresa_id       MB_CUENTA_BANCARIA.empresa_id%TYPE;
    v_banco_id         MB_CUENTA_BANCARIA.banco_id%TYPE;
    v_moneda_id        MB_CUENTA_BANCARIA.moneda_id%TYPE;
    v_tipo_cuenta_id   MB_CUENTA_BANCARIA.tipo_cuenta_id%TYPE;
    v_responsable_id   MB_CUENTA_BANCARIA.responsable_id%TYPE;
    v_usuario_id       MB_CUENTA_BANCARIA.creado_por%TYPE;

    -- Valores de la cuenta empresarial creada durante la prueba.
    v_cuenta_id        MB_CUENTA_BANCARIA.cuenta_id%TYPE;
    v_codigo_cuenta    MB_CUENTA_BANCARIA.codigo_cuenta%TYPE;
    v_numero_cuenta    MB_CUENTA_BANCARIA.numero_cuenta%TYPE;

    -- Plantilla real para cuenta de proveedor.
    v_proveedor_id            MB_CUENTA_BANCARIA_PROVEEDOR.proveedor_id%TYPE;
    v_banco_prov_id           MB_CUENTA_BANCARIA_PROVEEDOR.banco_id%TYPE;
    v_tipo_cuenta_prov_id     MB_CUENTA_BANCARIA_PROVEEDOR.tipo_cuenta_id%TYPE;
    v_moneda_prov_id          MB_CUENTA_BANCARIA_PROVEEDOR.moneda_id%TYPE;
    v_carta_doc_id            MB_CUENTA_BANCARIA_PROVEEDOR.carta_solicitud_doc_id%TYPE;
    v_constancia_doc_id       MB_CUENTA_BANCARIA_PROVEEDOR.constancia_banco_doc_id%TYPE;
    v_representante_doc_id    MB_CUENTA_BANCARIA_PROVEEDOR.representante_doc_id%TYPE;
    v_solicitado_por          MB_CUENTA_BANCARIA_PROVEEDOR.solicitado_por%TYPE;

    -- Valores de la cuenta de proveedor creada durante la prueba.
    v_cta_proveedor_id MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE;
    v_numero_proveedor MB_CUENTA_BANCARIA_PROVEEDOR.numero_cuenta%TYPE;

    PROCEDURE cerrar_cursor IS
    BEGIN
        IF v_cursor%ISOPEN THEN
            CLOSE v_cursor;
        END IF;
    EXCEPTION
        WHEN INVALID_CURSOR THEN
            NULL;
    END cerrar_cursor;

    PROCEDURE ok(p_mensaje VARCHAR2) IS
    BEGIN
        DBMS_OUTPUT.PUT_LINE('[OK] ' || p_mensaje);
    END ok;

BEGIN
    SAVEPOINT inicio_prueba_pkg_mb_cuentas;

    ------------------------------------------------------------------
    -- 0. Cargar referencias REALES del esquema integrado.
    ------------------------------------------------------------------
    BEGIN
        SELECT
            c.empresa_id,
            c.banco_id,
            c.moneda_id,
            c.tipo_cuenta_id,
            c.responsable_id,
            c.creado_por
        INTO
            v_empresa_id,
            v_banco_id,
            v_moneda_id,
            v_tipo_cuenta_id,
            v_responsable_id,
            v_usuario_id
        FROM MB_CUENTA_BANCARIA c
        INNER JOIN MB_BANCO b
            ON b.banco_id = c.banco_id
           AND b.estado = 'ACTIVO'
        INNER JOIN MB_CATALOGO_BANCARIO tc
            ON tc.catalogo_id = c.tipo_cuenta_id
           AND tc.grupo = 'TIPO_CUENTA'
        WHERE ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(
                -20991,
                'Prerequisito faltante: se necesita al menos una cuenta empresarial existente con banco ACTIVO para tomar referencias maestras reales.'
            );
    END;

    BEGIN
        SELECT
            cp.proveedor_id,
            cp.banco_id,
            cp.tipo_cuenta_id,
            cp.moneda_id,
            cp.carta_solicitud_doc_id,
            cp.constancia_banco_doc_id,
            cp.representante_doc_id,
            cp.solicitado_por
        INTO
            v_proveedor_id,
            v_banco_prov_id,
            v_tipo_cuenta_prov_id,
            v_moneda_prov_id,
            v_carta_doc_id,
            v_constancia_doc_id,
            v_representante_doc_id,
            v_solicitado_por
        FROM MB_CUENTA_BANCARIA_PROVEEDOR cp
        INNER JOIN MB_BANCO b
            ON b.banco_id = cp.banco_id
           AND b.estado = 'ACTIVO'
        INNER JOIN MB_CATALOGO_BANCARIO tc
            ON tc.catalogo_id = cp.tipo_cuenta_id
           AND tc.grupo = 'TIPO_CUENTA'
        WHERE ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(
                -20992,
                'Prerequisito faltante: se necesita al menos una cuenta de proveedor existente con referencias/documentos reales para ejecutar las pruebas de escritura sin inventar maestros.'
            );
    END;

    -- Numeros unicos para no depender de IDs locales fijos.
    v_numero_cuenta :=
        SUBSTR('9' || TO_CHAR(SYSTIMESTAMP, 'DDHH24MISSFF6'), 1, 20);

    v_numero_proveedor :=
        'P1-' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF6');

    ------------------------------------------------------------------
    -- 1. LISTAR_CUENTAS
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.LISTAR_CUENTAS(
        p_estado     => NULL,
        p_banco_id   => NULL,
        p_moneda_id  => NULL,
        p_resultado  => v_cursor
    );
    cerrar_cursor;
    ok('1/12 LISTAR_CUENTAS');

    ------------------------------------------------------------------
    -- 4. CREAR_CUENTA
    -- Se ejecuta antes de OBTENER/ACTUALIZAR para no depender de un ID fijo.
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.CREAR_CUENTA(
        p_empresa_id             => v_empresa_id,
        p_banco_id               => v_banco_id,
        p_moneda_id              => v_moneda_id,
        p_tipo_cuenta_id         => v_tipo_cuenta_id,
        p_responsable_id         => v_responsable_id,
        p_numero_cuenta          => v_numero_cuenta,
        p_nombre_interno         => 'PRUEBA P1 PACKAGE',
        p_saldo_inicial          => 100.25,
        p_fecha_apertura         => TRUNC(SYSDATE),
        p_uso_principal          => 'AMBOS',
        p_permite_cobros         => 'S',
        p_permite_pagos          => 'S',
        p_permite_cheques        => 'N',
        p_permite_transferencias => 'S',
        p_estado                 => 'BORRADOR',
        p_observaciones          => 'Registro temporal de test integral',
        p_creado_por             => v_usuario_id,
        p_cuenta_id              => v_cuenta_id
    );
    ok('4/12 CREAR_CUENTA -> cuenta_id=' || TO_CHAR(v_cuenta_id));

    SELECT codigo_cuenta
      INTO v_codigo_cuenta
      FROM MB_CUENTA_BANCARIA
     WHERE cuenta_id = v_cuenta_id;

    ------------------------------------------------------------------
    -- 3. OBTENER_CUENTA
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.OBTENER_CUENTA(
        p_cuenta_id => v_cuenta_id,
        p_resultado => v_cursor
    );
    cerrar_cursor;
    ok('3/12 OBTENER_CUENTA');

    ------------------------------------------------------------------
    -- 5. ACTUALIZAR_CUENTA
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.ACTUALIZAR_CUENTA(
        p_cuenta_id              => v_cuenta_id,
        p_empresa_id             => v_empresa_id,
        p_banco_id               => v_banco_id,
        p_moneda_id              => v_moneda_id,
        p_tipo_cuenta_id         => v_tipo_cuenta_id,
        p_responsable_id         => v_responsable_id,
        p_codigo_cuenta          => v_codigo_cuenta,
        p_numero_cuenta          => v_numero_cuenta,
        p_nombre_interno         => 'PRUEBA P1 PACKAGE ACTUALIZADA',
        p_saldo_inicial          => 150.50,
        p_fecha_apertura         => TRUNC(SYSDATE),
        p_uso_principal          => 'PAGOS',
        p_permite_cobros         => 'N',
        p_permite_pagos          => 'S',
        p_permite_cheques        => 'N',
        p_permite_transferencias => 'S',
        p_fecha_cierre           => NULL,
        p_observaciones          => 'Actualizacion temporal de prueba',
        p_modificado_por         => v_usuario_id
    );
    ok('5/12 ACTUALIZAR_CUENTA');

    ------------------------------------------------------------------
    -- 6. CAMBIAR_ESTADO_CUENTA
    -- BORRADOR -> ACTIVA; luego se ejercita reversibilidad INACTIVA.
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.CAMBIAR_ESTADO_CUENTA(
        p_cuenta_id      => v_cuenta_id,
        p_estado         => 'ACTIVA',
        p_modificado_por => v_usuario_id
    );
    ok('6/12 CAMBIAR_ESTADO_CUENTA (BORRADOR -> ACTIVA)');

    ------------------------------------------------------------------
    -- 2. LISTAR_CUENTAS_ACTIVAS con filtros reales.
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.LISTAR_CUENTAS_ACTIVAS(
        p_banco_id  => v_banco_id,
        p_moneda_id => v_moneda_id,
        p_resultado => v_cursor
    );
    cerrar_cursor;
    ok('2/12 LISTAR_CUENTAS_ACTIVAS con banco/moneda');

    PKG_MB_CUENTAS.CAMBIAR_ESTADO_CUENTA(
        p_cuenta_id      => v_cuenta_id,
        p_estado         => 'INACTIVA',
        p_modificado_por => v_usuario_id
    );

    PKG_MB_CUENTAS.CAMBIAR_ESTADO_CUENTA(
        p_cuenta_id      => v_cuenta_id,
        p_estado         => 'ACTIVA',
        p_modificado_por => v_usuario_id
    );
    ok('Regla adicional: INACTIVA -> ACTIVA');

    ------------------------------------------------------------------
    -- 7. LISTAR_CUENTAS_PROVEEDOR
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.LISTAR_CUENTAS_PROVEEDOR(
        p_proveedor_id => NULL,
        p_estado       => NULL,
        p_banco_id     => NULL,
        p_moneda_id    => NULL,
        p_resultado    => v_cursor
    );
    cerrar_cursor;
    ok('7/12 LISTAR_CUENTAS_PROVEEDOR');

    ------------------------------------------------------------------
    -- 10. CREAR_CUENTA_PROVEEDOR
    -- El ID lo genera SEQ_MB_CUENTA_PROVEEDOR dentro del Package.
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.CREAR_CUENTA_PROVEEDOR(
        p_proveedor_id            => v_proveedor_id,
        p_banco_id                => v_banco_prov_id,
        p_tipo_cuenta_id          => v_tipo_cuenta_prov_id,
        p_moneda_id               => v_moneda_prov_id,
        p_cuenta_anterior_id      => NULL,
        p_titular                 => 'PROVEEDOR PRUEBA P1',
        p_numero_cuenta           => v_numero_proveedor,
        p_carta_solicitud_doc_id  => v_carta_doc_id,
        p_constancia_banco_doc_id => v_constancia_doc_id,
        p_representante_doc_id    => v_representante_doc_id,
        p_motivo_registro         => 'Prueba integral PKG_MB_CUENTAS',
        p_fecha_vigencia          => TRUNC(SYSDATE) + 30,
        p_estado                  => 'PENDIENTE',
        p_observaciones           => 'Registro temporal de test integral',
        p_solicitado_por          => v_solicitado_por,
        p_cta_proveedor_id        => v_cta_proveedor_id
    );
    ok('10/12 CREAR_CUENTA_PROVEEDOR -> id=' || TO_CHAR(v_cta_proveedor_id));

    ------------------------------------------------------------------
    -- 9. OBTENER_CUENTA_PROVEEDOR
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.OBTENER_CUENTA_PROVEEDOR(
        p_cta_proveedor_id => v_cta_proveedor_id,
        p_resultado        => v_cursor
    );
    cerrar_cursor;
    ok('9/12 OBTENER_CUENTA_PROVEEDOR');

    ------------------------------------------------------------------
    -- 11. ACTUALIZAR_CUENTA_PROVEEDOR
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.ACTUALIZAR_CUENTA_PROVEEDOR(
        p_cta_proveedor_id        => v_cta_proveedor_id,
        p_proveedor_id            => v_proveedor_id,
        p_banco_id                => v_banco_prov_id,
        p_tipo_cuenta_id          => v_tipo_cuenta_prov_id,
        p_moneda_id               => v_moneda_prov_id,
        p_cuenta_anterior_id      => NULL,
        p_titular                 => 'PROVEEDOR PRUEBA P1 ACTUALIZADO',
        p_numero_cuenta           => v_numero_proveedor,
        p_carta_solicitud_doc_id  => v_carta_doc_id,
        p_constancia_banco_doc_id => v_constancia_doc_id,
        p_representante_doc_id    => v_representante_doc_id,
        p_motivo_registro         => 'Prueba integral actualizada',
        p_fecha_vigencia          => TRUNC(SYSDATE) + 60,
        p_observaciones           => 'Actualizacion temporal de prueba'
    );
    ok('11/12 ACTUALIZAR_CUENTA_PROVEEDOR');

    ------------------------------------------------------------------
    -- 12. CAMBIAR_ESTADO_CUENTA_PROVEEDOR
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.CAMBIAR_ESTADO_CUENTA_PROVEEDOR(
        p_cta_proveedor_id => v_cta_proveedor_id,
        p_estado           => 'EN_REVISION'
    );

    PKG_MB_CUENTAS.CAMBIAR_ESTADO_CUENTA_PROVEEDOR(
        p_cta_proveedor_id => v_cta_proveedor_id,
        p_estado           => 'VERIFICADA'
    );
    ok('12/12 CAMBIAR_ESTADO_CUENTA_PROVEEDOR');

    ------------------------------------------------------------------
    -- 8. LISTAR_CUENTAS_PROV_VERIFICADAS
    ------------------------------------------------------------------
    PKG_MB_CUENTAS.LISTAR_CUENTAS_PROV_VERIFICADAS(
        p_proveedor_id => v_proveedor_id,
        p_resultado    => v_cursor
    );
    cerrar_cursor;
    ok('8/12 LISTAR_CUENTAS_PROV_VERIFICADAS');

    ------------------------------------------------------------------
    -- Resistencia: IDs inexistentes deben ser rechazados.
    ------------------------------------------------------------------
    BEGIN
        PKG_MB_CUENTAS.OBTENER_CUENTA(
            p_cuenta_id => 9999999999,
            p_resultado => v_cursor
        );
        cerrar_cursor;
        RAISE_APPLICATION_ERROR(-20993, 'La prueba esperaba error al obtener una cuenta empresarial inexistente.');
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE = -20993 THEN
                RAISE;
            END IF;
            DBMS_OUTPUT.PUT_LINE('[OK] Resistencia cuenta inexistente -> ' || SQLERRM);
    END;

    BEGIN
        PKG_MB_CUENTAS.OBTENER_CUENTA_PROVEEDOR(
            p_cta_proveedor_id => 9999999999999999999,
            p_resultado        => v_cursor
        );
        cerrar_cursor;
        RAISE_APPLICATION_ERROR(-20994, 'La prueba esperaba error al obtener una cuenta de proveedor inexistente.');
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE = -20994 THEN
                RAISE;
            END IF;
            DBMS_OUTPUT.PUT_LINE('[OK] Resistencia cuenta proveedor inexistente -> ' || SQLERRM);
    END;

    DBMS_OUTPUT.PUT_LINE('============================================================');
    DBMS_OUTPUT.PUT_LINE('RESULTADO: 12/12 OPERACIONES PUBLICAS EJECUTADAS EN EL SCRIPT');
    DBMS_OUTPUT.PUT_LINE('Los registros temporales se revierten a continuacion.');
    DBMS_OUTPUT.PUT_LINE('============================================================');

    ROLLBACK TO inicio_prueba_pkg_mb_cuentas;
EXCEPTION
    WHEN OTHERS THEN
        BEGIN
            cerrar_cursor;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
        ROLLBACK TO inicio_prueba_pkg_mb_cuentas;
        DBMS_OUTPUT.PUT_LINE('[ERROR] ' || SQLERRM);
        RAISE;
END;
/
