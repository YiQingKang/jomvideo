const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Models = require("../models");

// Helper function to calculate credits needed
const calculateCreditsNeeded = (settings) => {
  let credits = 1; // Base cost
  
  if (settings.resolution === 'fhd') credits = 2;
  if (settings.resolution === '4k') credits = 4;
  
  const duration = settings.duration || 10;
  const durationMultiplier = Math.ceil(duration / 10);
  
  return credits * durationMultiplier;
};

// Mock video generation process
const processVideoGeneration = async (videoId) => {
  try {
    // Simulate processing time
    setTimeout(async () => {
      const video = await Models.video.findByPk(videoId);
      if (!video) return;

      await video.update({
        status: 'processing',
      });

      // Simulate longer processing time
      setTimeout(async () => {
        await video.update({
          status: 'completed',
          video_url: 'https://example.com/generated-video.mp4',
          thumbnail_url: 'https://example.com/thumbnail.jpg',
          duration: 30,
        });
      }, 5000);
    }, 1000);
  } catch (error) {
    console.error('Video processing error:', error);
    await Models.video.update(
      { 
        status: 'failed', 
        error_message: 'Generation failed' 
      },
      { where: { id: videoId } }
    );
  }
};

class VideoController {
  static async getVideos(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (page - 1) * limit;

      const where = { user_id: req.user.id };
      
      if (status && status !== 'all') {
        where.status = status;
      }
      
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { prompt: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows: videos, count } = await Models.video.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
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
  }

  static async getVideo(req, res) {
    try {
      const video = await Models.video.findOne({
        where: { 
          id: req.params.id,
          user_id: req.user.id,
        },
      });

      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      res.json({ video });
    } catch (error) {
      console.error('Get video error:', error);
      res.status(500).json({ message: 'Failed to fetch video' });
    }
  }

  static async generateVideo(req, res) {
    const transaction = await Models.sequelize.transaction();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { title, prompt, negative_prompt, settings = {} } = req.body;
      
      // Calculate credits needed based on settings
      const creditsNeeded = calculateCreditsNeeded(settings);
      
      if (req.user.credits < creditsNeeded) {
        await transaction.rollback();
        return res.status(402).json({ 
          message: 'Insufficient credits',
          required: creditsNeeded,
          current: req.user.credits,
        });
      }

      // Create video record
      const video = await Models.video.create({
        user_id: req.user.id,
        title: title.trim(),
        prompt: prompt.trim(),
        negative_prompt: negative_prompt?.trim(),
        settings,
        status: 'pending',
        credits_used: creditsNeeded,
      }, { transaction });

      // Deduct credits
      await req.user.update({
        credits: req.user.credits - creditsNeeded,
      }, { transaction });

      // Record credit transaction
      await Models.credit_transaction.create({
        user_id: req.user.id,
        type: 'usage',
        amount: -creditsNeeded,
        description: `Video generation: ${title}`,
        reference_id: video.id,
        reference_type: 'video',
        balance_after: req.user.credits - creditsNeeded,
      }, { transaction });

      await transaction.commit();

      // Start video generation process (mock implementation)
      processVideoGeneration(video.id);

      res.status(201).json({
        message: 'Video generation started',
        video,
        creditsRemaining: req.user.credits - creditsNeeded,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Video generation error:', error);
      res.status(500).json({ message: 'Failed to start video generation' });
    }
  }

  static async recordDownload(req, res) {
    try {
      const video = await Models.video.findOne({
        where: { 
          id: req.params.id,
          user_id: req.user.id,
          status: 'completed',
        },
      });

      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      await video.increment('download_count');

      res.json({ message: 'Download recorded' });
    } catch (error) {
      console.error('Download tracking error:', error);
      res.status(500).json({ message: 'Failed to record download' });
    }
  }

  static async recordShare(req, res) {
    try {
      const video = await Models.video.findOne({
        where: { 
          id: req.params.id,
          user_id: req.user.id,
          status: 'completed',
        },
      });

      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      await video.increment('share_count');

      res.json({ message: 'Share recorded' });
    } catch (error) {
      console.error('Share tracking error:', error);
      res.status(500).json({ message: 'Failed to record share' });
    }
  }

  static async deleteVideo(req, res) {
    try {
      const video = await Models.video.findOne({
        where: { 
          id: req.params.id,
          user_id: req.user.id,
        },
      });

      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      await video.destroy();

      res.json({ message: 'Video deleted successfully' });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({ message: 'Failed to delete video' });
    }
  }
}

module.exports = VideoController;
