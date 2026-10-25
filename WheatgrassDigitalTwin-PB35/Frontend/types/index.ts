// Shared TypeScript types for the Wheatgrass Monitor application

export interface SensorData {
  temperature: number;
  humidity: number;
  light: number;
  pressure: number;
  waterFlow: number;
  lastUpdate: string | null;
}

export interface SensorReading {
  sensor: string;
  value: number;
  lastUpdate: string;
}

export interface HistoricalDataPoint {
  time: string;
  value: number;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  homeAssistant: {
    configured: boolean;
    url: string;
  };
}

export interface HomeAssistantEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export type NotificationSeverity = 'info' | 'warning' | 'critical';
export type NotificationType = 'threshold' | 'system' | 'alert';

export interface Alert {
  sensor: string;
  type: NotificationType;
  severity: NotificationSeverity;
  message: string;
  value: number;
  timestamp: string;
}

export interface AlertResponse {
  alerts: Alert[];
  count: number;
  criticalCount: number;
  warningCount: number;
}
