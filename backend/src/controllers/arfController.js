const { Arf, Transaksi } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');
const { asyncHandler } = require('../middleware/errorHandler');

// Get All Area
exports.getAllArea = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await Arf.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id_arf', 'DESC']],
  });

  const totalPages = Math.ceil(count / limit);

  paginatedResponse(res, 200, rows, count, page, totalPages, 'Area retrieved');
});

// Get Area by ID
exports.getAreaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const area = await Arf.findByPk(id);

  if (!area) {
    return errorResponse(res, 404, 'Area tidak ditemukan');
  }

  successResponse(res, 200, area, 'Area retrieved');
});

// Create Area
exports.createArea = asyncHandler(async (req, res) => {
  const { nama_arf, lokasi, kapasitas, harga_per_jam, status } = req.body;

  if (!nama_arf || !kapasitas) {
    return errorResponse(res, 400, 'Nama area dan kapasitas wajib diisi');
  }

  const area = await Arf.create({
    nama_arf,
    lokasi: lokasi || '',
    kapasitas: parseInt(kapasitas),
    harga_per_jam: harga_per_jam ? parseInt(harga_per_jam) : 0,
    status: status || 'aktif',
  });

  successResponse(res, 201, area, 'Area berhasil ditambahkan');
});

// Update Area
exports.updateArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama_arf, lokasi, kapasitas, harga_per_jam, status } = req.body;

  const area = await Arf.findByPk(id);

  if (!area) {
    return errorResponse(res, 404, 'Area tidak ditemukan');
  }

  Object.assign(area, {
    nama_arf: nama_arf || area.nama_arf,
    lokasi: lokasi !== undefined ? lokasi : area.lokasi,
    kapasitas: kapasitas ? parseInt(kapasitas) : area.kapasitas,
    harga_per_jam: harga_per_jam ? parseInt(harga_per_jam) : area.harga_per_jam,
    status: status || area.status,
  });

  await area.save();

  successResponse(res, 200, area, 'Area berhasil diupdate');
});

// Get Area by Jenis Parkir
exports.getAreaByJenisParkir = asyncHandler(async (req, res) => {
  const { jenis_parkir } = req.query;

  if (!jenis_parkir) {
    return errorResponse(res, 400, 'Jenis parkir harus diisi');
  }

  const areas = await Arf.findAll({
    where: {
      status: 'aktif',
    },
    raw: true,
  });

  // Filter areas yang support jenis_parkir ini
  const filteredAreas = areas.filter(area => {
    if (!area.jenis_parkir_yang_didukung) return false;
    const supported = JSON.parse(area.jenis_parkir_yang_didukung);
    return supported.includes(jenis_parkir);
  });

  successResponse(res, 200, filteredAreas, 'Area retrieved');
});

// Get area occupancy (kapasitas + occupied count)
exports.getAreaOccupancy = asyncHandler(async (req, res) => {
  const { jenis_parkir } = req.query;

  // fetch active areas
  const areas = await Arf.findAll({ where: { status: 'aktif' }, raw: true });

  // Optionally filter by jenis_parkir
  const filtered = areas.filter(area => {
    if (!area.jenis_parkir_yang_didukung) return true;
    try {
      const supported = Array.isArray(area.jenis_parkir_yang_didukung) ? area.jenis_parkir_yang_didukung : JSON.parse(area.jenis_parkir_yang_didukung);
      if (!jenis_parkir) return true;
      return supported.includes(jenis_parkir);
    } catch (e) {
      return true;
    }
  });

  // For each area compute occupied count (transaksi with waktu_keluar IS NULL)
  const results = await Promise.all(filtered.map(async (area) => {
    const occupied = await Transaksi.count({ where: { id_arf: area.id_arf, waktu_keluar: null } });
    const kapasitas = area.kapasitas || 0;
    return {
      id_arf: area.id_arf,
      nama_area: area.nama_area,
      kapasitas,
      occupied,
      remaining: Math.max(0, kapasitas - occupied),
      jenis_parkir_yang_didukung: area.jenis_parkir_yang_didukung,
      status: area.status,
    };
  }));

  successResponse(res, 200, results, 'Area occupancy retrieved');
});

// Delete Area
exports.deleteArea = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const area = await Arf.findByPk(id);

  if (!area) {
    return errorResponse(res, 404, 'Area tidak ditemukan');
  }

  // Check if used in transactions
  const transaksi = await Transaksi.count({
    where: { id_arf: id },
  });

  if (transaksi > 0) {
    return errorResponse(res, 400, 'Tidak dapat menghapus area yang memiliki riwayat transaksi');
  }

  await area.destroy();

  successResponse(res, 200, null, 'Area berhasil dihapus');
});
