const cron = require('node-cron');
const axios = require('axios');
const { Op } = require('sequelize');
const Models = require('../models');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Function to upload a file to S3
const uploadToS3 = async (filePath, key) => {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${process.env.NODE_ENV || "development"}/${key}`,
    Body: fileStream,
  };
  return s3.upload(uploadParams).promise();
};

// Function to download a file
const downloadFile = async (url, dest) => {
  const writer = fs.createWriteStream(dest);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// Cron job to check video status
cron.schedule('* * * * *', async () => {
  try {
    const videos = await Models.video.findAll({
      where: {
        status: 'processing',
      },
    });

    for (const video of videos) {
      // Check for timeout
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (video.created_at < twoHoursAgo) {
        await video.update({
          status: 'failed',
          error_message: 'Generation timed out',
        });
        continue;
      }

      // Check BytePlus API for status
      const response = await axios.get(`https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks/${video.task_id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.BYTEPLUS_API_KEY}`,
        }
      });

      const { status, content, usage } = response.data;

      if (status === 'succeeded') {
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
        }

        const videoFileName = `${video.id}.mp4`;
        const thumbnailFileName = `${video.id}.png`;
        const videoPath = path.join(tempDir, videoFileName);
        const thumbnailPath = path.join(tempDir, thumbnailFileName);

        // Download video
        await downloadFile(content.video_url, videoPath);

        // Generate thumbnail
        await new Promise((resolve, reject) => {
          ffmpeg(videoPath)
            .on('end', resolve)
            .on('error', reject)
            .screenshots({
              count: 1,
              folder: tempDir,
              filename: thumbnailFileName,
              timemarks: [ '1' ] // 1 second
            });
        });

        // Upload video and thumbnail to S3
        const videoS3Key = `videos/${video.user_id}/${videoFileName}`;
        const thumbnailS3Key = `thumbnails/${video.user_id}/${thumbnailFileName}`;

        const [videoUpload, thumbnailUpload] = await Promise.all([
          uploadToS3(videoPath, videoS3Key),
          uploadToS3(thumbnailPath, thumbnailS3Key),
        ]);

        // Update video record
        await video.update({
          status: 'completed',
          video_url: videoUpload.Location,
          thumbnail_url: thumbnailUpload.Location,
          duration: usage.duration,
        });

        // Clean up temp files
        fs.unlinkSync(videoPath);
        fs.unlinkSync(thumbnailPath);

      } else if (status === 'failed') {
        await video.update({
          status: 'failed',
          error_message: 'Generation failed on BytePlus',
        });
      }
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});
