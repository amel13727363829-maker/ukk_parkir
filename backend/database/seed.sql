-- Seed Initial Data

USE parkir_db;

-- Insert Admin User (Password: admin123 - bcrypted will be done via Node.js)
-- For now, we'll insert placeholder, real passwords will be set via API
INSERT INTO m_user (username, password, nama_lengkap, email, no_telepon, role, status_aktif) VALUES
('admin', '$2b$10$KiXyY8Q8Xj3q0Y7QzQz0ze.J2j5B5P0C5S5X5V5Z5Q5Y5C5E5G5', 'Administrator', 'admin@parkir.app', '081234567890', 'admin', 1),
('operator1', '$2b$10$KiXyY8Q8Xj3q0Y7QzQz0ze.J2j5B5P0C5S5X5V5Z5Q5Y5C5E5G5', 'Operator 1', 'operator1@parkir.app', '081234567891', 'operator', 1),
('manager1', '$2b$10$KiXyY8Q8Xj3q0Y7QzQz0ze.J2j5B5P0C5S5X5V5Z5Q5Y5C5E5G5', 'Manager 1', 'manager1@parkir.app', '081234567892', 'manager', 1);

-- Insert Parking Types
INSERT INTO m_jenis_parkir (nama_jenis, deskripsi) VALUES
('Parkir Mobil', 'Area parkir untuk mobil penumpang'),
('Parkir Motor', 'Area parkir untuk sepeda motor'),
('Parkir Truk', 'Area parkir untuk truk dan kendaraan besar'),
('Parkir Bus', 'Area parkir khusus untuk bus');

-- Insert Pricing for Each Parking Type
INSERT INTO m_tarif_parkir (id_jenis_parkir, tarif_per_jam, tarif_per_hari, tarif_bulanan, status) VALUES
(1, 5000.00, 30000.00, 400000.00, 'aktif'),
(2, 2000.00, 15000.00, 200000.00, 'aktif'),
(3, 10000.00, 60000.00, 800000.00, 'aktif'),
(4, 15000.00, 100000.00, 1200000.00, 'aktif');

-- Insert Parking Areas
INSERT INTO tb_arf (nama_area, kapasitas, status) VALUES
('Area A - Lantai 1', 50, 'aktif'),
('Area B - Lantai 2', 50, 'aktif'),
('Area C - Lantai 3', 40, 'aktif'),
('Area D - Outdoor', 100, 'aktif'),
('Area E - VIP', 20, 'aktif');

-- Insert Sample Vehicles (Optional)
INSERT INTO m_kendaraan (no_polisi, jenis_kendaraan, warna, tahun_pembuatan, tipe_kendaraan, pemilik_nama, pemilik_no_telepon) VALUES
('B 1234 ABC', 'mobil', 'Putih', 2022, 'Toyota Avanza', 'Budi Santoso', '081234567890'),
('B 5678 DEF', 'motor', 'Hitam', 2023, 'Honda Vario', 'Ahmad Riyana', '081234567891'),
('B 9012 GHI', 'mobil', 'Silver', 2021, 'Daihatsu Xenia', 'Siti Nurhaliza', '081234567892'),
('B 3456 JKL', 'motor', 'Merah', 2023, 'Yamaha Nmax', 'Rizki Pradana', '081234567893'),
('B 7890 MNO', 'truk', 'Biru', 2020, 'Hino Lohan', 'CV Maju Jaya', '081234567894');

-- Activity Log Example
INSERT INTO tb_log_aktivitas (id_user, deskripsi_aksi) VALUES
(1, 'Database initialized and seeded with initial data'),
(1, 'System ready for operation');
