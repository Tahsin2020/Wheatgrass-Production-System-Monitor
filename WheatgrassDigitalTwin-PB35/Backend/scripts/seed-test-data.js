const { pool } = require('../config/database');

/**
 * Seeds the database with artificial sensor data for testing time ranges
 * Creates data spanning 7 days with realistic sensor values
 */
async function seedTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding test data...\n');

    // Define sensor types and their realistic ranges
    const sensors = [
      { type: 'temperature', min: 18, max: 25, unit: '°C' },
      { type: 'humidity', min: 35, max: 70, unit: '%' },
      { type: 'light', min: 5, max: 900, unit: 'lux' },
      { type: 'pressure', min: 0, max: 10000, unit: 'hPa' },
      { type: 'waterFlow', min: 0, max: 2, unit: 'L/min' }
    ];

    // Generate data points
    const now = new Date();
    const dataPoints = [];
    
    // Generate data for the last 7 days, every 15 minutes, up to NOW
    const intervalMinutes = 15;
    const totalMinutes = 7 * 24 * 60; // 7 days in minutes
    const totalPoints = Math.floor(totalMinutes / intervalMinutes);

    console.log(`Generating ${totalPoints} data points per sensor (${totalPoints * sensors.length} total)...`);
    console.log(`Time span: 7 days, sampling every ${intervalMinutes} minutes\n`);

    for (let i = 0; i < totalPoints; i++) {
      const timestamp = new Date(now.getTime() - (totalPoints - i - 1) * intervalMinutes * 60 * 1000);
      
      for (const sensor of sensors) {
        // Generate realistic values with some variation
        let value;
        const hourOfDay = timestamp.getHours();
        
        switch (sensor.type) {
          case 'temperature':
            // Temperature varies by time of day
            const tempVariation = Math.sin((hourOfDay - 6) * Math.PI / 12) * 3;
            value = ((sensor.min + sensor.max) / 2) + tempVariation + (Math.random() - 0.5) * 2;
            break;
          
          case 'humidity':
            // Humidity inversely related to temperature
            const humidVariation = -Math.sin((hourOfDay - 6) * Math.PI / 12) * 10;
            value = ((sensor.min + sensor.max) / 2) + humidVariation + (Math.random() - 0.5) * 5;
            break;
          
          case 'light':
            // Light follows day/night cycle
            if (hourOfDay >= 6 && hourOfDay <= 18) {
              value = sensor.min + (sensor.max - sensor.min) * Math.sin((hourOfDay - 6) * Math.PI / 12) + Math.random() * 50;
            } else {
              value = sensor.min + Math.random() * 10;
            }
            break;
          
          case 'pressure':
            // Simulate pressure decreasing slowly over time, spikes occasionally
            value = sensor.max * 0.6 - (i % 96) * 0.3 + (Math.random() > 0.95 ? 20 : 0); // How do I modify this for pressure?
            value = Math.max(sensor.min, Math.min(sensor.max, value));
            break;
          
          case 'waterFlow':
            // Water flow happens occasionally
            value = Math.random() > 0.9 ? sensor.min + Math.random() * sensor.max : 0;
            break;
          
          default:
            value = sensor.min + Math.random() * (sensor.max - sensor.min);
        }

        dataPoints.push({
          sensor_type: sensor.type,
          value: parseFloat(value.toFixed(2)),
          unit: sensor.unit,
          timestamp: timestamp
        });
      }
    }

    // Insert data in batches
    console.log('Inserting data into database...');
    const batchSize = 1000;
    let inserted = 0;

    await client.query('BEGIN');

    for (let i = 0; i < dataPoints.length; i += batchSize) {
      const batch = dataPoints.slice(i, i + batchSize);
      
      for (const point of batch) {
        await client.query(
          `INSERT INTO sensor_readings (sensor_type, value, unit, timestamp) 
           VALUES ($1, $2, $3, $4)`,
          [point.sensor_type, point.value, point.unit, point.timestamp]
        );
      }
      
      inserted += batch.length;
      const progress = ((inserted / dataPoints.length) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${progress}% (${inserted}/${dataPoints.length} records)`);
    }

    await client.query('COMMIT');
    console.log('\n');

    // Show summary
    console.log('✅ Test data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Total records inserted: ${dataPoints.length}`);
    console.log(`   • Sensors: ${sensors.map(s => s.type).join(', ')}`);
    console.log(`   • Time range: ${dataPoints[0].timestamp.toLocaleString()} to ${dataPoints[dataPoints.length - 1].timestamp.toLocaleString()}`);
    console.log(`   • Sampling interval: ${intervalMinutes} minutes\n`);

    // Show data distribution
    const countBySensor = await client.query(`
      SELECT sensor_type, COUNT(*) as count, MIN(timestamp) as first, MAX(timestamp) as last
      FROM sensor_readings
      GROUP BY sensor_type
      ORDER BY sensor_type
    `);
    
    console.log('📈 Data distribution:');
    console.table(countBySensor.rows.map(row => ({
      sensor: row.sensor_type,
      records: row.count,
      first_reading: new Date(row.first).toLocaleString(),
      last_reading: new Date(row.last).toLocaleString()
    })));

    console.log('\n💡 Now you can test the time range selector:');
    console.log('   • 1 Hour - Recent data points');
    console.log('   • 6 Hours - Last quarter day');
    console.log('   • 24 Hours - Full day cycle');
    console.log('   • 7 Days - Complete week view\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  seedTestData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedTestData };
