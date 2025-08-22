'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class credit_transaction extends Model {
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: 'user_id' })
    }
  }

  credit_transaction.init({
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
    type: {
      type: DataTypes.ENUM('purchase', 'usage', 'refund', 'bonus', 'adjustment'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Positive for credit additions, negative for usage',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Reference to related entity (video, payment, etc.)',
    },
    reference_type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of referenced entity (video, payment, etc.)',
    },
    balance_after: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User credit balance after this transaction',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    sequelize,
    tableName: 'credit_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['created_at'],
      },
    ],
  });

  return credit_transaction;
}