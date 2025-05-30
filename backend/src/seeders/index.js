/**
 * Seeder Manager
 * 
 * This module manages the execution of all seeders in the application.
 * Seeders are used to populate the database with initial required data
 * such as permissions, default roles, and other system requirements.
 * 
 * Each seeder should implement:
 * - name: A unique name for the seeder
 * - up: Async function that performs the seeding
 * - shouldRun: Async function that determines if the seeder needs to run
 */

const path = require('path');
const fs = require('fs');
const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// Track executed seeders to avoid redundancy
let executedSeeders = new Set();
let seederHistory = [];

// Create or ensure seeder_history table exists
async function initSeedersTable() {
  try {
    // Check if the table exists
    const tableExists = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'seeder_history'
    `, { type: QueryTypes.SELECT });

    if (tableExists.length === 0) {
      // Create the table if it doesn't exist
      await sequelize.query(`
        CREATE TABLE seeder_history (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('Created seeder_history table');
    }

    // Load previously executed seeders
    const history = await sequelize.query('SELECT name FROM seeder_history', { type: QueryTypes.SELECT });
    history.forEach(record => {
      executedSeeders.add(record.name);
    });
    
    console.log(`Loaded ${executedSeeders.size} previously executed seeders`);
  } catch (error) {
    console.error('Failed to initialize seeder history:', error);
    throw error;
  }
}

// Record that a seeder was executed
async function recordSeeder(name) {
  try {
    await sequelize.query(`
      INSERT INTO seeder_history (name) VALUES (:name)
      ON CONFLICT (name) DO NOTHING
    `, {
      replacements: { name },
      type: QueryTypes.INSERT
    });
    executedSeeders.add(name);
    seederHistory.push({ name, success: true, timestamp: new Date() });
  } catch (error) {
    seederHistory.push({ name, success: false, error: error.message, timestamp: new Date() });
    console.error(`Failed to record seeder execution: ${name}`, error);
  }
}

// Load and run all seeders from the seeders directory
async function runSeeders() {
  try {
    await initSeedersTable();
    
    // Get all seeder files
    const seedersDir = path.join(__dirname);
    const files = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('-seeder.js') && file !== 'index.js');
    
    console.log(`Found ${files.length} seeders`);
    
    // Run seeders in sequence
    for (const file of files) {
      const seederPath = path.join(seedersDir, file);
      const seeder = require(seederPath);
      
      // Skip if no name or already executed
      if (!seeder.name) {
        console.warn(`Skipping seeder without name: ${file}`);
        continue;
      }
      
      if (executedSeeders.has(seeder.name)) {
        console.log(`Seeder already executed: ${seeder.name}`);
        continue;
      }
      
      // Check if seeder should run
      if (seeder.shouldRun && !(await seeder.shouldRun())) {
        console.log(`Seeder not needed: ${seeder.name}`);
        continue;
      }
      
      // Execute the seeder
      console.log(`Running seeder: ${seeder.name}`);
      await seeder.up();
      await recordSeeder(seeder.name);
      console.log(`Completed seeder: ${seeder.name}`);
    }
    
    console.log('All seeders completed successfully');
    return seederHistory;
  } catch (error) {
    console.error('Seeder execution failed:', error);
    throw error;
  }
}

module.exports = {
  runSeeders
};
