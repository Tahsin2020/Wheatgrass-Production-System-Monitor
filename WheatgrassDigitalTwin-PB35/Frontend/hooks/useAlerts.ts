import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Alert } from '../types';

export const useAlerts = (pollingInterval = 10000) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    // Don't fetch if polling is disabled
    if (pollingInterval === 0) return;
    
    try {
      setLoading(true);
      const data = await apiService.getAlerts();
      setAlerts(data.alerts);
      setAlertCount(data.count);
      setCriticalCount(data.criticalCount);
      setWarningCount(data.warningCount);
      setError(null);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pollingInterval]);

  useEffect(() => {
    // Don't set up polling if interval is 0
    if (pollingInterval === 0) return;
    
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(), pollingInterval);
    return () => clearInterval(interval);
  }, [fetchAlerts, pollingInterval]);

  return {
    alerts,
    alertCount,
    criticalCount,
    warningCount,
    loading,
    error,
    fetchAlerts,
    hasAlerts: alertCount > 0,
    hasCriticalAlerts: criticalCount > 0,
  };
};
