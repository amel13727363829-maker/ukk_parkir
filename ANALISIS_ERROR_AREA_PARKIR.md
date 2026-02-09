# 🔍 ANALISIS ERROR: "Area parkir tidak ditemukan"

## 📋 RINGKASAN MASALAH
Saat user melakukan check-in dengan form yang sudah diisi lengkap:
- ✅ Nomor plat: terisi (contoh: "TEST001")
- ✅ Jenis kendaraan: terisi (motor/mobil)
- ✅ Area parkir: dipilih (contoh: "Area Motor Depan")

**Namun API backend mengembalikan error:** `"Area parkir tidak ditemukan"`

---

## 🎯 ANALISIS AKAR PENYEBAB (ROOT CAUSE)

### **PENYEBAB UTAMA: id_arf Tidak Terkirim atau Berformat Salah**

Backend mencari area dengan query:
```javascript
const arf = await Arf.findByPk(id_arf);  // Mencari berdasarkan PRIMARY KEY
if (!arf) {
  return errorResponse(res, 404, 'Area parkir tidak ditemukan');
}
```

**Kemungkinan masalah:**

| No | Masalah | Bukti | Akibat |
|----|---------|-------|--------|
| 1️⃣ | `id_arf` = `undefined` atau `null` | Frontend kirim tanpa `id_arf` | Arf.findByPk(undefined) → tidak ketemu |
| 2️⃣ | `id_arf` = string (bukan number) | Frontend kirim "8" | Arf.findByPk("8") vs Arf.findByPk(8) mismatch |
| 3️⃣ | `id_arf` = hardcoded ID (999/998) | Frontend kirim id area fallback | ID 999/998 tidak ada di database |
| 4️⃣ | Format JSON di request salah | Content-Type error | Backend gagal parse payload |

---

## 🔴 TRACE MASALAH SPESIFIK

### **Data di Database (✅ VALID):**
```json
[
  { "id_arf": 8, "nama_area": "Area Motor Depan", "jenis_parkir_yang_didukung": ["motor"] },
  { "id_arf": 9, "nama_area": "Area Mobil Basement", "jenis_parkir_yang_didukung": ["mobil"] }
]
```

### **Yang Seharusnya Dikirim Frontend ke Backend:**
```javascript
// BENAR - Ketika user pilih Area Motor Depan di dropdown
{
  "nomor_plat": "TEST001",
  "id_jenis_parkir": 1,        // 1=motor, 2=mobil
  "id_arf": 8,                 // ← HARUS INTEGER, bukan string
  "waktu_masuk": "2024-01-31T15:30:00"
}
```

### **Validasi Backend untuk CHECK-IN:**
```javascript
// Step 1: Validasi basic
if (!nomor_plat || !id_jenis_parkir) {
  ❌ return error  // Nomor plat dan jenis parkir wajib diisi
}

// Step 2: Cek jenis parkir ada di database
const jenisParkir = await JenisParkir.findByPk(id_jenis_parkir);
if (!jenisParkir) {
  ❌ return error  // Jenis parkir tidak ditemukan
}

// Step 3: Cek area parkir (JIKA DISEDIAKAN)
if (id_arf) {  // ← Ini penting!
  const arf = await Arf.findByPk(id_arf);
  if (!arf) {
    ❌ return error  // Area parkir tidak ditemukan  ← ERROR INI!
  }
  
  // Step 4: Cek apakah area mendukung jenis parkir
  const supportedTypes = arf.jenis_parkir_yang_didukung;
  const jenisParkirKey = id_jenis_parkir === 1 ? 'motor' : 'mobil';
  
  if (!supportedTypes.includes(jenisParkirKey)) {
    ❌ return error  // Area tidak mendukung jenis parkir ini
  }
}

// ✅ Jika semua valid, lanjut ke create transaksi
```

---

## 🔧 DEBUGGING: KEMUNGKINAN MASALAH & SOLUSI

### **Masalah #1: id_arf = hardcoded fallback (999/998)**

