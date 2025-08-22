'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class video extends Model {
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: 'user_id' });
    }
  }
  video.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    negative_prompt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in seconds',
    },
    resolution: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orientation: {
      type: DataTypes.ENUM('landscape', 'portrait', 'square'),
      defaultValue: 'landscape',
    },
    credits_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    external_job_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Job ID from external video generation API',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    download_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    share_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    tableName: 'videos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['created_at'],
      },
    ],
  });

  return video;
}