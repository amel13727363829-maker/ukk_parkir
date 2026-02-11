CREATE DATABASE IF NOT EXISTS `parkir_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `parkir_db`;
-- Create Database
CREATE DATABASE IF NOT EXISTS parkir_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parkir_db;

-- Table: m_user (Users/Admins)
CREATE TABLE IF NOT EXISTS m_user (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  no_telepon VARCHAR(20),
  role ENUM('admin', 'operator', 'manager') DEFAULT 'operator',
    role ENUM('admin', 'operator', 'manager', 'owner', 'petugas') DEFAULT 'operator',
  status_aktif TINYINT(1) DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: m_kendaraan (Vehicles)
CREATE TABLE IF NOT EXISTS m_kendaraan (
  id_kendaraan INT AUTO_INCREMENT PRIMARY KEY,
  no_polisi VARCHAR(20) NOT NULL UNIQUE,
  jenis_kendaraan ENUM('mobil', 'motor', 'truk', 'bus') DEFAULT 'mobil',
  warna VARCHAR(50),
  tahun_pembuatan INT,
  tipe_kendaraan VARCHAR(50),
  pemilik_nama VARCHAR(100),
  pemilik_no_telepon VARCHAR(20),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_no_polisi (no_polisi),
  INDEX idx_jenis_kendaraan (jenis_kendaraan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: m_jenis_parkir (Parking Types)
CREATE TABLE IF NOT EXISTS m_jenis_parkir (
  id_jenis_parkir INT AUTO_INCREMENT PRIMARY KEY,
  nama_jenis VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nama_jenis (nama_jenis)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: m_tarif_parkir (Pricing)
CREATE TABLE IF NOT EXISTS m_tarif_parkir (
  id_tarif INT AUTO_INCREMENT PRIMARY KEY,
  id_jenis_parkir INT NOT NULL,
  tarif_per_jam DECIMAL(10, 2) NOT NULL,
  tarif_per_hari DECIMAL(10, 2) NOT NULL,
  tarif_bulanan DECIMAL(10, 2),
  status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_jenis_parkir) REFERENCES m_jenis_parkir(id_jenis_parkir) ON DELETE RESTRICT,
  INDEX idx_jenis_parkir (id_jenis_parkir)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: tb_arf (Parking Areas)
CREATE TABLE IF NOT EXISTS tb_arf (
  id_arf INT AUTO_INCREMENT PRIMARY KEY,
  nama_area VARCHAR(100) NOT NULL,
  kapasitas INT NOT NULL,
  status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nama_area (nama_area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: transaksi (Transactions/Parking Sessions)
CREATE TABLE IF NOT EXISTS transaksi (
  id_transaksi INT AUTO_INCREMENT PRIMARY KEY,
  id_kendaraan INT NOT NULL,
  id_jenis_parkir INT NOT NULL,
  id_arf INT NOT NULL,
  waktu_masuk TIMESTAMP NOT NULL,
  waktu_keluar TIMESTAMP,
  lama_parkir INT COMMENT 'Duration in minutes',
  tarif_parkir DECIMAL(10, 2),
  total_bayar DECIMAL(10, 2),
  status_pembayaran ENUM('belum_bayar', 'lunas') DEFAULT 'belum_bayar',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_kendaraan) REFERENCES m_kendaraan(id_kendaraan) ON DELETE RESTRICT,
  FOREIGN KEY (id_jenis_parkir) REFERENCES m_jenis_parkir(id_jenis_parkir) ON DELETE RESTRICT,
  FOREIGN KEY (id_arf) REFERENCES tb_arf(id_arf) ON DELETE RESTRICT,
  INDEX idx_kendaraan (id_kendaraan),
  INDEX idx_waktu_masuk (waktu_masuk),
  INDEX idx_status_pembayaran (status_pembayaran)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: tb_log_aktivitas (Activity Logs)
CREATE TABLE IF NOT EXISTS tb_log_aktivitas (
  id_log INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT,
  deskripsi_aksi TEXT NOT NULL,
  waktu_aksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES m_user(id_user) ON DELETE SET NULL,
  INDEX idx_user (id_user),
  INDEX idx_waktu_aksi (waktu_aksi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
