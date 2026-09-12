-- =========================================================
-- DDL: MB_CATALOGO_BANCARIO
-- Proyecto: ERP - Módulo de Bancos
-- Catálogo bancario genérico
-- =========================================================

CREATE TABLE MB_CATALOGO_BANCARIO (
  catalogo_id NUMBER(10) NOT NULL,
  grupo VARCHAR2(30) NOT NULL,
  codigo VARCHAR2(30) NOT NULL,
  nombre VARCHAR2(80) NOT NULL,
  descripcion VARCHAR2(250),
  aplica_a VARCHAR2(30),
  naturaleza CHAR(1),
  requiere_comentario CHAR(1) NOT NULL,
  requiere_evidencia CHAR(1) NOT NULL,
  permite_reversion CHAR(1) NOT NULL,
  estado VARCHAR2(15) NOT NULL,

  CONSTRAINT mb_pk_catalogo_bancario
    PRIMARY KEY (catalogo_id),

  CONSTRAINT mb_uq_catalogo_grupo_codigo
    UNIQUE (grupo,codigo),

  CONSTRAINT mb_ck_catalogo_nat
    CHECK (naturaleza IN ('D','C') OR naturaleza IS NULL),

  CONSTRAINT mb_ck_catalogo_flags
    CHECK (
      requiere_comentario IN ('S','N')
      AND requiere_evidencia IN ('S','N')
      AND permite_reversion IN ('S','N')
    ),

  CONSTRAINT mb_ck_catalogo_estado
    CHECK (estado IN ('ACTIVO','INACTIVO')),

  CONSTRAINT mb_ck_catalogo_nat_tipo
    CHECK (grupo <> 'TIPO_MOVIMIENTO' OR naturaleza IS NOT NULL)
);