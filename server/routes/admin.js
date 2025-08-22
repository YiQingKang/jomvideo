const { body } = require('express-validator');
const Controller = require("../controllers/admin");
const { authenticate, requireAdmin } = require('../middleware/auth');

function Routes(app, privateRoute) {
  app.post("/api/admin/register", [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ], Controller.register);
  app.post("/api/admin/login", [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ], Controller.login);
  app.get("/api/admin/me", privateRoute, Controller.getCurrentUser);
  app.post("/api/admin/logout", privateRoute, Controller.logout);

  // Admin specific routes
  app.get("/api/admin/users", authenticate, requireAdmin, Controller.getUsers);
  app.put("/api/admin/users/:id/status", authenticate, requireAdmin, Controller.updateUserStatus);
  app.get("/api/admin/videos", authenticate, requireAdmin, Controller.getVideos);
  app.delete("/api/admin/videos/:id", authenticate, requireAdmin, Controller.deleteVideo);
}

module.exports = Routes;