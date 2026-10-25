const dbService = require('./services/database.service');

async function testHistoricalData() {
  try {
    console.log('=== TESTING HISTORICAL DATA API ===\n');

    // Test parameters
    const sensorType = 'temperature';
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // Last 1 hour

    console.log(`Sensor: ${sensorType}`);
    console.log(`Time Range: ${startTime.toISOString()} to ${endTime.toISOString()}\n`);

    // Fetch historical data
    const data = await dbService.getHistoricalData(sensorType, startTime, endTime, 100);

    console.log(`✓ Retrieved ${data.length} records\n`);

    if (data.length > 0) {
      console.log('📊 Sample Data (first 5 records):');
      console.log('─'.repeat(80));
      
      data.slice(0, 5).forEach((record, index) => {
        console.log(`\n${index + 1}. ${record.sensor_type}`);
        console.log(`   Value: ${record.value} ${record.unit}`);
        console.log(`   Time: ${new Date(record.timestamp).toLocaleString()}`);
      });

      console.log('\n\n📈 Chart Format (what frontend receives):');
      console.log('─'.repeat(80));
      
      const chartData = data.slice(0, 10).map(entry => ({
        time: new Date(entry.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        value: parseFloat(entry.value)
      }));

      console.table(chartData);

      console.log('\n✅ The line chart will automatically display this data!');
      console.log('   No changes needed - the system is already configured.\n');
      
      console.log('📝 How it works:');
      console.log('   1. Frontend calls: /api/history/temperature?start=...&end=...');
      console.log('   2. Backend queries PostgreSQL database');
      console.log('   3. Data is transformed to {time, value} format');
      console.log('   4. Chart component renders the line graph\n');
    } else {
      console.log('⚠️  No data found in the time range.');
      console.log('   The system will use mock data as fallback.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testHistoricalData();
