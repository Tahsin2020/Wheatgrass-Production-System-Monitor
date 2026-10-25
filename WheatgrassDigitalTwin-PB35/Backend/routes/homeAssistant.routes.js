const express = require('express');
const haController = require('../controllers/homeAssistant.controller');

const router = express.Router();

// Get all Home Assistant entities
router.get('/states', (req, res) => haController.getStates(req, res));

// Control a device
router.post('/control/:entity_id', (req, res) => haController.controlDevice(req, res));

module.exports = router;
