-- ============================================================
-- PRUEBAS DE INTEGRIDAD: MB_BANCO
-- Proyecto: ERP - Módulo de Bancos
--
-- Objetivo:
-- Verificar el estado final de los datos funcionales de
-- MB_BANCO sin realizar INSERT, UPDATE, DELETE ni COMMIT.
--
-- Esta prueba es repetible y de solo lectura.
-- ============================================================

SET SERVEROUTPUT ON;


-- ============================================================
-- 1. LISTADO GENERAL
-- ============================================================

SELECT
    banco_id,
    codigo_banco,
    nombre,
    bic_swift,
    estado,
    creado_por,
    creado_en
FROM MB_BANCO
ORDER BY banco_id;


-- ============================================================
-- 2. VERIFICAR BANCOS FUNCIONALES ESPERADOS
--
-- Deben existir:
-- BAM
-- BI
-- BANRURAL
-- ============================================================

SELECT
    codigo_banco,
    nombre,
    bic_swift,
    estado
FROM MB_BANCO
WHERE codigo_banco IN (
    'BAM',
    'BI',
    'BANRURAL'
)
ORDER BY codigo_banco;


-- ============================================================
-- 3. CÓDIGOS DUPLICADOS
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    codigo_banco,
    COUNT(*) AS cantidad
FROM MB_BANCO
GROUP BY codigo_banco
HAVING COUNT(*) > 1;


-- ============================================================
-- 4. ESTADOS INVÁLIDOS
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    banco_id,
    codigo_banco,
    estado
FROM MB_BANCO
WHERE estado NOT IN (
    'ACTIVO',
    'INACTIVO'
)
   OR estado IS NULL;


-- ============================================================
-- 5. CAMPOS OBLIGATORIOS VACÍOS
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    banco_id,
    codigo_banco,
    nombre
FROM MB_BANCO
WHERE codigo_banco IS NULL
   OR TRIM(codigo_banco) IS NULL
   OR nombre IS NULL
   OR TRIM(nombre) IS NULL;


-- ============================================================
-- 6. BANCOS DE PRUEBA QUE NO DEBEN EXISTIR
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    banco_id,
    codigo_banco,
    nombre
FROM MB_BANCO
WHERE banco_id IN (
    100,
    101,
    102,
    104,
    106
)
   OR codigo_banco IN (
       'TEST',
       'NODE',
       'API',
       'REFTEST',
       'BTI'
   );


-- ============================================================
-- 7. VALIDAR DATOS PRINCIPALES DE BAM
-- ============================================================

SELECT
    banco_id,
    codigo_banco,
    nombre,
    bic_swift,
    estado
FROM MB_BANCO
WHERE codigo_banco = 'BAM';


-- ============================================================
-- 8. VALIDAR DATOS PRINCIPALES DE BI
-- ============================================================

SELECT
    banco_id,
    codigo_banco,
    nombre,
    bic_swift,
    estado
FROM MB_BANCO
WHERE codigo_banco = 'BI';


-- ============================================================
-- 9. VALIDAR DATOS PRINCIPALES DE BANRURAL
-- ============================================================

SELECT
    banco_id,
    codigo_banco,
    nombre,
    bic_swift,
    estado
FROM MB_BANCO
WHERE codigo_banco = 'BANRURAL';


-- ============================================================
-- 10. RESUMEN POR ESTADO
-- ============================================================

SELECT
    estado,
    COUNT(*) AS cantidad
FROM MB_BANCO
GROUP BY estado
ORDER BY estado;


-- ============================================================
-- FIN DE PRUEBAS MB_BANCO
-- ============================================================