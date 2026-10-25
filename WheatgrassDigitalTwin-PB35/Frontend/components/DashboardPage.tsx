import React from 'react';
import { useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SensorData, Alert } from '../types';
import { AlertBanner, AlertIndicator } from './AlertBanner';
import { NavBar } from './NavBar';
import { accessCamera } from '@/services/livestream';
const SystemSchematicUrl = 'System_Schematic.png'; 

interface DashboardPageProps {
  currentPage: string;
  loggedInUser: string;
  sensorData: SensorData;
  historicalData: any[];
  selectedMetric: string;
  selectedTimeRange: string;
  isLoading: boolean;
  error: string | null;
  alerts: Alert[];
  criticalCount: number;
  warningCount: number;
  hasAlerts: boolean;
  alertsHidden: boolean;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onMetricChange: (metric: string) => void;
  onTimeRangeChange: (range: string) => void;
  onDismissAlerts: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentPage,
  loggedInUser,
  sensorData,
  historicalData,
  selectedMetric,
  selectedTimeRange,
  isLoading,
  error,
  alerts,
  criticalCount,
  warningCount,
  hasAlerts,
  alertsHidden,
  onNavigate,
  onLogout,
  onMetricChange,
  onTimeRangeChange,
  onDismissAlerts,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check if the Ref value is working.
    if (!canvasRef.current) return;
    else accessCamera(canvasRef)
  }, []);
  
  return (
  <div style={{ minHeight: '100vh', backgroundColor: '#2b161b' }}>
    <NavBar 
      currentPage={currentPage}
      loggedInUser={loggedInUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
    />
    <div style={{ padding: '30px' }}>
      <h1 style={{ color: '#FFFFFF', fontSize: '20px', margin: '0 0 30px 0', fontFamily: 'monospace' }}>
        SYSTEM DASHBOARD
      </h1>
      
      {/* Alert Status Bar */}
      {hasAlerts && (
        <AlertBanner 
          alerts={alerts} 
          criticalCount={criticalCount} 
          warningCount={warningCount}
          onDismiss={onDismissAlerts}
          isCollapsed={alertsHidden}
        />
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '20px' }}>
          <div style={{ color: '#FFFFFF', fontSize: '12px', marginBottom: '10px', fontFamily: 'monospace' }}>
            TEMPERATURE
          </div>
          <div style={{ color: '#FFFFFF', fontSize: '28px', fontFamily: 'monospace' }}>
            {isLoading ? '...' : (typeof sensorData.temperature=== "undefined" ||  sensorData.temperature=== null ) ? "..." : sensorData.temperature.toFixed(1)}°C
          </div>
        </div>
        <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '20px' }}>
          <div style={{ color: '#FFFFFF', fontSize: '12px', marginBottom: '10px', fontFamily: 'monospace' }}>
            HUMIDITY
          </div>
          <div style={{ color: '#FFFFFF', fontSize: '28px', fontFamily: 'monospace' }}>
            {isLoading ? '...' : (typeof sensorData.humidity=== "undefined" ||  sensorData.humidity=== null ) ? "..." : sensorData.humidity.toFixed(1)}%
          </div>
        </div>
        <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '20px' }}>
          <div style={{ color: '#FFFFFF', fontSize: '12px', marginBottom: '10px', fontFamily: 'monospace' }}>
            LIGHT LEVEL
          </div>
          <div style={{ color: '#FFFFFF', fontSize: '28px', fontFamily: 'monospace' }}>
            {isLoading ? '...' :  (typeof sensorData.light=== "undefined" ||  sensorData.light=== null ) ? "..." : Math.round(sensorData.light)} lux
          </div>
        </div>
        <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '20px' }}>
          <div style={{ color: '#FFFFFF', fontSize: '12px', marginBottom: '10px', fontFamily: 'monospace' }}>
            WATER FLOW
          </div>
          <div style={{ color: '#FFFFFF', fontSize: '28px', fontFamily: 'monospace' }}>
            {isLoading ? '...' : (typeof sensorData.waterFlow=== "undefined" ||  sensorData.waterFlow=== null ) ? "..." : sensorData.waterFlow.toFixed(1)} L/min
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '20px', minHeight: '400px' }}>
          <div style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '15px', fontFamily: 'monospace' }}>
            SYSTEM SCHEMATIC
          </div>
          <div style={{display:'flex',justifyContent:"center", backgroundColor: '#ffffff', border:"6px solid #000000"}}>
            <img src={SystemSchematicUrl} alt="System Schematic of the Sensors" style={{maxWidth:"600px", width:"100%"}}/>
          </div>
        </div>

        <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '20px' }}>
          <div style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '15px', fontFamily: 'monospace' }}>
            HISTORICAL DATA
          </div>
          <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
            <select 
              value={selectedMetric} 
              onChange={(e) => onMetricChange(e.target.value)}
              style={{ 
                padding: '8px', 
                backgroundColor: '#2b161b', 
                border: '1px solid #000000', 
                color: '#FFFFFF', 
                fontSize: '12px', 
                fontFamily: 'monospace', 
                flex: 1 
              }}
            >
              <option value="temperature">TEMPERATURE</option>
              <option value="humidity">HUMIDITY</option>
              <option value="light">LIGHT LEVEL</option>
              <option value="waterFlow">WATER FLOW RATE</option>
            </select>
            <select
              value={selectedTimeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              style={{ 
                padding: '8px', 
                backgroundColor: '#2b161b', 
                border: '1px solid #000000', 
                color: '#FFFFFF', 
                fontSize: '12px', 
                fontFamily: 'monospace',
                flex: 1
              }}
            >
              <option value="1h">LAST 1 HOUR</option>
              <option value="6h">LAST 6 HOURS</option>
              <option value="24h">LAST 24 HOURS</option>
              <option value="7d">LAST 7 DAYS</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
              <XAxis 
                dataKey="time" 
                stroke="#FFFFFF" 
                style={{ fontSize: '11px', fontFamily: 'monospace' }} 
              />
              <YAxis 
                stroke="#FFFFFF" 
                style={{ fontSize: '11px', fontFamily: 'monospace' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#2b161b', 
                  border: '1px solid #000000', 
                  fontFamily: 'monospace', 
                  fontSize: '12px' 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#FFFFFF" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
        <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '20px', minHeight: '400px' }}>
          <div style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '15px', fontFamily: 'monospace' }}>
            LIVE VIDEO STREAM
          </div>
          <div style={{justifyContent:"center",alignContent:"center", display:"flex"}}>
          <canvas ref={canvasRef} width={640} height={480}></canvas>     
        </div>
        </div>
    </div>
  </div>
);
}
