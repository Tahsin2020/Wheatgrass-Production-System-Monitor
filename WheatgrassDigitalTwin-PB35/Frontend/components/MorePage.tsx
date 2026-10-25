import React from 'react';
import { NavBar } from './NavBar';

interface MorePageProps {
  currentPage: string;
  loggedInUser: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const MorePage: React.FC<MorePageProps> = ({
  currentPage,
  loggedInUser,
  onNavigate,
  onLogout,
}) => (
  <div style={{ minHeight: '100vh', backgroundColor: '#2b161b' }}>
    <NavBar 
      currentPage={currentPage}
      loggedInUser={loggedInUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
    />
    <div style={{ padding: '50px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ 
          width: '200px', 
          height: '200px', 
          margin: '0 auto 30px', 
          backgroundColor: '#634b55', 
          border: '2px solid #000000', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <span style={{ color: '#FFFFFF', fontSize: '18px', fontFamily: 'monospace' }}>
            COMPANY LOGO
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '24px', margin: '0 0 10px 0', fontFamily: 'monospace' }}>
          AUTOMATED WHEATGRASS PRODUCTION
        </h1>
        <h2 style={{ color: '#FFFFFF', fontSize: '18px', margin: 0, fontFamily: 'monospace' }}>
          MONITORING & CONTROL SYSTEM
        </h2>
      </div>

      <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ color: '#FFFFFF', fontSize: '16px', margin: '0 0 20px 0', fontFamily: 'monospace' }}>
          FREQUENTLY ASKED QUESTIONS
        </h3>
        <div style={{ color: '#FFFFFF', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.8' }}>
          <p><strong>Q: How often is sensor data updated?</strong></p>
          <p style={{ marginLeft: '20px' }}>
            A: Real-time data is refreshed every 30 seconds from the conveyor system sensors.
          </p>
          <p><strong>Q: What alerts are available?</strong></p>
          <p style={{ marginLeft: '20px' }}>
            A: System monitors temperature, humidity, light levels, and pressure content with configurable thresholds.
          </p>
          <p><strong>Q: How can I export historical data?</strong></p>
          <p style={{ marginLeft: '20px' }}>
            A: Historical logs can be exported from the dashboard in CSV format for analysis.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '30px' }}>
        <h3 style={{ color: '#FFFFFF', fontSize: '16px', margin: '0 0 20px 0', fontFamily: 'monospace' }}>
          RESOURCES
        </h3>
        <div style={{ color: '#FFFFFF', fontSize: '13px', fontFamily: 'monospace', lineHeight: '2' }}>
          <div>
            <a href="#" style={{ color: '#FF6A97', textDecoration: 'none' }}>
              → SYSTEM DOCUMENTATION
            </a>
          </div>
          <div>
            <a href="#" style={{ color: '#FF6A97', textDecoration: 'none' }}>
              → USER MANUAL
            </a>
          </div>
          <div>
            <a href="#" style={{ color: '#FF6A97', textDecoration: 'none' }}>
              → TECHNICAL SPECIFICATIONS
            </a>
          </div>
          <div>
            <a href="#" style={{ color: '#FF6A97', textDecoration: 'none' }}>
              → SUPPORT PORTAL
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);
