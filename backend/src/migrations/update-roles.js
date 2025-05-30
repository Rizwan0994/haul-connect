const { Sequelize } = require('sequelize');
const db = require('../models');

const runMigration = async () => {
  console.log('Starting role update migration...');
  const sequelize = db.sequelize;

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Step 1: Drop the default value for the role column
    await sequelize.query(`
      ALTER TABLE users
      ALTER COLUMN role DROP DEFAULT;
    `);
    console.log('Dropped default value for role column.');

    // Step 2: Alter the column type to use the enum
    await sequelize.query(`
      ALTER TABLE users
      ALTER COLUMN role TYPE user_role_enum USING role::text::user_role_enum;
    `);
    console.log('Changed role column type to user_role_enum.');

    // Step 3: Set the default value again
    await sequelize.query(`
      ALTER TABLE users
      ALTER COLUMN role SET DEFAULT 'Dispatch';
    `);
    console.log('Set new default value for role column.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
};

runMigration();
