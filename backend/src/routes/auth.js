const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Routes
router.get('/profile', verifyToken, authController.getCurrentUser);
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;
