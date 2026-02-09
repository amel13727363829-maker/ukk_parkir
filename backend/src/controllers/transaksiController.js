const { Transaksi, Kendaraan, JenisParkir, TarifParkir, Arf, LogAktivitas } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Get All Transaksi
exports.getAllTransaksi = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) {
    where.status_pembayaran = status;
  }

  const { count, rows } = await Transaksi.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id_transaksi', 'DESC']],
    include: [
      { model: Kendaraan, attributes: ['id_kendaraan', 'no_polisi'] },
      { model: JenisParkir, attributes: ['id_jenis_parkir', 'nama_jenis'] },
      { model: Arf, attributes: ['id_arf', 'nama_area'] },
    ],
  });

  // Debug: log first few transactions to check total_bayar values
  if (rows.length > 0) {
    console.log('📊 Sample transactions (first 3):');
    rows.slice(0, 3).forEach((r, idx) => {
      console.log(`  [${idx + 1}] ID: ${r.id_transaksi}, total_bayar: ${r.total_bayar} (type: ${typeof r.total_bayar})`);
    });
  }

  const totalPages = Math.ceil(count / limit);

  paginatedResponse(res, 200, rows, count, page, totalPages, 'Transaksi retrieved');
});

// Get Transaksi by ID
exports.getTransaksiById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaksi = await Transaksi.findByPk(id, {
    include: [
      { model: Kendaraan, attributes: ['id_kendaraan', 'no_polisi', 'jenis_kendaraan'] },
      { model: JenisParkir, attributes: ['id_jenis_parkir', 'nama_jenis'] },
      { model: Arf, attributes: ['id_arf', 'nama_area'] },
    ],
  });

  if (!transaksi) {
    return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  }

  successResponse(res, 200, transaksi, 'Transaksi retrieved');
});

// Get Aktif Transaksi (belum checkout)
exports.getAktifTransaksi = asyncHandler(async (req, res) => {
  const { nomor_plat } = req.query;

  if (!nomor_plat) {
    return errorResponse(res, 400, 'Nomor plat harus diisi');
  }

  // Find transactions directly by searching in related kendaraan
  const transaksi = await Transaksi.findAll({
    include: [
      { 
        model: Kendaraan, 
        attributes: ['id_kendaraan', 'no_polisi'],
        where: { no_polisi: nomor_plat.toUpperCase() },
        required: true
      },
      { model: JenisParkir, attributes: ['id_jenis_parkir', 'nama_jenis'] },
      { model: Arf, attributes: ['id_arf', 'nama_area'] },
    ],
    where: {
      waktu_keluar: null,
    },
    order: [['waktu_masuk', 'DESC']],
  });

  if (transaksi.length === 0) {
    return errorResponse(res, 404, 'Tidak ada transaksi aktif untuk nomor plat ini');
  }

  // Format response to include jenis_parkir and area_parkir names
  const formatted = transaksi.map(trx => ({
    id_transaksi: trx.id_transaksi,
    nomor_plat: trx.Kendaraan.no_polisi,
    jenis_parkir: trx.JenisParkir.nama_jenis,
    waktu_masuk: trx.waktu_masuk,
    area_parkir: trx.Arf?.nama_area || 'N/A',
  }));

  successResponse(res, 200, formatted, 'Aktif transaksi retrieved');
});

