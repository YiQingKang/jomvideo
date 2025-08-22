const { body } = require('express-validator');
const Controller = require("../controllers/user");

function Routes(app, privateRoute) {
  app.get("/api/user/profile", privateRoute, Controller.getProfile);
  app.put("/api/user/profile", privateRoute, [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
  ], Controller.updateProfile);
  app.put("/api/user/password", privateRoute, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ], Controller.changePassword);
  app.get("/api/user/stats", privateRoute, Controller.getStats);
}

module.exports = Routes;