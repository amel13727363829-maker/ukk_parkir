const express = require('express');
const router = express.Router();
const arfController = require('../controllers/arfController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public GET routes (no auth required) - allow frontend to fetch area list for dropdown
router.get('/', arfController.getAllArea);
router.get('/by-jenis', arfController.getAreaByJenisParkir);
router.get('/occupancy', arfController.getAreaOccupancy);
router.get('/:id', arfController.getAreaById);

// Protected routes for modifying data
router.post('/', verifyToken, arfController.createArea);
router.put('/:id', verifyToken, arfController.updateArea);
router.delete('/:id', verifyToken, arfController.deleteArea);

module.exports = router;
