-- =========================================================
-- SECUENCIA: SEQ_MB_BANCO
-- Proyecto: ERP - Módulo de Bancos
-- Modelo: MB_BANCO
-- =========================================================

DECLARE
    v_inicio NUMBER;
    v_existe NUMBER;
BEGIN
    -- Obtener el siguiente ID disponible según los datos actuales
    SELECT NVL(MAX(banco_id), 0) + 1
    INTO v_inicio
    FROM MB_BANCO;

    -- Verificar si la secuencia ya existe
    SELECT COUNT(*)
    INTO v_existe
    FROM USER_SEQUENCES
    WHERE SEQUENCE_NAME = 'SEQ_MB_BANCO';

    -- Crear solo si todavía no existe
    IF v_existe = 0 THEN
        EXECUTE IMMEDIATE
            'CREATE SEQUENCE SEQ_MB_BANCO ' ||
            'START WITH ' || v_inicio || ' ' ||
            'INCREMENT BY 1 ' ||
            'NOCACHE ' ||
            'NOCYCLE';
    END IF;
END;
/

SELECT
    sequence_name,
    increment_by,
    last_number
FROM user_sequences
WHERE sequence_name = 'SEQ_MB_BANCO';