# 🧪 PETUNJUK TESTING CHECK-IN SETELAH PERBAIKAN

## 📋 PRE-TEST CHECKLIST

- [ ] Backend running di port 5001
- [ ] Frontend running di port 3000
- [ ] Database terkoneksi (cek di console backend)
- [ ] Sudah clear browser cache (Ctrl+Shift+Del)

---

## 🚀 STEP-BY-STEP TESTING

### Step 1: Buka Form Check-In
```
URL: http://localhost:3000/dashboard/petugas
```

**Harapkan:**
- ✅ Form terload dengan clean (NO error box)
- ✅ Dropdown "Area Parkir" menampilkan:
  - Area Motor Depan
  - Area Mobil Basement
  - Area A-E (optional)

---

### Step 2: Test Check-In Motor

**Input:**
| Field | Nilai |
|-------|-------|
| Nomor Plat | B1111ABC |
| Jenis Kendaraan | 🏍️ Motor |
| Area Parkir | Area Motor Depan (otomatis) |
| Waktu Masuk | Auto (sekarang) |

**Proses:**
1. Ketik nomor plat "B1111ABC"
2. Pilih radio "Motor"
3. Area akan auto-select "Area Motor Depan"
4. Klik "✓ Check-in Kendaraan"

**Harapkan:**
- ✅ **Backend console menampilkan:**
  ```
  ═══════════════════════════════════════════════════════════
  📥 CHECK-IN REQUEST RECEIVED
  ═══════════════════════════════════════════════════════════
    nomor_plat: B1111ABC | Type: string
    id_jenis_parkir: 2 | Type: number
    id_arf: 8 | Type: number
  ───────────────────────────────────────────────────────────
  ✅ JenisParkir found: Parkir Motor
  🔎 Searching for area dengan id: 8
  ✅ Area found: Area Motor Depan
    Supported types: [ 'motor' ] | Current: motor
  ✅ Jenis parkir didukung oleh area
  ✅ Transaksi created with id: XXX
  ═══════════════════════════════════════════════════════════
  ✨ CHECK-IN SUCCESS
  ═══════════════════════════════════════════════════════════
  ```

- ✅ **Frontend menampilkan:**
  - Struk Parkir dengan data:
    - No. Transaksi: (auto-generated)
    - Jenis: Motor
    - Plat Nomor: B1111ABC
    - Area Parkir: Area Motor Depan
    - Waktu Masuk: (timestamp)
  - Button "Cetak Struk"
  - Button "Check-in Kendaraan Baru"

---

### Step 3: Test Check-In Mobil

**Input:**
| Field | Nilai |
|-------|-------|
| Nomor Plat | A2222BB |
| Jenis Kendaraan | 🚗 Mobil |
| Area Parkir | Area Mobil Basement (otomatis) |

**Proses:**
1. Klik "Check-in Kendaraan Baru" (reset form)
2. Ketik nomor plat "A2222BB"
3. Pilih radio "Mobil"
4. Area akan auto-select "Area Mobil Basement"
5. Klik "✓ Check-in Kendaraan"

**Harapkan:**
- ✅ **Backend console menampilkan id_jenis_parkir: 1** (untuk mobil)
  ```
  nomor_plat: A2222BB | Type: string
  id_jenis_parkir: 1 | Type: number
  id_arf: 9 | Type: number
  ───────────────────────────────────────────────────────────
  ✅ JenisParkir found: Parkir Mobil
  🔎 Searching for area dengan id: 9
  ✅ Area found: Area Mobil Basement
    Supported types: [ 'mobil' ] | Current: mobil
  ✅ Jenis parkir didukung oleh area
  ```

- ✅ **Frontend menampilkan struk mobil**

---

### Step 4: Test Manual Area Selection

**Input:**
| Field | Nilai |
|-------|-------|
| Nomor Plat | C3333CD |
| Jenis Kendaraan | 🏍️ Motor |
| Area Parkir | Area A - Lantai 1 (manual select) |

**Proses:**
1. Klik "Check-in Kendaraan Baru"
2. Ketik "C3333CD"
3. Pilih "Motor"
4. Change Area dari "Area Motor Depan" → "Area A - Lantai 1"
5. Klik submit

**Harapkan:**
- ✅ Struk menampilkan "Area A - Lantai 1"
- ✅ Backend log: `id_arf: 3`

---

### Step 5: Test Error Cases

#### Error Case 5a: Nomor Plat Kosong
**Input:** (kosongkan semua)
**Aksi:** Klik submit
**Harapkan:** 
- ❌ Error: "Nomor plat harus diisi" (hanya muncul SETELAH klik submit)
- ✅ Form tidak mengirim request ke backend

