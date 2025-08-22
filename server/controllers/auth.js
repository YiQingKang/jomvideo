const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Models = require("../models");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

class AuthController {
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { name, email, password } = req.body;

      const existingUser = await Models.user.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const user = await Models.user.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      const token = generateToken(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to register user' });
    }
  };

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      const user = await Models.user.findOne({ where: { email: email.toLowerCase().trim() } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (user.status === 'banned') {
        return res.status(403).json({ message: 'Account has been banned' });
      }

      // Update last login
      await user.update({ last_login: new Date() });

      const token = generateToken(user.id);

      res.json({
        message: 'Login successful',
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Failed to login' });
    }
  };

  static async getCurrentUser(req, res) {
    res.json({
      user: req.user.toJSON(),
    });
  };

  static async logout(req, res) {
    res.json({ message: 'Logged out successfully' });
  };
}

module.exports = AuthController;
