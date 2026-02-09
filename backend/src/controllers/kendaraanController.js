const { Kendaraan, Transaksi } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');
const { asyncHandler } = require('../middleware/errorHandler');

// Get All Kendaraan
exports.getAllKendaraan = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where.no_polisi = {
      [require('sequelize').Op.like]: `%${search}%`,
    };
  }

  const { count, rows } = await Kendaraan.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id_kendaraan', 'DESC']],
  });

  const totalPages = Math.ceil(count / limit);

  paginatedResponse(res, 200, rows, count, page, totalPages, 'Data kendaraan retrieved');
});

// Get Kendaraan by ID
exports.getKendaraanById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const kendaraan = await Kendaraan.findByPk(id, {
    include: [
      {
        model: Transaksi,
        as: 'Transaksis',
        attributes: ['id_transaksi', 'waktu_masuk', 'waktu_keluar', 'total_bayar'],
      },
    ],
  });

  if (!kendaraan) {
    return errorResponse(res, 404, 'Kendaraan tidak ditemukan');
  }

  successResponse(res, 200, kendaraan, 'Kendaraan retrieved');
});

// Create Kendaraan
exports.createKendaraan = asyncHandler(async (req, res) => {
  const { no_polisi, jenis_kendaraan, warna, tahun_pembuatan, tipe_kendaraan } = req.body;

  // Validasi
  if (!no_polisi) {
    return errorResponse(res, 400, 'No. polisi wajib diisi');
  }

  // Check duplicate
  const existing = await Kendaraan.findOne({
    where: { no_polisi },
  });

  if (existing) {
    return errorResponse(res, 400, 'Nomor polisi sudah terdaftar');
  }

  const kendaraan = await Kendaraan.create({
    no_polisi,
    jenis_kendaraan,
    warna,
    tahun_pembuatan: tahun_pembuatan ? parseInt(tahun_pembuatan) : null,
    tipe_kendaraan,
  });

  successResponse(res, 201, kendaraan, 'Kendaraan berhasil ditambahkan');
});

// Update Kendaraan
exports.updateKendaraan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { no_polisi, jenis_kendaraan, warna, tahun_pembuatan, tipe_kendaraan } = req.body;

  const kendaraan = await Kendaraan.findByPk(id);

  if (!kendaraan) {
    return errorResponse(res, 404, 'Kendaraan tidak ditemukan');
  }

  // Check duplicate no_polisi
  if (no_polisi && no_polisi !== kendaraan.no_polisi) {
    const existing = await Kendaraan.findOne({
      where: { no_polisi },
    });

    if (existing) {
      return errorResponse(res, 400, 'Nomor polisi sudah digunakan oleh kendaraan lain');
    }
  }

  Object.assign(kendaraan, {
    no_polisi: no_polisi || kendaraan.no_polisi,
    jenis_kendaraan: jenis_kendaraan || kendaraan.jenis_kendaraan,
    warna: warna || kendaraan.warna,
    tahun_pembuatan: tahun_pembuatan ? parseInt(tahun_pembuatan) : kendaraan.tahun_pembuatan,
    tipe_kendaraan: tipe_kendaraan || kendaraan.tipe_kendaraan,
  });

  await kendaraan.save();

  successResponse(res, 200, kendaraan, 'Kendaraan berhasil diupdate');
});

// Delete Kendaraan
exports.deleteKendaraan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const kendaraan = await Kendaraan.findByPk(id);

  if (!kendaraan) {
    return errorResponse(res, 404, 'Kendaraan tidak ditemukan');
  }

  // Check if have transaction
  const transaksi = await Transaksi.count({
    where: { id_kendaraan: id },
  });

  if (transaksi > 0) {
    return errorResponse(res, 400, 'Tidak dapat menghapus kendaraan yang memiliki riwayat transaksi');
  }

  await kendaraan.destroy();

  successResponse(res, 200, null, 'Kendaraan berhasil dihapus');
});
