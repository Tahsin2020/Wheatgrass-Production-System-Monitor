import React from 'react';

interface LoginPageProps {
  username: string;
  password: string;
  loginError: string;
  isLoggingIn: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  username, 
  password, 
  loginError, 
  isLoggingIn, 
  onUsernameChange, 
  onPasswordChange, 
  onSubmit 
}) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2b161b' }}>
    <div style={{ width: '400px', backgroundColor: '#634b55', border: '2px solid #000000', padding: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ width: '120px', height: '120px', margin: '0 auto 20px', backgroundColor: '#2b161b', border: '2px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#FFFFFF', fontSize: '14px', fontFamily: 'monospace' }}>LOGO</span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '18px', margin: 0, fontFamily: 'monospace' }}>WHEATGRASS MONITOR</h1>
      </div>
      
      {loginError && (
        <div style={{ 
          backgroundColor: '#FF0000', 
          color: '#FFFFFF', 
          padding: '10px', 
          marginBottom: '20px', 
          fontSize: '12px', 
          fontFamily: 'monospace',
          border: '1px solid #000000'
        }}>
          {loginError}
        </div>
      )}
      
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="username" style={{ display: 'block', color: '#FFFFFF', marginBottom: '5px', fontSize: '13px', fontFamily: 'monospace' }}>USERNAME / EMAIL</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            disabled={isLoggingIn}
            autoComplete="username"
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#2b161b', 
              border: '1px solid #000000', 
              color: '#FFFFFF', 
              fontSize: '13px', 
              fontFamily: 'monospace', 
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', color: '#FFFFFF', marginBottom: '5px', fontSize: '13px', fontFamily: 'monospace' }}>PASSWORD</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={isLoggingIn}
            autoComplete="current-password"
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#2b161b', 
              border: '1px solid #000000', 
              color: '#FFFFFF', 
              fontSize: '13px', 
              fontFamily: 'monospace', 
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoggingIn}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: isLoggingIn ? '#999999' : '#FF6A97', 
            border: '2px solid #000000', 
            color: '#FFFFFF', 
            fontSize: '13px', 
            cursor: isLoggingIn ? 'not-allowed' : 'pointer', 
            fontFamily: 'monospace', 
            marginBottom: '15px'
          }}
        >
          {isLoggingIn ? 'LOGGING IN...' : 'LOGIN'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <a href="#" style={{ color: '#FF6A97', fontSize: '12px', textDecoration: 'none', fontFamily: 'monospace' }}>FORGOT PASSWORD / RESET</a>
        </div>
      </form>
    </div>
  </div>
);
