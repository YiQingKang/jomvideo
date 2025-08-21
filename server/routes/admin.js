import express from 'express';
import { Op } from 'sequelize';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { User, Video, Payment, CreditTransaction } from '../models/associations.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Promise.all([
      User.count(),
      Video.count(),
      Payment.sum('amount', { where: { status: 'completed' } }),
      CreditTransaction.sum('amount', { where: { type: 'purchase' } }),
      User.count({ where: { status: 'active' } }),
      Video.count({ where: { status: 'completed' } }),
    ]);

    res.json({
      totalUsers: stats[0],
      totalVideos: stats[1],
      totalRevenue: parseFloat(stats[2] || 0),
      totalCreditsPurchased: stats[3] || 0,
      activeUsers: stats[4],
      completedVideos: stats[5],
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get all users with pagination and search
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
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

    const { rows: users, count } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Video,
          as: 'videos',
          attributes: [],
        },
        {
          model: Payment,
          as: 'payments',
          attributes: [],
          where: { status: 'completed' },
          required: false,
        },
      ],
      attributes: [
        'id', 'name', 'email', 'credits', 'status', 'role', 'created_at', 'last_login',
        [sequelize.fn('COUNT', sequelize.col('videos.id')), 'totalVideos'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('payments.amount')), 0), 'totalSpent'],
      ],
      group: ['user.id'],
      subQuery: false,
    });

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(count.length / limit),
        total: count.length,
      },
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get all videos with pagination and search
router.get('/videos', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, user_id } = req.query;
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
    
    if (user_id) {
      where.user_id = user_id;
    }

    const { rows: videos, count } = await Video.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
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
    console.error('Admin get videos error:', error);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

// Update user status or credits
router.put('/users/:id', async (req, res) => {
  try {
    const { status, credits, role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (credits !== undefined) updateData.credits = credits;
    if (role) updateData.role = role;

    await user.update(updateData);

    // Record credit adjustment if credits were modified
    if (credits !== undefined && credits !== user.credits) {
      await CreditTransaction.create({
        user_id: user.id,
        type: 'adjustment',
        amount: credits - user.credits,
        description: `Admin adjustment by ${req.user.name}`,
        balance_after: credits,
        metadata: { admin_id: req.user.id },
      });
    }

    res.json({
      message: 'User updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete video (admin only)
router.delete('/videos/:id', async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.destroy();

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Admin delete video error:', error);
    res.status(500).json({ message: 'Failed to delete video' });
  }
});

// Get payment history
router.get('/payments', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: payments, count } = await Payment.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.json({
      payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    console.error('Admin get payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

export default router;