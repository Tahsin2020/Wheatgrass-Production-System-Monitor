const config = require('../config/config');

// Alert service for real-time threshold monitoring
class AlertService {
  constructor() {
    this.currentAlerts = [];
  }

  checkThresholds(sensorData) {
    const activeAlerts = [];
    const timestamp = new Date().toISOString();

    // Check temperature
    const tempStatus = this.checkSensorThreshold(
      'temperature',
      sensorData.temperature,
      config.thresholds.temperature,
      '°C'
    );
    if (tempStatus) {
      activeAlerts.push({
        sensor: 'temperature',
        type: tempStatus.type,
        severity: tempStatus.severity,
        message: tempStatus.message,
        value: sensorData.temperature,
        timestamp,
      });
    }

    // Check humidity
    const humidityStatus = this.checkSensorThreshold(
      'humidity',
      sensorData.humidity,
      config.thresholds.humidity,
      '%'
    );
    if (humidityStatus) {
      activeAlerts.push({
        sensor: 'humidity',
        type: humidityStatus.type,
        severity: humidityStatus.severity,
        message: humidityStatus.message,
        value: sensorData.humidity,
        timestamp,
      });
    }

    // Check light
    const lightStatus = this.checkSensorThreshold(
      'light',
      sensorData.light,
      config.thresholds.light,
      'lux'
    );
    if (lightStatus) {
      activeAlerts.push({
        sensor: 'light',
        type: lightStatus.type,
        severity: lightStatus.severity,
        message: lightStatus.message,
        value: sensorData.light,
        timestamp,
      });
    }

    // Check pressure
    const pressureStatus = this.checkSensorThreshold(
      'pressure',
      sensorData.pressure,
      config.thresholds.pressure,
      'hPa'
    );
    if (pressureStatus) {
      activeAlerts.push({
        sensor: 'pressure',
        type: pressureStatus.type,
        severity: pressureStatus.severity,
        message: pressureStatus.message,
        value: sensorData.pressure,
        timestamp,
      });
    }

    // Check water flow
    const waterFlowStatus = this.checkSensorThreshold(
      'waterFlow',
      sensorData.waterFlow,
      config.thresholds.waterFlow,
      'L/min'
    );
    if (waterFlowStatus) {
      activeAlerts.push({
        sensor: 'waterFlow',
        type: waterFlowStatus.type,
        severity: waterFlowStatus.severity,
        message: waterFlowStatus.message,
        value: sensorData.waterFlow,
        timestamp,
      });
    }

    // Store current alerts (replaces old ones)
    this.currentAlerts = activeAlerts;
    return activeAlerts;
  }

  checkSensorThreshold(sensorName, value, threshold, unit) {
    if (value <= threshold.criticalMin) {
      return {
        type: 'threshold',
        severity: 'critical',
        message: `${this.formatSensorName(sensorName)} critically low: ${value}${unit} (Critical Min: ${threshold.criticalMin}${unit})`,
      };
    }
    if (value >= threshold.criticalMax) {
      return {
        type: 'threshold',
        severity: 'critical',
        message: `${this.formatSensorName(sensorName)} critically high: ${value}${unit} (Critical Max: ${threshold.criticalMax}${unit})`,
      };
    }
    if (value < threshold.min) {
      return {
        type: 'threshold',
        severity: 'warning',
        message: `${this.formatSensorName(sensorName)} below optimal: ${value}${unit} (Min: ${threshold.min}${unit})`,
      };
    }
    if (value > threshold.max) {
      return {
        type: 'threshold',
        severity: 'warning',
        message: `${this.formatSensorName(sensorName)} above optimal: ${value}${unit} (Max: ${threshold.max}${unit})`,
      };
    }
    return null;
  }

  formatSensorName(sensorName) {
    const names = {
      temperature: 'Temperature',
      humidity: 'Humidity',
      light: 'Light Level',
      pressure: 'Pressure',
      waterFlow: 'Water Flow',
    };
    return names[sensorName] || sensorName;
  }

  getActiveAlerts() {
    return {
      alerts: this.currentAlerts,
      count: this.currentAlerts.length,
      criticalCount: this.currentAlerts.filter(a => a.severity === 'critical').length,
      warningCount: this.currentAlerts.filter(a => a.severity === 'warning').length,
    };
  }

  hasActiveAlerts() {
    return this.currentAlerts.length > 0;
  }

  getCriticalAlerts() {
    return this.currentAlerts.filter(a => a.severity === 'critical');
  }

  getAlertsBySeverity(severity) {
    return this.currentAlerts.filter(a => a.severity === severity);
  }
}

module.exports = new AlertService();
