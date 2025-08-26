const jwt = require('jsonwebtoken');
const Models = require("../models");

const logRequest = async (req, res, next) => {
  if (req.method !== 'GET') {
    const logEntry = {
      method: req.method,
      url: req.originalUrl,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      request_body: JSON.stringify(req.body),
      user_id: req.user ? req.user.id : null,
    };

    const originalSend = res.send;
    res.send = function (body) {
      res.locals.responseBody = body;
      originalSend.apply(res, arguments);
    };

    res.on('finish', async () => {
      logEntry.response_status_code = res.statusCode;
      logEntry.response_body = res.locals.responseBody ? JSON.stringify(res.locals.responseBody) : null;
      try {
        await Models.request_log.create(logEntry);
      } catch (error) {
        console.error('Error logging request:', error);
      }
    });
  }
  next();
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await Models.user.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account has been banned' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    req.user = user;
    logRequest(req, res, next);

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const requireCredits = (minCredits = 1) => {
  return (req, res, next) => {
    if (req.user.credits < minCredits) {
      return res.status(402).json({ 
        message: 'Insufficient credits',
        required: minCredits,
        current: req.user.credits
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireAdmin,
  requireCredits,
  logRequest
};