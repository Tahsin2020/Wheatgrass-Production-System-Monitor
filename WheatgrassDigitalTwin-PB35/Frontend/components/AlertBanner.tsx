import React from 'react';
import { Alert, NotificationSeverity } from '../types';

interface AlertBannerProps {
  alerts: Alert[];
  criticalCount: number;
  warningCount: number;
  onDismiss: () => void;
  isCollapsed: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, criticalCount, warningCount, onDismiss, isCollapsed }) => {
  if (alerts.length === 0) return null;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Show collapsed version
  if (isCollapsed) {
    return (
      <div
        style={{
          backgroundColor: '#2b161b',
          border: '2px solid #FF0000',
          padding: '15px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span 
            style={{ 
              fontSize: '20px',
              animation: criticalCount > 0 ? 'blink 1s infinite' : 'none'
            }}
          >
            🚨
          </span>
          <span style={{ color: '#FFFFFF', fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            {criticalCount + warningCount} ALERT{(criticalCount + warningCount) > 1 ? 'S' : ''} HIDDEN
          </span>
          {criticalCount > 0 && (
            <span
              style={{
                backgroundColor: '#FF0000',
                color: '#FFFFFF',
                padding: '3px 8px',
                fontSize: '10px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                animation: 'blink 1s infinite'
              }}
            >
              {criticalCount} CRITICAL
            </span>
          )}
          {warningCount > 0 && (
            <span
              style={{
                backgroundColor: '#FFA500',
                color: '#FFFFFF',
                padding: '3px 8px',
                fontSize: '10px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              {warningCount} WARNING
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ color: '#FFFFFF', fontSize: '11px', fontFamily: 'monospace', opacity: 0.7 }}>
            LIVE • UPDATED {formatTimestamp(alerts[0].timestamp)}
          </div>
          <button
            onClick={onDismiss}
            style={{
              backgroundColor: '#634b55',
              border: '1px solid #FFFFFF',
              color: '#FFFFFF',
              padding: '5px 12px',
              fontSize: '11px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2b161b')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#634b55')}
          >
            SHOW
          </button>
        </div>
        <style jsx>{`
          @keyframes blink {
            0%, 50%, 100% {
              opacity: 1;
            }
            25%, 75% {
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  const getSeverityColor = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return '#FF0000';
      case 'warning':
        return '#FFA500';
      default:
        return '#00BFFF';
    }
  };

  const getSeverityIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  // Show expanded version
  return (
    <div
      style={{
        backgroundColor: '#2b161b',
        border: '2px solid #FF0000',
        borderRadius: '0',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#FFFFFF', fontSize: '16px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            🚨 ACTIVE ALERTS
          </span>
          {criticalCount > 0 && (
            <span
              style={{
                backgroundColor: '#FF0000',
                color: '#FFFFFF',
                padding: '4px 10px',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              {criticalCount} CRITICAL
            </span>
          )}
          {warningCount > 0 && (
            <span
              style={{
                backgroundColor: '#FFA500',
                color: '#FFFFFF',
                padding: '4px 10px',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              {warningCount} WARNING
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ color: '#FFFFFF', fontSize: '11px', fontFamily: 'monospace', opacity: 0.7 }}>
            LIVE • UPDATED {formatTimestamp(alerts[0].timestamp)}
          </div>
          <button
            onClick={onDismiss}
            style={{
              backgroundColor: '#634b55',
              border: '1px solid #FFFFFF',
              color: '#FFFFFF',
              padding: '5px 12px',
              fontSize: '11px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2b161b')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#634b55')}
          >
            HIDE
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {alerts.map((alert, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#634b55',
              border: `2px solid ${getSeverityColor(alert.severity)}`,
              padding: '12px 15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: alert.severity === 'critical' ? 'pulse 2s infinite' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <span style={{ fontSize: '18px' }}>{getSeverityIcon(alert.severity)}</span>
              <div>
                <div style={{ color: '#FFFFFF', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {alert.sensor.toUpperCase()}
                </div>
                <div style={{ color: '#FFFFFF', fontSize: '12px', fontFamily: 'monospace', marginTop: '3px' }}>
                  {alert.message}
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: getSeverityColor(alert.severity),
                color: '#FFFFFF',
                padding: '4px 10px',
                fontSize: '10px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              {alert.severity.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

interface AlertIndicatorProps {
  criticalCount: number;
  warningCount: number;
}

export const AlertIndicator: React.FC<AlertIndicatorProps> = ({ criticalCount, warningCount }) => {
  if (criticalCount === 0 && warningCount === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '12px', height: '12px', backgroundColor: '#00FF00', borderRadius: '50%', border: '1px solid #000000' }}></div>
        <span style={{ color: '#FFFFFF', fontSize: '13px', fontFamily: 'monospace' }}>ALL SYSTEMS NORMAL</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      {criticalCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#FF0000',
              borderRadius: '50%',
              border: '1px solid #000000',
              animation: 'blink 1s infinite',
            }}
          ></div>
          <span style={{ color: '#FF0000', fontSize: '13px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            {criticalCount} CRITICAL ALERT{criticalCount > 1 ? 'S' : ''}
          </span>
        </div>
      )}
      {warningCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#FFA500', borderRadius: '50%', border: '1px solid #000000' }}></div>
          <span style={{ color: '#FFA500', fontSize: '13px', fontFamily: 'monospace' }}>
            {warningCount} WARNING{warningCount > 1 ? 'S' : ''}
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes blink {
          0%, 50%, 100% {
            opacity: 1;
          }
          25%, 75% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
