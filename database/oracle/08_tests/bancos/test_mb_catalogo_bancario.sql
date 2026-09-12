-- ============================================================
-- PRUEBAS DE INTEGRIDAD: MB_CATALOGO_BANCARIO
-- Proyecto: ERP - Módulo de Bancos
--
-- Objetivo:
-- Verificar el estado final del catálogo bancario genérico
-- sin realizar INSERT, UPDATE, DELETE ni COMMIT.
--
-- Esta prueba es repetible y de solo lectura.
-- ============================================================

SET SERVEROUTPUT ON;


-- ============================================================
-- 1. LISTADO GENERAL
-- ============================================================

SELECT
    catalogo_id,
    grupo,
    codigo,
    nombre,
    descripcion,
    aplica_a,
    naturaleza,
    requiere_comentario,
    requiere_evidencia,
    permite_reversion,
    estado
FROM MB_CATALOGO_BANCARIO
ORDER BY grupo, catalogo_id;


-- ============================================================
-- 2. TOTAL DE REGISTROS
--
-- Resultado esperado actualmente:
-- 13
-- ============================================================

SELECT
    COUNT(*) AS total_catalogos
FROM MB_CATALOGO_BANCARIO;


-- ============================================================
-- 3. RESUMEN POR GRUPO
-- ============================================================

SELECT
    grupo,
    COUNT(*) AS cantidad,
    SUM(
        CASE
            WHEN estado = 'ACTIVO' THEN 1
            ELSE 0
        END
    ) AS activos,
    SUM(
        CASE
            WHEN estado = 'INACTIVO' THEN 1
            ELSE 0
        END
    ) AS inactivos
FROM MB_CATALOGO_BANCARIO
GROUP BY grupo
ORDER BY grupo;


-- ============================================================
-- 4. GRUPO + CÓDIGO DUPLICADO
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    grupo,
    codigo,
    COUNT(*) AS cantidad
FROM MB_CATALOGO_BANCARIO
GROUP BY
    grupo,
    codigo
HAVING COUNT(*) > 1;


-- ============================================================
-- 5. ESTADOS INVÁLIDOS
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    catalogo_id,
    grupo,
    codigo,
    estado
FROM MB_CATALOGO_BANCARIO
WHERE estado NOT IN (
    'ACTIVO',
    'INACTIVO'
)
   OR estado IS NULL;


-- ============================================================
-- 6. FLAGS INVÁLIDOS
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    catalogo_id,
    grupo,
    codigo,
    requiere_comentario,
    requiere_evidencia,
    permite_reversion
FROM MB_CATALOGO_BANCARIO
WHERE requiere_comentario NOT IN ('S', 'N')
   OR requiere_evidencia NOT IN ('S', 'N')
   OR permite_reversion NOT IN ('S', 'N')
   OR requiere_comentario IS NULL
   OR requiere_evidencia IS NULL
   OR permite_reversion IS NULL;


-- ============================================================
-- 7. NATURALEZA INVÁLIDA
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    catalogo_id,
    grupo,
    codigo,
    naturaleza
FROM MB_CATALOGO_BANCARIO
WHERE naturaleza NOT IN ('D', 'C')
  AND naturaleza IS NOT NULL;


-- ============================================================
-- 8. TIPO_MOVIMIENTO SIN NATURALEZA
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    catalogo_id,
    grupo,
    codigo,
    naturaleza
FROM MB_CATALOGO_BANCARIO
WHERE grupo = 'TIPO_MOVIMIENTO'
  AND naturaleza IS NULL;


-- ============================================================
-- 9. CAMPOS OBLIGATORIOS VACÍOS
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    catalogo_id,
    grupo,
    codigo,
    nombre
FROM MB_CATALOGO_BANCARIO
WHERE grupo IS NULL
   OR TRIM(grupo) IS NULL
   OR codigo IS NULL
   OR TRIM(codigo) IS NULL
   OR nombre IS NULL
   OR TRIM(nombre) IS NULL;


-- ============================================================
-- 10. DATOS DE PRUEBA QUE NO DEBEN EXISTIR
--
-- Resultado esperado:
-- 0 filas
-- ============================================================

SELECT
    catalogo_id,
    grupo,
    codigo,
    nombre
FROM MB_CATALOGO_BANCARIO
WHERE catalogo_id IN (
    101,
    102,
    200,
    202,
    211
)
   OR codigo IN (
       'RECIBO_TEST',
       'COMPROBANTE_API',
       'PRUEBA_BACKEND',
       'PRUEBA_ID_AUTO',
       'PRUEBA_UI_FINAL'
   )
   OR grupo = 'PRUEBA_P3'
   OR grupo = 'PRUEBA_AUTOMATICA';


-- ============================================================
-- 11. TIPOS DE CUENTA
-- ============================================================

SELECT
    catalogo_id,
    codigo,
    nombre,
    estado
FROM MB_CATALOGO_BANCARIO
WHERE grupo = 'TIPO_CUENTA'
ORDER BY catalogo_id;


-- ============================================================
-- 12. TIPOS DE MOVIMIENTO
-- ============================================================

SELECT
    catalogo_id,
    codigo,
    nombre,
    naturaleza,
    estado
FROM MB_CATALOGO_BANCARIO
WHERE grupo = 'TIPO_MOVIMIENTO'
ORDER BY catalogo_id;


-- ============================================================
-- 13. TIPOS DE OPERACIÓN
-- ============================================================

SELECT
    catalogo_id,
    codigo,
    nombre,
    estado
FROM MB_CATALOGO_BANCARIO
WHERE grupo = 'TIPO_OPERACION'
ORDER BY catalogo_id;


-- ============================================================
-- 14. TIPOS DE DOCUMENTO
-- ============================================================

SELECT
    catalogo_id,
    codigo,
    nombre,
    naturaleza,
    estado
FROM MB_CATALOGO_BANCARIO
WHERE grupo = 'TIPO_DOCUMENTO'
ORDER BY catalogo_id;


-- ============================================================
-- 15. MEDIOS DE PAGO
-- ============================================================

SELECT
    catalogo_id,
    codigo,
    nombre,
    estado
FROM MB_CATALOGO_BANCARIO
WHERE grupo = 'MEDIO_PAGO'
ORDER BY catalogo_id;


-- ============================================================
-- 16. REGISTROS ACTIVOS DISPONIBLES PARA SELECTS
-- ============================================================

SELECT
    catalogo_id,
    grupo,
    codigo,
    nombre,
    naturaleza
FROM MB_CATALOGO_BANCARIO
WHERE estado = 'ACTIVO'
ORDER BY
    grupo,
    nombre;


-- ============================================================
-- FIN DE PRUEBAS MB_CATALOGO_BANCARIO
-- ============================================================