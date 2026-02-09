const express = require('express');
const router = express.Router();
const logAktivitasController = require('../controllers/logAktivitasController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', verifyRole('admin', 'manager'), logAktivitasController.getAllLogs);

// POST route (Admin only)
router.post('/', verifyRole('admin'), logAktivitasController.createLog);

// DELETE route (Admin only) - Clear old logs
router.delete('/clear', verifyRole('admin'), logAktivitasController.clearLogs);

module.exports = router;
