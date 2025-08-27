const Controller = require('../controllers/payment');

function Routes(app, privateRoute, logRequest) {
  app.post("/api/payment/gkash-callback", logRequest, Controller.gkashCallback);
  app.post("/api/payment/gkash-return", logRequest, Controller.gkashReturn);
}

module.exports = Routes;
