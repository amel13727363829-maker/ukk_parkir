# 🧪 API Testing Guide

## Setup

### Backend Running
- ✅ Server: `http://localhost:5001`
- ✅ Database: `parkir_db` connected
- ✅ All routes configured

### Frontend Running
- ✅ Server: `http://localhost:3000`
- ✅ Ready for login testing

---

## Authentication Endpoints

### 1. Login
**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id_user": 1,
      "username": "admin",
      "nama_lengkap": "Administrator",
      "email": "admin@parkir.app",
      "role": "admin",
      "status_aktif": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Test Credentials:**
- **Admin:** `admin` / `admin123`
- **Operator:** `operator1` / `operator123`
- **Manager:** `manager1` / `manager123`

---

### 2. Register
**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "username": "newuser",
  "password": "password123",
  "nama_lengkap": "New User",
  "email": "newuser@parkir.app",
  "no_telepon": "081234567890"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

---

### 3. Get Current User
**Endpoint:** `GET /api/v1/auth/profile`  
**Auth:** Required (Bearer Token)

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id_user": 1,
    "username": "admin",
    ...
  }
}
```

---

### 4. Change Password
**Endpoint:** `PUT /api/v1/auth/change-password`  
**Auth:** Required

**Request:**
```json
{
  "old_password": "admin123",
  "new_password": "newpassword123"
}
```

---

## Vehicle Endpoints

### 1. Get All Vehicles
**Endpoint:** `GET /api/v1/kendaraan?page=1&limit=10&search=B1234`  
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "message": "Data kendaraan retrieved",
  "data": [
    {
      "id_kendaraan": 1,
      "no_polisi": "B 1234 ABC",
      "jenis_kendaraan": "mobil",
      "warna": "Putih",
      "tahun_pembuatan": 2022,
      "tipe_kendaraan": "Toyota Avanza",
      "pemilik_nama": "Budi Santoso",
      "pemilik_no_telepon": "081234567890"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 2. Create Vehicle
**Endpoint:** `POST /api/v1/kendaraan`  
**Auth:** Required

**Request:**
```json
{
  "no_polisi": "B 9999 XYZ",
  "jenis_kendaraan": "mobil",
  "warna": "Merah",
  "tahun_pembuatan": 2023,
  "tipe_kendaraan": "Honda CR-V",
  "pemilik_nama": "Siti Aisyah",
  "pemilik_no_telepon": "081234567895"
}
```

### 3. Update Vehicle
**Endpoint:** `PUT /api/v1/kendaraan/:id`  
**Auth:** Required

### 4. Delete Vehicle
**Endpoint:** `DELETE /api/v1/kendaraan/:id`  
**Auth:** Required  
**Note:** Cannot delete if vehicle has transactions

---

## Parking Type Endpoints

### Get All Parking Types
**Endpoint:** `GET /api/v1/jenis-parkir`  
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "message": "Data jenis parkir retrieved",
  "data": [
    {
      "id_jenis_parkir": 1,
      "nama_jenis": "Parkir Mobil",
      "deskripsi": "Area parkir untuk mobil penumpang",
      "tarif": [
        {
          "id_tarif": 1,
          "tarif_per_jam": 5000,
          "tarif_per_hari": 30000,
          "tarif_bulanan": 400000
        }
      ]
    }
  ]
}
```

---

## Pricing Endpoints

### Get All Pricing
**Endpoint:** `GET /api/v1/tarif?page=1&limit=10`  
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_tarif": 1,
      "id_jenis_parkir": 1,
      "tarif_per_jam": 5000,
      "tarif_per_hari": 30000,
      "tarif_bulanan": 400000,
      "status": "aktif"
    }
  ]
}
```

### Create Pricing
**Endpoint:** `POST /api/v1/tarif`  
**Auth:** Required

**Request:**
```json
{
  "id_jenis_parkir": 1,
  "tarif_per_jam": 6000,
  "tarif_per_hari": 35000,
  "tarif_bulanan": 450000
}
```

---

## Parking Area Endpoints

### Get All Areas
**Endpoint:** `GET /api/v1/area`  
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_arf": 1,
      "nama_area": "Area A - Lantai 1",
      "kapasitas": 50,
      "status": "aktif"
    }
  ]
}
```

### Create Area
**Endpoint:** `POST /api/v1/area`  
**Auth:** Required

**Request:**
```json
{
  "nama_area": "Area F - Basement",
  "kapasitas": 30,
  "status": "aktif"
}
```

---

## Transaction Endpoints

### 1. Check-In (Create Transaction)
**Endpoint:** `POST /api/v1/transaksi/checkin`  
**Auth:** Required

**Request:**
```json
{
  "id_kendaraan": 1,
  "id_jenis_parkir": 1,
  "id_arf": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in berhasil",
  "data": {
    "id_transaksi": 1,
    "id_kendaraan": 1,
    "id_jenis_parkir": 1,
    "id_arf": 1,
    "waktu_masuk": "2026-01-27T06:30:00.000Z",
    "status_pembayaran": "belum_bayar"
  }
}
```

