// API service for communicating with the backend
import { SensorData, HistoricalDataPoint, HealthStatus, AlertResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  async getSensorData(): Promise<SensorData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sensors`);
      if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      throw error;
    }
  }

  async getSpecificSensor(sensor: string): Promise<{ sensor: string; value: number; lastUpdate: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sensors/${sensor}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${sensor} data`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${sensor} data:`, error);
      throw error;
    }
  }

  async getHistoricalData(sensor: string, start?: string, end?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      
      const url = `${this.baseUrl}/api/history/${sensor}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch historical data for ${sensor}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching historical data for ${sensor}:`, error);
      throw error;
    }
  }

  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error('Failed to fetch health status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching health status:', error);
      throw error;
    }
  }

  // Alert API methods
  async getAlerts(): Promise<AlertResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  async getCriticalAlerts(): Promise<{ alerts: any[]; count: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/critical`);
      if (!response.ok) {
        throw new Error('Failed to fetch critical alerts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching critical alerts:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
