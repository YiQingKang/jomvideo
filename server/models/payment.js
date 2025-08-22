'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class payment extends Model {
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: 'user_id' });
    }
  }

  payment.init({
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
    provider: {
      type: DataTypes.ENUM('stripe', 'paypal'),
      allowNull: false,
    },
    provider_payment_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    credits_purchased: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    provider_response: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    refund_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refunded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['provider_payment_id'],
        unique: true,
      },
      {
        fields: ['status'],
      },
    ],
  });

  return payment
}