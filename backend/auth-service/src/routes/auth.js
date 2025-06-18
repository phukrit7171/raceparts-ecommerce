const express = require('express');
const path = require('path');
const router = express.Router();
const authController = require(path.join(__dirname, '..', 'controllers', 'authController'));
const { authenticateToken } = require(path.join(__dirname, '..', 'middleware', 'authMiddleware'));

// Auth routes - note: these will be prefixed with /api/auth in the gateway
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router; 