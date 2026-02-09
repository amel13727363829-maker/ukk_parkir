const { User, LogAktivitas } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');
const { asyncHandler } = require('../middleware/errorHandler');
const { hashPassword } = require('../utils/tokenGenerator');
const { verifyRole } = require('../middleware/authMiddleware');

// Get All Users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (role) {
    where.role = role;
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['id_user', 'DESC']],
    attributes: { exclude: ['password'] },
  });

  const totalPages = Math.ceil(count / limit);

  paginatedResponse(res, 200, rows, count, page, totalPages, 'Users retrieved');
});

// Get User by ID
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    return errorResponse(res, 404, 'User tidak ditemukan');
  }

  successResponse(res, 200, user, 'User retrieved');
});

// Create User (Admin only)
exports.createUser = asyncHandler(async (req, res) => {
  const { username, password, nama_lengkap, email, no_telepon, role } = req.body;

  // Validasi
  if (!username || !password || !nama_lengkap) {
    return errorResponse(res, 400, 'Username, password, dan nama_lengkap wajib diisi');
  }

  // Check existing
  const existing = await User.findOne({
    where: { username },
  });

  if (existing) {
    return errorResponse(res, 400, 'Username sudah terdaftar');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    username,
    password: hashedPassword,
    nama_lengkap,
    email,
    no_telepon,
    role: role || 'operator',
  });

  const userResponse = {
    id_user: user.id_user,
    username: user.username,
    nama_lengkap: user.nama_lengkap,
    email: user.email,
    role: user.role,
  };

  successResponse(res, 201, userResponse, 'User berhasil ditambahkan');
  // Log activity (best-effort)
  if (LogAktivitas) {
    LogAktivitas.create({
      id_user: req.user?.id_user || null,
      deskripsi_aksi: `Menambahkan user baru: ${user.username} (role: ${user.role}) oleh userId: ${req.user?.id_user || 'anon'}`,
    }).catch(err => console.error('[Log] create user:', err.message));
  }
});

// Update User
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama_lengkap, email, no_telepon, role, status_aktif } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    return errorResponse(res, 404, 'User tidak ditemukan');
  }

  Object.assign(user, {
    nama_lengkap: nama_lengkap || user.nama_lengkap,
    email: email || user.email,
    no_telepon: no_telepon || user.no_telepon,
    role: role || user.role,
    status_aktif: status_aktif !== undefined ? status_aktif : user.status_aktif,
  });

  await user.save();

  const userResponse = {
    id_user: user.id_user,
    username: user.username,
    nama_lengkap: user.nama_lengkap,
    email: user.email,
    role: user.role,
    status_aktif: user.status_aktif,
  };

  successResponse(res, 200, userResponse, 'User berhasil diupdate');
  // Log activity (best-effort)
  if (LogAktivitas) {
    LogAktivitas.create({
      id_user: req.user?.id_user || null,
      deskripsi_aksi: `Update user: ${user.username} (id: ${user.id_user}) oleh userId: ${req.user?.id_user || 'anon'}`,
    }).catch(err => console.error('[Log] update user:', err.message));
  }
});

// Delete User
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user.id_user === parseInt(id)) {
    return errorResponse(res, 400, 'Tidak dapat menghapus akun Anda sendiri');
  }

  const user = await User.findByPk(id);

  if (!user) {
    return errorResponse(res, 404, 'User tidak ditemukan');
  }

  await user.destroy();

  successResponse(res, 200, null, 'User berhasil dihapus');
  // Log activity (best-effort)
  if (LogAktivitas) {
    LogAktivitas.create({
      id_user: req.user?.id_user || null,
      deskripsi_aksi: `Menghapus user: ${user.username} (id: ${user.id_user}) oleh userId: ${req.user?.id_user || 'anon'}`,
    }).catch(err => console.error('[Log] delete user:', err.message));
  }
});

// Reset Password (Admin only)
exports.resetPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;

  if (!new_password) {
    return errorResponse(res, 400, 'Password baru wajib diisi');
  }

  const user = await User.findByPk(id);

  if (!user) {
    return errorResponse(res, 404, 'User tidak ditemukan');
  }

  user.password = await hashPassword(new_password);
  await user.save();

  successResponse(res, 200, null, 'Password user berhasil direset');
  // Log activity (best-effort)
  if (LogAktivitas) {
    LogAktivitas.create({
      id_user: req.user?.id_user || null,
      deskripsi_aksi: `Reset password untuk user: ${user.username} (id: ${user.id_user}) oleh userId: ${req.user?.id_user || 'anon'}`,
    }).catch(err => console.error('[Log] reset password:', err.message));
  }
});
