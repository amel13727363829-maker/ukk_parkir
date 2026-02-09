const { JenisParkir, TarifParkir, Transaksi } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');
const { asyncHandler } = require('../middleware/errorHandler');

// Get All Jenis Parkir
exports.getAllJenisParkir = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await JenisParkir.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id_jenis_parkir', 'DESC']],
    include: [
      {
        model: TarifParkir,
        as: 'TarifParkirs',
      },
    ],
  });

  const totalPages = Math.ceil(count / limit);

  paginatedResponse(res, 200, rows, count, page, totalPages, 'Jenis parkir retrieved');
});

// Get Jenis Parkir by ID
exports.getJenisParkirById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const jenisParkir = await JenisParkir.findByPk(id, {
    include: [
      {
        model: TarifParkir,
        as: 'TarifParkirs',
      },
    ],
  });

  if (!jenisParkir) {
    return errorResponse(res, 404, 'Jenis parkir tidak ditemukan');
  }

  successResponse(res, 200, jenisParkir, 'Jenis parkir retrieved');
});

// Create Jenis Parkir
exports.createJenisParkir = asyncHandler(async (req, res) => {
  const { nama_jenis, deskripsi, kapasitas, harga_per_jam, harga_awal } = req.body;

  if (!nama_jenis) {
    return errorResponse(res, 400, 'Nama jenis wajib diisi');
  }

  console.log('[jenisParkir] create payload:', req.body);

  const jenisParkir = await JenisParkir.create({
    nama_jenis,
    deskripsi,
    kapasitas: kapasitas || 0,
    harga_per_jam: harga_per_jam || 0,
    harga_awal: harga_awal || 0,
  });

  // Return freshly fetched plain object to avoid Sequelize instance serialization issues
  const created = await JenisParkir.findByPk(jenisParkir.id_jenis_parkir);
  successResponse(res, 201, created, 'Jenis parkir berhasil ditambahkan');
});

// Update Jenis Parkir
exports.updateJenisParkir = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama_jenis, deskripsi, kapasitas, harga_per_jam, harga_awal } = req.body;

  const jenisParkir = await JenisParkir.findByPk(id);

  if (!jenisParkir) {
    return errorResponse(res, 404, 'Jenis parkir tidak ditemukan');
  }

  console.log('[jenisParkir] update payload for id', id, req.body);

  Object.assign(jenisParkir, {
    nama_jenis: nama_jenis || jenisParkir.nama_jenis,
    deskripsi: deskripsi !== undefined ? deskripsi : jenisParkir.deskripsi,
    kapasitas: kapasitas !== undefined ? kapasitas : jenisParkir.kapasitas,
    harga_per_jam: harga_per_jam !== undefined ? harga_per_jam : jenisParkir.harga_per_jam,
    harga_awal: harga_awal !== undefined ? harga_awal : jenisParkir.harga_awal,
  });

  await jenisParkir.save();

  // Return freshly fetched plain object after update
  const updated = await JenisParkir.findByPk(id);
  successResponse(res, 200, updated, 'Jenis parkir berhasil diupdate');
});

// Delete Jenis Parkir
exports.deleteJenisParkir = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const jenisParkir = await JenisParkir.findByPk(id);

  if (!jenisParkir) {
    return errorResponse(res, 404, 'Jenis parkir tidak ditemukan');
  }

  // Check if used in transactions
  const transaksi = await Transaksi.count({
    where: { id_jenis_parkir: id },
  });

  if (transaksi > 0) {
    return errorResponse(res, 400, 'Tidak dapat menghapus jenis parkir yang sudah digunakan');
  }

  await jenisParkir.destroy();

  successResponse(res, 200, null, 'Jenis parkir berhasil dihapus');
});
