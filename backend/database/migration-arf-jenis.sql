-- Add many-to-many table for Area and Jenis Parkir
CREATE TABLE IF NOT EXISTS arf_jenis_parkir (
  id_arf_jenis INT AUTO_INCREMENT PRIMARY KEY,
  id_arf INT NOT NULL,
  id_jenis_parkir INT NOT NULL,
  kapasitas_jenis INT NOT NULL COMMENT 'Kapasitas untuk jenis parkir ini di area ini',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_arf) REFERENCES tb_arf(id_arf) ON DELETE CASCADE,
  FOREIGN KEY (id_jenis_parkir) REFERENCES m_jenis_parkir(id_jenis_parkir) ON DELETE CASCADE,
  UNIQUE KEY uk_arf_jenis (id_arf, id_jenis_parkir),
  INDEX idx_arf (id_arf),
  INDEX idx_jenis (id_jenis_parkir)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data: Area Mobil Basement bisa untuk mobil dan motor
-- Assuming 'Area Mobil Basement' has id_arf and jenis parkir mobil (id=1), motor (id=2)
INSERT INTO arf_jenis_parkir (id_arf, id_jenis_parkir, kapasitas_jenis) 
SELECT id_arf, 1, 30 FROM tb_arf WHERE nama_area = 'Area Mobil Basement'
ON DUPLICATE KEY UPDATE kapasitas_jenis = 30;

INSERT INTO arf_jenis_parkir (id_arf, id_jenis_parkir, kapasitas_jenis)
SELECT id_arf, 2, 20 FROM tb_arf WHERE nama_area = 'Area Mobil Basement'
ON DUPLICATE KEY UPDATE kapasitas_jenis = 20;
