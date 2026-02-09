const { User, LogAktivitas } = require('../models');
const {
  generateToken,
  hashPassword,
  comparePassword,
} = require('../utils/tokenGenerator');
const {
  successResponse,
  errorResponse,
} = require('../utils/responseFormatter');
const { asyncHandler } = require('../middleware/errorHandler');

// Register
exports.register = asyncHandler(async (req, res) => {
  const { username, password, nama_lengkap, email, no_telepon, role } = req.body;

  // Validasi
  if (!username || !password || !nama_lengkap) {
    return errorResponse(res, 400, 'Username, password, dan nama_lengkap wajib diisi');
  }

  // Check existing user
  const existingUser = await User.findOne({
    where: { username },
  });

  if (existingUser) {
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

  // Generate token
  const token = generateToken(user);

  successResponse(res, 201, {
    user: {
      id_user: user.id_user,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      role: user.role,
    },
    token,
  }, 'Registrasi berhasil');
});

// Login
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  console.log('[Auth] Login attempt:', { username });

  // Validasi
  if (!username || !password) {
    return errorResponse(res, 400, 'Username dan password wajib diisi');
  }

  // Find user
  const user = await User.findOne({
    where: { username },
  });

  if (!user) {
    return errorResponse(res, 401, 'Username atau password salah');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return errorResponse(res, 401, 'Username atau password salah');
  }

  // Check if user is active
  if (!user.status_aktif) {
    return errorResponse(res, 403, 'User account tidak aktif');
  }

  // Generate token
  const token = generateToken(user);

  // Create activity log (best-effort)
  if (LogAktivitas) {
    LogAktivitas.create({
      id_user: user.id_user,
      deskripsi_aksi: `Login berhasil oleh user: ${user.username}`,
    }).catch(err => console.error('[Log] create login:', err.message));
  }

  successResponse(res, 200, {
    user: {
      id_user: user.id_user,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      role: user.role,
    },
    token,
  }, 'Login berhasil');
});

// Get Current User
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id_user, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    return errorResponse(res, 404, 'User tidak ditemukan');
  }

  successResponse(res, 200, user, 'User data retrieved');
});

// Change Password
exports.changePassword = asyncHandler(async (req, res) => {
  const { old_password, new_password, confirm_password } = req.body;

  // Validasi
  if (!old_password || !new_password || !confirm_password) {
    return errorResponse(res, 400, 'Semua field wajib diisi');
  }

  if (new_password !== confirm_password) {
    return errorResponse(res, 400, 'Password baru tidak cocok');
  }

  const user = await User.findByPk(req.user.id_user);

  if (!user) {
    return errorResponse(res, 404, 'User tidak ditemukan');
  }

  // Verify old password
  const isPasswordValid = await comparePassword(old_password, user.password);

  if (!isPasswordValid) {
    return errorResponse(res, 401, 'Password lama salah');
  }

  // Hash new password
  user.password = await hashPassword(new_password);
  await user.save();

  successResponse(res, 200, null, 'Password berhasil diubah');
});
