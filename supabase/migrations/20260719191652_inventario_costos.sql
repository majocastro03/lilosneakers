-- Migración: módulo de inventario y costos
-- Fecha: 2026-07-19
-- Añade el precio de compra (costo) a productos y la tabla de movimientos de inventario.

-- 1. Precio de compra (costo) — privado, solo admin
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_costo numeric(12,2);

-- 2. Movimientos de inventario (entradas, salidas, ajustes)
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id  uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  talla_id     uuid REFERENCES tallas(id) ON DELETE SET NULL,
  tipo         text NOT NULL CHECK (tipo IN ('entrada','salida','ajuste')),
  cantidad     integer NOT NULL CHECK (cantidad >= 0),
  motivo       text,
  precio_venta numeric(12,2),
  precio_costo numeric(12,2),
  ganancia     numeric(12,2),
  referencia   text,
  origen       text DEFAULT 'manual',
  creado_por   uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  creado_en    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mov_inv_producto ON movimientos_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_mov_inv_fecha    ON movimientos_inventario(creado_en);
