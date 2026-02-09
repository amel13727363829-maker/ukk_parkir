# Dokumentasi Struktur Backend & Frontend - Aplikasi Parkir

## 📁 STRUKTUR BACKEND (Express.js + MySQL)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Konfigurasi koneksi MySQL
│   │   └── environment.js        # Konfigurasi environment variables
│   │
│   ├── controllers/
│   │   ├── kendaraanController.js
│   │   ├── jenisParkirController.js
│   │   ├── userController.js
│   │   ├── tarifParkirController.js
│   │   ├── transaksiController.js
│   │   ├── arfController.js
│   │   ├── logAktivitasController.js
│   │   └── authController.js
│   │
│   ├── models/
│   │   ├── Kendaraan.js
│   │   ├── JenisParkir.js
│   │   ├── User.js
│   │   ├── TarifParkir.js
│   │   ├── Transaksi.js
│   │   ├── Arf.js
│   │   ├── LogAktivitas.js
│   │   └── index.js             # Export semua models
│   │
│   ├── routes/
│   │   ├── kendaraan.js
│   │   ├── jenisParkir.js
│   │   ├── user.js
│   │   ├── tarifParkir.js
│   │   ├── transaksi.js
│   │   ├── arf.js
│   │   ├── logAktivitas.js
│   │   ├── auth.js
│   │   └── index.js             # Main router
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── validationMiddleware.js
│   │   ├── corsMiddleware.js
│   │   └── loggerMiddleware.js
│   │
│   ├── services/
│   │   ├── kendaraanService.js
│   │   ├── transaksiService.js
│   │   ├── authService.js
│   │   ├── reportService.js
│   │   └── emailService.js
│   │
│   ├── validators/
│   │   ├── kendaraanValidator.js
│   │   ├── userValidator.js
│   │   ├── transaksiValidator.js
│   │   └── authValidator.js
│   │
│   ├── utils/
│   │   ├── tokenGenerator.js    # JWT token generation
│   │   ├── passwordHelper.js    # Password hashing
│   │   ├── dateHelper.js
│   │   └── responseFormatter.js # Standard API response
│   │
│   └── index.js                 # Entry point aplikasi
│
├── migrations/                  # Database migrations
│   ├── 001_create_users.js
│   ├── 002_create_kendaraan.js
│   └── ...
│
├── seeders/                     # Database seeders
│   ├── demo_users.js
│   ├── demo_kendaraan.js
│   └── ...
│
├── package.json
├── .env.example
├── .gitignore
└── tsconfig.json
```

## 📁 STRUKTUR FRONTEND (Next.js 14)

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Home page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── kendaraan/
│   │   │   ├── transaksi/
│   │   │   ├── laporan/
│   │   │   └── pengaturan/
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── api/                        # API routes (optional)
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Loading.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── KendaraanForm.tsx
│   │   │   ├── TransaksiForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── TarifForm.tsx
│   │   │
│   │   ├── tables/
│   │   │   ├── KendaraanTable.tsx
│   │   │   ├── TransaksiTable.tsx
│   │   │   ├── UserTable.tsx
│   │   │   └── DataTable.tsx            # Reusable component
│   │   │
│   │   ├── charts/
│   │   │   ├── PenghasilanChart.tsx
│   │   │   ├── AktivitasChart.tsx
│   │   │   └── StatisticCard.tsx
│   │   │
│   │   └── layout/
│   │       ├── Navigation.tsx
│   │       ├── Sidebar.tsx
│   │       └── ProtectedRoute.tsx       # Auth guard
│   │
│   ├── services/
│   │   ├── api.ts                       # Axios instance config
│   │   ├── kendaraanService.ts
│   │   ├── transaksiService.ts
│   │   ├── userService.ts
│   │   ├── authService.ts
│   │   └── reportService.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                   # Authentication hook
│   │   ├── useKendaraan.ts
│   │   ├── useTransaksi.ts
│   │   ├── useFetch.ts
│   │   └── useForm.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts                 # Zustand store
│   │   ├── uiStore.ts
│   │   └── dataStore.ts
│   │
│   ├── types/
│   │   ├── index.ts                     # Main types file
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── auth.ts
│   │
│   ├── styles/
│   │   ├── globals.css                  # Global styles
│   │   ├── variables.css                # CSS variables
│   │   └── components.css
│   │
│   └── utils/
│       ├── formatting.ts                # Format functions
│       ├── validation.ts
│       ├── constants.ts
│       ├── dateHelper.ts
│       └── errorHandler.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── package.json
├── .env.example
├── .gitignore
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## 📦 LIBRARY YANG DIGUNAKAN

### Backend Dependencies:

| Library | Version | Fungsi |
|---------|---------|--------|
| express | 4.18.2 | Web framework utama |
| mysql2 | 3.6.5 | MySQL driver |
| sequelize | 6.35.2 | ORM untuk database |
| dotenv | 16.3.1 | Environment variables |
| cors | 2.8.5 | Cross-origin requests |
| helmet | 7.1.0 | Security headers |
| joi | 17.11.0 | Schema validation |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.1.2 | JWT authentication |
| express-validator | 7.0.0 | Input validation middleware |

### Backend DevDependencies:

| Library | Version | Fungsi |
|---------|---------|--------|
| nodemon | 3.0.2 | Auto-reload development server |
| jest | 29.7.0 | Testing framework |
| supertest | 6.3.3 | HTTP assertion library |

### Frontend Dependencies:

| Library | Version | Fungsi |
|---------|---------|--------|
| next | 14.0.4 | React framework |
| react | 18.2.0 | UI library |
| react-dom | 18.2.0 | React rendering |
| axios | 1.6.2 | HTTP client |
| zustand | 4.4.6 | State management |
| react-hook-form | 7.48.1 | Form management |
| tailwindcss | 3.3.6 | CSS framework |
| react-icons | 4.13.0 | Icon library |
| chart.js | 4.4.1 | Chart library |
| react-chartjs-2 | 5.2.0 | React chart wrapper |
| date-fns | 2.30.0 | Date utilities |
| sonner | 1.3.0 | Toast notifications |

### Frontend DevDependencies:

| Library | Version | Fungsi |
|---------|---------|--------|
| typescript | 5.3.3 | Type safety |
| autoprefixer | 10.4.16 | CSS vendor prefixes |
| postcss | 8.4.32 | CSS processor |

## 🗄️ DATABASE SCHEMA (dari ERD)

```sql
-- Master Data Tables

