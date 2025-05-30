# Haul Connect - Database Seeder System

This document explains the database seeder system implemented for Haul Connect, which automatically manages required data such as permissions, roles, and more.

## Overview

The seeder system ensures that all required system data is properly initialized when the application starts. It's designed to:

- Create missing permissions and roles
- Manage role-permission assignments
- Convert legacy roles to the new permission-based system
- Track which seeders have been executed to avoid redundancy

## How It Works

1. **Seeder Manager**: The main `runSeeders()` function located in `src/seeders/index.js` orchestrates the seeder execution.
2. **Tracking System**: A `seeder_history` table keeps track of which seeders have already been executed, preventing duplicate runs.
3. **Individualized Seeders**: Each seeder is encapsulated in its own file and implements these key functions:
   - `name`: Unique identifier for the seeder
   - `up()`: Performs the actual seeding operation
   - `shouldRun()`: Determines if the seeder needs to run at this time

## Available Seeders

The system includes the following seeders:

1. **01-permission-seeder.js**:
   - Creates core system permissions in the database
   - Ensures all required permissions exist for various modules (Users, Settings, Carriers, etc.)

2. **02-role-seeder.js**:
   - Creates default system roles (admin, manager, dispatch, sales, account, carrier)
   - Sets up role-permission relationships

3. **03-legacy-role-mapping-seeder.js**:
   - Maps legacy roles/categories to the new role-based permission system
   - Updates existing users to have appropriate `role_id` values
   - Ensures backward compatibility

## Running the Seeders

The seeders run automatically when the server starts up. If you need to run them manually:

```bash
# Run all seeders
npm run seed

# Run the permission migration specifically
npm run migrate:permissions
```

## Extending the Seeder System

To add a new seeder:

1. Create a new file in `src/seeders` with a name like `XX-your-seeder-name.js`
2. Implement the required interface (name, up, shouldRun)
3. Export the functions

Example template:

```javascript
// Template for new seeder
const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// Seeder name - must be unique
const name = 'your-unique-seeder-name';

// Main seeder function
async function up() {
  try {
    // Your seeding logic here
    console.log('Your seeder completed');
  } catch (error) {
    console.error('Your seeder failed:', error);
    throw error;
  }
}

// Function to determine if seeder should run
async function shouldRun() {
  // Logic to determine if seeder needs to run
  return true; // or false
}

module.exports = {
  name,
  up,
  shouldRun
};
```

## Best Practices

1. Ensure each seeder checks for existing data before creating new records
2. Use proper error handling in seeders
3. Keep seeders idempotent - they should be safe to run multiple times
4. Add new permissions in the permission seeder when adding new features
