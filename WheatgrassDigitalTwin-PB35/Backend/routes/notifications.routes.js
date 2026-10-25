const express = require('express');
const alertController = require('../controllers/notification.controller');

const router = express.Router();

// Get all active alerts
router.get('/', (req, res) => alertController.getAlerts(req, res));

// Get critical alerts only
router.get('/critical', (req, res) => alertController.getCriticalAlerts(req, res));

module.exports = router;
