const { body } = require('express-validator');
const Controller = require("../controllers/admin");
const { authenticate, requireAdmin } = require('../middleware/auth');

function Routes(app, privateRoute) {
  app.get("/api/admin/stats", authenticate, requireAdmin, Controller.getStats);
  app.get("/api/admin/users", authenticate, requireAdmin, Controller.getUsers);
  app.put("/api/admin/users/:id/status", authenticate, requireAdmin, Controller.updateUserStatus);
  app.get("/api/admin/videos", authenticate, requireAdmin, Controller.getVideos);
}

module.exports = Routes;