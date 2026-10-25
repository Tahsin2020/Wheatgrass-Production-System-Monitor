const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => authController.login(req, res));

// Refresh token endpoint
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

// Logout endpoint
router.post('/logout', (req, res) => authController.logout(req, res));

// Get user info (protected)
router.get('/userinfo', verifyToken, (req, res) => authController.getUserInfo(req, res));

module.exports = router;
