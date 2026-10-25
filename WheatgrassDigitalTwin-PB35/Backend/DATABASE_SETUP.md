# PostgreSQL Time Series Database Setup

This guide will help you set up PostgreSQL for storing sensor time series data.

## Prerequisites

- PostgreSQL 12 or higher installed on your system
- Node.js and npm installed
- Backend dependencies installed (`npm install` in the Backend folder)

## Quick Start

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

Connect to PostgreSQL and create the database:

```bash
# macOS/Linux
psql postgres

# Inside psql:
CREATE DATABASE wheatgrass_monitor;
\q
```

Or use a single command:
```bash
createdb wheatgrass_monitor
```

### 3. Configure Environment Variables

Copy the example environment file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` and set:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wheatgrass_monitor
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

### 4. Initialize Database Schema

Run the initialization script to create tables and indexes:

```bash
npm run db:init
```

This will create:
- `sensor_readings` table - stores all sensor time series data
- `sensor_metadata` table - stores sensor configuration
- `latest_sensor_readings` view - quick access to latest values
- Optimized indexes for time series queries

## Database Operations

### View Database Status

```bash
# Check if database exists
psql -l | grep wheatgrass_monitor

# Connect to database
psql wheatgrass_monitor

# Inside psql, view tables:
\dt

# View indexes:
\di

# View the view:
\dv

# Query latest readings:
SELECT * FROM latest_sensor_readings;

# Query historical data:
SELECT * FROM sensor_readings 
WHERE sensor_type = 'temperature' 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Reset Database

To drop and recreate all tables (WARNING: deletes all data):

```bash
npm run db:reset
```

### Drop All Tables

To remove all tables (WARNING: deletes all data):

```bash
npm run db:drop
```

## Database Schema

### sensor_readings table

| Column      | Type                        | Description                    |
|-------------|-----------------------------|--------------------------------|
| id          | SERIAL PRIMARY KEY          | Unique identifier              |
| sensor_type | VARCHAR(50)                 | Type of sensor                 |
| value       | DECIMAL(10, 2)              | Sensor reading value           |
| unit        | VARCHAR(20)                 | Unit of measurement            |
| timestamp   | TIMESTAMP WITH TIME ZONE    | When reading was taken         |
| metadata    | JSONB                       | Additional metadata (optional) |

**Indexes:**
- `idx_sensor_readings_timestamp` - Optimizes time-based queries
- `idx_sensor_readings_type_timestamp` - Optimizes sensor + time queries
- `idx_sensor_readings_type_time_range` - Composite index for range queries

### sensor_metadata table

Stores configuration for each sensor type (temperature, humidity, etc.)

### latest_sensor_readings view

Provides quick access to the most recent reading for each sensor type.

## API Endpoints

Once the database is running, the following endpoints use PostgreSQL:

### Get Current Sensor Data
```
GET /api/sensors
```
Returns latest sensor readings and saves them to PostgreSQL.

### Get Historical Data
```
GET /api/history/:sensor?start=2025-01-01&end=2025-01-28
```
Returns historical data from PostgreSQL for the specified sensor and time range.

**Parameters:**
- `sensor` - Sensor type (temperature, humidity, light, pressure, waterFlow)
- `start` - Start date/time (ISO 8601 format)
- `end` - End date/time (ISO 8601 format)

### Get Database Statistics
```
GET /api/sensors/stats
```
Returns statistics about stored sensor data.

## Data Flow

1. **Data Collection**: Home Assistant sensors → Backend API
2. **Storage**: Backend automatically saves all sensor readings to PostgreSQL
3. **Retrieval**: Frontend fetches historical data from PostgreSQL
4. **Visualization**: Line chart displays historical trends

## Troubleshooting

### Connection Issues

If you see "Database connection failed":

1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Verify credentials in `.env` file

3. Test connection manually:
   ```bash
   psql -h localhost -U postgres -d wheatgrass_monitor
   ```

### Permission Issues

If you get permission errors:

```bash
# Grant permissions
psql postgres
GRANT ALL PRIVILEGES ON DATABASE wheatgrass_monitor TO postgres;
```

### Port Already in Use

If port 5432 is already in use, change `DB_PORT` in `.env` and restart PostgreSQL on a different port.

## Advanced Configuration

### Data Retention

By default, all data is kept indefinitely. To implement automatic cleanup:

```javascript
// In your code or cron job
const dbService = require('./services/database.service');

// Delete data older than 90 days
await dbService.deleteOldReadings(90);
```

### Performance Optimization

For very large datasets, consider:

1. **TimescaleDB Extension** (optional):
   ```sql
   CREATE EXTENSION IF NOT EXISTS timescaledb;
   SELECT create_hypertable('sensor_readings', 'timestamp');
   ```

2. **Partitioning**: Partition by time for better query performance

3. **Connection Pooling**: Already configured in `config/database.js`

## Monitoring

Monitor database size and performance:

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('wheatgrass_monitor'));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check number of readings per sensor
SELECT sensor_type, COUNT(*) as count 
FROM sensor_readings 
GROUP BY sensor_type;
```

## Backup and Restore

### Backup

```bash
pg_dump wheatgrass_monitor > backup.sql
```

### Restore

```bash
psql wheatgrass_monitor < backup.sql
```

## Next Steps

- The server will automatically initialize the database on startup
- Sensor data is now being saved to PostgreSQL
- Historical charts will display real data from the database
- You can query the database directly for analysis and reporting
