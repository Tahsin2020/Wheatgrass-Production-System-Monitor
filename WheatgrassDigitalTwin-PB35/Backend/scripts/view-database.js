const { pool, query } = require('./config/database');

async function viewDatabaseContents() {
  try {
    console.log('=== DATABASE CONTENTS ===\n');

    // Show sensor_metadata table
    console.log('📊 SENSOR METADATA:');
    console.log('─'.repeat(80));
    const metadata = await query('SELECT * FROM sensor_metadata ORDER BY sensor_type');
    console.table(metadata.rows);

    // Show sensor_readings count
    console.log('\n📈 SENSOR READINGS SUMMARY:');
    console.log('─'.repeat(80));
    const summary = await query(`
      SELECT 
        sensor_type,
        COUNT(*) as total_readings,
        MIN(timestamp) as first_reading,
        MAX(timestamp) as last_reading,
        ROUND(AVG(value)::numeric, 2) as avg_value,
        ROUND(MIN(value)::numeric, 2) as min_value,
        ROUND(MAX(value)::numeric, 2) as max_value
      FROM sensor_readings 
      GROUP BY sensor_type
      ORDER BY sensor_type
    `);
    console.table(summary.rows);

    // Show latest readings
    console.log('\n🔄 LATEST READINGS (last 20):');
    console.log('─'.repeat(80));
    const latest = await query(`
      SELECT 
        id,
        sensor_type,
        value,
        unit,
        timestamp,
        metadata
      FROM sensor_readings 
      ORDER BY timestamp DESC 
      LIMIT 20
    `);
    console.table(latest.rows);

    // Show total counts
    console.log('\n📊 OVERALL STATISTICS:');
    console.log('─'.repeat(80));
    const counts = await query(`
      SELECT 
        COUNT(*) as total_readings,
        COUNT(DISTINCT sensor_type) as distinct_sensors,
        MIN(timestamp) as earliest_timestamp,
        MAX(timestamp) as latest_timestamp
      FROM sensor_readings
    `);
    console.table(counts.rows);

    await pool.end();
    console.log('\n✓ Database view complete');
  } catch (error) {
    console.error('Error viewing database:', error.message);
    process.exit(1);
  }
}

viewDatabaseContents();
