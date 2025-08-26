const { body } = require('express-validator');
const Controller = require("../controllers/credit");

function Routes(app, privateRoute) {
  app.get("/api/credit/balance", privateRoute, Controller.getBalance);
  app.get("/api/credit/transactions", privateRoute, Controller.getTransactions);
  app.post("/api/credit/purchase", privateRoute, [
    body('package_id').notEmpty().withMessage('Package ID is required'),
    body('payment_method').isIn(['stripe', 'paypal']).withMessage('Invalid payment method'),
  ], Controller.purchaseCredits);
  app.post("/api/credit/gkashpayment", privateRoute, Controller.gkashPayment)
}

module.exports = Routes;