/**
 * Migration script to add the permissions.manage permission
 * This ensures that users can access the permissions management page
 */
const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

async function up() {
  try {
    // Check if permission already exists
    const existingPermission = await sequelize.query(
      "SELECT * FROM permissions WHERE name = 'permissions.manage'",
      { type: QueryTypes.SELECT }
    );

    if (existingPermission.length === 0) {
      // Create the permissions.manage permission if it doesn't exist
      await sequelize.query(`
        INSERT INTO permissions (name, type, module, resource, action, description, created_at, updated_at)
        VALUES (
          'permissions.manage',
          'feature',
          'Settings',
          'permissions',
          'manage',
          'Access and manage the permissions system',
          NOW(),
          NOW()
        )
      `);
      
      console.log('Created permissions.manage permission');
      
      // Get the ID of the permission we just created
      const newPermission = await sequelize.query(
        "SELECT id FROM permissions WHERE name = 'permissions.manage'",
        { type: QueryTypes.SELECT }
      );
      
      if (newPermission.length > 0) {
        const permissionId = newPermission[0].id;
        
        // Get all admin role IDs
        const adminRoles = await sequelize.query(
          "SELECT id FROM roles WHERE name IN ('admin', 'Admin', 'Super Admin')",
          { type: QueryTypes.SELECT }
        );
        
        // Assign this permission to all admin roles
        for (const role of adminRoles) {
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (${role.id}, ${permissionId}, NOW(), NOW())
          `);
          console.log(`Assigned permissions.manage to role ID: ${role.id}`);
        }
      }
    } else {
      console.log('permissions.manage permission already exists');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
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
