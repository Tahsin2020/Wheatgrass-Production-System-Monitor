const axios = require('axios');
const config = require('../config/config');

// Authentication controller for login/logout
class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const tokenUrl = `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/token`;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', config.keycloak.clientId);
      params.append('client_secret', config.keycloak.clientSecret);
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post(tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      res.json({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const tokenUrl = `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/token`;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', config.keycloak.clientId);
      params.append('client_secret', config.keycloak.clientSecret);
      params.append('refresh_token', refresh_token);

      const response = await axios.post(tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      res.json({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
      });
    } catch (error) {
      res.status(401).json({ error: 'Token refresh failed' });
    }
  }

  async logout(req, res) {
    try {
      const { refresh_token } = req.body;

      if (refresh_token) {
        const logoutUrl = `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/logout`;
        
        const params = new URLSearchParams();
        params.append('client_id', config.keycloak.clientId);
        params.append('client_secret', config.keycloak.clientSecret);
        params.append('refresh_token', refresh_token);

        await axios.post(logoutUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
      }

      res.json({ message: 'Logged out' });
    } catch (error) {
      res.json({ message: 'Logged out' });
    }
  }

  async getUserInfo(req, res) {
    try {
      const token = req.headers.authorization?.substring(7);
      const userInfoUrl = `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/userinfo`;
      
      const response = await axios.get(userInfoUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      res.json(response.data);
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = new AuthController();
