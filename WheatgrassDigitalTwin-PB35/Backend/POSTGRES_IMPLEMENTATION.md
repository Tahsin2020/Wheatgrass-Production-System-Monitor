# PostgreSQL Time Series Database - Implementation Summary

## What Was Added

A complete PostgreSQL time series database integration for storing and retrieving sensor data with automatic synchronization to the line chart.

## Architecture Overview

```
Home Assistant Sensors
         ↓
    Backend API
         ↓
  PostgreSQL Database ← Real-time data storage
         ↓
  Historical Data API
         ↓
  Frontend Line Chart ← Displays historical trends
```

## Files Created

### Backend

1. **`config/database.js`** - PostgreSQL connection pool and query helpers
2. **`config/init-db.js`** - Database schema initialization and migration script
3. **`services/database.service.js`** - Complete CRUD operations for sensor data
4. **`test-database.js`** - Database functionality test script
5. **`DATABASE_SETUP.md`** - Comprehensive setup guide
6. **`.env.example`** - Updated with database configuration

### Files Modified

1. **`services/sensor.service.js`**
   - Added automatic saving to PostgreSQL on every sensor data fetch
   - Updated historical data retrieval to use PostgreSQL first, Home Assistant as fallback

2. **`controllers/sensor.controller.js`**
   - Added `/api/sensors/stats` endpoint for database statistics

3. **`routes/sensors.routes.js`**
   - Added stats route

4. **`server.js`**
   - Added database connection initialization on startup
   - Automatic schema setup

5. **`config/config.js`**
   - Added database configuration section

6. **`package.json`**
   - Added database management scripts
   - Added `pg` dependency

7. **Frontend: `utils/dataUtils.ts`**
   - Updated to handle both PostgreSQL and Home Assistant data formats

8. **`README.md`**
   - Added PostgreSQL setup instructions

## Database Schema

### sensor_readings Table
```sql
CREATE TABLE sensor_readings (
  id SERIAL PRIMARY KEY,
  sensor_type VARCHAR(50) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);
```

**Optimized Indexes:**
- Time-based queries
- Sensor type + time queries
- Range queries

### Sensor Types Supported
- `temperature` (°C)
- `humidity` (%)
- `light` (lux)
- `pressure` (hPa)
- `waterFlow` (L/min)

## Key Features

### Automatic Data Collection
- Every time sensor data is fetched from Home Assistant, it's automatically saved to PostgreSQL
- Bulk insert for efficiency
- Non-blocking (errors don't crash the server)

### Historical Data Retrieval
- Line chart now displays real historical data from PostgreSQL
- Falls back to Home Assistant if no database data exists
- Supports custom time ranges

### Data Persistence
- All sensor readings are permanently stored
- Data survives server restarts
- Queryable for analysis and reporting

### Performance Optimizations
- Connection pooling (max 20 connections)
- Indexed columns for fast queries
- Prepared statements
- Optimized for time series data

## API Endpoints

### Get Current Sensor Data (saves to DB)
```
GET /api/sensors
```

### Get Historical Data (from PostgreSQL)
```
GET /api/history/:sensor?start=2025-01-01T00:00:00Z&end=2025-01-28T23:59:59Z
```

### Get Database Statistics
```
GET /api/sensors/stats
```

## NPM Scripts

```bash
# Initialize database schema
npm run db:init

# Test database connection and functionality
npm run test:db

# Reset database (WARNING: deletes all data)
npm run db:reset

# Drop all tables (WARNING: deletes all data)
npm run db:drop
```

## Setup Instructions

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database
```bash
createdb wheatgrass_monitor
```

### 3. Configure Environment
Copy `.env.example` to `.env` and set:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wheatgrass_monitor
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Initialize Schema
```bash
cd Backend
npm run db:init
```

### 5. Test Database
```bash
npm run test:db
```

### 6. Start Server
```bash
npm start
```

The server will:
- Connect to PostgreSQL
- Initialize tables if needed
- Start collecting and storing sensor data
- Serve historical data to the frontend

## Data Flow

1. **Collection**: Home Assistant sensors → Backend API (`/api/sensors`)
2. **Storage**: Backend automatically saves to PostgreSQL
3. **Retrieval**: Frontend requests historical data (`/api/history/:sensor`)
4. **Display**: Line chart renders time series data

## Verification

### Check Data is Being Saved

```bash
# Connect to database
psql wheatgrass_monitor

# View latest readings
SELECT * FROM latest_sensor_readings;

# View recent history
SELECT * FROM sensor_readings 
ORDER BY timestamp DESC 
LIMIT 10;

# Count readings per sensor
SELECT sensor_type, COUNT(*) 
FROM sensor_readings 
GROUP BY sensor_type;
```

### Monitor in Real-Time

```sql
-- Watch new data arrive
SELECT sensor_type, value, unit, timestamp 
FROM sensor_readings 
ORDER BY timestamp DESC 
LIMIT 5;

-- Refresh every 2 seconds with \watch
\watch 2
```

## Frontend Integration

The line chart automatically uses PostgreSQL data:

1. User selects metric (temperature, humidity, etc.)
2. User selects date
3. Frontend calls `/api/history/:sensor?start=...&end=...`
4. Backend queries PostgreSQL
5. Chart displays historical trend

**Data Format:**
```json
[
  {
    "id": 1,
    "sensor_type": "temperature",
    "value": 22.5,
    "unit": "°C",
    "timestamp": "2025-01-28T10:30:00Z"
  }
]
```

## Benefits

### Data Persistence
- Historical data preserved across restarts
- No data loss
- Long-term trend analysis

### Performance
- Fast queries with indexed columns
- Efficient bulk inserts
- Connection pooling

### Scalability
- Handles millions of readings
- Time-series optimized
- Can add TimescaleDB extension for even better performance

### Analytics
- SQL queries for custom reports
- Aggregations (avg, min, max)
- Time-based analysis

## Troubleshooting

### "Database connection failed"
- Ensure PostgreSQL is running: `brew services list` (macOS)
- Check credentials in `.env`
- Verify database exists: `psql -l | grep wheatgrass_monitor`

### "Table does not exist"
- Run: `npm run db:init`
- Check server logs on startup

### No data in charts
- Ensure server is running and collecting data
- Check database has data: `SELECT COUNT(*) FROM sensor_readings;`
- Verify date range includes data

## Next Steps

### Optional Enhancements

1. **TimescaleDB Extension**: For even better time-series performance
   ```sql
   CREATE EXTENSION timescaledb;
   SELECT create_hypertable('sensor_readings', 'timestamp');
   ```

2. **Data Retention Policy**: Automatically delete old data
   ```javascript
   // Run daily
   await dbService.deleteOldReadings(90); // Keep 90 days
   ```

3. **Aggregated Views**: Pre-compute hourly/daily averages
   
4. **Real-time WebSocket Updates**: Push new data to frontend

5. **Export Functionality**: Download historical data as CSV

## Testing Checklist

- [x] PostgreSQL dependency installed
- [ ] PostgreSQL server running
- [ ] Database created
- [ ] Schema initialized (`npm run db:init`)
- [ ] Database test passes (`npm run test:db`)
- [ ] Server starts successfully
- [ ] Sensor data being saved (check logs)
- [ ] Historical data endpoint working
- [ ] Line chart displays data from PostgreSQL
- [ ] Data persists after server restart

## Support

For detailed setup instructions, see:
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Complete PostgreSQL setup guide
- [README.md](../README.md) - Main application documentation
