const { LogAktivitas, User } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');
const { asyncHandler } = require('../middleware/errorHandler');

// Get All Logs
exports.getAllLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, user_id } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (user_id) {
    where.id_user = user_id;
  }

  const { count, rows } = await LogAktivitas.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['waktu_aksi', 'DESC']],
    include: [
      {
        model: User,
        attributes: ['id_user', 'username', 'nama_lengkap'],
      },
    ],
  });

  const totalPages = Math.ceil(count / limit);

  paginatedResponse(res, 200, rows, count, page, totalPages, 'Logs retrieved');
});

// Create Log (Internal Use)
exports.createLog = asyncHandler(async (req, res) => {
  const { id_user, deskripsi_aksi } = req.body;

  if (!deskripsi_aksi) {
    return errorResponse(res, 400, 'Deskripsi aksi wajib diisi');
  }

  const log = await LogAktivitas.create({
    id_user: id_user || null,
    deskripsi_aksi,
  });

  successResponse(res, 201, log, 'Log berhasil dibuat');
});

// Clear Logs (Admin only)
exports.clearLogs = asyncHandler(async (req, res) => {
  const { days_old = 30 } = req.body;

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - parseInt(days_old));

  const result = await LogAktivitas.destroy({
    where: {
      waktu_aksi: {
        [require('sequelize').Op.lt]: dateThreshold,
      },
    },
  });

  successResponse(res, 200, { deleted: result }, `${result} log records berhasil dihapus`);
});
