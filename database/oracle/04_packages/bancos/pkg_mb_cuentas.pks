CREATE OR REPLACE EDITIONABLE PACKAGE "ERP_BANCOS"."PKG_MB_CUENTAS" AS

    ------------------------------------------------------------------
    -- CUENTAS BANCARIAS EMPRESARIALES
    ------------------------------------------------------------------

    PROCEDURE LISTAR_CUENTAS (
        p_estado     IN MB_CUENTA_BANCARIA.estado%TYPE,
        p_banco_id   IN MB_CUENTA_BANCARIA.banco_id%TYPE,
        p_moneda_id  IN MB_CUENTA_BANCARIA.moneda_id%TYPE,
        p_resultado  OUT SYS_REFCURSOR
    );

    PROCEDURE LISTAR_CUENTAS_ACTIVAS (
        p_banco_id   IN MB_CUENTA_BANCARIA.banco_id%TYPE,
        p_moneda_id  IN MB_CUENTA_BANCARIA.moneda_id%TYPE,
        p_resultado  OUT SYS_REFCURSOR
    );

    PROCEDURE OBTENER_CUENTA (
        p_cuenta_id  IN MB_CUENTA_BANCARIA.cuenta_id%TYPE,
        p_resultado  OUT SYS_REFCURSOR
    );

    PROCEDURE CREAR_CUENTA (
        p_empresa_id              IN MB_CUENTA_BANCARIA.empresa_id%TYPE,
        p_banco_id                IN MB_CUENTA_BANCARIA.banco_id%TYPE,
        p_moneda_id               IN MB_CUENTA_BANCARIA.moneda_id%TYPE,
        p_tipo_cuenta_id          IN MB_CUENTA_BANCARIA.tipo_cuenta_id%TYPE,
        p_responsable_id          IN MB_CUENTA_BANCARIA.responsable_id%TYPE,
        p_numero_cuenta           IN MB_CUENTA_BANCARIA.numero_cuenta%TYPE,
        p_nombre_interno          IN MB_CUENTA_BANCARIA.nombre_interno%TYPE,
        p_saldo_inicial           IN MB_CUENTA_BANCARIA.saldo_inicial%TYPE,
        p_fecha_apertura          IN MB_CUENTA_BANCARIA.fecha_apertura%TYPE,
        p_uso_principal           IN MB_CUENTA_BANCARIA.uso_principal%TYPE,
        p_permite_cobros          IN MB_CUENTA_BANCARIA.permite_cobros%TYPE,
        p_permite_pagos           IN MB_CUENTA_BANCARIA.permite_pagos%TYPE,
        p_permite_cheques         IN MB_CUENTA_BANCARIA.permite_cheques%TYPE,
        p_permite_transferencias  IN MB_CUENTA_BANCARIA.permite_transferencias%TYPE,
        p_estado                  IN MB_CUENTA_BANCARIA.estado%TYPE,
        p_observaciones           IN MB_CUENTA_BANCARIA.observaciones%TYPE,
        p_creado_por              IN MB_CUENTA_BANCARIA.creado_por%TYPE,
        p_cuenta_id               OUT MB_CUENTA_BANCARIA.cuenta_id%TYPE
    );

    PROCEDURE ACTUALIZAR_CUENTA (
        p_cuenta_id               IN MB_CUENTA_BANCARIA.cuenta_id%TYPE,
        p_empresa_id              IN MB_CUENTA_BANCARIA.empresa_id%TYPE,
        p_banco_id                IN MB_CUENTA_BANCARIA.banco_id%TYPE,
        p_moneda_id               IN MB_CUENTA_BANCARIA.moneda_id%TYPE,
        p_tipo_cuenta_id          IN MB_CUENTA_BANCARIA.tipo_cuenta_id%TYPE,
        p_responsable_id          IN MB_CUENTA_BANCARIA.responsable_id%TYPE,
        p_codigo_cuenta           IN MB_CUENTA_BANCARIA.codigo_cuenta%TYPE,
        p_numero_cuenta           IN MB_CUENTA_BANCARIA.numero_cuenta%TYPE,
        p_nombre_interno          IN MB_CUENTA_BANCARIA.nombre_interno%TYPE,
        p_saldo_inicial           IN MB_CUENTA_BANCARIA.saldo_inicial%TYPE,
        p_fecha_apertura          IN MB_CUENTA_BANCARIA.fecha_apertura%TYPE,
        p_uso_principal           IN MB_CUENTA_BANCARIA.uso_principal%TYPE,
        p_permite_cobros          IN MB_CUENTA_BANCARIA.permite_cobros%TYPE,
        p_permite_pagos           IN MB_CUENTA_BANCARIA.permite_pagos%TYPE,
        p_permite_cheques         IN MB_CUENTA_BANCARIA.permite_cheques%TYPE,
        p_permite_transferencias  IN MB_CUENTA_BANCARIA.permite_transferencias%TYPE,
        p_fecha_cierre            IN MB_CUENTA_BANCARIA.fecha_cierre%TYPE,
        p_observaciones           IN MB_CUENTA_BANCARIA.observaciones%TYPE,
        p_modificado_por          IN MB_CUENTA_BANCARIA.modificado_por%TYPE
    );

    PROCEDURE CAMBIAR_ESTADO_CUENTA (
        p_cuenta_id       IN MB_CUENTA_BANCARIA.cuenta_id%TYPE,
        p_estado          IN MB_CUENTA_BANCARIA.estado%TYPE,
        p_modificado_por  IN MB_CUENTA_BANCARIA.modificado_por%TYPE
    );


    ------------------------------------------------------------------
    -- CUENTAS BANCARIAS DE PROVEEDORES
    ------------------------------------------------------------------

    PROCEDURE LISTAR_CUENTAS_PROVEEDOR (
        p_proveedor_id  IN MB_CUENTA_BANCARIA_PROVEEDOR.proveedor_id%TYPE,
        p_estado        IN MB_CUENTA_BANCARIA_PROVEEDOR.estado%TYPE,
        p_banco_id      IN MB_CUENTA_BANCARIA_PROVEEDOR.banco_id%TYPE,
        p_moneda_id     IN MB_CUENTA_BANCARIA_PROVEEDOR.moneda_id%TYPE,
        p_resultado     OUT SYS_REFCURSOR
    );

    PROCEDURE LISTAR_CUENTAS_PROV_VERIFICADAS (
        p_proveedor_id  IN MB_CUENTA_BANCARIA_PROVEEDOR.proveedor_id%TYPE,
        p_resultado     OUT SYS_REFCURSOR
    );

    PROCEDURE OBTENER_CUENTA_PROVEEDOR (
        p_cta_proveedor_id
            IN MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE,
        p_resultado
            OUT SYS_REFCURSOR
    );

    PROCEDURE CREAR_CUENTA_PROVEEDOR (
        p_proveedor_id             IN MB_CUENTA_BANCARIA_PROVEEDOR.proveedor_id%TYPE,
        p_banco_id                 IN MB_CUENTA_BANCARIA_PROVEEDOR.banco_id%TYPE,
        p_tipo_cuenta_id           IN MB_CUENTA_BANCARIA_PROVEEDOR.tipo_cuenta_id%TYPE,
        p_moneda_id                IN MB_CUENTA_BANCARIA_PROVEEDOR.moneda_id%TYPE,
        p_cuenta_anterior_id       IN MB_CUENTA_BANCARIA_PROVEEDOR.cuenta_anterior_id%TYPE,
        p_titular                  IN MB_CUENTA_BANCARIA_PROVEEDOR.titular%TYPE,
        p_numero_cuenta            IN MB_CUENTA_BANCARIA_PROVEEDOR.numero_cuenta%TYPE,
        p_carta_solicitud_doc_id   IN MB_CUENTA_BANCARIA_PROVEEDOR.carta_solicitud_doc_id%TYPE,
        p_constancia_banco_doc_id  IN MB_CUENTA_BANCARIA_PROVEEDOR.constancia_banco_doc_id%TYPE,
        p_representante_doc_id     IN MB_CUENTA_BANCARIA_PROVEEDOR.representante_doc_id%TYPE,
        p_motivo_registro          IN MB_CUENTA_BANCARIA_PROVEEDOR.motivo_registro%TYPE,
        p_fecha_vigencia           IN MB_CUENTA_BANCARIA_PROVEEDOR.fecha_vigencia%TYPE,
        p_estado                   IN MB_CUENTA_BANCARIA_PROVEEDOR.estado%TYPE,
        p_observaciones            IN MB_CUENTA_BANCARIA_PROVEEDOR.observaciones%TYPE,
        p_solicitado_por           IN MB_CUENTA_BANCARIA_PROVEEDOR.solicitado_por%TYPE,
        p_cta_proveedor_id         OUT MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE
    );

    PROCEDURE ACTUALIZAR_CUENTA_PROVEEDOR (
        p_cta_proveedor_id         IN MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE,
        p_proveedor_id             IN MB_CUENTA_BANCARIA_PROVEEDOR.proveedor_id%TYPE,
        p_banco_id                 IN MB_CUENTA_BANCARIA_PROVEEDOR.banco_id%TYPE,
        p_tipo_cuenta_id           IN MB_CUENTA_BANCARIA_PROVEEDOR.tipo_cuenta_id%TYPE,
        p_moneda_id                IN MB_CUENTA_BANCARIA_PROVEEDOR.moneda_id%TYPE,
        p_cuenta_anterior_id       IN MB_CUENTA_BANCARIA_PROVEEDOR.cuenta_anterior_id%TYPE,
        p_titular                  IN MB_CUENTA_BANCARIA_PROVEEDOR.titular%TYPE,
        p_numero_cuenta            IN MB_CUENTA_BANCARIA_PROVEEDOR.numero_cuenta%TYPE,
        p_carta_solicitud_doc_id   IN MB_CUENTA_BANCARIA_PROVEEDOR.carta_solicitud_doc_id%TYPE,
        p_constancia_banco_doc_id  IN MB_CUENTA_BANCARIA_PROVEEDOR.constancia_banco_doc_id%TYPE,
        p_representante_doc_id     IN MB_CUENTA_BANCARIA_PROVEEDOR.representante_doc_id%TYPE,
        p_motivo_registro          IN MB_CUENTA_BANCARIA_PROVEEDOR.motivo_registro%TYPE,
        p_fecha_vigencia           IN MB_CUENTA_BANCARIA_PROVEEDOR.fecha_vigencia%TYPE,
        p_observaciones            IN MB_CUENTA_BANCARIA_PROVEEDOR.observaciones%TYPE
    );

    PROCEDURE CAMBIAR_ESTADO_CUENTA_PROVEEDOR (
        p_cta_proveedor_id
            IN MB_CUENTA_BANCARIA_PROVEEDOR.cta_proveedor_id%TYPE,
        p_estado
            IN MB_CUENTA_BANCARIA_PROVEEDOR.estado%TYPE
    );

END PKG_MB_CUENTAS;
/
