import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import User from '../models/user.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// Update user profile
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, email, bio } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (email) {
      const emailExists = await User.findOne({ 
        where: { email: email.toLowerCase().trim() } 
      });
      if (emailExists && emailExists.id !== req.user.id) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      updateData.email = email.toLowerCase().trim();
    }
    if (bio !== undefined) updateData.bio = bio.trim();

    await req.user.update(updateData);
    
    res.json({
      message: 'Profile updated successfully',
      user: req.user.toJSON(),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    await req.user.update({ password: newPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { Video, CreditTransaction } = await import('../models/associations.js');
    
    const stats = await Promise.all([
      Video.count({ where: { user_id: req.user.id } }),
      Video.count({ where: { user_id: req.user.id, status: 'completed' } }),
      CreditTransaction.sum('amount', { 
        where: { 
          user_id: req.user.id, 
          type: 'usage',
          amount: { [Op.lt]: 0 }
        } 
      }),
    ]);

    res.json({
      totalVideos: stats[0],
      completedVideos: stats[1],
      totalCreditsUsed: Math.abs(stats[2] || 0),
      creditsRemaining: req.user.credits,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

export default router;