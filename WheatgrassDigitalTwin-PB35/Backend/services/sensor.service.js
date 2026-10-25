const haService = require('./homeAssistant.service');
const dbService = require('./database.service');
const config = require('../config/config');

// Sensor data service
class SensorService {
  constructor() {
    this.latestData = {
      temperature: 0,
      humidity: 0,
      light: 0,
      pressure: 0,
      waterFlow: 0,
      lastUpdate: null,
    };
  }

  async fetchSensorData() {
    try {
      const states = await haService.getStates();

      const tempSensorID = config.entityIDs.temperature || 'sensor.test_temperature';
      const humiditySensorID = config.entityIDs.humidity || 'sensor.test_humidity';
      const lightSensorID = config.entityIDs.light || 'sensor.test_light';
      const pressureSensorID = config.entityIDs.pressure || 'sensor.test_pressure';
      const waterFlowSensorID = config.entityIDs.waterFlow || 'sensor.test_water_flow_rate';

      // Find and map sensor entities
      const tempSensor = states.find(s => s.entity_id === tempSensorID);
      const humiditySensor = states.find(s => s.entity_id === humiditySensorID);
      const lightSensor = states.find(s => s.entity_id === lightSensorID);
      const pressureSensor = states.find(s => 
        s.entity_id === pressureSensorID || s.entity_id.includes('pressure')
      );
      const waterFlowSensor = states.find(s => s.entity_id === waterFlowSensorID);

      this.latestData = {
        temperature: tempSensor ? parseFloat(tempSensor.state) : 0,
        humidity: humiditySensor ? parseFloat(humiditySensor.state) : 0,
        light: lightSensor ? parseFloat(lightSensor.state) : 0,
        pressure: pressureSensor ? parseFloat(pressureSensor.state) : 0,
        waterFlow: waterFlowSensor ? parseFloat(waterFlowSensor.state) : 0,
        lastUpdate: new Date().toISOString(),
      };

      // Save sensor data to PostgreSQL
      await this.saveSensorDataToDatabase();

      return this.latestData;
    } catch (error) {
      console.error('Error fetching sensor data:', error.message);
      return this.latestData;
    }
  }

  async saveSensorDataToDatabase() {
    try {
      const readings = [
        { sensorType: 'temperature', value: this.latestData.temperature, unit: '°C' },
        { sensorType: 'humidity', value: this.latestData.humidity, unit: '%' },
        { sensorType: 'light', value: this.latestData.light, unit: 'lux' },
        { sensorType: 'pressure', value: this.latestData.pressure, unit: 'hPa' },
        { sensorType: 'waterFlow', value: this.latestData.waterFlow, unit: 'L/min' },
      ];

      await dbService.insertBulkSensorReadings(readings);
      // Logged in dbService.insertBulkSensorReadings
    } catch (error) {
      console.error('Error saving sensor data to database:', error.message);
      // Don't throw - we want the API to continue working even if DB save fails
    }
  }

  getLatestData() {
    return this.latestData;
  }

  getSpecificSensor(sensorName) {
    if (this.latestData[sensorName] !== undefined) {
      return {
        sensor: sensorName,
        value: this.latestData[sensorName],
        lastUpdate: this.latestData.lastUpdate,
      };
    }
    return null;
  }

  async getHistoricalData(sensor, startDate, endDate) {
    try {
      // First try to get data from PostgreSQL
      const dbData = await dbService.getHistoricalData(sensor, startDate, endDate);
      
      if (dbData && dbData.length > 0) {
        console.log(`Retrieved ${dbData.length} records from database for ${sensor}`);
        return dbData;
      }

      // Fallback to Home Assistant if no data in database
      console.log(`No database data found, falling back to Home Assistant for ${sensor}`);
      const entityId = `sensor.${sensor}`;
      return await haService.getHistory(entityId, startDate, endDate);
    } catch (error) {
      console.error('Error fetching historical data:', error.message);
      throw error;
    }
  }
}

module.exports = new SensorService();
