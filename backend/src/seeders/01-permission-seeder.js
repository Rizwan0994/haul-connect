/**
 * Permission Seeder
 * 
 * This seeder ensures that all required permissions exist in the system.
 * It will create missing permissions but won't modify existing ones.
 */

const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// Define all system permissions
const systemPermissions = [
  // Users module permissions
  {
    name: 'users.view',
    type: 'feature',
    module: 'Users',
    resource: 'users',
    action: 'view',
    description: 'View users in the system'
  },
  {
    name: 'users.create',
    type: 'feature',
    module: 'Users',
    resource: 'users',
    action: 'create',
    description: 'Create new users'
  },
  {
    name: 'users.edit',
    type: 'feature',
    module: 'Users',
    resource: 'users',
    action: 'edit',
    description: 'Edit existing users'
  },
  {
    name: 'users.delete',
    type: 'feature',
    module: 'Users',
    resource: 'users',
    action: 'delete',
    description: 'Delete users'
  },
  {
    name: 'users.status',
    type: 'feature',
    module: 'Users',
    resource: 'users',
    action: 'status',
    description: 'Change user status (activate/deactivate)'
  },
  
  // Role management permissions
  {
    name: 'role.view',
    type: 'feature',
    module: 'Settings',
    resource: 'roles',
    action: 'view',
    description: 'View roles in the system'
  },
  {
    name: 'role.edit',
    type: 'feature',
    module: 'Settings',
    resource: 'roles',
    action: 'edit',
    description: 'Create and modify roles'
  },
  {
    name: 'permission.assign',
    type: 'feature',
    module: 'Settings',
    resource: 'permissions',
    action: 'assign',
    description: 'Assign permissions to roles'
  },
  {
    name: 'permissions.manage',
    type: 'feature',
    module: 'Settings',
    resource: 'permissions',
    action: 'manage',
    description: 'Access and manage the permissions system'
  },
  
  // Carrier module permissions
  {
    name: 'carriers.view',
    type: 'feature',
    module: 'Carriers',
    resource: 'carriers',
    action: 'view',
    description: 'View carrier information'
  },
  {
    name: 'carriers.create',
    type: 'feature',
    module: 'Carriers',
    resource: 'carriers',
    action: 'create',
    description: 'Create new carriers'
  },
  {
    name: 'carriers.edit',
    type: 'feature',
    module: 'Carriers',
    resource: 'carriers',
    action: 'edit',
    description: 'Edit carrier information'
  },
  {
    name: 'carriers.delete',
    type: 'feature',
    module: 'Carriers',
    resource: 'carriers',
    action: 'delete',
    description: 'Delete carriers'
  },
  
  // Dispatch module permissions
  {
    name: 'dispatch.view',
    type: 'feature',
    module: 'Dispatch',
    resource: 'dispatches',
    action: 'view',
    description: 'View dispatches'
  },
  {
    name: 'dispatch.create',
    type: 'feature',
    module: 'Dispatch',
    resource: 'dispatches',
    action: 'create',
    description: 'Create new dispatches'
  },
  {
    name: 'dispatch.edit',
    type: 'feature',
    module: 'Dispatch',
    resource: 'dispatches',
    action: 'edit',
    description: 'Edit dispatches'
  },
  {
    name: 'dispatch.delete',
    type: 'feature',
    module: 'Dispatch',
    resource: 'dispatches',
    action: 'delete',
    description: 'Delete dispatches'
  },
  
  // Invoice module permissions
  {
    name: 'invoices.view',
    type: 'feature',
    module: 'Invoices',
    resource: 'invoices',
    action: 'view',
    description: 'View invoices'
  },
  {
    name: 'invoices.create',
    type: 'feature',
    module: 'Invoices',
    resource: 'invoices',
    action: 'create',
    description: 'Create invoices'
  },
  {
    name: 'invoices.edit',
    type: 'feature',
    module: 'Invoices',
    resource: 'invoices',
    action: 'edit',
    description: 'Edit invoices'
  },
  
  // Settings module permissions
  {
    name: 'settings.smtp',
    type: 'feature',
    module: 'Settings',
    resource: 'smtp',
    action: 'manage',
    description: 'Configure SMTP settings'
  }
];

// Check if permission exists and create if missing
async function ensurePermission(permission) {
  try {
    // Check if permission already exists
    const existingPermission = await sequelize.query(
      "SELECT * FROM permissions WHERE name = :name",
      {
        replacements: { name: permission.name },
        type: QueryTypes.SELECT
      }
    );
    
    if (existingPermission.length === 0) {
      // Create the permission
      await sequelize.query(`
        INSERT INTO permissions (name, type, module, resource, action, description, created_at, updated_at)
        VALUES (:name, :type, :module, :resource, :action, :description, NOW(), NOW())
      `, {
        replacements: {
          name: permission.name,
          type: permission.type,
          module: permission.module,
          resource: permission.resource,
          action: permission.action,
          description: permission.description
        },
        type: QueryTypes.INSERT
      });
      
      console.log(`Created permission: ${permission.name}`);
      return true; // Permission was created
    }
    
    return false; // Permission already existed
  } catch (error) {
    console.error(`Failed to ensure permission ${permission.name}:`, error);
    throw error;
  }
}

// Seeder name should be unique
const name = 'core-permissions-seeder';

// Main seeder function
async function up() {
  try {
    console.log('Creating missing permissions...');
    
    let created = 0;
    for (const permission of systemPermissions) {
      const wasCreated = await ensurePermission(permission);
      if (wasCreated) created++;
    }
    
    console.log(`Permission seeder completed: ${created} new permissions created, ${systemPermissions.length - created} already existed`);
  } catch (error) {
    console.error('Permission seeder failed:', error);
    throw error;
  }
}

// Function to check if the seeder should run
// For permissions, we always check as new ones might be added over time
async function shouldRun() {
  return true;
}

module.exports = {
  name,
  up,
  shouldRun
};
