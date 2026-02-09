# ⚡ QUICK REFERENCE: MASALAH & SOLUSI CHECK-IN

## 🔴 MASALAH

User melihat error saat check-in:
```
"Area parkir tidak ditemukan"
```

Padahal dropdown menampilkan area dengan benar.

---

## 🟢 ROOT CAUSE

**3 masalah ditemukan:**

### 1️⃣ ID Area Salah
- Frontend hardcode ID 999 & 998
- Database punya ID 8 & 9
- **Fix:** Update ID di frontend line 88-92

### 2️⃣ ID JenisParkir Terbalik
- DB: 1=Mobil, 2=Motor
- Frontend kirim: 1 untuk motor, 2 untuk mobil ❌
- **Fix:** Reverse mapping di frontend line 258 & backend

### 3️⃣ Kurang Logging
- Sulit debug apa yang dikirim frontend
- **Fix:** Tambah console.log di backend

---

## ✅ SOLUSI DITERAPKAN

### File 1: `frontend/src/app/dashboard/petugas/page.tsx`

**Line 88-92** - Fix hardcoded IDs:
```diff
  const requiredAreas = [
-   { id_arf: 999, nama_area: 'Area Motor Depan', ... },
+   { id_arf: 8, nama_area: 'Area Motor Depan', ... },
-   { id_arf: 998, nama_area: 'Area Mobil Basement', ... },
+   { id_arf: 9, nama_area: 'Area Mobil Basement', ... },
  ];
```

**Line 258** - Fix JenisParkir mapping:
```diff
- id_jenis_parkir: formData.jenis_parkir === 'motor' ? 1 : 2,
+ id_jenis_parkir: formData.jenis_parkir === 'motor' ? 2 : 1,  // 2=motor, 1=mobil
```

---

### File 2: `backend/src/controllers/transaksiController.js`

**Line 95-152** - Add debug logging:
```javascript
console.log('📥 CHECK-IN REQUEST RECEIVED');
console.log('  id_jenis_parkir:', id_jenis_parkir);
console.log('  id_arf:', id_arf);
// ... validation logs ...
console.log('✨ CHECK-IN SUCCESS');
```

**Line 135-137** - Fix JenisParkir mapping:
```diff
- const jenisParkirKey = id_jenis_parkir === 1 ? 'motor' : 'mobil';
+ const jenisParkirKey = id_jenis_parkir === 2 ? 'motor' : 'mobil';
```

**Line 158** - Fix Kendaraan jenis:
```diff
- jenis_kendaraan: id_jenis_parkir === 1 ? 'motor' : 'mobil',
+ jenis_kendaraan: id_jenis_parkir === 2 ? 'motor' : 'mobil',
```

---

## 🧪 HOW TO TEST

1. **Open form:** http://localhost:3000/dashboard/petugas
2. **Fill form:**
   - Nomor Plat: B1234ABC
   - Jenis: Motor
   - Area: Auto-select "Area Motor Depan"
3. **Submit:** Click "✓ Check-in Kendaraan"
4. **Expected:** Struk muncul ✅
5. **Check backend console:** Should show ✨ CHECK-IN SUCCESS

---

## 🔍 VERIFY FIXES

### Check 1: Database Area IDs
```bash
cd backend
node -e "const db = require('./src/models'); db.Arf.findAll({raw:true, attributes:['id_arf','nama_area']}).then(a => console.log(JSON.stringify(a,null,2))).then(()=>process.exit(0))"
```

**Expected:** id_arf 8 and 9 present ✅

### Check 2: Frontend Sends Correct ID
1. Open browser DevTools (F12)
2. Go to Network tab
3. Do check-in
4. Find POST to `/api/v1/transaksi/checkin`
5. Check payload → should show `id_arf: 8` (not 999) ✅

### Check 3: Backend Logs
Monitor backend terminal:
- Should see `📥 CHECK-IN REQUEST RECEIVED`
- Should see `id_arf: 8` (not 999)
- Should see `✨ CHECK-IN SUCCESS`

---

## 📊 ID MAPPINGS (Reference)

### JenisParkir (Database tb_m_jenis_parkir)
```
id=1 → "Parkir Mobil"  (for mobil vehicles)
id=2 → "Parkir Motor"  (for motor vehicles)
```

### Area (Database tb_arf)
```
id=8 → "Area Motor Depan"  (supports: ['motor'])
id=9 → "Area Mobil Basement" (supports: ['mobil'])
```

### Frontend Mapping (AFTER FIX)
```
motor selected? → send id_jenis_parkir=2
mobil selected? → send id_jenis_parkir=1
```

---

## ⚠️ IF STILL HAVING ISSUES

1. **Clear browser cache:** Ctrl+Shift+Del → All time → Clear
2. **Restart backend:** `npm start` in backend folder
3. **Restart frontend:** `npm run dev` in frontend folder
4. **Check browser console:** F12 → should show API request
5. **Check backend console:** should show detailed logs

---

## 📞 SUPPORT

**If error persists:**
1. Check `ANALISIS_ERROR_AREA_PARKIR.md` for detailed analysis
2. Check `TEST_CHECK_IN_GUIDE.md` for step-by-step testing
3. Check `VISUALISASI_MASALAH_SOLUSI.md` for flow diagrams
4. Run database verification commands above

