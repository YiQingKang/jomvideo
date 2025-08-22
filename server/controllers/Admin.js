const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Models = require("../models");
const { Op, Sequelize } = require('sequelize');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

class AdminController {
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

  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, search, status, role } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }
      if (status && status !== 'all') {
        where.status = status;
      }
      if (role) {
        where.role = role;
      }

      const { rows: users, count } = await Models.user.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        attributes: {
          include: [
            [Sequelize.fn('COUNT', Sequelize.col('videos.id')), 'totalVideos'],
          ],
        },
        include: [{
          model: Models.video,
          as: 'videos',
          attributes: [],
          duplicating: false,
        }],
        group: ['user.id'],
      });

      res.json({
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(count / limit),
          total: count,
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  };

  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await Models.user.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.status = status;
      await user.save();

      res.json({ message: 'User status updated successfully', user });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ message: 'Failed to update user status' });
    }
  };

  static async getVideos(req, res) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { prompt: { [Op.iLike]: `%${search}%` } },
        ];
      }
      if (status && status !== 'all') {
        where.status = status;
      }

      const { rows: videos, count } = await Models.video.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [{
          model: Models.user,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }]
      });

      res.json({
        videos,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(count / limit),
          total: count,
        },
      });
    } catch (error) {
      console.error('Get videos error:', error);
      res.status(500).json({ message: 'Failed to fetch videos' });
    }
  };

  static async deleteVideo(req, res) {
    try {
      const { id } = req.params;

      const video = await Models.video.findByPk(id);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      await video.destroy();

      res.json({ message: 'Video deleted successfully' });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({ message: 'Failed to delete video' });
    }
  };
}

module.exports = AdminController;