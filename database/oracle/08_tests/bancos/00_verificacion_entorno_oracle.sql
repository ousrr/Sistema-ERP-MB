-- ============================================
-- VERIFICACIÓN DEL ENTORNO ORACLE
-- Proyecto: ERP - Módulo de Bancos
-- ============================================

-- 1. Verificar usuario y contenedor actual
SELECT USER AS USUARIO,
       SYS_CONTEXT('USERENV','CON_NAME') AS CONTENEDOR
FROM dual;


-- 2. Verificar contenedor
SELECT SYS_CONTEXT('USERENV','CON_NAME') AS CONTENEDOR
FROM dual;


-- 3. Verificar existencia de las tablas asignadas
SELECT table_name
FROM user_tables
WHERE table_name IN (
    'MB_BANCO',
    'MB_CATALOGO_BANCARIO'
)
ORDER BY table_name;


-- 4. Verificar total de tablas del módulo Bancos
SELECT COUNT(*) AS TOTAL_TABLAS_MB
FROM user_tables
WHERE table_name LIKE 'MB_%';