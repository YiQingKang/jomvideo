const { body } = require('express-validator');
const Controller = require("../controllers/video");

function Routes(app, privateRoute) {
  app.get("/api/video", privateRoute, Controller.getVideos);
  app.get("/api/video/share/:id", Controller.getSharedVideo);
  app.get("/api/video/:id", privateRoute, Controller.getVideo);
  app.get("/api/video/:id/download-url", privateRoute, Controller.getDownloadUrl);
  app.post("/api/video/generate", privateRoute, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
    body('settings').optional().isObject().withMessage('Settings must be an object'),
  ], Controller.generateVideo);
  app.post("/api/video/:id/download", privateRoute, Controller.recordDownload);
  app.post("/api/video/:id/share", privateRoute, Controller.recordShare);
  app.delete("/api/video/:id", privateRoute, Controller.deleteVideo);
}

module.exports = Routes;
