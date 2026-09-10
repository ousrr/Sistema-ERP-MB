-- =========================================================
-- DDL: MB_BANCO
-- Proyecto: ERP - Módulo de Bancos
-- Modelo maestro de instituciones bancarias
-- =========================================================

CREATE TABLE MB_BANCO (
  banco_id NUMBER(10) NOT NULL,
  codigo_banco VARCHAR2(10) NOT NULL,
  nombre VARCHAR2(100) NOT NULL,
  bic_swift VARCHAR2(11),
  estado VARCHAR2(15) NOT NULL,
  creado_por NUMBER(10) NOT NULL,
  creado_en TIMESTAMP NOT NULL,

  CONSTRAINT mb_pk_banco
    PRIMARY KEY (banco_id),

  CONSTRAINT mb_uq_banco_codigo
    UNIQUE (codigo_banco),

  CONSTRAINT mb_ck_banco_estado
    CHECK (estado IN ('ACTIVO','INACTIVO'))
);