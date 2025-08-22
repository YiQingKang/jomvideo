const app = require('./app');
const Models = require("./models/index.js");

const PORT = process.env.PORT || 3001;

// Start server
const startServer = async () => {
  try {
    await Models.sequelize.authenticate();
    console.log('Database connection established successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
