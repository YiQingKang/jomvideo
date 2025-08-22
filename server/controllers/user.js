const { body, validationResult } = require('express-validator');
const Models = require("../models");
const { Op } = require('sequelize');

class UserController {
  static async getProfile(req, res) {
    res.json({ user: req.user.toJSON() });
  }

  static async updateProfile(req, res) {
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
        const emailExists = await Models.user.findOne({ 
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
  }

  static async changePassword(req, res) {
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
  }

  static async getStats(req, res) {
    try {    
      const stats = await Promise.all([
        Models.video.count({ where: { user_id: req.user.id } }),
        Models.video.count({ where: { user_id: req.user.id, status: 'completed' } }),
        Models.credit_transaction.sum('amount', { 
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
  }
}

module.exports = UserController;
