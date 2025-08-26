const { authenticate, logRequest } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

module.exports = function (app) {
  if (fs.existsSync(__dirname)) {
    fs
    .readdirSync(__dirname)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      );
    })
    .forEach(file => {
      const route = require(path.join(__dirname, file));
      route(app, authenticate, logRequest);
    });
  }
};