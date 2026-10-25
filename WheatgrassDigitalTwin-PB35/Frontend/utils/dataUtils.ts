/**
 * Utility functions for the Wheatgrass Monitor application
 */

/**
 * Generates mock historical data for a given metric
 * Used as fallback when real historical data is unavailable
 */
export const generateHistoricalData = (metric: string): Array<{ time: string; value: number }> => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    let value;
    switch(metric) {
      case 'temperature':
        value = 20 + Math.random() * 5;
        break;
      case 'humidity':
        value = 60 + Math.random() * 10;
        break;
      case 'light':
        value = 800 + Math.random() * 100;
        break;
      case 'pressure':
        value = 1000 + Math.random() * 15;
        break;
      default:
        value = 0;
    }
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      value: parseFloat(value.toFixed(2))
    });
  }
  return data;
};

/**
 * Transforms Home Assistant historical data to chart format
 */
export const transformHistoricalData = (data: any[], timeRange: string = '1h'): Array<{ time: string; value: number }> => {
  if (!data || data.length === 0) {
    return [];
  }

  // Determine sample rate based on time range to avoid cluttered x-axis
  const getSampleRate = (dataLength: number, timeRange: string) => {
    const maxPoints = 100; // Maximum points to show on chart
    
    if (dataLength <= maxPoints) {
      return 1; // Show all points
    }
    
    return Math.ceil(dataLength / maxPoints);
  };

  // Determine time format based on time range
  const getTimeFormat = (timestamp: Date, timeRange: string) => {
    switch (timeRange) {
      case '1h':
      case '6h':
        // Show hour:minute:second for short ranges to see variation
        return timestamp.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          second: '2-digit'
        });
      case '24h':
        // Show hour:minute for 24 hours
        return timestamp.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        });
      case '7d':
        // Show full date and time for 7 days
        const date = timestamp.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        });
        const time = timestamp.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: '2-digit'
        });
        return `${date} ${time}`;
      default:
        return timestamp.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        });
    }
  };

  let rawData: Array<{ timestamp: Date; value: number }> = [];

  // Check if data is from PostgreSQL (has sensor_type, value, timestamp properties)
  if (data[0] && 'sensor_type' in data[0] && 'timestamp' in data[0]) {
    rawData = data.map((entry: any) => ({
      timestamp: new Date(entry.timestamp),
      value: parseFloat(entry.value) || 0
    }));
  }
  // Check if data is from Home Assistant (nested array format)
  else if (data[0] && Array.isArray(data[0])) {
    rawData = data[0].map((entry: any) => ({
      timestamp: new Date(entry.last_changed),
      value: parseFloat(entry.state) || 0
    }));
  } else {
    return [];
  }

  // Sample data to avoid cluttered x-axis
  const sampleRate = getSampleRate(rawData.length, timeRange);
  const sampledData = rawData.filter((_, index) => index % sampleRate === 0);

  // Transform to chart format
  return sampledData.map((entry) => ({
    time: getTimeFormat(entry.timestamp, timeRange),
    value: entry.value
  }));
};