**Lokasi kode frontend:**
```typescript
// c:\laragon\www\parkir\frontend\src\app\dashboard\petugas\page.tsx line 88-92
const requiredAreas = [
  { id_arf: 999, nama_area: 'Area Motor Depan', ... },  // ← ID 999 TIDAK ADA!
  { id_arf: 998, nama_area: 'Area Mobil Basement', ... }, // ← ID 998 TIDAK ADA!
];
```

**Hasil:** Saat user submit, `id_arf=999` dikirim ke backend → `Arf.findByPk(999)` → `NOT FOUND` → ERROR

**Solusi:** Gunakan ID yang benar dari database (8 dan 9)

---

### **Masalah #2: id_arf dikirim sebagai STRING bukan NUMBER**

**Frontend code:**
```typescript
const payload: any = {
  nomor_plat: formData.nomor_plat.toUpperCase(),
  id_jenis_parkir: formData.jenis_parkir === 'motor' ? 1 : 2,
};
if (areaId) payload.id_arf = parseInt(areaId);  // ← Coba parseInt()
```

**Kemungkinan masalah:**
- `areaId` = string "8"
- `parseInt("8")` = 8 ✅
- Tapi kalau `areaId` = "999" atau undefined → parseInt gagal

---

### **Masalah #3: id_arf = undefined**

**Skenario:**
```typescript
// Line 244 di petugas/page.tsx
let areaId = formData.id_arf;  // ← Bisa jadi undefined!
if (!areaId && formData.jenis_parkir) {
  const chosen = findAreaForJenis(jenis);
  if (chosen) {
    areaId = String(chosen.id_arf);  // ← Di-convert ke string
  }
}

// Line 260
if (areaId) payload.id_arf = parseInt(areaId);  // Tapi ini bisa skip kalau areaId masih undefined
```

**Hasil:** `id_arf` tidak terkirim → Backend tidak validasi area → Bisa lolos atau error tergantung logic

---

### **Masalah #4: Mismatch antara JenisParkir ID**

**Frontend kirim:**
```javascript
id_jenis_parkir: formData.jenis_parkir === 'motor' ? 1 : 2
```

**Backend expect:**
```javascript
// Harus sesuai dengan database tb_jenis_parkir
// id=1 → motor, id=2 → mobil
```

**Verifikasi diperlukan**: Cek apakah database tb_jenis_parkir memiliki id 1 dan 2

---

## ✅ LANGKAH PERBAIKAN

### **Step 1: Perbaiki ID Fallback Area di Frontend**

**File:** `c:\laragon\www\parkir\frontend\src\app\dashboard\petugas\page.tsx`

```typescript
// SEBELUM (SALAH):
const requiredAreas = [
  { id_arf: 999, nama_area: 'Area Motor Depan', ... },
  { id_arf: 998, nama_area: 'Area Mobil Basement', ... },
];

// SESUDAH (BENAR):
const requiredAreas = [
  { id_arf: 8, nama_area: 'Area Motor Depan', ... },
  { id_arf: 9, nama_area: 'Area Mobil Basement', ... },
];
```

---

### **Step 2: Tambah Logging di Backend untuk Debug**

**Tambahkan di transaksiController.js baris 95:**

```javascript
exports.checkIn = asyncHandler(async (req, res) => {
  const { nomor_plat, id_jenis_parkir, id_arf, waktu_masuk } = req.body;

  // 🔍 DEBUG LOGGING
  console.log('📥 CHECKIN REQUEST RECEIVED:');
  console.log('  nomor_plat:', nomor_plat, '(type:', typeof nomor_plat + ')');
  console.log('  id_jenis_parkir:', id_jenis_parkir, '(type:', typeof id_jenis_parkir + ')');
  console.log('  id_arf:', id_arf, '(type:', typeof id_arf + ')');
  console.log('  waktu_masuk:', waktu_masuk);

  // Validasi...
  if (id_arf) {
    console.log('🔎 Searching for area with id:', id_arf);
    const arf = await Arf.findByPk(id_arf);
    console.log('📍 Area found:', arf ? `✅ ${arf.nama_area}` : '❌ NOT FOUND');
    if (!arf) {
      return errorResponse(res, 404, 'Area parkir tidak ditemukan');
    }
  }
  // ...
});
```

