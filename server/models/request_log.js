'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class request_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  request_log.init({
    method: DataTypes.STRING,
    url: DataTypes.STRING,
    ip_address: DataTypes.STRING,
    user_agent: DataTypes.TEXT,
    request_body: DataTypes.TEXT,
    response_status_code: DataTypes.INTEGER,
    response_body: DataTypes.TEXT,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'request_log',
  });
  return request_log;
};