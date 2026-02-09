const { TarifParkir, JenisParkir } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');
const { asyncHandler } = require('../middleware/errorHandler');

// Get All Tarif
exports.getAllTarif = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await TarifParkir.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id_tarif', 'DESC']],
    include: [
      {
        model: JenisParkir,
        attributes: ['id_jenis_parkir', 'nama_jenis'],
      },
    ],
  });

  const totalPages = Math.ceil(count / limit);

  paginatedResponse(res, 200, rows, count, page, totalPages, 'Tarif retrieved');
});

// Get Tarif by ID
exports.getTarifById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tarif = await TarifParkir.findByPk(id, {
    include: [
      {
        model: JenisParkir,
        attributes: ['id_jenis_parkir', 'nama_jenis'],
      },
    ],
  });

  if (!tarif) {
    return errorResponse(res, 404, 'Tarif tidak ditemukan');
  }

  successResponse(res, 200, tarif, 'Tarif retrieved');
});

// Create Tarif
exports.createTarif = asyncHandler(async (req, res) => {
  const { id_jenis_parkir, tarif_per_jam, tarif_per_hari, tarif_bulanan } = req.body;

  // Validasi
  if (!id_jenis_parkir || !tarif_per_jam) {
    return errorResponse(res, 400, 'Id jenis parkir dan tarif per jam wajib diisi');
  }

  // Check jenis parkir exists
  const jenisParkir = await JenisParkir.findByPk(id_jenis_parkir);
  if (!jenisParkir) {
    return errorResponse(res, 404, 'Jenis parkir tidak ditemukan');
  }

  const tarif = await TarifParkir.create({
    id_jenis_parkir,
    tarif_per_jam: parseFloat(tarif_per_jam),
    tarif_per_hari: tarif_per_hari ? parseFloat(tarif_per_hari) : null,
    tarif_bulanan: tarif_bulanan ? parseFloat(tarif_bulanan) : null,
  });

  successResponse(res, 201, tarif, 'Tarif berhasil ditambahkan');
});

// Update Tarif
exports.updateTarif = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { id_jenis_parkir, tarif_per_jam, tarif_per_hari, tarif_bulanan } = req.body;

  const tarif = await TarifParkir.findByPk(id);

  if (!tarif) {
    return errorResponse(res, 404, 'Tarif tidak ditemukan');
  }

  if (id_jenis_parkir) {
    const jenisParkir = await JenisParkir.findByPk(id_jenis_parkir);
    if (!jenisParkir) {
      return errorResponse(res, 404, 'Jenis parkir tidak ditemukan');
    }
  }

  Object.assign(tarif, {
    id_jenis_parkir: id_jenis_parkir || tarif.id_jenis_parkir,
    tarif_per_jam: tarif_per_jam ? parseFloat(tarif_per_jam) : tarif.tarif_per_jam,
    tarif_per_hari: tarif_per_hari ? parseFloat(tarif_per_hari) : tarif.tarif_per_hari,
    tarif_bulanan: tarif_bulanan ? parseFloat(tarif_bulanan) : tarif.tarif_bulanan,
  });

  await tarif.save();

  successResponse(res, 200, tarif, 'Tarif berhasil diupdate');
});

// Delete Tarif
exports.deleteTarif = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tarif = await TarifParkir.findByPk(id);

  if (!tarif) {
    return errorResponse(res, 404, 'Tarif tidak ditemukan');
  }

  await tarif.destroy();

  successResponse(res, 200, null, 'Tarif berhasil dihapus');
});
