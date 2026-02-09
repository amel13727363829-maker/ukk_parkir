const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const kendaraanRoutes = require('./kendaraan');
const jenisParkirRoutes = require('./jenisParkir');
const tarifParkirRoutes = require('./tarifParkir');
const arfRoutes = require('./arf');
const transaksiRoutes = require('./transaksi');
const userRoutes = require('./user');
const logAktivitasRoutes = require('./logAktivitas');

// API Documentation
router.get('/', (req, res) => {
  res.json({
    message: 'Aplikasi Parkir API v1',
    endpoints: {
      auth: '/auth',
      kendaraan: '/kendaraan',
      'jenis-parkir': '/jenis-parkir',
      tarif: '/tarif',
      area: '/area',
      transaksi: '/transaksi',
      user: '/user',
      logs: '/logs',
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes (Public)
router.use('/auth', authRoutes);

// Debug routes (temporary, no auth) - helpful for local troubleshooting
router.use('/debug', require('./debug'));

// Protected Routes
router.use('/kendaraan', kendaraanRoutes);
router.use('/jenis-parkir', jenisParkirRoutes);
router.use('/tarif', tarifParkirRoutes);
router.use('/area', arfRoutes);
router.use('/arf', arfRoutes);
router.use('/transaksi', transaksiRoutes);
router.use('/user', userRoutes);
router.use('/users', userRoutes); // Alias for /user
router.use('/logs', logAktivitasRoutes);

module.exports = router;
