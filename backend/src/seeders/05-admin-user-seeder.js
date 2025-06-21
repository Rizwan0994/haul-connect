/**
 * Admin User Seeder
 * 
 * This seeder creates a default super admin user for the system.
 * It ensures that there's always at least one admin user available.
 */

const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Default admin user configuration
const defaultAdminUser = {
  email: 'admin@gmail.com',
  password: 'admin123', // This should be changed after first login
  first_name: 'Super',
  last_name: 'Admin',
  basic_salary: 0,
  is_active: true
};

// Function to create the admin user
async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await sequelize.query(
      "SELECT * FROM users WHERE email = :email",
      {
        replacements: { email: defaultAdminUser.email },
        type: QueryTypes.SELECT
      }
    );

    if (existingUser.length > 0) {
      console.log(`Admin user with email ${defaultAdminUser.email} already exists`);
      return false;
    }    // Get the Super Admin role ID
    const superAdminRole = await sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin'",
      { type: QueryTypes.SELECT }
    );

    if (superAdminRole.length === 0) {
      console.error('Super Admin role not found. Make sure role seeder has run first.');
      throw new Error('Super Admin role not found');
    }

    const roleId = superAdminRole[0].id;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultAdminUser.password, saltRounds);

    // Create the admin user
    await sequelize.query(`
      INSERT INTO users (
        email, 
        password, 
        role_id, 
        first_name, 
        last_name, 
        basic_salary, 
        is_active,
        created_at, 
        updated_at
      )
      VALUES (
        :email, 
        :password, 
        :role_id, 
        :first_name, 
        :last_name, 
        :basic_salary, 
        :is_active,
        NOW(), 
        NOW()
      )
    `, {
      replacements: {
        email: defaultAdminUser.email,
        password: hashedPassword,
        role_id: roleId,
        first_name: defaultAdminUser.first_name,
        last_name: defaultAdminUser.last_name,
        basic_salary: defaultAdminUser.basic_salary,
        is_active: defaultAdminUser.is_active
      },
      type: QueryTypes.INSERT
    });

    console.log(`Created admin user: ${defaultAdminUser.email}`);
    console.log(`Default password: ${defaultAdminUser.password} (Please change this after first login)`);
    
    return true;
  } catch (error) {
    console.error('Failed to create admin user:', error);
    throw error;
  }
}

// Seeder name should be unique
const name = 'admin-user-seeder';

// Main seeder function
async function up() {
  try {
    console.log('Creating default admin user...');
    
    const created = await createAdminUser();
    
    if (created) {
      console.log('Admin user seeder completed: Admin user created successfully');
    } else {
      console.log('Admin user seeder completed: Admin user already exists');
    }
  } catch (error) {
    console.error('Admin user seeder failed:', error);
    throw error;
  }
}

// Function to check if the seeder should run
// We should run if there's no user with admin@gmail.com email yet
async function shouldRun() {
  try {
    // Check if admin user with specific email exists
    const adminUser = await sequelize.query(
      "SELECT COUNT(*) as count FROM users WHERE email = :email",
      {
        replacements: { email: defaultAdminUser.email },
        type: QueryTypes.SELECT
      }
    );    // Return true if user doesn't exist (count is 0), false if user exists
    return parseInt(adminUser[0].count) === 0;
  } catch (error) {
    console.error('Failed to check if admin user seeder should run:', error);
    return false;
  }
}

module.exports = {
  name,
  up,
  shouldRun
};
