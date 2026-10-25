# Wheatgrass Monitor - Automated Production System

A full-stack monitoring and control system for automated wheatgrass production using Next.js, Node.js, Home Assistant, and Keycloak authentication.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Service Verification](#service-verification)
- [Troubleshooting](#troubleshooting)
- [API Endpoints](#api-endpoints)
- [Sensor Threshold Configuration](#sensor-threshold-configuration)
- [Development Workflow](#development-workflow)
- [Notes](#notes)
- [Support](#support)

## 🔧 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Docker** (for running Keycloak)
- **PostgreSQL** (v12 or higher) - for time series sensor data storage
- **Home Assistant** (running and accessible) - see [Hardware/HOME_ASSISTANT_SETUP.md](Hardware/HOME_ASSISTANT_SETUP.md) for installatione
- **Java** (v26 or higher)
- **Keycloak** (v26.5.7 or higher, also running and accessible)
- **FFmpeg** (8.1 or higher)

## 📁 Project Structure

```
Code/
├── Backend/              # Node.js Express server
│   ├── config/          # Configuration files
│   ├── controllers/     # API controllers
│   ├── middleware/      # Authentication middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── .env             # Backend environment variables
│   └── server.js        # Main server file
│
├── Frontend/            # Next.js React application
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Next.js pages
│   ├── public/         # Holds images 
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── .env.local      # Frontend environment variables
│
└── run.sh              # Convenience script to run both services
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 2. Keycloak Setup

**Recommended: Using Docker Compose (with persistence)**

Keycloak is included in the Docker Compose setup and will start automatically with `./run.sh start`. All realms, users, and configuration are persisted in a Docker volume.

**Optional: Standalone Docker Container**

If you prefer to run Keycloak separately, use this command with persistent storage:

```bash
docker run -d \
  --name keycloak-local \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v keycloak_data:/opt/keycloak/data \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

**Note:** The `-v keycloak_data:/opt/keycloak/data` ensures your realms, users, and configuration persist across container restarts.

#### Configure Keycloak

1. **Access Keycloak Admin Console**
   - URL: http://localhost:8080/admin
   - Username: `admin`
   - Password: `admin`

2. **Create Realm**
   - Name: `wheatgrass`

3. **Create Client**
   - Client ID: `wheatgrass-monitor`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/*`
   - **Enable Direct Access Grants**: Go to the client's Settings tab → Capability config → Enable "Direct access grants"
   - Copy the **Client Secret** to `Backend/.env` → `KEYCLOAK_CLIENT_SECRET`

4. **Create Users**
   - Navigate to Users → Add User
   - Set username and email
   - Set first name and last name
   - Go to Credentials tab and set password
   - Disable "Temporary" password option

### 3. Set Up Home Assistant

> 📖 **For detailed Home Assistant and ESPHome installation instructions, see [Hardware/HOME_ASSISTANT_SETUP.md](Hardware/HOME_ASSISTANT_SETUP.md)**

#### Generate Long-Lived Access Token

1. Log into Home Assistant
2. Click on your profile (bottom left)
3. Scroll to "Long-Lived Access Tokens"
4. Click "Create Token"
5. Copy the token to `Backend/.env` → `HA_TOKEN`

#### Configure Sensor Entities

The system expects these sensor entities in Home Assistant:
- `sensor.temperature`
- `sensor.humidity`
- `sensor.light_level`
- `sensor.pressure`
- `sensor.water_flow`

However you can also set up the entity id's in the .env file in the Backend Folder. 

Below is an example:

```bash
TEMP_ENTITY_ID = sensor.wheatgrass_sensors_temperature
HUMIDITY_ENTITY_ID = sensor.wheatgrass_sensors_humidity
LIGHT_ENTITY_ID = sensor.wheatgrass_sensors_light
PRESSURE_ENTITY_ID = sensor.wheatgrass_sensors_pressure
WATER_FLOW_ENTITY_ID = sensor.wheatgrass_sensors_water_flow_rate
```

Refer to the [wheatgrass-monitor-esp32-pb-35](https://github.com/sam-pty/wheatgrass-monitor-esp32-pb-35)
repo if accessible for ESPHome device configuration.

Otherwise, look at [Hardware/HOME_ASSISTANT_SETUP.md](Hardware/HOME_ASSISTANT_SETUP.md) and `Hardware/esphome.txt` for ESPHome device configuration.

#### Configure RTSP Video Stream

After setting up the RTSP Camera Streaming in Home Assistant, you should have a username, password, and rtsp stream url for your camera.

To find it, access your home assistant url (on the same network or through accessing it with a VPN) and login with your home assistant account. 

Example URL: http://100.90.146.14:8123/lovelace/0

Click Settings > Devices & services > Generic Camera > Configure (Gear symbol). 

A menu saying Options should appear, with:

- `Stream source URL (RTSP_STREAM_URL)`
- `Username (RTSP_USER)`
- `Password (RTSP_PASSWORD)`

Put these in the .env file (example values below):

```bash
RTSP_USER=pb_ece
RTSP_PASSWORD=pb_ece123
RTSP_STREAM_URL=192.168.100.101:554/stream2
```

Also pick a port to stream the RTSP Camera Stream for the Frontend Dashboard to connect to. Example: 9999

Put it in the Backend/.env file as RTSP_WS_PORT:

```bash
RTSP_WS_PORT=9999
```

Also put it in Frontend/.env.local file as NEXT_PUBLIC_RTSP_SERVER_PORT:

```bash
# RTSP Server Port
NEXT_PUBLIC_RTSP_SERVER_PORT=9999
```

### 4. Set Up PostgreSQL Database

The application uses PostgreSQL to store time series sensor data.

#### Install PostgreSQL (macOS)

```bash
brew install postgresql@15
brew services start postgresql@15
```

For other platforms, see [Backend/DATABASE_SETUP.md](Backend/DATABASE_SETUP.md)

#### Create Database

```bash
createdb wheatgrass_monitor
```

#### Initialize Database Schema

```bash
cd Backend
npm run db:init
```

This creates the necessary tables and indexes for time series data storage.

**Key Points:**
- Sensor data is automatically saved to PostgreSQL on every fetch
- Historical charts display real data from the database
- Data persists across server restarts
- Query database: `psql wheatgrass_monitor -c "SELECT * FROM latest_sensor_readings;"`
- See [Backend/DATABASE_SETUP.md](Backend/DATABASE_SETUP.md) for detailed documentation

### 5. Configure Environment Variables

#### Backend Configuration (`Backend/.env`)

```bash
# Home Assistant Configuration
HA_URL=http://homeassistant.local:8123
HA_TOKEN=your_home_assistant_long_lived_token

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wheatgrass_monitor
DB_USER=postgres
DB_PASSWORD=postgres

# Server Configuration
PORT=3001

# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=wheatgrass
KEYCLOAK_CLIENT_ID=wheatgrass-monitor
KEYCLOAK_CLIENT_SECRET=your_keycloak_client_secret
SESSION_SECRET=change-this-to-random-secure-key-in-production

# Sensor Thresholds (adjust as needed)
TEMP_MIN=18
TEMP_MAX=28
HUMIDITY_MIN=50
HUMIDITY_MAX=75
LIGHT_MIN=600
LIGHT_MAX=1200
PRESSURE_MIN=30
PRESSURE_MAX=60
```

#### Frontend Configuration (`Frontend/.env.local`)

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🏃 Running the Application

### Option 1: Using the Run Script (Recommended)

```bash
# From the project root
./run.sh
```

### Option 2: Manual Start

#### Start Backend Server

```bash
cd Backend
npm start
```

The backend will run on http://localhost:3001

#### Start Frontend Development Server

```bash
cd Frontend
npm run dev
```

The frontend will run on http://localhost:3000

## ✅ Service Verification

### Check if Backend is Running

```bash
# Check if port 3001 is in use
lsof -ti:3001

# Test health endpoint
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T...",
  "homeAssistant": {
    "configured": true,
    "url": "http://homeassistant.local:8123"
  }
}
```

### Check if Keycloak is Running

```bash
# Check Keycloak accessibility
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080

# Or visit in browser
open http://localhost:8080
```

### Check if Frontend is Running

```bash
# Check if port 3000 is in use
lsof -ti:3000

# Or visit in browser
open http://localhost:3000
```

### Test Authentication Endpoint

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

##  Troubleshooting

### Backend Not Starting

**Issue**: Backend server not responding on port 3001

**Solutions**:
```bash
# Check if port is already in use
lsof -ti:3001

# Kill existing process if needed
kill -9 $(lsof -ti:3001)

# Restart the backend
cd Backend
npm start
```

### Login Fails

**Issue**: "Login failed" or network error

**Check**:
1. Backend server is running: `lsof -ti:3001`
2. Keycloak is accessible: `curl http://localhost:8080`
3. Environment variables are set correctly in `Backend/.env`
4. User exists in Keycloak realm

### Home Assistant Connection Issues

**Issue**: Cannot fetch sensor data

**Solutions**:
```bash
# Test Home Assistant connectivity
curl -H "Authorization: Bearer YOUR_HA_TOKEN" \
  http://homeassistant.local:8123/api/

# Check backend logs
tail -f Backend/backend.log

# Verify HA_TOKEN and HA_URL in Backend/.env
```

### Frontend Can't Connect to Backend

**Issue**: API calls failing

**Check**:
1. `NEXT_PUBLIC_API_URL` in `Frontend/.env.local` matches backend URL
2. Backend is running on the correct port
3. CORS is enabled in backend (already configured)

### Port Already in Use

```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)

# Or for port 3000 (frontend)
kill -9 $(lsof -ti:3000)
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/userinfo` - Get user information

### Sensors
- `GET /api/sensors` - Get all sensor data
- `GET /api/sensors/:sensor` - Get specific sensor data

### History
- `GET /api/history/:sensor` - Get historical data for sensor
  - Query params: `start`, `end` (ISO timestamps)

### Notifications
- `GET /api/notifications` - Get all alerts
- `GET /api/notifications/critical` - Get critical alerts only

### Health
- `GET /api/health` - System health check

## 📊 Sensor Threshold Configuration

Modify thresholds in `Backend/.env`:

```bash
# Warning thresholds
TEMP_MIN=18          # Minimum temperature (°C)
TEMP_MAX=28          # Maximum temperature (°C)

# Critical thresholds (triggers critical alerts)
TEMP_CRITICAL_MIN=15
TEMP_CRITICAL_MAX=32
```

Available threshold categories:
- Temperature (°C)
- Humidity (%)
- Light Level (lux)
- Soil Pressure (hPa)
- Water Flow (L/min)

## 🔄 Development Workflow

### Making Changes to Frontend

```bash
cd Frontend
npm run dev  # Hot reload enabled
```

### Making Changes to Backend

```bash
cd Backend
npm start    # Restart required after changes
```

### Building for Production

```bash
# Build frontend
cd Frontend
npm run build
npm start

# Backend runs the same in production
cd Backend
npm start
```

## 📝 Notes

- Backend runs on port **3001**
- Frontend runs on port **3000**
- Keycloak must be on port **8080**
- Sensor data updates every **30 seconds**
- Alert checks run every **30 seconds** (configurable)
- Historical data is fetched from Home Assistant

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all services are running
3. Check backend logs: `tail -f Backend/backend.log`
4. Check frontend logs in browser console

