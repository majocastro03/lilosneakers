-- Migration: Add producto_imagenes table for multiple images per product
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS producto_imagenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  imagen_url TEXT NOT NULL,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by product
CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto_id ON producto_imagenes(producto_id);

-- Enable RLS
ALTER TABLE producto_imagenes ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "producto_imagenes_public_read" ON producto_imagenes
  FOR SELECT USING (true);

-- Admin insert/update/delete (authenticated users)
CREATE POLICY "producto_imagenes_admin_write" ON producto_imagenes
  FOR ALL USING (auth.role() = 'authenticated');