### 2. Check-Out
**Endpoint:** `PUT /api/v1/transaksi/:id/checkout`  
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "message": "Check-out berhasil",
  "data": {
    "id_transaksi": 1,
    "waktu_keluar": "2026-01-27T07:00:00.000Z",
    "lama_parkir": 30,
    "tarif_parkir": 5000,
    "total_bayar": 5000,
    "status_pembayaran": "belum_bayar"
  }
}
```

**Cost Calculation Logic:**
- If duration ≤ 24 hours: use hourly rate
- If duration > 24 hours: use daily rate
- For partial hours/days: ceiling function applied

### 3. Update Payment Status
**Endpoint:** `PUT /api/v1/transaksi/:id/payment`  
**Auth:** Required

**Request:**
```json
{
  "status_pembayaran": "lunas"
}
```

### 4. Get All Transactions
**Endpoint:** `GET /api/v1/transaksi?status_pembayaran=belum_bayar&page=1&limit=10`  
**Auth:** Required

**Query Parameters:**
- `status_pembayaran`: Filter by payment status (belum_bayar/lunas)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

---

## User Management Endpoints (Admin Only)

### Get All Users
**Endpoint:** `GET /api/v1/user?page=1&limit=10&role=admin`  
**Auth:** Required (Admin only)

**Query Parameters:**
- `role`: Filter by role (admin/operator/manager)
- `page`: Page number
- `limit`: Items per page

### Create User
**Endpoint:** `POST /api/v1/user`  
**Auth:** Required (Admin only)

**Request:**
```json
{
  "username": "newoperator",
  "password": "password123",
  "nama_lengkap": "New Operator",
  "email": "operator@parkir.app",
  "no_telepon": "081234567899",
  "role": "operator",
  "status_aktif": true
}
```

### Reset Password
**Endpoint:** `PUT /api/v1/user/:id/reset-password`  
**Auth:** Required (Admin only)

**Request:**
```json
{
  "new_password": "newpass123"
}
```

### Delete User
**Endpoint:** `DELETE /api/v1/user/:id`  
**Auth:** Required (Admin only)  
**Note:** Cannot delete own account

---

## Activity Logs (Admin Only)

### Get All Logs
**Endpoint:** `GET /api/v1/logs?user_id=1&page=1&limit=10`  
**Auth:** Required (Admin only)

### Clear Old Logs
**Endpoint:** `DELETE /api/v1/logs/clear`  
**Auth:** Required (Admin only)

**Request:**
```json
{
  "days": 30
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Username wajib diisi"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token tidak valid atau expired"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Akses ditolak. Role tidak sesuai."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Data tidak ditemukan"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Data sudah ada (duplicate entry)"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Using Bearer Token

All authenticated endpoints require the token in the Authorization header:

```
Authorization: Bearer <token_dari_login>
```

**Example using curl:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5001/api/v1/kendaraan
```

---

## Testing with Postman

1. **Import Base URL:** Set collection variable `{{BASE_URL}}` = `http://localhost:5001/api/v1`
2. **Store Token:** After login, save token in environment variable `{{TOKEN}}`
3. **Auto-inject:** Set Authorization header to `Bearer {{TOKEN}}`
4. **Test Flows:**
   - Register → Login → Get Profile
   - Create Vehicle → Get Vehicles
   - Check-In → Check-Out → Update Payment
   - Create Tariff → Update Tariff

---

## Quick Test Sequence

```bash
# 1. Login
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Get Vehicles (replace TOKEN)
curl -X GET http://localhost:5001/api/v1/kendaraan \
  -H "Authorization: Bearer TOKEN"

# 3. Create Vehicle
curl -X POST http://localhost:5001/api/v1/kendaraan \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "no_polisi":"B 1111 AAA",
    "jenis_kendaraan":"mobil",
    "warna":"Putih",
    "tahun_pembuatan":2023,
    "tipe_kendaraan":"Toyota",
    "pemilik_nama":"Test",
    "pemilik_no_telepon":"08123"
  }'

# 4. Check-In
curl -X POST http://localhost:5001/api/v1/transaksi/checkin \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_kendaraan":1,
    "id_jenis_parkir":1,
    "id_arf":1
  }'
```

---

## Frontend Testing

Navigate to:
- **Login:** http://localhost:3000/login
- **Register:** http://localhost:3000/register
- **Dashboard:** http://localhost:3000/dashboard (after login)

**Test Flow:**
1. Click "Register" to create new account
2. Login with your credentials
3. Dashboard should show after successful authentication
4. Sidebar navigation to manage entities

---

## Troubleshooting

### "Token tidak valid"
- Ensure token is passed in Authorization header as `Bearer <token>`
- Token expires after 24 hours - login again

### "Database connection failed"
- Verify MySQL is running
- Check `.env` database credentials
- Run `npm run seed` to reinitialize

### "Route not found"
- Check API base URL is `http://localhost:5001/api/v1`
- Verify backend is running: `npm run dev` in backend folder

### "CORS error"
- Backend CORS is configured for `http://localhost:3000`
- Frontend `.env.local` should have `NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1`

---

## Next Steps

- [ ] Create CRUD pages for Kendaraan, Transaksi, Area, Tarif
- [ ] Implement data tables with sorting/filtering
- [ ] Add reporting/dashboard statistics
- [ ] Create comprehensive test suite
- [ ] Deploy to production
