const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', verifyRole('admin', 'manager', 'owner'), userController.getAllUsers);
router.get('/:id', userController.getUserById);

// POST route (Admin only)
router.post('/', verifyRole('admin'), userController.createUser);

// PUT routes
router.put('/:id', userController.updateUser);
router.put('/:id/reset-password', verifyRole('admin'), userController.resetPassword);

// DELETE route (Admin only)
router.delete('/:id', verifyRole('admin'), userController.deleteUser);

module.exports = router;
