const express = require('express');
const sensorController = require('../controllers/sensor.controller');

const router = express.Router();

// Get historical data for a specific sensor
router.get('/:sensor', (req, res) => sensorController.getHistoricalData(req, res));

module.exports = router;
