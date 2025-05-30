const express = require('express');
const router = express.Router();
const { role: Role, permission: Permission, role_permission: RolePermission } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Apply authentication to all role routes
router.use(authenticateToken);

// Get all roles
router.get('/', requirePermission('role.view'), async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] } // Don't include junction table
        }
      ]
    });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get role by ID
router.get('/:id', requirePermission('role.view'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] } // Don't include junction table
        }
      ]
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// Create a new role
router.post('/', requirePermission('role.create'), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Check if role with that name already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ error: 'Role with that name already exists' });
    }
    
    // Create the new role
    const role = await Role.create({
      name,
      guard_name: 'web',
      description,
      is_system_role: false
    });
    
    // If permissions provided, assign them to the role
    if (permissions && permissions.length > 0) {
      const permissionRecords = await Permission.findAll({
        where: {
          id: permissions
        }
      });
      
      if (permissionRecords.length > 0) {
        await role.setPermissions(permissionRecords);
      }
    }
    
    // Return the role with its permissions
    const roleWithPermissions = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });
    
    res.status(201).json(roleWithPermissions);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update a role
router.put('/:id', requirePermission('role.edit'), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Prevent updating system roles
    if (role.is_system_role && name !== role.name) {
      return res.status(403).json({ error: 'Cannot rename system roles' });
    }
    
    // Update role properties
    await role.update({
      name,
      description
    });
    
    // If permissions provided, update role permissions
    if (permissions) {
      const permissionRecords = await Permission.findAll({
        where: {
          id: permissions
        }
      });
      
      await role.setPermissions(permissionRecords);
    }
    
    // Return the updated role with its permissions
    const updatedRole = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });
    
    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete a role
router.delete('/:id', requirePermission('role.delete'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Prevent deleting system roles
    if (role.is_system_role) {
      return res.status(403).json({ error: 'Cannot delete system roles' });
    }
    
    // Check if role is assigned to any users
    const userCount = await role.countUsers();
    if (userCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to users',
        userCount
      });
    }
    
    await role.destroy();
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// Get role permissions
router.get('/:id/permissions', requirePermission('role.view'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const permissions = await role.getPermissions();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
});

// Update role permissions
router.put('/:id/permissions', requirePermission('permission.assign'), async (req, res) => {
  try {
    const { permissions } = req.body;
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Update permissions
    if (Array.isArray(permissions)) {
      await RolePermission.destroy({ where: { role_id: role.id } });
      
      if (permissions.length > 0) {
        const permissionRecords = await Permission.findAll({
          where: {
            id: permissions
          }
        });
        
        await role.addPermissions(permissionRecords);
      }
    }
    
    // Return the updated role with permissions
    const updatedRole = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });
    
    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role permissions:', error);
    res.status(500).json({ error: 'Failed to update role permissions' });
  }
});

module.exports = router;
