-- ============================================================
-- SEQ_MB_CUENTA_BANCARIA
-- Reinstalable: al ejecutarse calcula el siguiente valor a partir
-- de los datos existentes en MB_CUENTA_BANCARIA.
-- ============================================================
DECLARE
    v_inicio NUMBER;
BEGIN
    SELECT NVL(MAX(cuenta_id), 0) + 1
      INTO v_inicio
      FROM MB_CUENTA_BANCARIA;

    BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_MB_CUENTA_BANCARIA';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE <> -2289 THEN
                RAISE;
            END IF;
    END;

    EXECUTE IMMEDIATE
        'CREATE SEQUENCE SEQ_MB_CUENTA_BANCARIA ' ||
        'START WITH ' || TO_CHAR(v_inicio) || ' ' ||
        'INCREMENT BY 1 MINVALUE 1 MAXVALUE 9999999999 ' ||
        'NOCACHE NOORDER NOCYCLE';
END;
/
