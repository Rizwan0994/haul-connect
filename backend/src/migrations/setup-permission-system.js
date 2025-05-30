/**
 * Migration to set up the role-based permission system
 */
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

async function runMigration() {
  console.log('Starting permission system migration...');
  
  // Create a new Sequelize instance
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
    }
  );

  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    const queryInterface = sequelize.getQueryInterface();

    // Step 1: Create Roles Table
    console.log('Creating roles table...');
    await queryInterface.createTable('roles', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      guard_name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "web"
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_system_role: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Step 2: Create Permissions Table
    console.log('Creating permissions table...');
    await queryInterface.createTable('permissions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      module: {
        type: DataTypes.STRING,
        allowNull: false
      },
      resource: {
        type: DataTypes.STRING,
        allowNull: false
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Step 3: Create Role_Permissions Junction Table
    console.log('Creating role_permissions table...');
    await queryInterface.createTable('role_permissions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to role_id and permission_id pair
    await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], {
      unique: true,
      name: 'role_permission_unique'
    });

    // Step 4: Modify Users Table to add role_id
    console.log('Modifying users table to add role_id...');
    await queryInterface.addColumn('users', 'role_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // Step 5: Create Initial Roles based on existing roles
    console.log('Creating initial roles...');
    const systemRoles = [
      { name: 'Admin', guard_name: 'web', description: 'Administrator with full access', is_system_role: true },
      { name: 'Super Admin', guard_name: 'web', description: 'Super administrator with all permissions', is_system_role: true },
      { name: 'Dispatch', guard_name: 'web', description: 'Dispatch department user', is_system_role: true },
      { name: 'Sales', guard_name: 'web', description: 'Sales department user', is_system_role: true },
      { name: 'Account', guard_name: 'web', description: 'Accounting department user', is_system_role: true },
      { name: 'Manager', guard_name: 'web', description: 'Manager with elevated permissions', is_system_role: true },
    ];

    const roles = await sequelize.models.role?.bulkCreate(systemRoles) || 
      await sequelize.query('INSERT INTO roles (name, guard_name, description, is_system_role, created_at, updated_at) VALUES ' + 
        systemRoles.map(role => 
          `('${role.name}', '${role.guard_name}', '${role.description}', ${role.is_system_role}, NOW(), NOW())`
        ).join(','));
    
    console.log('Roles created:', roles);

    // Step 6: Create base permissions
    console.log('Creating base permissions...');
    const basePermissions = [
      // User module permissions
      { name: 'user.view', type: 'route', module: 'user', resource: 'user_list', action: 'view', description: 'View user list' },
      { name: 'user.create', type: 'route', module: 'user', resource: 'user_create', action: 'create', description: 'Create users' },
      { name: 'user.edit', type: 'route', module: 'user', resource: 'user_edit', action: 'update', description: 'Edit users' },
      { name: 'user.delete', type: 'route', module: 'user', resource: 'user_delete', action: 'delete', description: 'Delete users' },
      
      // Carrier module permissions
      { name: 'carrier.view', type: 'route', module: 'carrier', resource: 'carrier_list', action: 'view', description: 'View carrier list' },
      { name: 'carrier.create', type: 'route', module: 'carrier', resource: 'carrier_create', action: 'create', description: 'Create carriers' },
      { name: 'carrier.edit', type: 'route', module: 'carrier', resource: 'carrier_edit', action: 'update', description: 'Edit carriers' },
      { name: 'carrier.delete', type: 'route', module: 'carrier', resource: 'carrier_delete', action: 'delete', description: 'Delete carriers' },
      
      // Dispatch module permissions
      { name: 'dispatch.view', type: 'route', module: 'dispatch', resource: 'dispatch_list', action: 'view', description: 'View dispatch list' },
      { name: 'dispatch.create', type: 'route', module: 'dispatch', resource: 'dispatch_create', action: 'create', description: 'Create dispatches' },
      { name: 'dispatch.edit', type: 'route', module: 'dispatch', resource: 'dispatch_edit', action: 'update', description: 'Edit dispatches' },
      { name: 'dispatch.delete', type: 'route', module: 'dispatch', resource: 'dispatch_delete', action: 'delete', description: 'Delete dispatches' },
      
      // Invoice module permissions
      { name: 'invoice.view', type: 'route', module: 'invoice', resource: 'invoice_list', action: 'view', description: 'View invoice list' },
      { name: 'invoice.create', type: 'route', module: 'invoice', resource: 'invoice_create', action: 'create', description: 'Create invoices' },
      { name: 'invoice.edit', type: 'route', module: 'invoice', resource: 'invoice_edit', action: 'update', description: 'Edit invoices' },
      
      // Role management permissions
      { name: 'role.view', type: 'route', module: 'role', resource: 'role_list', action: 'view', description: 'View roles' },
      { name: 'role.create', type: 'route', module: 'role', resource: 'role_create', action: 'create', description: 'Create roles' },
      { name: 'role.edit', type: 'route', module: 'role', resource: 'role_edit', action: 'update', description: 'Edit roles' },
      { name: 'role.delete', type: 'route', module: 'role', resource: 'role_delete', action: 'delete', description: 'Delete roles' },
      
      // Permission management
      { name: 'permission.assign', type: 'feature', module: 'permission', resource: 'permission_assign', action: 'update', description: 'Assign permissions to roles' },
      
      // Column-level permissions (examples)
      { name: 'user.view.salary', type: 'column', module: 'user', resource: 'basic_salary', action: 'view', description: 'View user salary information' },
      { name: 'carrier.view.financial', type: 'column', module: 'carrier', resource: 'financial_info', action: 'view', description: 'View carrier financial information' },
      { name: 'dispatch.view.financial', type: 'column', module: 'dispatch', resource: 'financial_info', action: 'view', description: 'View dispatch financial information' },
    ];

    const permissions = await sequelize.models.permission?.bulkCreate(basePermissions) ||
      await sequelize.query('INSERT INTO permissions (name, type, module, resource, action, description, created_at, updated_at) VALUES ' + 
        basePermissions.map(perm => 
          `('${perm.name}', '${perm.type}', '${perm.module}', '${perm.resource}', '${perm.action}', '${perm.description}', NOW(), NOW())`
        ).join(','));
    
    console.log('Base permissions created');

    // Step 7: Assign default permissions to roles
    console.log('Assigning default permissions to roles...');
    
    // Get role IDs
    const roleIds = {};
    const roleRows = await sequelize.query('SELECT id, name FROM roles', { type: Sequelize.QueryTypes.SELECT });
    roleRows.forEach(role => {
      roleIds[role.name] = role.id;
    });
    
    // Get permission IDs
    const permissionIds = {};
    const permissionRows = await sequelize.query('SELECT id, name FROM permissions', { type: Sequelize.QueryTypes.SELECT });
    permissionRows.forEach(perm => {
      permissionIds[perm.name] = perm.id;
    });
    
    // Define role-permission mappings
    const rolePermissions = [
      // Super Admin - gets all permissions
      ...permissionRows.map(perm => ({ role_id: roleIds['Super Admin'], permission_id: perm.id })),
      
      // Admin - gets most permissions except some sensitive operations
      ...permissionRows.filter(perm => !perm.name.includes('delete')).map(perm => ({ 
        role_id: roleIds['Admin'], permission_id: perm.id 
      })),
      
      // Manager - gets view permissions plus team management
      ...permissionRows.filter(perm => 
        perm.name.includes('.view') || 
        perm.name.includes('user.') || 
        perm.name.includes('carrier.')
      ).map(perm => ({ 
        role_id: roleIds['Manager'], permission_id: perm.id 
      })),
      
      // Dispatch - relevant dispatch permissions
      ...permissionRows.filter(perm => 
        perm.name.includes('dispatch.') || 
        perm.name === 'carrier.view'
      ).map(perm => ({ 
        role_id: roleIds['Dispatch'], permission_id: perm.id 
      })),
      
      // Sales - relevant sales permissions
      ...permissionRows.filter(perm => 
        perm.name.includes('carrier.') || 
        perm.name === 'dispatch.view'
      ).map(perm => ({ 
        role_id: roleIds['Sales'], permission_id: perm.id 
      })),
      
      // Account - relevant accounting permissions
      ...permissionRows.filter(perm => 
        perm.name.includes('invoice.') || 
        perm.name === 'dispatch.view' ||
        perm.name === 'carrier.view'
      ).map(perm => ({ 
        role_id: roleIds['Account'], permission_id: perm.id 
      })),
    ];
    
    // Insert role-permission relationships
    if (rolePermissions.length > 0) {
      await sequelize.models.role_permission?.bulkCreate(rolePermissions) || 
        await sequelize.query('INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES ' + 
          rolePermissions.map(rp => 
            `(${rp.role_id}, ${rp.permission_id}, NOW(), NOW())`
          ).join(','));
    }
    
    console.log('Permissions assigned to roles');

    // Step 8: Update existing users to assign role_id based on their current role/category
    console.log('Updating existing users to assign role_id...');
    
    // Get users and their current roles/categories
    const users = await sequelize.query('SELECT id, role, category FROM users', { type: Sequelize.QueryTypes.SELECT });
    
    // Update each user to assign the appropriate role_id
    for (const user of users) {
      let roleName = user.category || user.role;
      // Make sure the role name matches one of our new system roles
      if (!roleIds[roleName]) {
        // Default mapping for legacy roles
        if (roleName.includes('admin')) roleName = 'Admin';
        else if (roleName.includes('super')) roleName = 'Super Admin';
        else if (roleName.includes('dispatch')) roleName = 'Dispatch';
        else if (roleName.includes('sales')) roleName = 'Sales';
        else if (roleName.includes('account')) roleName = 'Account';
        else if (roleName.includes('manager')) roleName = 'Manager';
        else roleName = 'Dispatch'; // Default fallback
      }
      
      await sequelize.query(`UPDATE users SET role_id = ${roleIds[roleName]} WHERE id = ${user.id}`);
    }
    
    console.log('User role_id values updated');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

runMigration()
  .then(() => {
    console.log('Permission system setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Permission system setup failed:', error);
    process.exit(1);
  });
