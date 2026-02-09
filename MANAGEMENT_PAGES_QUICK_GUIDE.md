# 🚀 Quick Start Guide - Management Pages

## What Was Just Created?

Six fully-functional management pages for the **Parkir Plus** parking management system:

| Page | Path | Purpose | Features |
|------|------|---------|----------|
| 🚗 Vehicles | `/dashboard/kendaraan` | Manage vehicle registry | CRUD, Search, Pagination |
| 💳 Transactions | `/dashboard/transaksi` | Track parking & payments | Status filter, Payment confirm |
| 🅿️ Areas | `/dashboard/area` | Manage parking zones | CRUD, Capacity, Pricing |
| 💰 Pricing | `/dashboard/tarif` | Configure rates | Link to types, Duration-based |
| 📑 Types | `/dashboard/jenis-parkir` | Parking categories | CRUD, Descriptions |
| 👥 Users | `/dashboard/users` | Admin user management | Role assignment, Search |

---

## ⚡ Quick Start (5 Minutes)

### 1. Start Backend Server
```bash
cd backend
npm start
```
✅ Should see: `Connected to database successfully`

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
✅ Should see: `Ready in X.XXs`

### 3. Login to System
```
URL: http://localhost:3000
Username: admin
Password: admin123
```

### 4. Access Management Pages
```
Dashboard: http://localhost:3000/dashboard
Vehicles: http://localhost:3000/dashboard/kendaraan
Transactions: http://localhost:3000/dashboard/transaksi
Areas: http://localhost:3000/dashboard/area
Pricing: http://localhost:3000/dashboard/tarif
Types: http://localhost:3000/dashboard/jenis-parkir
Users: http://localhost:3000/dashboard/users (admin only)
```

---

## 🎯 Common Tasks

### Add a New Vehicle
1. Go to **Kendaraan** page
2. Click **"Tambah Kendaraan"** button
3. Fill form:
   - Plat Nomor: `B 1234 ABC`
   - Jenis: Select from dropdown
   - Warna: `Putih`
   - Tahun: `2023`
   - Tipe: `Toyota Avanza`
   - Pemilik: `Nama Lengkap`
   - Telepon: `081234567890`
4. Click **Simpan**

### Process a Payment
1. Go to **Transaksi** page
2. Filter by status: **"Belum Bayar"**
3. Find the transaction
4. Click green **checkmark** icon
5. Review details in modal
6. Click **Konfirmasi Pembayaran**
7. Status updates to **Lunas** ✅

### Create Pricing Rule
1. Go to **Tarif** page
2. Click **"Tambah Tarif"** button
3. Select parking type from dropdown
4. Enter duration (hours): `1`
5. Enter price (IDR): `5000`
6. Click **Simpan**

### Manage Users (Admin Only)
1. Log in with **admin** account
2. Go to **User Manajemen** page
3. Click **"Tambah Pengguna"**
4. Enter:
   - Username: `operator1`
   - Email: `operator1@parkir.com`
   - Password: `password123`
   - Role: Select `Operator`
5. Click **Simpan**

---

## 🔍 Troubleshooting

