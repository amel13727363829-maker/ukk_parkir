# 🚀 Parkir Plus - Quick Start Guide

## ✅ System Status

### Backend
- **Status:** ✅ Running
- **Port:** 5001
- **URL:** http://localhost:5001
- **Database:** parkir_db (MySQL)
- **Start Command:** `cd backend && npm run dev`

### Frontend
- **Status:** ✅ Running
- **Port:** 3000
- **URL:** http://localhost:3000
- **Start Command:** `cd frontend && npm run dev`

### Database
- **Status:** ✅ Initialized
- **Database:** parkir_db
- **Tables:** 7 (User, Kendaraan, JenisParkir, TarifParkir, Arf, Transaksi, LogAktivitas)
- **Data:** Seeded with initial data
- **Init Command:** `cd backend && npm run seed`

---

## 🧪 Testing the System

### Option 1: Via Browser (Recommended for Testing)

1. **Open Frontend**
   ```
   http://localhost:3000
   ```

2. **Login Page**
   - Use one of the test accounts below
   - Automatic redirect to dashboard after successful login

3. **Dashboard**
   - View summary statistics
   - Access management pages via sidebar
   - Logout functionality in header

### Option 2: Via API (cURL/Postman)

1. **Login to Get Token**
   ```bash
   curl -X POST http://localhost:5001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "password": "admin123"
     }'
   ```

2. **Use Token for Authenticated Requests**
   ```bash
   curl -X GET http://localhost:5001/api/v1/kendaraan \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

---

## 👤 Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Operator | `operator1` | `operator123` |
| Manager | `manager1` | `manager123` |

---

## 📁 Project Structure

```
parkir/
├── backend/                    # Express.js + Sequelize
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── models/            # Sequelize ORM models (7 tables)
│   │   ├── controllers/       # Business logic (8 controllers)
│   │   ├── routes/            # API endpoints (8 route files)
│   │   ├── middleware/        # Auth, logging, error handling
│   │   ├── utils/             # JWT, password, response formatting
│   │   └── index.js           # Express server entry point
│   ├── scripts/
│   │   └── seed.js            # Database seeding script
│   ├── database/
│   │   ├── schema.sql         # Database schema
│   │   └── seed.sql           # Initial data SQL
│   ├── package.json
│   └── .env                   # Environment variables
│
├── frontend/                   # Next.js + React
│   ├── src/
│   │   ├── app/               # App router pages
│   │   │   ├── page.tsx       # Home (redirects)
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Register page
│   │   │   └── dashboard/     # Dashboard layout
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks (useProtectedRoute, useApi, useAuthInit)
│   │   ├── services/          # API services (authService)
│   │   ├── stores/            # Zustand stores (authStore)
│   │   ├── styles/            # Global CSS + Tailwind
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   ├── package.json
│   └── .env.local             # Environment variables
│
├── DATABASE_SETUP.md          # Database setup instructions
├── API_TESTING.md             # API endpoint reference
└── QUICK_START.md             # This file
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=parkir_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_min_32_chars
CORS_ORIGIN=http://localhost:3000
PORT=5001
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_APP_NAME=Parkir Plus
NEXT_PUBLIC_APP_DESCRIPTION=Sistem Manajemen Parkir Modern
```

---

## 📚 Core Features Implemented

### ✅ Authentication & Authorization
- [x] User registration with password hashing (bcrypt)
- [x] Login with JWT token generation (24h expiry)
- [x] Role-based access control (Admin, Operator, Manager)
- [x] Protected routes with automatic redirects
- [x] Token persistence in localStorage
- [x] Automatic logout on token expiry

### ✅ Database & Models
- [x] 7 Sequelize ORM models with relationships
- [x] UTF-8mb4 encoding for Indonesian characters
- [x] Timezone support (+07:00 WIB)
- [x] Data validation and constraints
- [x] Foreign key relationships
- [x] Activity logging for audit trail

### ✅ Backend API
- [x] 30+ endpoints across 8 route files
- [x] Request/response validation
- [x] Global error handling
- [x] Pagination support
- [x] Search functionality
- [x] Activity logging middleware

### ✅ Frontend
- [x] Next.js 14 app directory structure
- [x] TypeScript support
- [x] Tailwind CSS responsive design
- [x] React Hook Form validation
- [x] Zustand state management
- [x] Axios API client with interceptors
- [x] Login/Register pages
- [x] Dashboard layout with sidebar
- [x] Protected routes

---

## 🔄 Key Workflows

### 1. User Login Flow
```
User enters credentials
  ↓
