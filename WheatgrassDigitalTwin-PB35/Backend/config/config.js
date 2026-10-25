// Configuration module for loading and validating environment variables
module.exports = {
  server: {
    port: process.env.PORT || 3001,
  },
  homeAssistant: {
    url: process.env.HA_URL || 'http://homeassistant.local:8123',
    token: process.env.HA_TOKEN || '',
  },
  keycloak: {
    url: process.env.KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.KEYCLOAK_REALM || 'wheatgrass',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'wheatgrass-monitor',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    publicKey: process.env.KEYCLOAK_PUBLIC_KEY || '',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-secret-key',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'wheatgrass_monitor',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  rtsp:{
    username:process.env.RTSP_USER,
    password:process.env.RTSP_PASSWORD,
    stream_url:process.env.RTSP_STREAM_URL,
    wsPort:process.env.RTSP_WS_PORT,
  },
  entityIDs:{
    temperature:process.env.TEMP_ENTITY_ID,
    humidity:process.env.HUMIDITY_ENTITY_ID,
    light:process.env.LIGHT_ENTITY_ID,
    pressure:process.env.PRESSURE_ENTITY_ID,
    waterFlow:process.env.WATER_FLOW_ENTITY_ID,
  },
  thresholds: {
    temperature: {
      min: parseFloat(process.env.TEMP_MIN) || 18,
      max: parseFloat(process.env.TEMP_MAX) || 28,
      criticalMin: parseFloat(process.env.TEMP_CRITICAL_MIN) || 15,
      criticalMax: parseFloat(process.env.TEMP_CRITICAL_MAX) || 32,
    },
    humidity: {
      entityID:process.env.HUMIDITY_ENTITY_ID,
      min: parseFloat(process.env.HUMIDITY_MIN) || 50,
      max: parseFloat(process.env.HUMIDITY_MAX) || 75,
      criticalMin: parseFloat(process.env.HUMIDITY_CRITICAL_MIN) || 40,
      criticalMax: parseFloat(process.env.HUMIDITY_CRITICAL_MAX) || 85,
    },
    light: {
      entityID:process.env.LIGHT_ENTITY_ID,
      min: parseFloat(process.env.LIGHT_MIN) || 600,
      max: parseFloat(process.env.LIGHT_MAX) || 1200,
      criticalMin: parseFloat(process.env.LIGHT_CRITICAL_MIN) || 400,
      criticalMax: parseFloat(process.env.LIGHT_CRITICAL_MAX) || 1500,
    },
    pressure: {
      entityID:process.env.PRESSURE_ENTITY_ID,
      min: parseFloat(process.env.PRESSURE_MIN) || 30,
      max: parseFloat(process.env.PRESSURE_MAX) || 60,
      criticalMin: parseFloat(process.env.PRESSURE_CRITICAL_MIN) || 20,
      criticalMax: parseFloat(process.env.PRESSURE_CRITICAL_MAX) || 70,
    },
    waterFlow: {
      entityID:process.env.WATER_FLOW_ENTITY_ID,
      min: parseFloat(process.env.WATER_FLOW_MIN) || 0.5,
      max: parseFloat(process.env.WATER_FLOW_MAX) || 2.0,
      criticalMin: parseFloat(process.env.WATER_FLOW_CRITICAL_MIN) || 0.1,
      criticalMax: parseFloat(process.env.WATER_FLOW_CRITICAL_MAX) || 3.0,
    },
  },
  notifications: {
    checkInterval: parseInt(process.env.NOTIFICATION_CHECK_INTERVAL) || 30000,
    maxAge: parseInt(process.env.NOTIFICATION_MAX_AGE) || 3600000, // 1 hour
  },
};