CREATE TABLE m_user (
  id_user INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  no_telepon VARCHAR(15),
  role ENUM('admin', 'operator', 'manager') NOT NULL,
  status_aktif TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE m_kendaraan (
  id_kendaraan INT PRIMARY KEY AUTO_INCREMENT,
  no_polisi VARCHAR(20) UNIQUE NOT NULL,
  jenis_kendaraan VARCHAR(50),
  warna VARCHAR(20),
  tahun_pembuatan INT,
  tipe_kendaraan VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE m_jenis_parkir (
  id_jenis_parkir INT PRIMARY KEY AUTO_INCREMENT,
  nama_jenis VARCHAR(50) NOT NULL,
  deskripsi VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE m_tarif_parkir (
  id_tarif INT PRIMARY KEY AUTO_INCREMENT,
  id_jenis_parkir INT NOT NULL,
  tarif_per_jam DECIMAL(10, 2) NOT NULL,
  tarif_per_hari DECIMAL(10, 2),
  tarif_bulanan DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_jenis_parkir) REFERENCES m_jenis_parkir(id_jenis_parkir)
);

CREATE TABLE tb_arf (
  id_arf INT PRIMARY KEY AUTO_INCREMENT,
  nama_area VARCHAR(100) NOT NULL,
  kapasitas INT NOT NULL,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE transaksi (
  id_transaksi INT PRIMARY KEY AUTO_INCREMENT,
  id_kendaraan INT NOT NULL,
  id_jenis_parkir INT NOT NULL,
  id_arf INT,
  waktu_masuk DATETIME NOT NULL,
  waktu_keluar DATETIME,
  lama_parkir INT,
  tarif_parkir DECIMAL(10, 2),
  total_bayar DECIMAL(10, 2),
  status_pembayaran ENUM('belum_bayar', 'lunas') DEFAULT 'belum_bayar',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_kendaraan) REFERENCES m_kendaraan(id_kendaraan),
  FOREIGN KEY (id_jenis_parkir) REFERENCES m_jenis_parkir(id_jenis_parkir),
  FOREIGN KEY (id_arf) REFERENCES tb_arf(id_arf)
);

CREATE TABLE tb_log_aktivitas (
  id_log INT PRIMARY KEY AUTO_INCREMENT,
  id_user INT,
  deskripsi_aksi VARCHAR(255),
  waktu_aksi DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES m_user(id_user)
);
```

## 🚀 API Endpoints Overview (akan dibuat di Bagian 2)

```
Authentication:
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token

Kendaraan:
GET    /api/v1/kendaraan
GET    /api/v1/kendaraan/:id
POST   /api/v1/kendaraan
PUT    /api/v1/kendaraan/:id
DELETE /api/v1/kendaraan/:id

Transaksi:
GET    /api/v1/transaksi
GET    /api/v1/transaksi/:id
POST   /api/v1/transaksi/checkin
POST   /api/v1/transaksi/checkout
PUT    /api/v1/transaksi/:id

User:
GET    /api/v1/user
GET    /api/v1/user/:id
POST   /api/v1/user
PUT    /api/v1/user/:id
DELETE /api/v1/user/:id

Laporan:
GET    /api/v1/laporan/harian
GET    /api/v1/laporan/bulanan
GET    /api/v1/laporan/penghasilan
```

## ✅ Persiapan Lengkap!

Struktur folder dan library sudah siap. Untuk melanjutkan ke **Bagian 2**, kita akan:

1. ✓ Setup database MySQL (create tables)
2. ✓ Implementasi Sequelize models
3. ✓ Setup authentication (JWT)
4. ✓ Implementasi API endpoints
5. ✓ Implementasi frontend pages & components
6. ✓ Integration & testing

---
Siap untuk eksekusi! 🎯