API validates and returns JWT token
  ↓
Token stored in localStorage
  ↓
Zustand store updated with user data
  ↓
Automatic redirect to dashboard
  ↓
Token automatically added to API requests
```

### 2. Vehicle Check-In Flow
```
Select vehicle, parking type, and area
  ↓
POST /transaksi/checkin creates transaction
  ↓
Transaction record created with waktu_masuk
  ↓
Prevents duplicate check-in for same vehicle
```

### 3. Vehicle Check-Out Flow
```
GET transaction by ID
  ↓
PUT /transaksi/:id/checkout
  ↓
Calculate duration: (waktu_keluar - waktu_masuk) in minutes
  ↓
Determine tariff: hourly if ≤24h, daily if >24h
  ↓
Calculate total: tariff × duration (with ceiling)
  ↓
Update transaction with cost and timestamp
```

---

## 🐛 Troubleshooting

### Backend won't start
1. Check MySQL is running
2. Verify database exists: `parkir_db`
3. Check `.env` credentials
4. Run `npm install` in backend folder
5. Check port 5001 isn't in use

### Frontend won't start
1. Run `npm install` in frontend folder
2. Check `.env.local` API_URL points to backend
3. Verify Node.js version (18+)
4. Clear `.next` folder and rebuild

### Can't login
1. Verify backend is running on 5001
2. Check frontend `.env.local` API_URL
3. Verify test credentials match seeded data
4. Check browser console for error messages

### Database errors
1. Verify MySQL connection: `mysql -u root`
2. Check database exists: `SHOW DATABASES;`
3. Reinitialize with: `npm run seed` in backend
4. Check `.env` credentials match MySQL setup

---

## 📊 Database Schema Quick Reference

### m_user
- id_user (PK), username, password, nama_lengkap, email, no_telepon, role, status_aktif

### m_kendaraan
- id_kendaraan (PK), no_polisi (UNIQUE), jenis_kendaraan, warna, tahun_pembuatan, tipe_kendaraan

### m_jenis_parkir
- id_jenis_parkir (PK), nama_jenis, deskripsi

### m_tarif_parkir
- id_tarif (PK), id_jenis_parkir (FK), tarif_per_jam, tarif_per_hari, tarif_bulanan

### tb_arf
- id_arf (PK), nama_area, kapasitas, status

### transaksi
- id_transaksi (PK), id_kendaraan (FK), id_jenis_parkir (FK), id_arf (FK), waktu_masuk, waktu_keluar, lama_parkir, tarif_parkir, total_bayar, status_pembayaran

### tb_log_aktivitas
- id_log (PK), id_user (FK), deskripsi_aksi, waktu_aksi

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| [DATABASE_SETUP.md](DATABASE_SETUP.md) | Database initialization and migration guide |
| [API_TESTING.md](API_TESTING.md) | Complete API endpoint reference with examples |
| [QUICK_START.md](QUICK_START.md) | This file - quick overview |

---

## 🚦 Next Steps

### Immediate
1. [x] Test login with: admin/admin123
2. [x] View dashboard after login
3. [x] Verify API connectivity

### Short Term
- [ ] Create CRUD pages for Kendaraan management
- [ ] Create CRUD pages for Transaksi management
- [ ] Implement search and filtering
- [ ] Add data table components

### Medium Term
- [ ] Create Admin dashboard with statistics
- [ ] Implement payment processing
- [ ] Add reporting/export features
- [ ] Create audit log viewer

### Long Term
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] QR code payment
- [ ] Analytics dashboard
- [ ] Production deployment

---

## 📞 Support

For detailed API documentation, see [API_TESTING.md](API_TESTING.md)

For database setup issues, see [DATABASE_SETUP.md](DATABASE_SETUP.md)

---

**System Ready! 🎉**

Start testing:
1. Open http://localhost:3000
2. Login with admin/admin123
3. Explore the dashboard

Selamat menggunakan Parkir Plus! 🚗
