// server.js

const app = require("./src/app");
const { sequelize } = require("./src/models"); // Sequelize instance for DB connection
const { runSeeders } = require("./src/seeders"); // Seeder system

const PORT = process.env.PORT || 5000;

/**
 * Starts the server
 */
function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

/**
 * Initializes the database, runs seeders, and starts the server
 */
async function initializeDatabaseAndStartServer() {
  try {
    // Synchronize all defined models with the database
    await sequelize.sync(); 
    console.log("✅ Database synchronized successfully");
    
    // Run data seeders
    console.log("🌱 Running data seeders...");
    try {
      const seederResults = await runSeeders();
      console.log(`✅ Seeders completed: ${seederResults.length} seeder(s) processed`);
    } catch (seederError) {
      console.error("⚠️ Error running seeders:", seederError);
      // Continue with server startup even if seeders fail
    }
    
    // Start the server
    startServer();
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
}

// Start the server with database initialization and seeders
initializeDatabaseAndStartServer();
