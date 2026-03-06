-- Migration: Add multiple sizing systems to tallas table
-- Run this SQL in your Supabase SQL editor

-- Add new columns for sizing systems
ALTER TABLE tallas ADD COLUMN IF NOT EXISTS valor_us VARCHAR(20);
ALTER TABLE tallas ADD COLUMN IF NOT EXISTS valor_eur VARCHAR(20);
ALTER TABLE tallas ADD COLUMN IF NOT EXISTS valor_cm VARCHAR(20);

-- Rename 'valor' conceptually to be the CO value (no actual rename needed)
-- The existing 'valor' column will represent CO sizing

-- Drop old unique constraint if exists and create new one
-- ALTER TABLE tallas DROP CONSTRAINT IF EXISTS tallas_valor_genero_key;
-- ALTER TABLE tallas ADD CONSTRAINT tallas_valor_genero_key UNIQUE (valor, genero);
