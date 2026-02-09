# ✅ Sistem Parkir Plus - Login Information

## Status Sistem
- ✅ Backend: Running on http://localhost:5001
- ✅ Frontend: Running on http://localhost:3000 (atau :3001 jika port busy)
- ✅ Database: Connected dan ter-setup dengan benar
- ✅ Users: Ready untuk login

## Login Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin
- **Status:** Active ✓

### Operator Account (jika ada)
- **Username:** `petugas2`
- **Role:** Petugas
- **Status:** Active ✓

## Cara Login

1. **Buka Frontend:**
   - http://localhost:3000 (atau :3001 jika :3000 busy)

2. **Masukkan Credentials:**
   - Username: `admin`
   - Password: `admin123`

3. **Klik "Masuk"**
   - Sistem akan validate di backend
   - Token akan disimpan ke localStorage
   - Redirect ke dashboard

## Troubleshooting

### Jika Login Gagal:

1. **Cek Backend Running:**
   ```
   netstat -ano | findstr :5001
   ```

2. **Cek Frontend Running:**
   ```
   netstat -ano | findstr :3000
   ```

3. **Verify Credentials di Database:**
   ```
   node c:\laragon\www\parkir\backend\verify-setup.js
   ```

4. **Restart Services:**
   ```
   # Terminal 1 - Backend
   cd c:\laragon\www\parkir\backend
   node src\index.js

   # Terminal 2 - Frontend
   cd c:\laragon\www\parkir\frontend
   npm run dev
   ```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | Login |
| `/api/v1/auth/register` | POST | Register |
| `/api/v1/auth/profile` | GET | Get user profile |

## Quick Test Commands

```bash
# Verify database users
cd c:\laragon\www\parkir\backend && node verify-setup.js

# Check running ports
netstat -ano | findstr LISTEN | findstr ":3000\|:3001\|:5001"
```

---
Generated: Feb 6, 2026
