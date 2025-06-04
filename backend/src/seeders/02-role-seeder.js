/**
 * Role Seeder
 * 
 * This seeder ensures that all required roles exist in the system.
 * It will create missing roles but won't modify existing ones.
 */

const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// Define default system roles
const systemRoles = [
  {
    name: 'admin',
    guard_name: 'api',
    description: 'System administrator with full access',
    is_system_role: true
  },
  {
    name: 'manager',
    guard_name: 'api',
    description: 'Manager with access to most features',
    is_system_role: true
  },
  {
    name: 'dispatch',
    guard_name: 'api',
    description: 'Dispatch operator role',
    is_system_role: true
  },
  {
    name: 'sales',
    guard_name: 'api',
    description: 'Sales team member',
    is_system_role: true
  },
  {
    name: 'account',
    guard_name: 'api',
    description: 'Accounting team member',
    is_system_role: true
  },
  {
    name: 'carrier',
    guard_name: 'api',
    description: 'External carrier with limited access',
    is_system_role: true
  }
];

// Role permission assignments - define permissions for each role
const rolePermissions = {
  // Admin has all permissions (will be assigned separately)
    // Manager permissions
  'manager': [    // Feature permissions
    'users.view', 'users.create', 'users.edit', 'users.status',
    'carriers.view', 'carriers.create', 'carriers.edit',
    'carrier.approve.manager', 'carrier.reject', 'carrier.view.pending',
    'dispatch.view', 'dispatch.create', 'dispatch.edit',
    'dispatch.approve.manager', 'dispatch.reject', 'dispatch.view.pending',
    'invoices.view', 'invoices.create', 'invoices.edit',
    'role.view',
    
    // Route permissions
    'route.dashboard', 'route.messages', 'route.calendar',
    'route.carrier-profiles', 'route.add-carrier', 'route.followup-sheets',
    'route.active-dispatches', 'route.create-dispatch',
    'route.invoices', 'route.user-management',
    'route.email-settings'
  ],
    // Dispatch role permissions
  'dispatch': [
    // Feature permissions
    'carriers.view', // Can only view carriers in list, not details
    'dispatch.view', 'dispatch.create', 'dispatch.edit',
    'invoices.view', // Can view invoices but not edit
    
    // Route permissions
    'route.dashboard',
    'route.carrier-profiles', // Access to carrier list page only
    'route.active-dispatches', 'route.create-dispatch',
    'route.invoices'
  ],
  
  // Sales role permissions
  'sales': [
    // Feature permissions
    'carriers.view', 'carriers.create', 'carriers.edit',
    'dispatch.view', 'dispatch.create',
    
    // Route permissions
    'route.dashboard', 'route.messages',
    'route.carrier-profiles', 'route.add-carrier', 'route.followup-sheets',
    'route.active-dispatches', 'route.create-dispatch'
  ],
    // Account role permissions
  'account': [    // Feature permissions
    'invoices.view', 'invoices.create', 'invoices.edit',
    'carriers.view',
    'carrier.approve.accounts', 'carrier.reject', 'carrier.view.pending',
    'dispatch.view', 'dispatch.approve.accounts', 'dispatch.reject', 'dispatch.view.pending',
    
    // Route permissions
    'route.dashboard',
    'route.carrier-profiles',
    'route.active-dispatches',
    'route.invoices'
  ],
  
  // Carrier role permissions (very limited)
  'carrier': [
    // Feature permissions
    'dispatch.view',
    
    // Route permissions
    'route.dashboard',
    'route.active-dispatches'
  ]
};

// Function to ensure a role exists
async function ensureRole(role) {
  try {
    // Check if role already exists
    const existingRole = await sequelize.query(
      "SELECT * FROM roles WHERE name = :name",
      {
        replacements: { name: role.name },
        type: QueryTypes.SELECT
      }
    );
    
    if (existingRole.length === 0) {
      // Create the role
      await sequelize.query(`
        INSERT INTO roles (name, guard_name, description, is_system_role, created_at, updated_at)
        VALUES (:name, :guard_name, :description, :is_system_role, NOW(), NOW())
      `, {
        replacements: {
          name: role.name,
          guard_name: role.guard_name,
          description: role.description,
          is_system_role: role.is_system_role
        },
        type: QueryTypes.INSERT
      });
      
      console.log(`Created role: ${role.name}`);
      return { created: true, roleId: null }; 
    }
    
    return { created: false, roleId: existingRole[0].id }; 
  } catch (error) {
    console.error(`Failed to ensure role ${role.name}:`, error);
    throw error;
  }
}

