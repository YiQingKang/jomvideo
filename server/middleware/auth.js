const jwt = require('jsonwebtoken');
const Models = require("../models");

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
    next();
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
  requireCredits
}