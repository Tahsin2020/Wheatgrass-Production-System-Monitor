const sensorService = require('../services/sensor.service');
const notificationService = require('../services/notification.service');
const dbService = require('../services/database.service');

// Controller for sensor-related operations
class SensorController {
  async getAllSensors(req, res) {
    try {
      await sensorService.fetchSensorData();
      const data = sensorService.getLatestData();
      
      // Check thresholds and generate notifications
      notificationService.checkThresholds(data);
      
      res.json(data);
    } catch (error) {
      console.error('Error in getAllSensors:', error);
      res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
  }

  async getSpecificSensor(req, res) {
    try {
      const sensor = req.params.sensor;
      const data = sensorService.getSpecificSensor(sensor);
      
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ error: 'Sensor not found' });
      }
    } catch (error) {
      console.error('Error in getSpecificSensor:', error);
      res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
  }

  async getHistoricalData(req, res) {
    try {
      const sensor = req.params.sensor;
      const start = req.query.start || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const end = req.query.end || new Date().toISOString();

      const data = await sensorService.getHistoricalData(sensor, start, end);
      res.json(data);
    } catch (error) {
      console.error('Error in getHistoricalData:', error);
      res.status(500).json({ error: 'Failed to fetch historical data' });
    }
  }

  async getDatabaseStats(req, res) {
    try {
      const stats = await dbService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error in getDatabaseStats:', error);
      res.status(500).json({ error: 'Failed to fetch database statistics' });
    }
  }
}

module.exports = new SensorController();
