const express = require('express');
const router = express.Router();
const tarifParkirController = require('../controllers/tarifParkirController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', tarifParkirController.getAllTarif);
router.get('/:id', tarifParkirController.getTarifById);

// POST route
router.post('/', tarifParkirController.createTarif);

// PUT route
router.put('/:id', tarifParkirController.updateTarif);

// DELETE route
router.delete('/:id', tarifParkirController.deleteTarif);

module.exports = router;