// Check-In (Create Transaksi)
exports.checkIn = asyncHandler(async (req, res) => {
  const { nomor_plat, id_jenis_parkir, id_arf, waktu_masuk } = req.body;

  // 🔍 DEBUG LOGGING
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📥 CHECK-IN REQUEST RECEIVED');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  nomor_plat:', nomor_plat, '| Type:', typeof nomor_plat);
  console.log('  id_jenis_parkir:', id_jenis_parkir, '| Type:', typeof id_jenis_parkir);
  console.log('  id_arf:', id_arf, '| Type:', typeof id_arf);
  console.log('  waktu_masuk:', waktu_masuk);
  console.log('───────────────────────────────────────────────────────────');

  // Validasi
  if (!nomor_plat || !id_jenis_parkir) {
    console.log('❌ Validation failed: nomor_plat atau id_jenis_parkir missing');
    return errorResponse(res, 400, 'Nomor plat dan jenis parkir wajib diisi');
  }

  // Check if jenis parkir exists
  const jenisParkir = await JenisParkir.findByPk(id_jenis_parkir);
  if (!jenisParkir) {
    console.log('❌ JenisParkir tidak ditemukan untuk id:', id_jenis_parkir);
    return errorResponse(res, 404, 'Jenis parkir tidak ditemukan');
  }
  console.log('✅ JenisParkir found:', jenisParkir.nama_jenis);

  // Validasi area parkir jika disediakan
  if (id_arf) {
    console.log('🔎 Searching for area dengan id:', id_arf);
    const arf = await Arf.findByPk(id_arf);
    if (!arf) {
      console.log('❌ Area parkir NOT FOUND untuk id:', id_arf);
      return errorResponse(res, 404, 'Area parkir tidak ditemukan');
    }
    console.log('✅ Area found:', arf.nama_area);

    // Cek jenis parkir yang didukung area (dari metadata area)
    // Database mapping:
    //   id_jenis_parkir = 1 → "Parkir Mobil" (mobil)
    //   id_jenis_parkir = 2 → "Parkir Motor" (motor)
    const supportedTypes = arf.jenis_parkir_yang_didukung || ['mobil'];
    const jenisParkirKey = id_jenis_parkir === 2 ? 'motor' : id_jenis_parkir === 1 ? 'mobil' : 'mobil';  // 2=motor, 1=mobil
    console.log('  Supported types:', supportedTypes, '| Current:', jenisParkirKey);
    
    if (!supportedTypes.includes(jenisParkirKey)) {
      console.log(`❌ Area ${arf.nama_area} tidak mendukung jenis ${jenisParkir.nama_jenis}`);
      return errorResponse(res, 400, `Area ${arf.nama_area} tidak mendukung parkir jenis ${jenisParkir.nama_jenis}`);
    }
    console.log('✅ Jenis parkir didukung oleh area');
  } else {
    console.log('⚠️  No id_arf provided (optional)');
  }

  // Find or create kendaraan
  let kendaraan = await Kendaraan.findOne({
    where: { no_polisi: nomor_plat.toUpperCase() },
  });

  if (!kendaraan) {
    kendaraan = await Kendaraan.create({
      no_polisi: nomor_plat.toUpperCase(),
      jenis_kendaraan: id_jenis_parkir === 2 ? 'motor' : 'mobil',  // 2=motor, 1=mobil
    });
  }

  // Check if kendaraan already checked in
  const activeTransaksi = await Transaksi.findOne({
    where: {
      id_kendaraan: kendaraan.id_kendaraan,
      waktu_keluar: null,
    },
  });

  if (activeTransaksi) {
    return errorResponse(res, 400, 'Kendaraan sudah melakukan check-in, lakukan check-out terlebih dahulu');
  }

  // Create transaksi with custom waktu_masuk
  const transaksi = await Transaksi.create({
    id_kendaraan: kendaraan.id_kendaraan,
    id_jenis_parkir,
    id_arf: id_arf || null,
    waktu_masuk: waktu_masuk ? new Date(waktu_masuk) : new Date(),
    status_pembayaran: 'belum_bayar',
  });
  console.log('✅ Transaksi created with id:', transaksi.id_transaksi);

  const detail = await Transaksi.findByPk(transaksi.id_transaksi, {
    include: [
      { model: Kendaraan, attributes: ['id_kendaraan', 'no_polisi'] },
      { model: JenisParkir, attributes: ['id_jenis_parkir', 'nama_jenis'] },
      { model: Arf, attributes: ['id_arf', 'nama_area'] },
    ],
  });

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✨ CHECK-IN SUCCESS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Log activity (best-effort)
  if (LogAktivitas) {
    try {
      const uname = req.user?.username || null;
      await LogAktivitas.create({
        id_user: req.user?.id_user || null,
        deskripsi_aksi: `Check-in kendaraan ${nomor_plat.toUpperCase()} (trx id: ${transaksi.id_transaksi}) oleh ${uname || 'sistem'}`,
      });
    } catch (err) {
      console.error('[Log] check-in create:', err.message);
    }
  }
  successResponse(res, 201, detail, 'Check-in berhasil');
});

