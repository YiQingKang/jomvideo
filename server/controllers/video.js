const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const axios = require('axios');
const Models = require("../models");
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Helper function to calculate credits needed
const calculateCreditsNeeded = (settings) => {
  let credits = 1; // Base cost
  
  if (settings.resolution === 'fhd') credits = 2;
  if (settings.resolution === '4k') credits = 4;
  
  const duration = settings.duration || 10;
  const durationMultiplier = Math.ceil(duration / 10);
  
  return credits * durationMultiplier;
};

// Helper function to get presigned URL
const getPresignedUrl = (key) => {
  if (!key) return null;
  try {
    const url = new URL(key);
    let s3Key = url.pathname;
    if (s3Key.startsWith("/")) {
      s3Key = s3Key.replace("/", "");
    }
    return s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Expires: 60 * 60, // 1 hour
    });
  } catch (error) {
    console.error('Invalid URL for presigning:', key);
    return null;
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

      const videosWithPresignedUrls = videos.map(video => {
        const videoData = video.toJSON();
        videoData.thumbnail_url = getPresignedUrl(video.thumbnail_url);
        return videoData;
      });

      res.json({
        videos: videosWithPresignedUrls,
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

      const videoData = video.toJSON();
      videoData.thumbnail_url = getPresignedUrl(video.thumbnail_url);

      res.json({ video: videoData });
    } catch (error) {
      console.error('Get video error:', error);
      res.status(500).json({ message: 'Failed to fetch video' });
    }
  }

  static async getDownloadUrl(req, res) {
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

      const downloadUrl = getPresignedUrl(video.video_url);

      res.json({ downloadUrl });
    } catch (error) {
      console.error('Get download URL error:', error);
      res.status(500).json({ message: 'Failed to get download URL' });
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
        duration: settings.duration,
        resolution: settings.resolution,
        orientation: settings.orientation,
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

      // Construct the prompt for BytePlus
      const byteplusPrompt = `${prompt.trim()} --ratio ${settings.ratio || '16:9'} --resolution ${settings.resolution || '720p'} --duration ${settings.duration || 5} --camerafixed ${settings.camerafixed || false}`;

      // Call BytePlus API
      const byteplusResponse = await axios.post('https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks', {
        model: 'seedance-1-0-lite-t2v-250428',
        content: [
          {
            type: 'text',
            text: byteplusPrompt,
          },
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.BYTEPLUS_API_KEY}`,
        }
      });

      // Update video with task_id
      await video.update({
        task_id: byteplusResponse.data.id,
        status: 'processing',
      }, { transaction });


      await transaction.commit();

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