// Function to assign permissions to a role
async function assignRolePermissions(roleName, permissions) {
  try {
    // Get role ID
    const role = await sequelize.query(
      "SELECT id FROM roles WHERE name = :name",
      {
        replacements: { name: roleName },
        type: QueryTypes.SELECT
      }
    );
    
    if (role.length === 0) {
      console.warn(`Role ${roleName} not found, skipping permission assignment`);
      return;
    }
    
    const roleId = role[0].id;
    
    // For each permission
    for (const permissionName of permissions) {
      // Get permission ID
      const permission = await sequelize.query(
        "SELECT id FROM permissions WHERE name = :name",
        {
          replacements: { name: permissionName },
          type: QueryTypes.SELECT
        }
      );
      
      if (permission.length === 0) {
        console.warn(`Permission ${permissionName} not found, skipping assignment to ${roleName}`);
        continue;
      }
      
      const permissionId = permission[0].id;
      
      // Check if role already has this permission
      const existing = await sequelize.query(
        "SELECT * FROM role_permissions WHERE role_id = :roleId AND permission_id = :permissionId",
        {
          replacements: { roleId, permissionId },
          type: QueryTypes.SELECT
        }
      );
      
      if (existing.length === 0) {
        // Create role permission association
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (:roleId, :permissionId, NOW(), NOW())
        `, {
          replacements: { roleId, permissionId },
          type: QueryTypes.INSERT
        });
        
        console.log(`Assigned permission ${permissionName} to role ${roleName}`);
      }
    }
  } catch (error) {
    console.error(`Failed to assign permissions to role ${roleName}:`, error);
    throw error;
  }
}

// Assign all permissions to admin role
async function assignAdminAllPermissions() {
  try {
    // Get admin role ID
    const adminRole = await sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin'",
      { type: QueryTypes.SELECT }
    );
    
    if (adminRole.length === 0) {
      console.warn('Admin role not found, skipping all permissions assignment');
      return;
    }
    
    const adminRoleId = adminRole[0].id;
    
    // Get all permissions
    const allPermissions = await sequelize.query(
      "SELECT id, name FROM permissions",
      { type: QueryTypes.SELECT }
    );
    
    // For each permission, ensure admin role has it
    for (const permission of allPermissions) {
      // Check if admin already has this permission
      const existing = await sequelize.query(
        "SELECT * FROM role_permissions WHERE role_id = :roleId AND permission_id = :permissionId",
        {
          replacements: { roleId: adminRoleId, permissionId: permission.id },
          type: QueryTypes.SELECT
        }
      );
      
      if (existing.length === 0) {
        // Create role permission association
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (:roleId, :permissionId, NOW(), NOW())
        `, {
          replacements: { roleId: adminRoleId, permissionId: permission.id },
          type: QueryTypes.INSERT
        });
        
        console.log(`Assigned permission ${permission.name} to admin role`);
      }
    }
    
    console.log('Admin role has been granted all permissions');
  } catch (error) {
    console.error('Failed to assign all permissions to admin role:', error);
    throw error;
  }
}

// Seeder name should be unique
const name = 'core-roles-seeder';

// Main seeder function
async function up() {
  try {
    console.log('Creating missing roles...');
    
    let created = 0;
    for (const role of systemRoles) {
      const result = await ensureRole(role);
      if (result.created) created++;
    }
    
    console.log(`Role seeder completed: ${created} new roles created, ${systemRoles.length - created} already existed`);
    
    // Assign permissions to roles
    console.log('Assigning permissions to roles...');
    
    // First, make sure admin has all permissions
    await assignAdminAllPermissions();
    
    // Assign specific permissions to other roles
    for (const [roleName, permissions] of Object.entries(rolePermissions)) {
      await assignRolePermissions(roleName, permissions);
    }
    
    console.log('Role permission assignments completed');
  } catch (error) {
    console.error('Role seeder failed:', error);
    throw error;
  }
}

// Function to check if the seeder should run
// For roles, we always check as configurations may change
async function shouldRun() {
  return true;
}

module.exports = {
  name,
  up,
  shouldRun
};
