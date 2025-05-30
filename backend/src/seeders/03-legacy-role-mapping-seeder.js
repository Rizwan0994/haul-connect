/**
 * Legacy Role Mapping Seeder
 * 
 * This seeder ensures that legacy roles (Super Admin, Admin, etc.) are properly mapped
 * to the new permission system. It also ensures that all users have appropriate role_id values.
 */

const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// Define legacy role mappings
const legacyRoleMappings = [
  {
    legacyRole: 'Super Admin',
    newRoleName: 'admin',
    description: 'Super admin with full system access'
  },
  {
    legacyRole: 'Admin',
    newRoleName: 'admin',
    description: 'Admin with full system access'
  },
  {
    legacyRole: 'Manager',
    newRoleName: 'manager',
    description: 'Manager role'
  },
  {
    legacyRole: 'Dispatch',
    newRoleName: 'dispatch',
    description: 'Dispatch role'
  },
  {
    legacyRole: 'Sales',
    newRoleName: 'sales',
    description: 'Sales role'
  },
  {
    legacyRole: 'Account',
    newRoleName: 'account',
    description: 'Accounting role'
  }
];

// Ensure Super Admin role exists
async function ensureSuperAdminRole() {
  try {
    // Check if Super Admin role already exists
    const existingRole = await sequelize.query(
      "SELECT * FROM roles WHERE name = 'Super Admin'",
      { type: QueryTypes.SELECT }
    );
    
    if (existingRole.length === 0) {
      // Create the Super Admin role
      await sequelize.query(`
        INSERT INTO roles (name, guard_name, description, is_system_role, created_at, updated_at)
        VALUES ('Super Admin', 'api', 'Super administrator with full access', TRUE, NOW(), NOW())
      `);
      
      console.log('Created Super Admin role');
      
      // Get the new role ID
      const superAdminRole = await sequelize.query(
        "SELECT id FROM roles WHERE name = 'Super Admin'",
        { type: QueryTypes.SELECT }
      );
      
      if (superAdminRole.length > 0) {
        const roleId = superAdminRole[0].id;
        
        // Get all permissions
        const allPermissions = await sequelize.query(
          "SELECT id FROM permissions",
          { type: QueryTypes.SELECT }
        );
        
        // Assign all permissions to Super Admin role
        for (const permission of allPermissions) {
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (:roleId, :permissionId, NOW(), NOW())
          `, {
            replacements: { roleId, permissionId: permission.id },
            type: QueryTypes.INSERT
          });
        }
        
        console.log(`Assigned all permissions to Super Admin role`);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to ensure Super Admin role:', error);
    throw error;
  }
}

// Update users with missing role_id based on their legacy role/category
async function updateUserRoleIds() {
  try {
    // First, get all roles
    const roles = await sequelize.query(
      "SELECT id, name FROM roles",
      { type: QueryTypes.SELECT }
    );
    
    const roleMap = new Map();
    roles.forEach(role => {
      roleMap.set(role.name.toLowerCase(), role.id);
    });
    
    // Get users with missing role_id but have category or role
    const usersToUpdate = await sequelize.query(`
      SELECT id, category, role 
      FROM users 
      WHERE role_id IS NULL AND (category IS NOT NULL OR role IS NOT NULL)
    `, { type: QueryTypes.SELECT });
    
    console.log(`Found ${usersToUpdate.length} users with missing role_id`);
    
    let updatedCount = 0;
    
    // Update each user with appropriate role_id
    for (const user of usersToUpdate) {
      // Try to match by category first, then role
      const category = (user.category || '').toLowerCase();
      const role = (user.role || '').toLowerCase();
      
      // Find matching role ID
      let roleId = null;
      
      // Direct mapping by category/role name
      if (roleMap.has(category)) {
        roleId = roleMap.get(category);
      } else if (roleMap.has(role)) {
        roleId = roleMap.get(role);
      } else {
        // Try legacy mapping
        for (const mapping of legacyRoleMappings) {
          if (mapping.legacyRole.toLowerCase() === category || mapping.legacyRole.toLowerCase() === role) {
            if (roleMap.has(mapping.newRoleName.toLowerCase())) {
              roleId = roleMap.get(mapping.newRoleName.toLowerCase());
              break;
            }
          }
        }
      }
      
      if (roleId) {
        // Update user's role_id
        await sequelize.query(`
          UPDATE users 
          SET role_id = :roleId, updated_at = NOW()
          WHERE id = :userId
        `, {
          replacements: { roleId, userId: user.id },
          type: QueryTypes.UPDATE
        });
        
        updatedCount++;
      }
    }
    
    console.log(`Updated role_id for ${updatedCount} users`);
    
    return updatedCount;
  } catch (error) {
    console.error('Failed to update user role IDs:', error);
    throw error;
  }
}

// Seeder name should be unique
const name = 'legacy-role-mapping-seeder';

// Main seeder function
async function up() {
  try {
    // Ensure Super Admin role exists
    const superAdminCreated = await ensureSuperAdminRole();
    if (superAdminCreated) {
      console.log('Super Admin role has been created and granted all permissions');
    } else {
      console.log('Super Admin role already exists');
    }
    
    // Update users with legacy roles
    const updatedUsers = await updateUserRoleIds();
    console.log(`Legacy role mapping completed: ${updatedUsers} users updated`);
  } catch (error) {
    console.error('Legacy role mapping seeder failed:', error);
    throw error;
  }
}

// Function to check if the seeder should run
// For legacy mapping, we should check for users without role_id
async function shouldRun() {
  try {
    // Check if there are any users without role_id
    const usersWithoutRoleId = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role_id IS NULL AND (category IS NOT NULL OR role IS NOT NULL)
    `, { type: QueryTypes.SELECT });
    
    return usersWithoutRoleId[0].count > 0;
  } catch (error) {
    console.error('Failed to check if legacy role mapping seeder should run:', error);
    return false;
  }
}

module.exports = {
  name,
  up,
  shouldRun
};
