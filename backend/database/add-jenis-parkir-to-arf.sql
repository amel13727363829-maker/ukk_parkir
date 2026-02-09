-- Add jenis_parkir_yang_didukung column to tb_arf table
-- This column stores the parking types supported by each area as JSON

USE parkir_db;

-- Check if column exists, if not add it
ALTER TABLE tb_arf 
ADD COLUMN IF NOT EXISTS jenis_parkir_yang_didukung JSON DEFAULT '["mobil"]' AFTER kapasitas;

-- Update existing areas with default values (both motor and mobil supported)
UPDATE tb_arf 
SET jenis_parkir_yang_didukung = '["motor", "mobil"]' 
WHERE jenis_parkir_yang_didukung = '["mobil"]' OR jenis_parkir_yang_didukung IS NULL;

-- You can also customize per area:
-- UPDATE tb_arf SET jenis_parkir_yang_didukung = '["motor"]' WHERE nama_area = 'Area A - Motor Only';
-- UPDATE tb_arf SET jenis_parkir_yang_didukung = '["mobil"]' WHERE nama_area = 'Area B - Mobil Only';
