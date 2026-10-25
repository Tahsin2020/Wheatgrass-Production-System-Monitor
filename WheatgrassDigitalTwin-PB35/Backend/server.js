const express = require('express');
const cors = require('cors');
const Stream = require('node-rtsp-stream')
const WebSocket = require('ws');
require('dotenv').config();

const config = require('./config/config');
const { testConnection } = require('./config/database');
const { initializeDatabase } = require('./config/init-db');
const sensorService = require('./services/sensor.service');
const notificationService = require('./services/notification.service');

// Import routes
const authRoutes = require('./routes/auth.routes');
const sensorsRoutes = require('./routes/sensors.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const historyRoutes = require('./routes/history.routes');
const haRoutes = require('./routes/homeAssistant.routes');

const app = express();
const PORT = config.server.port;
const rtsp_url = "rtsp://"+config.rtsp.username+":"+config.rtsp.password+"@"+config.rtsp.stream_url;
const wsPort = config.rtsp.wsPort;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ha', haRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    homeAssistant: {
      configured: !!config.homeAssistant.token,
      url: config.homeAssistant.url,
    },
  });
});

// WebSocket connection to Home Assistant (for real-time updates)
function connectHomeAssistantWebSocket() {
  const wsUrl = config.homeAssistant.url.replace('http', 'ws') + 'api/websocket';
  
  try {
    const ws = new WebSocket(wsUrl);
    let messageId = 1;

    ws.on('open', () => {
      console.log('Connected to Home Assistant WebSocket');
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'auth_required') {
        // Send authentication
        ws.send(JSON.stringify({
          type: 'auth',
          access_token: config.homeAssistant.token,
        }));
      } else if (message.type === 'auth_ok') {
        console.log('Home Assistant WebSocket authenticated');
        
        // Subscribe to state changes
        ws.send(JSON.stringify({
          id: messageId++,
          type: 'subscribe_events',
          event_type: 'state_changed',
        }));
      } else if (message.type === 'event') {
        // Handle state change events - refresh sensor data
        sensorService.fetchSensorData().then(data => {
          notificationService.checkThresholds(data);
        });
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed. Reconnecting in 5 seconds...');
      setTimeout(connectHomeAssistantWebSocket, 5000);
    });
  } catch (error) {
    console.error('Failed to connect to Home Assistant WebSocket:', error.message);
    setTimeout(connectHomeAssistantWebSocket, 5000);
  }
}

// Periodic sensor data fetch and threshold checking
async function periodicCheck() {
  try {
    const data = await sensorService.fetchSensorData();
    notificationService.checkThresholds(data);
  } catch (error) {
    console.error('Error in periodic check:', error.message);
  }
}

function initializeRTSPStream() {
  stream = new Stream({
    name: 'name',
    streamUrl: rtsp_url,
    wsPort: wsPort,

    ffmpegOptions: {
      '-rtsp_transport': 'udp',   // required for reliability
      '-f': 'mpegts',             // output format
      '-codec:v': 'mpeg1video',   // Required for JSMpeg
      '-r': 30,                   // frame rate
      '-bf': '0',                 // no B-frames
      '-b:v': '1000k',            // bitrate
      // '-s': '640x480'             // resolution (important)
    }
  });

  console.log('Stream started on ws://localhost'+wsPort);

  // Error, don't have the wsPort accessed by anyone else.
  // Optional: debug if stream dies
  stream.on('exitWithError', () => {
    console.error('Stream exited with error');
  });
}

// Start server
app.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Home Assistant URL: ${config.homeAssistant.url}`);
  
  // Initialize database
  console.log('\nInitializing database...');
  const dbConnected = await testConnection();
  if (dbConnected) {
    try {
      await initializeDatabase();
      console.log('Database ready for use\n');
    } catch (error) {
      console.error('Database initialization failed:', error.message);
      console.warn('Server will continue but database features may not work\n');
    }
  } else {
    console.warn('Database connection failed. Server will continue but data will not be persisted\n');
  }
  
  if (config.homeAssistant.token) {
    console.log('Home Assistant token configured');
    console.log('\nThreshold Monitoring Enabled:');
    console.log(`- Temperature: ${config.thresholds.temperature.min}°C - ${config.thresholds.temperature.max}°C`);
    console.log(`- Humidity: ${config.thresholds.humidity.min}% - ${config.thresholds.humidity.max}%`);
    console.log(`- Light: ${config.thresholds.light.min} - ${config.thresholds.light.max} lux`);
    console.log(`- Pressure: ${config.thresholds.pressure.min}hPa - ${config.thresholds.pressure.max}hPa`);
    console.log(`- Water Flow: ${config.thresholds.waterFlow.min} - ${config.thresholds.waterFlow.max} L/min\n`);
    
    // Initial fetch
    periodicCheck();
    
    // Connect to WebSocket for real-time updates
    connectHomeAssistantWebSocket();

    // Connect to Home Assistant Camera RTSP Stream and share veido stream to dashboard(s)
    initializeRTSPStream()
    
    // Periodic polling as backup
    setInterval(periodicCheck, config.notifications.checkInterval);
  } else {
    console.warn('WARNING: Home Assistant token not configured. Set HA_TOKEN in .env file');
  }
});
