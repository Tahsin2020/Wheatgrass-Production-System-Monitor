const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('../config/config');

class AuthMiddleware {
  constructor() {
    this.publicKey = null;
    this.initPublicKey();
  }

  async initPublicKey() {
    try {
      if (config.keycloak.publicKey) {
        this.publicKey = config.keycloak.publicKey;
        return;
      }

      const realmUrl = `${config.keycloak.url}/realms/${config.keycloak.realm}`;
      const response = await axios.get(realmUrl);
      this.publicKey = `-----BEGIN PUBLIC KEY-----\n${response.data.public_key}\n-----END PUBLIC KEY-----`;
    } catch (error) {
      // Silently fail - will be caught on first auth attempt
    }
  }

  verifyToken(req, res, next) {
    const token = req.headers.authorization?.substring(7);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: `${config.keycloak.url}/realms/${config.keycloak.realm}`,
      });

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  optionalAuth(req, res, next) {
    const token = req.headers.authorization?.substring(7);

    if (token) {
      try {
        const decoded = jwt.verify(token, this.publicKey, {
          algorithms: ['RS256'],
          issuer: `${config.keycloak.url}/realms/${config.keycloak.realm}`,
        });
        req.user = decoded;
      } catch (error) {
        // Token invalid, continue without user
      }
    }

    next();
  }
}

const authMiddleware = new AuthMiddleware();

module.exports = {
  verifyToken: (req, res, next) => authMiddleware.verifyToken(req, res, next),
  optionalAuth: (req, res, next) => authMiddleware.optionalAuth(req, res, next),
};
