const express = require('express');
const router = express.Router();
const jenisParkirController = require('../controllers/jenisParkirController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', jenisParkirController.getAllJenisParkir);
router.get('/:id', jenisParkirController.getJenisParkirById);

// POST route
router.post('/', jenisParkirController.createJenisParkir);

// PUT route
router.put('/:id', jenisParkirController.updateJenisParkir);

// DELETE route
router.delete('/:id', jenisParkirController.deleteJenisParkir);

module.exports = router;
