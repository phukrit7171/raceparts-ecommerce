const jwt = require('jsonwebtoken');
const db = require('../models');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logger.warn('Authentication failed - no token provided');
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug('Token verified', { decoded });
    
    const user = await db.User.findByPk(decoded.id);

    if (!user) {
      logger.warn('Authentication failed - user not found', { userId: decoded.id });
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    req.user = user;
    logger.debug('User authenticated', { userId: user.id, email: user.email });
    next();
  } catch (err) {
    logger.error('Token verification failed:', { error: err });
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { authenticateToken };
