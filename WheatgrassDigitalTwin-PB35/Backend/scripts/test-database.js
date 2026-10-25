#!/usr/bin/env node

/**
 * Test script to verify PostgreSQL database setup and functionality
 */

const { testConnection, query } = require('./config/database');
const dbService = require('./services/database.service');

async function runTests() {
  console.log('🧪 Testing PostgreSQL Database Connection and Functionality\n');

  try {
    // Test 1: Database connection
    console.log('Test 1: Database Connection');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    console.log('✅ Database connection successful\n');

    // Test 2: Check if tables exist
    console.log('Test 2: Checking Tables');
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('✅ Found tables:', tablesResult.rows.map(r => r.table_name).join(', '));
    console.log('');

    // Test 3: Insert test sensor data
    console.log('Test 3: Inserting Test Data');
    const testReadings = [
      { sensorType: 'temperature', value: 22.5, unit: '°C' },
      { sensorType: 'humidity', value: 65.0, unit: '%' },
      { sensorType: 'light', value: 850, unit: 'lux' },
    ];
    
    const inserted = await dbService.insertBulkSensorReadings(testReadings);
    console.log(`✅ Inserted ${inserted.length} test readings\n`);

    // Test 4: Retrieve latest readings
    console.log('Test 4: Retrieving Latest Readings');
    const latest = await dbService.getAllLatestReadings();
    console.log('✅ Latest readings:');
    Object.keys(latest).forEach(sensor => {
      console.log(`   ${sensor}: ${latest[sensor].value} ${latest[sensor].unit}`);
    });
    console.log('');

    // Test 5: Query historical data
    console.log('Test 5: Querying Historical Data');
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const endTime = new Date();
    const historical = await dbService.getHistoricalData('temperature', startTime, endTime);
    console.log(`✅ Found ${historical.length} historical temperature readings\n`);

    // Test 6: Get database statistics
    console.log('Test 6: Database Statistics');
    const stats = await dbService.getStats();
    console.log('✅ Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat.sensor_type}: ${stat.total_readings} readings (avg: ${parseFloat(stat.avg_value).toFixed(2)})`);
    });
    console.log('');

    console.log('🎉 All tests passed! Database is working correctly.\n');
    
    console.log('📊 Database is ready to store sensor data.');
    console.log('   - Historical data will be saved automatically');
    console.log('   - Charts will display real data from PostgreSQL');
    console.log('   - Data persists across server restarts\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Ensure PostgreSQL is running');
    console.error('2. Check database credentials in .env file');
    console.error('3. Run: npm run db:init');
    console.error('4. See DATABASE_SETUP.md for detailed instructions\n');
    process.exit(1);
  }
}

// Run tests
runTests();
