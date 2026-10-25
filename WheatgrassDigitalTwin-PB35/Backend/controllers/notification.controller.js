const alertService = require('../services/notification.service');

// Controller for alert operations
class AlertController {
  getAlerts(req, res) {
    try {
      const alertData = alertService.getActiveAlerts();
      res.json(alertData);
    } catch (error) {
      console.error('Error in getAlerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  getCriticalAlerts(req, res) {
    try {
      const criticalAlerts = alertService.getCriticalAlerts();
      res.json({ alerts: criticalAlerts, count: criticalAlerts.length });
    } catch (error) {
      console.error('Error in getCriticalAlerts:', error);
      res.status(500).json({ error: 'Failed to fetch critical alerts' });
    }
  }
}

module.exports = new AlertController();
