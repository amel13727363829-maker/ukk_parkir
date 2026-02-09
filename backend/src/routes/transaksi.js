const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', transaksiController.getAllTransaksi);
router.get('/aktif', transaksiController.getAktifTransaksi);
router.get('/:id', transaksiController.getTransaksiById);

// Check-in / Check-out
router.post('/checkin', transaksiController.checkIn);
router.put('/:id/checkout', transaksiController.checkOut);

// Payment
router.put('/:id/payment', transaksiController.updatePaymentStatus);

// DELETE
router.delete('/:id', transaksiController.deleteTransaksi);

module.exports = router;
