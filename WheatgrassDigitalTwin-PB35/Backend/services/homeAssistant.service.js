const axios = require('axios');
const config = require('../config/config');

// Home Assistant API service
class HomeAssistantService {
  constructor() {
    this.api = axios.create({
      baseURL: config.homeAssistant.url,
      headers: {
        'Authorization': `Bearer ${config.homeAssistant.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getStates() {
    try {
      const response = await this.api.get('/api/states');
      return response.data;
    } catch (error) {
      console.error('Error fetching states from Home Assistant:', error.message);
      throw error;
    }
  }

  async getHistory(entityId, startDate, endDate) {
    try {
      const response = await this.api.get(`/api/history/period/${startDate}`, {
        params: {
          filter_entity_id: entityId,
          end_time: endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching history from Home Assistant:', error.message);
      throw error;
    }
  }

  async callService(domain, service, entityId, data = {}) {
    try {
      const response = await this.api.post(`/api/services/${domain}/${service}`, {
        entity_id: entityId,
        ...data,
      });
      return response.data;
    } catch (error) {
      console.error('Error calling Home Assistant service:', error.message);
      throw error;
    }
  }
}

module.exports = new HomeAssistantService();