### Page Loads but Shows "Tidak ada data"
- **Check**: Is backend running? (http://localhost:5001)
- **Check**: Is database connected? (See backend console)
- **Check**: Are you logged in? (Token in localStorage)
- **Solution**: Refresh page, restart backend

### 403 Forbidden Error on Users Page
- **Issue**: Non-admin trying to access user management
- **Solution**: Log in with `admin` account instead

### Form Submission Fails
- **Check**: Are all required fields filled?
- **Check**: Is backend responding? (Check Network tab)
- **Solution**: Check browser console for error message

### Search Not Finding Results
- **Check**: Exact spelling match required
- **Try**: Search with partial text (first few letters)
- **Example**: Search "B 12" instead of "B 1234 ABC"

### Pagination Not Working
- **Check**: Do you have more than 10 items?
- **Check**: Are you on the last page?
- **Solution**: Add more data first

---

## 📊 Data Structure Reference

### Vehicle Data
```json
{
  "id_kendaraan": 1,
  "no_polisi": "B 1234 ABC",
  "jenis_kendaraan": "mobil",
  "warna": "Putih",
  "tahun_pembuatan": 2023,
  "tipe_kendaraan": "Toyota Avanza",
  "pemilik_nama": "John Doe",
  "pemilik_no_telepon": "081234567890"
}
```

### Transaction Data
```json
{
  "id_transaksi": 1,
  "id_kendaraan": 1,
  "id_arf": 1,
  "waktu_masuk": "2024-01-15T10:30:00",
  "waktu_keluar": "2024-01-15T12:45:00",
  "durasi_menit": 135,
  "biaya": 13500,
  "status_pembayaran": "paid"
}
```

### Area Data
```json
{
  "id_arf": 1,
  "nama_arf": "Lantai 1",
  "lokasi": "Gedung A",
  "kapasitas": 50,
  "harga_per_jam": 5000,
  "status": "aktif"
}
```

### Pricing Data
```json
{
  "id_tarif": 1,
  "id_jenis_parkir": 1,
  "durasi_jam": 1,
  "harga": 5000
}
```

---

## 🎨 UI Component Guide

### Status Badges
```
✅ Lunas (Green)    - Payment completed
⏳ Pending (Yellow) - Awaiting payment
❌ Belum Bayar (Red) - Unpaid
```

### Area Status
```
✅ Aktif (Green)       - Available for parking
❌ Nonaktif (Red)      - Not available
🔧 Maintenance (Yellow) - Under maintenance
```

### User Roles
```
👑 Admin (Red)     - Full system access
📊 Manager (Blue)  - Reports & analytics
👤 Operator (Green) - Data entry & transactions
```

---

## ⌨️ Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Close Modal | `Esc` |
| Search | `Ctrl+F` / `Cmd+F` (browser) |
| Next Page | Click "Next" button |
| Prev Page | Click "Prev" button |

---

## 📱 Mobile Usage

All pages are fully responsive:
- **Mobile**: 1-column layout, collapsible menu
- **Tablet**: 2-column layout
- **Desktop**: Full multi-column layout

**Tip**: Swipe to scroll tables on mobile devices

---

## 🔐 Security Notes

- ✅ JWT tokens expire after 24 hours
- ✅ Passwords are hashed with bcryptjs
- ✅ API requests require valid token
- ✅ Sensitive operations (delete) need confirmation
- ✅ Admin-only operations checked server-side

---

## 🐛 Debug Mode

To enable verbose logging:

```typescript
// In any component
const debug = process.env.NODE_ENV === 'development';
if (debug) console.log('Debug info:', data);
```

Check browser console (F12) for:
- API responses
- Error messages
- State changes
- Authentication tokens

---

## 📚 API Endpoint Reference

### Vehicles
- `GET /api/v1/kendaraan?page=1&limit=10&search=B%201234`
- `POST /api/v1/kendaraan` (body: vehicle data)
- `PUT /api/v1/kendaraan/:id` (body: updated data)
- `DELETE /api/v1/kendaraan/:id`

### Transactions
- `GET /api/v1/transaksi?page=1&limit=10&status=paid`
- `PUT /api/v1/transaksi/:id/payment` (body: status_pembayaran)

### Areas
- `GET /api/v1/arf?page=1&limit=10&search=Lantai`
- `POST /api/v1/arf` (body: area data)
- `PUT /api/v1/arf/:id` (body: updated data)
- `DELETE /api/v1/arf/:id`

### Pricing
- `GET /api/v1/tarif-parkir?page=1&limit=10`
- `GET /api/v1/jenis-parkir?limit=100` (for dropdown)
- `POST /api/v1/tarif-parkir` (body: pricing data)
- `PUT /api/v1/tarif-parkir/:id` (body: updated data)
- `DELETE /api/v1/tarif-parkir/:id`

### Users (Admin Only)
- `GET /api/v1/users?page=1&limit=10&search=admin`
- `POST /api/v1/users` (body: user data)
- `PUT /api/v1/users/:id` (body: updated data)
- `DELETE /api/v1/users/:id`

---

## 💾 Backup & Data Export

### Manual Data Backup
```bash
# Backup database
mysqldump -u root -p parkir_db > backup.sql

# Restore from backup
mysql -u root -p parkir_db < backup.sql
```

### CSV Export (Future Enhancement)
Currently available via API responses - can be copied and pasted to Excel.

---

## 🎓 Learning Path

1. **Understand Data Flow**
   - 📱 UI Component
   - 🔗 API Service
   - 💾 Backend Endpoint
   - 🗄️ Database

2. **Modify Existing Page**
   - Copy `/dashboard/kendaraan/page.tsx`
   - Update API endpoint
   - Modify form fields
   - Change column displays

3. **Create New Management Page**
   - Create folder: `/dashboard/newpage/`
   - Create `page.tsx` with CRUD logic
   - Add to sidebar menu in main dashboard
   - Create corresponding backend endpoint

4. **Add New Features**
   - Bulk operations
   - Export to CSV
   - Advanced filtering
   - Real-time search

---

## ✅ Verification Checklist

After starting the application:

- [ ] Both servers running (backend & frontend)
- [ ] Can log in with admin/admin123
- [ ] Dashboard shows statistics
- [ ] Vehicle page loads with data
- [ ] Can add/edit/delete vehicles
- [ ] Transaction page filters work
- [ ] Can confirm payments
- [ ] Area management works
- [ ] Pricing rules display correctly
- [ ] User management accessible (admin only)
- [ ] Mobile view is responsive
- [ ] No console errors

---

## 🆘 Getting Help

If you encounter issues:

1. **Check Logs**
   - Backend console: `npm start` output
   - Browser console: F12 → Console tab
   - Network tab: F12 → Network tab

2. **Common Issues**
   - Port 3000/5001 already in use: Kill process or change port
   - Database not found: Run `npm run seed`
   - Token expired: Log out and log in again
   - API 404 errors: Check endpoint URL spelling

3. **Reset Everything**
   ```bash
   # Reset database
   mysql -u root -p parkir_db < backend/db/schema.sql
   
   # Reseed data
   cd backend && npm run seed
   
   # Clear browser cache
   # F12 → Application → Clear site data
   ```

---

## 🎉 You're All Set!

Your parking management system is ready to use. Start exploring the features:

- Create test data
- Process transactions
- Manage users
- Configure pricing
- Monitor operations

**Happy Parking! 🚗**

---

*Last Updated: 2024 | Parkir Plus v1.0.0*
