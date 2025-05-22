// server.js

const app = require("./src/app");
const { sequelize } = require("./src/models"); // Sequelize instance for DB connection

const PORT = process.env.PORT || 5000;

/**
 * Starts the server without initializing the database.
 * To enable DB syncing, uncomment the `initializeDatabaseAndStartServer` function below.
 */
function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

startServer();

/**
 * Initializes the database and starts the server upon successful connection.
 * Uncomment this function call to enable database initialization before starting the server.
 */
async function initializeDatabaseAndStartServer() {
  try {
    await sequelize.sync(); // Synchronize all defined models with the database
    console.log("✅ Database synchronized successfully");
    startServer();
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
}

initializeDatabaseAndStartServer(); // <- Enable this to start server with DB sync
