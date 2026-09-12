-- ============================================================
-- SEQ_MB_CUENTA_PROVEEDOR
-- Persona 1 adopta generación del ID en Oracle para evitar IDs
-- inventados en React y preservar NUMBER(19) sin depender de JS.
-- ============================================================
DECLARE
    v_inicio NUMBER;
BEGIN
    SELECT NVL(MAX(cta_proveedor_id), 0) + 1
      INTO v_inicio
      FROM MB_CUENTA_BANCARIA_PROVEEDOR;

    BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_MB_CUENTA_PROVEEDOR';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE <> -2289 THEN
                RAISE;
            END IF;
    END;

    EXECUTE IMMEDIATE
        'CREATE SEQUENCE SEQ_MB_CUENTA_PROVEEDOR ' ||
        'START WITH ' || TO_CHAR(v_inicio) || ' ' ||
        'INCREMENT BY 1 MINVALUE 1 MAXVALUE 9999999999999999999 ' ||
        'NOCACHE NOORDER NOCYCLE';
END;
/