#### Error Case 5b: Jenis Kendaraan Tidak Dipilih
**Input:** Nomor plat diisi, jenis kosong
**Aksi:** Klik submit
**Harapkan:**
- ❌ Error: "Jenis kendaraan harus dipilih"
- ✅ Form tidak mengirim request ke backend

#### Error Case 5c: Duplikasi Nomor Plat
**Input:** Gunakan nomor plat yang sudah check-in (misalnya B1111ABC dari Step 2)
**Proses:** Check-in lagi tanpa checkout dulu
**Harapkan:**
- ❌ Error: "Kendaraan sudah melakukan check-in, lakukan check-out terlebih dahulu"

---

## 🔍 MONITORING CHECKLIST

Saat testing, pastikan:

- [ ] **Browser Console** (F12):
  - Tidak ada error messages merah
  - Cek network tab - POST ke `/api/v1/transaksi/checkin` berhasil (200/201)

- [ ] **Backend Console** (Terminal):
  - Cek payload logging
  - Cek area dan jenis parkir ditemukan
  - Cek "✨ CHECK-IN SUCCESS" muncul

- [ ] **Database** (optional, verify):
  ```bash
  # Cek transaksi baru masuk
  node -e "const db = require('./src/models'); db.Transaksi.findAll({ order: [['createdAt', 'DESC']], limit: 3, raw: true }).then(t => console.log(JSON.stringify(t, null, 2))).then(() => process.exit(0))"
  ```

---

## 🚨 TROUBLESHOOTING

### ❌ Masalah: "Area parkir tidak ditemukan" masih muncul

**Kemungkinan:**
1. Frontend tidak reload cache
   - **Solusi:** Ctrl+Shift+Del → Clear cache → Refresh
   
2. Backend tidak restart
   - **Solusi:** `taskkill /F /IM node.exe` → start ulang backend
   
3. ID area masih salah
   - **Solusi:** Cek di backend console saat submit - apakah `id_arf: 8` atau `id_arf: 9`?

### ❌ Masalah: Console error "Unexpected token"

**Kemungkinan:** Syntax error di controller
- **Solusi:** Cek baris 95-197 di transaksiController.js
- Run: `node -c src/controllers/transaksiController.js` (syntax check)

### ❌ Masalah: Dropdown kosong

**Kemungkinan:** API `/arf` error
- **Solusi:** 
  1. Buka browser console (F12 → Network)
  2. Submit form, cek request ke `/api/v1/arf`
  3. Cek response - apakah data ada?

---

## ✅ SUCCESS CRITERIA

Perbaikan dianggap **BERHASIL** jika:

- [ ] ✅ Check-in motor ke "Area Motor Depan" → Struk muncul
- [ ] ✅ Check-in mobil ke "Area Mobil Basement" → Struk muncul
- [ ] ✅ Backend log menampilkan id_jenis_parkir yang benar (2=motor, 1=mobil)
- [ ] ✅ Backend log menampilkan id_arf yang benar (8 atau 9)
- [ ] ✅ Error hanya muncul setelah user klik submit (bukan on page load)
- [ ] ✅ Tidak ada "Area parkir tidak ditemukan" error

---

## 📞 DEBUG COMMANDS

Jika masih bermasalah, jalankan commands ini di backend:

**1. Cek area di database:**
```bash
node -e "const db = require('./src/models'); db.Arf.findAll({ raw: true, attributes: ['id_arf', 'nama_area', 'jenis_parkir_yang_didukung'] }).then(a => console.log(JSON.stringify(a, null, 2))).then(() => process.exit(0))"
```
**Expected:** id_arf 8 dan 9 ada

**2. Cek jenis parkir:**
```bash
node -e "const db = require('./src/models'); db.JenisParkir.findAll({ raw: true }).then(j => console.log(JSON.stringify(j, null, 2))).then(() => process.exit(0))"
```
**Expected:** id 1=Parkir Mobil, id 2=Parkir Motor

**3. Cek transaksi terbaru:**
```bash
node -e "const db = require('./src/models'); db.Transaksi.findAll({ order: [['createdAt', 'DESC']], limit: 5, include: [{model: db.Kendaraan}, {model: db.JenisParkir}, {model: db.Arf}], raw: false }).then(t => { t.forEach(tx => console.log('TRX:', tx.id_transaksi, 'Plat:', tx.Kendaraan.no_polisi, 'Jenis:', tx.JenisParkir.nama_jenis, 'Area:', tx.Arf?.nama_area)); process.exit(0); })"
```