---

### **Step 3: Validasi JenisParkir di Database**

```bash
# Cek apakah tb_jenis_parkir memiliki id 1 dan 2
node -e "const db = require('./src/models'); db.JenisParkir.findAll({ raw: true }).then(j => console.log(JSON.stringify(j, null, 2))).then(() => process.exit(0))"
```

**Expected output:**
```json
[
  { "id_jenis_parkir": 1, "nama_jenis": "Motor" },
  { "id_jenis_parkir": 2, "nama_jenis": "Mobil" }
]
```

---

### **Step 4: Perbaiki Payload Handling di Frontend**

**Ensure `id_arf` always sent as number:**

```typescript
const payload: any = {
  nomor_plat: formData.nomor_plat.toUpperCase(),
  id_jenis_parkir: formData.jenis_parkir === 'motor' ? 1 : 2,
};

if (areaId) {
  const numAreaId = parseInt(areaId);
  if (!isNaN(numAreaId)) {
    payload.id_arf = numAreaId;  // Ensure number, not string
  }
}
```

---

## 🎬 CONTOH PAYLOAD REQUEST YANG BENAR

### **Skenario: User check-in Motor dengan Area Motor Depan**

```http
POST /api/v1/transaksi/checkin HTTP/1.1
Host: localhost:5001
Authorization: Bearer <valid-jwt-token>
Content-Type: application/json

{
  "nomor_plat": "B1234ABC",
  "id_jenis_parkir": 1,
  "id_arf": 8,
  "waktu_masuk": "2024-01-31T15:30:00.000Z"
}
```

### **Expected Response (✅ Success):**
```json
{
  "success": true,
  "message": "Check-in berhasil",
  "data": {
    "id_transaksi": 123,
    "id_kendaraan": 45,
    "id_jenis_parkir": 1,
    "id_arf": 8,
    "waktu_masuk": "2024-01-31T15:30:00.000Z",
    "waktu_keluar": null,
    "status_pembayaran": "belum_bayar",
    "Kendaraan": {
      "id_kendaraan": 45,
      "no_polisi": "B1234ABC"
    },
    "JenisParkir": {
      "id_jenis_parkir": 1,
      "nama_jenis": "Motor"
    },
    "Arf": {
      "id_arf": 8,
      "nama_area": "Area Motor Depan"
    }
  }
}
```

### **Error Response (❌ If id_arf=999):**
```json
{
  "success": false,
  "message": "Area parkir tidak ditemukan",
  "statusCode": 404
}
```

---

## 🚀 CHECKLIST PERBAIKAN

- [ ] **Perbaiki ID fallback area di frontend** (999→8, 998→9)
- [ ] **Tambah logging di backend transaksiController.js**
- [ ] **Verify JenisParkir table** (pastikan id 1 dan 2 exist)
- [ ] **Test payload di Postman/curl dengan token valid**
- [ ] **Monitor console logs saat submit**
- [ ] **Restart backend dan frontend**
- [ ] **Test check-in form di browser**

---

## 📊 RINGKASAN DATABASE STATUS

### ✅ Area Parkir (tb_arf):
```
ID=8  | Area Motor Depan      | Supports: ['motor']       | Status: aktif
ID=9  | Area Mobil Basement   | Supports: ['mobil']       | Status: aktif
ID=3-7| Area A-E             | Supports: ['motor','mobil'] | Status: aktif
```

### ⚠️ MASALAH POTENSIAL:
1. Frontend menggunakan ID 999/998 (tidak ada di database)
2. Payload mungkin mengirim id_arf sebagai string bukan number
3. Kurang logging untuk debug

---

## 🎯 PERBAIKAN PRIORITAS

**PRIORITY 1** (Urgent - Root Cause): Ubah ID fallback area dari 999/998 → 8/9
**PRIORITY 2** (High): Tambah logging di backend untuk trace request
**PRIORITY 3** (Medium): Ensure id_arf always sent as number
