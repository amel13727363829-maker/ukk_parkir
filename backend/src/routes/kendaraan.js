const express = require('express');
const router = express.Router();
const kendaraanController = require('../controllers/kendaraanController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', kendaraanController.getAllKendaraan);
router.get('/:id', kendaraanController.getKendaraanById);

// POST route
router.post('/', kendaraanController.createKendaraan);

// PUT route
router.put('/:id', kendaraanController.updateKendaraan);

// DELETE route
router.delete('/:id', kendaraanController.deleteKendaraan);

module.exports = router;
