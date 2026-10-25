const express = require('express');
const sensorController = require('../controllers/sensor.controller');

const router = express.Router();

// Get all sensor data
router.get('/', (req, res) => sensorController.getAllSensors(req, res));

// Get database statistics
router.get('/stats', (req, res) => sensorController.getDatabaseStats(req, res));

// Get specific sensor
router.get('/:sensor', (req, res) => sensorController.getSpecificSensor(req, res));

module.exports = router;
