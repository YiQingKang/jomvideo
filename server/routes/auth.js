const { body } = require('express-validator');
const Controller = require("../controllers/auth");

function Routes(app, privateRoute, logRequest) {
  app.post("/api/auth/register", [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ], logRequest, Controller.register);
  app.post("/api/auth/login", [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ], logRequest, Controller.login);
  app.get("/api/auth/me", privateRoute, Controller.getCurrentUser);
  app.post("/api/auth/logout", privateRoute, Controller.logout);
}

module.exports = Routes;
