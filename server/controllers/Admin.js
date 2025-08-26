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
  static async getStats(req, res) {
    try {
      const totalUsers = await Models.user.count();
      const totalVideos = await Models.video.count();
      const totalCreditsUsed = await Models.video.sum('credits_used');
      const totalPayments = await Models.payment.sum('amount');

      const recentVideos = await Models.video.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [{ model: Models.user, attributes: ['id', 'name', 'email'] }],
      });

      const recentUsers = await Models.user.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
      });

      res.json({
        stats: {
          totalUsers,
          totalVideos,
          totalCreditsUsed,
          totalPayments,
        },
        recentVideos,
        recentUsers,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  }

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
            [Sequelize.literal('(SELECT COUNT(*) FROM videos WHERE videos.user_id = "user".id)'), 'totalVideos'],
            [Sequelize.literal('(SELECT SUM(amount) FROM payments WHERE payments.user_id = "user".id)'), 'totalSpent'],
          ],
        },
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
}

module.exports = AdminController;