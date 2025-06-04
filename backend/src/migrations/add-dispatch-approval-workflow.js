/**
 * Migration to add approval workflow fields to dispatch table
 */
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

async function up() {
  const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: console.log
    }
  );

  try {
    const queryInterface = sequelize.getQueryInterface();

    console.log('Adding approval workflow fields to dispatch table...');

    // First create the ENUM type for approval status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_dispatches_approval_status AS ENUM (
          'pending', 
          'manager_approved', 
          'accounts_approved', 
          'rejected', 
          'disabled'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add approval status enum column
    await queryInterface.addColumn('dispatches', 'approval_status', {
      type: DataTypes.ENUM('pending', 'manager_approved', 'accounts_approved', 'rejected', 'disabled'),
      defaultValue: 'pending',
      allowNull: false
    });

    // Add manager approval fields
    await queryInterface.addColumn('dispatches', 'approved_by_manager', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('dispatches', 'manager_approved_at', {
      type: DataTypes.DATE,
      allowNull: true
    });

    // Add accounts approval fields
    await queryInterface.addColumn('dispatches', 'approved_by_accounts', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('dispatches', 'accounts_approved_at', {
      type: DataTypes.DATE,
      allowNull: true
    });

    // Add rejection fields
    await queryInterface.addColumn('dispatches', 'rejected_by', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('dispatches', 'rejected_at', {
      type: DataTypes.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('dispatches', 'rejection_reason', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    // Add disable fields
    await queryInterface.addColumn('dispatches', 'is_disabled', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('dispatches', 'disabled_by', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('dispatches', 'disabled_at', {
      type: DataTypes.DATE,
      allowNull: true
    });

    console.log('Approval workflow fields added successfully');

    await sequelize.close();
  } catch (error) {
    console.error('Migration failed:', error);
    await sequelize.close();
    throw error;
  }
}

module.exports = { up };

// Run the migration if this script is executed directly
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
