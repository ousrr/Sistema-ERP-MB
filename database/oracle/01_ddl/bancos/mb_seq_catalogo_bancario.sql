-- ============================================================
-- MÓDULO DE BANCOS
-- SECUENCIA: MB_SEQ_CATALOGO_BANCARIO
--
-- Propósito:
-- Generar automáticamente el identificador primario
-- de MB_CATALOGO_BANCARIO.
--
-- Dependencia:
-- PKG_MB_CATALOGOS utiliza NEXTVAL durante CREAR.
-- ============================================================

DECLARE
    v_existe NUMBER;
    v_inicio NUMBER;
BEGIN

    SELECT COUNT(*)
      INTO v_existe
      FROM user_sequences
     WHERE sequence_name = 'MB_SEQ_CATALOGO_BANCARIO';


    IF v_existe = 0 THEN

        SELECT NVL(MAX(catalogo_id), 0) + 1
          INTO v_inicio
          FROM MB_CATALOGO_BANCARIO;


        EXECUTE IMMEDIATE
            'CREATE SEQUENCE MB_SEQ_CATALOGO_BANCARIO ' ||
            'START WITH ' || v_inicio || ' ' ||
            'INCREMENT BY 1 ' ||
            'NOCACHE ' ||
            'NOCYCLE';

    END IF;

END;
/