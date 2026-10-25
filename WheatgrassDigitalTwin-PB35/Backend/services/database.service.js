const { query, pool } = require('../config/database');

/**
 * Database service for sensor data operations
 * Handles CRUD operations for time-series sensor data
 */
class DatabaseService {
  /**
   * Insert a single sensor reading
   * @param {string} sensorType - Type of sensor (temperature, humidity, etc.)
   * @param {number} value - Sensor reading value
   * @param {string} unit - Unit of measurement
   * @param {object} metadata - Additional metadata (optional)
   * @returns {object} Inserted record
   */
  async insertSensorReading(sensorType, value, unit = null, metadata = null) {
    try {
      const result = await query(
        `INSERT INTO sensor_readings (sensor_type, value, unit, metadata, timestamp) 
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [sensorType, value, unit, metadata ? JSON.stringify(metadata) : null]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Error inserting sensor reading for ${sensorType}:`, error);
      throw error;
    }
  }

  /**
   * Insert multiple sensor readings in a single transaction
   * @param {Array} readings - Array of {sensorType, value, unit, metadata}
   * @returns {Array} Inserted records
   */
  async insertBulkSensorReadings(readings) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const results = [];

      for (const reading of readings) {
        const { sensorType, value, unit, metadata } = reading;
        const result = await client.query(
          `INSERT INTO sensor_readings (sensor_type, value, unit, metadata, timestamp) 
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
           RETURNING *`,
          [sensorType, value, unit, metadata ? JSON.stringify(metadata) : null]
        );
        results.push(result.rows[0]);
      }

      await client.query('COMMIT');
      // Log only periodically (every 10th batch)
      if (Math.random() < 0.1) {
        console.log(`Database: ${readings.length} sensor readings saved`);
      }
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error inserting bulk sensor readings:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get the latest reading for a specific sensor
   * @param {string} sensorType - Type of sensor
   * @returns {object} Latest sensor reading
   */
  async getLatestReading(sensorType) {
    try {
      const result = await query(
        `SELECT * FROM sensor_readings 
         WHERE sensor_type = $1 
         ORDER BY timestamp DESC 
         LIMIT 1`,
        [sensorType]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error getting latest reading for ${sensorType}:`, error);
      throw error;
    }
  }

  /**
   * Get latest readings for all sensors
   * @returns {object} Object with sensor types as keys and readings as values
   */
  async getAllLatestReadings() {
    try {
      const result = await query(
        `SELECT * FROM latest_sensor_readings`
      );
      
      // Convert array to object for easier access
      const readings = {};
      result.rows.forEach(row => {
        readings[row.sensor_type] = {
          value: parseFloat(row.value),
          unit: row.unit,
          timestamp: row.timestamp,
          metadata: row.metadata
        };
      });
      
      return readings;
    } catch (error) {
      console.error('Error getting all latest readings:', error);
      throw error;
    }
  }

  /**
   * Get historical data for a sensor within a time range
   * Uses time-based bucketing to ensure even distribution across the full time range
   * @param {string} sensorType - Type of sensor
   * @param {Date|string} startTime - Start of time range
   * @param {Date|string} endTime - End of time range
   * @param {number} maxPoints - Maximum number of data points to return (optional)
   * @returns {Array} Array of sensor readings
   */
  async getHistoricalData(sensorType, startTime, endTime, maxPoints = 500) {
    try {
      // Calculate the time span in milliseconds
      const start = new Date(startTime);
      const end = new Date(endTime);
      const spanMs = end - start;
      
      // Calculate bucket size in seconds to get approximately maxPoints
      const bucketSeconds = Math.max(1, Math.floor(spanMs / (maxPoints * 1000)));
      
      // Use time-based bucketing to sample evenly across the entire time range
      // This prevents high-frequency recent data from dominating
      const result = await query(
        `WITH time_buckets AS (
           SELECT 
             id,
             sensor_type,
             value,
             unit,
             timestamp,
             metadata,
             FLOOR(EXTRACT(EPOCH FROM timestamp) / $4) as bucket
           FROM sensor_readings 
           WHERE sensor_type = $1 
             AND timestamp >= $2 
             AND timestamp <= $3
         ),
         bucketed_data AS (
           SELECT DISTINCT ON (bucket)
             id,
             sensor_type,
             value,
             unit,
             timestamp,
             metadata
           FROM time_buckets
           ORDER BY bucket, timestamp ASC
         )
         SELECT id, sensor_type, value, unit, timestamp, metadata
         FROM bucketed_data
         ORDER BY timestamp ASC`,
        [sensorType, startTime, endTime, bucketSeconds]
      );
      
      return result.rows;
    } catch (error) {
      console.error(`Error getting historical data for ${sensorType}:`, error);
      throw error;
    }
  }

  /**
   * Get aggregated data for a sensor (avg, min, max) within time buckets
   * @param {string} sensorType - Type of sensor
   * @param {Date|string} startTime - Start of time range
   * @param {Date|string} endTime - End of time range
   * @param {string} interval - Time bucket interval (e.g., '1 hour', '15 minutes')
   * @returns {Array} Array of aggregated data points
   */
  async getAggregatedData(sensorType, startTime, endTime, interval = '1 hour') {
    try {
      const result = await query(
        `SELECT 
           time_bucket($1::interval, timestamp) AS time_bucket,
           AVG(value) as avg_value,
           MIN(value) as min_value,
           MAX(value) as max_value,
           COUNT(*) as sample_count
         FROM sensor_readings 
         WHERE sensor_type = $2 
           AND timestamp >= $3 
           AND timestamp <= $4
         GROUP BY time_bucket
         ORDER BY time_bucket ASC`,
        [interval, sensorType, startTime, endTime]
      );
      return result.rows;
    } catch (error) {
      // Fallback to regular grouping if time_bucket function is not available
      console.log('TimescaleDB extension not available, using regular grouping');
      return this.getHistoricalData(sensorType, startTime, endTime);
    }
  }

  /**
   * Delete old sensor readings (data retention)
   * @param {number} daysToKeep - Number of days of data to retain
   * @returns {number} Number of records deleted
   */
  async deleteOldReadings(daysToKeep = 90) {
    try {
      const result = await query(
        `DELETE FROM sensor_readings 
         WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'`
      );
      console.log(`Deleted ${result.rowCount} old sensor readings`);
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting old readings:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   * @returns {object} Statistics about sensor data
   */
  async getStats() {
    try {
      const result = await query(
        `SELECT 
           sensor_type,
           COUNT(*) as total_readings,
           MIN(timestamp) as first_reading,
           MAX(timestamp) as last_reading,
           AVG(value) as avg_value,
           MIN(value) as min_value,
           MAX(value) as max_value
         FROM sensor_readings 
         GROUP BY sensor_type`
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();
