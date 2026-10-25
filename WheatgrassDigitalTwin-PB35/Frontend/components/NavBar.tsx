import React from 'react';

interface NavBarProps {
  currentPage: string;
  loggedInUser: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ 
  currentPage, 
  loggedInUser, 
  onNavigate, 
  onLogout 
}) => (
  <div style={{ backgroundColor: '#634b55', border: '2px solid #000000', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', gap: '30px' }}>
      <button 
        onClick={() => onNavigate('dashboard')} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: currentPage === 'dashboard' ? '#FFFFFF' : '#FF6A97', 
          cursor: 'pointer', 
          fontSize: '13px', 
          fontFamily: 'monospace' 
        }}
      >
        DASHBOARD
      </button>
      <button 
        onClick={() => onNavigate('more')} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: currentPage === 'more' ? '#FFFFFF' : '#FF6A97', 
          cursor: 'pointer', 
          fontSize: '13px', 
          fontFamily: 'monospace' 
        }}
      >
        MORE
      </button>
    </div>
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <span style={{ color: '#FFFFFF', fontSize: '13px', fontFamily: 'monospace' }}>
        USER: {loggedInUser}
      </span>
      <button 
        onClick={onLogout} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#FF6A97', 
          cursor: 'pointer', 
          fontSize: '13px', 
          fontFamily: 'monospace' 
        }}
      >
        LOGOUT
      </button>
    </div>
  </div>
);
