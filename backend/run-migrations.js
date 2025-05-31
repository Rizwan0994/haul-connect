'use strict';

/**
 * Run migrations
 */
const { sequelize } = require('./src/models');
const addDiversePermissionTypes = require('./src/migrations/add-diverse-permission-types');

const runMigrations = async () => {
  try {
    console.log('🔄 Running migrations...');
    
    // Run the migration
    await addDiversePermissionTypes.up();
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migrations
runMigrations();
