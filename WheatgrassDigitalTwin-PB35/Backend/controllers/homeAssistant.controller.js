const haService = require('../services/homeAssistant.service');

// Controller for Home Assistant operations
class HomeAssistantController {
  async getStates(req, res) {
    try {
      const states = await haService.getStates();
      res.json(states);
    } catch (error) {
      console.error('Error in getStates:', error);
      res.status(500).json({ error: 'Failed to fetch Home Assistant states' });
    }
  }

  async controlDevice(req, res) {
    try {
      const { entity_id } = req.params;
      const { service, data } = req.body;

      const [domain] = entity_id.split('.');
      const result = await haService.callService(domain, service, entity_id, data);

      res.json(result);
    } catch (error) {
      console.error('Error in controlDevice:', error);
      res.status(500).json({ error: 'Failed to control device' });
    }
  }
}

module.exports = new HomeAssistantController();