// Check-Out (Update Transaksi)
exports.checkOut = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { waktu_keluar, total_bayar, metode_pembayaran } = req.body;

  const transaksi = await Transaksi.findByPk(id, {
    include: [
      { model: JenisParkir },
      { model: Kendaraan },
      { model: Arf },
    ],
  });

  if (!transaksi) {
    return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  }

  if (transaksi.waktu_keluar) {
    return errorResponse(res, 400, 'Kendaraan sudah melakukan check-out');
  }

  // Use provided waktu_keluar or current time
  const waktuKeluar = waktu_keluar ? new Date(waktu_keluar) : new Date();

  // Calculate duration in hours (ceil)
  const durasiMs = waktuKeluar - new Date(transaksi.waktu_masuk);
  const durasiJam = Math.ceil(durasiMs / (1000 * 60 * 60));

  // Update transaksi
  await transaksi.update({
    waktu_keluar: waktuKeluar,
    lama_parkir: durasiJam * 60, // Store in minutes
    tarif_parkir: total_bayar || 0,
    total_bayar: total_bayar || 0,
    metode_pembayaran: metode_pembayaran || 'tunai',
    status_pembayaran: 'lunas',
  });

  const updated = await Transaksi.findByPk(id, {
    include: [
      { model: Kendaraan, attributes: ['id_kendaraan', 'no_polisi'] },
      { model: JenisParkir, attributes: ['id_jenis_parkir', 'nama_jenis'] },
      { model: Arf, attributes: ['id_arf', 'nama_area'] },
    ],
  });

  successResponse(res, 200, updated, 'Check-out berhasil');

  // Log activity (best-effort)
  if (LogAktivitas) {
    LogAktivitas.create({
      id_user: req.user?.id_user || null,
      deskripsi_aksi: `Check-out transaksi ${id} untuk kendaraan ${transaksi.Kendaraan?.no_polisi || 'N/A'} — total: ${transaksi.total_bayar || total_bayar}`,
    }).catch(err => console.error('[Log] check-out:', err.message));
  }
});

// Update Payment Status
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status_pembayaran } = req.body;

  if (!['belum_bayar', 'lunas', 'paid', 'unpaid', 'pending'].includes(status_pembayaran)) {
    return errorResponse(res, 400, 'Status pembayaran tidak valid');
  }

  const transaksi = await Transaksi.findByPk(id);

  if (!transaksi) {
    return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  }

  transaksi.status_pembayaran = status_pembayaran;
  await transaksi.save();

  const updated = await Transaksi.findByPk(id, {
    include: [
      { model: Kendaraan, attributes: ['id_kendaraan', 'no_polisi'] },
      { model: JenisParkir, attributes: ['id_jenis_parkir', 'nama_jenis'] },
      { model: Arf, attributes: ['id_arf', 'nama_area'] },
    ],
  });

  successResponse(res, 200, updated, 'Status pembayaran berhasil diupdate');

  // Log activity (best-effort)
  if (LogAktivitas) {
    LogAktivitas.create({
      id_user: req.user?.id_user || null,
      deskripsi_aksi: `Update status pembayaran transaksi ${id} → ${status_pembayaran} oleh userId: ${req.user?.id_user || 'anon'}`,
    }).catch(err => console.error('[Log] update payment status:', err.message));
  }
});

// Delete Transaksi
exports.deleteTransaksi = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaksi = await Transaksi.findByPk(id);

  if (!transaksi) {
    return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  }

  // Only allow delete if tidak ada check-out (masih aktif) atau baru saja dibuat
  if (transaksi.waktu_keluar) {
    return errorResponse(res, 400, 'Tidak dapat menghapus transaksi yang sudah check-out');
  }

  await transaksi.destroy();

  successResponse(res, 200, null, 'Transaksi berhasil dihapus');
  // Log activity (best-effort)
  if (LogAktivitas) {
    LogAktivitas.create({
      id_user: req.user?.id_user || null,
      deskripsi_aksi: `Menghapus transaksi ${id} untuk kendaraan ${transaksi.Kendaraan?.no_polisi || 'N/A'} oleh userId: ${req.user?.id_user || 'anon'}`,
    }).catch(err => console.error('[Log] delete transaksi:', err.message));
  }
});
