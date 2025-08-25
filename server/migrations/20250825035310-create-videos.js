'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('videos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      prompt: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      negative_prompt: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      video_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      thumbnail_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'deleted'),
        defaultValue: 'pending',
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      resolution: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      orientation: {
        type: Sequelize.ENUM('landscape', 'portrait', 'square'),
        defaultValue: 'landscape',
      },
      credits_used: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      task_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      download_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      share_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('videos');
  },
};