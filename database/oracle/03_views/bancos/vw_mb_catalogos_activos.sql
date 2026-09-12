-- =========================================================
-- VIEW: VW_MB_CATALOGOS_ACTIVOS
-- Modelo: MB_CATALOGO_BANCARIO
-- Propósito:
-- Centralizar la lectura de catálogos bancarios activos.
-- =========================================================

CREATE OR REPLACE VIEW VW_MB_CATALOGOS_ACTIVOS AS
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
WHERE estado = 'ACTIVO';


SELECT *
FROM VW_MB_CATALOGOS_ACTIVOS
ORDER BY grupo, nombre;