const { pool } = require('../config/database');

/**
 * Initialize the database schema for sensor data
 * Creates tables with optimized indexes for time-series queries
 */
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Initializing database schema...');

    // Create sensor_readings table with time-series optimization
    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        id SERIAL PRIMARY KEY,
        sensor_type VARCHAR(50) NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(20),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      );
    `);

    // Create indexes for efficient time-series queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp 
      ON sensor_readings (timestamp DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_readings_type_timestamp 
      ON sensor_readings (sensor_type, timestamp DESC);
    `);

    // Create composite index for common query patterns
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_readings_type_time_range 
      ON sensor_readings (sensor_type, timestamp);
    `);

    // Create a view for latest sensor readings
    await client.query(`
      CREATE OR REPLACE VIEW latest_sensor_readings AS
      SELECT DISTINCT ON (sensor_type) 
        sensor_type,
        value,
        unit,
        timestamp,
        metadata
      FROM sensor_readings
      ORDER BY sensor_type, timestamp DESC;
    `);

    // Create table for sensor metadata/configuration
    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_metadata (
        sensor_type VARCHAR(50) PRIMARY KEY,
        display_name VARCHAR(100),
        unit VARCHAR(20),
        min_value DECIMAL(10, 2),
        max_value DECIMAL(10, 2),
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default sensor metadata
    await client.query(`
      INSERT INTO sensor_metadata (sensor_type, display_name, unit, min_value, max_value, description)
      VALUES 
        ('temperature', 'Temperature', '°C', -10, 50, 'Ambient temperature sensor'),
        ('humidity', 'Humidity', '%', 0, 100, 'Relative humidity sensor'),
        ('light', 'Light Level', 'lux', 0, 2000, 'Light intensity sensor'),
        ('pressure', 'Pressure', 'hPa', 0, 10000, 'Pressure sensor'),
        ('waterFlow', 'Water Flow Rate', 'L/min', 0, 5, 'Water flow rate sensor')
      ON CONFLICT (sensor_type) DO NOTHING;
    `);

    console.log('✓ Database schema initialized successfully');
    console.log('✓ Tables created: sensor_readings, sensor_metadata');
    console.log('✓ Indexes created for time-series optimization');
    console.log('✓ View created: latest_sensor_readings');

  } catch (error) {
    console.error('✗ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Drop all tables (use with caution!)
 */
async function dropTables() {
  const client = await pool.connect();
  
  try {
    await client.query('DROP VIEW IF EXISTS latest_sensor_readings CASCADE;');
    await client.query('DROP TABLE IF EXISTS sensor_readings CASCADE;');
    await client.query('DROP TABLE IF EXISTS sensor_metadata CASCADE;');
    console.log('✓ All tables dropped successfully');
  } catch (error) {
    console.error('✗ Error dropping tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Reset database (drop and recreate)
 */
async function resetDatabase() {
  await dropTables();
  await initializeDatabase();
}

// Run initialization if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    try {
      if (command === 'reset') {
        await resetDatabase();
      } else if (command === 'drop') {
        await dropTables();
      } else {
        await initializeDatabase();
      }
      process.exit(0);
    } catch (error) {
      console.error('Database operation failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  initializeDatabase,
  dropTables,
  resetDatabase,
};
