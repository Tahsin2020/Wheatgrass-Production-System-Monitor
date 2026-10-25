import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import { authService } from './services/auth.service';
import { SensorData } from './types';
import { useAlerts } from './hooks/useAlerts';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { MorePage } from './components/MorePage';
import { generateHistoricalData, transformHistoricalData } from './utils/dataUtils';

const WheatgrassMonitor = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Alert system - only active on dashboard
  const {
    alerts,
    alertCount,
    criticalCount,
    warningCount,
    hasAlerts,
  } = useAlerts(currentPage === 'dashboard' ? 10000 : 0);

  // Real sensor data from backend
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    light: 0,
    pressure: 0,
    waterFlow: 0,
    lastUpdate: null
  });
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertsHidden, setAlertsHidden] = useState(false);

  // Fetch sensor data from backend
  useEffect(() => {
    if (currentPage === 'dashboard') {
      fetchSensorData();
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchSensorData, 30000);
      return () => clearInterval(interval);
    }
  }, [currentPage]);

  // Fetch historical data when metric or time range changes
  useEffect(() => {
    if (currentPage === 'dashboard') {
      fetchHistoricalData();
    }
  }, [selectedMetric, selectedTimeRange, currentPage]);

  const fetchSensorData = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getSensorData();
      setSensorData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sensor data:', err);
      setError('Failed to fetch sensor data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      // Calculate time range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedTimeRange) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case '6h':
          startDate.setHours(startDate.getHours() - 6);
          break;
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
      }

      const data = await apiService.getHistoricalData(
        selectedMetric,
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Transform Home Assistant data to chart format
      const chartData = transformHistoricalData(data, selectedTimeRange);
      if (chartData.length > 0) {
        setHistoricalData(chartData);
      } else {
        // Fallback to generated data if no historical data
        setHistoricalData(generateHistoricalData(selectedMetric));
      }
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
      // Use generated data as fallback
      setHistoricalData(generateHistoricalData(selectedMetric));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!username || !password) {
      setLoginError('Please enter both username and password');
      return;
    }

    setIsLoggingIn(true);
    
    try {
      await authService.login(username, password);
      setLoggedInUser(username);
      setCurrentPage('dashboard');
      setPassword(''); // Clear password for security
    } catch (error: any) {
      setLoginError(error.message || 'Login failed. Please check your credentials.');
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setLoggedInUser('');
    setUsername('');
    setPassword('');
    setCurrentPage('login');
  };

  // Check authentication on mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      setLoggedInUser('Logged in'); // Set to show the user logged in status
      setCurrentPage('dashboard');
    }
  }, []);

  return (
    <div>
      {currentPage === 'login' && (
        <LoginPage
          username={username}
          password={password}
          loginError={loginError}
          isLoggingIn={isLoggingIn}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
        />
      )}
      {currentPage === 'dashboard' && (
        <DashboardPage
          currentPage={currentPage}
          loggedInUser={loggedInUser}
          sensorData={sensorData}
          historicalData={historicalData}
          selectedMetric={selectedMetric}
          selectedTimeRange={selectedTimeRange}
          isLoading={isLoading}
          error={error}
          alerts={alerts}
          criticalCount={criticalCount}
          warningCount={warningCount}
          hasAlerts={hasAlerts}
          alertsHidden={alertsHidden}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          onMetricChange={setSelectedMetric}
          onTimeRangeChange={setSelectedTimeRange}
          onDismissAlerts={() => setAlertsHidden(!alertsHidden)}
        />
      )}
      {currentPage === 'more' && (
        <MorePage
          currentPage={currentPage}
          loggedInUser={loggedInUser}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default WheatgrassMonitor;