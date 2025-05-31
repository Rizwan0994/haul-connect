'use strict';

const { role: Role, permission: Permission, role_permission: RolePermission } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseUtils');

const roleController = {
  // Get all roles
  getAllRoles: async (req, res) => {
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
      res.json(successResponse('Roles retrieved successfully', roles));
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json(errorResponse('Failed to fetch roles', error.message));
    }
  },

  // Get role by ID
  getRoleById: async (req, res) => {
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
        return res.status(404).json(errorResponse('Role not found'));
      }
      
      res.json(successResponse('Role retrieved successfully', role));
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json(errorResponse('Failed to fetch role', error.message));
    }
  },

  // Create a new role
  createRole: async (req, res) => {
    try {
      const { name, description, permissions } = req.body;
      
      // Check if role with that name already exists
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        return res.status(400).json(errorResponse('Role with that name already exists'));
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
      
      res.status(201).json(successResponse('Role created successfully', roleWithPermissions));
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json(errorResponse('Failed to create role', error.message));
    }
  },

  // Update a role
  updateRole: async (req, res) => {
    try {
      const { name, description, permissions } = req.body;
      
      const role = await Role.findByPk(req.params.id);
      if (!role) {
        return res.status(404).json(errorResponse('Role not found'));
      }
      
      // Prevent updating system roles
      if (role.is_system_role && name !== role.name) {
        return res.status(403).json(errorResponse('Cannot rename system roles'));
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
      
      res.json(successResponse('Role updated successfully', updatedRole));
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json(errorResponse('Failed to update role', error.message));
    }
  },

  // Delete a role
  deleteRole: async (req, res) => {
    try {
      const role = await Role.findByPk(req.params.id);
      
      if (!role) {
        return res.status(404).json(errorResponse('Role not found'));
      }
      
      // Prevent deleting system roles
      if (role.is_system_role) {
        return res.status(403).json(errorResponse('Cannot delete system roles'));
      }
      
      // Check if role is assigned to any users
      const userCount = await role.countUsers();
      if (userCount > 0) {
        return res.status(400).json(errorResponse('Cannot delete role that is assigned to users', { userCount }));
      }
      
      await role.destroy();
      res.json(successResponse('Role deleted successfully'));
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json(errorResponse('Failed to delete role', error.message));
    }
  },

  // Get role permissions
  getRolePermissions: async (req, res) => {
    try {
      const role = await Role.findByPk(req.params.id);
      
      if (!role) {
        return res.status(404).json(errorResponse('Role not found'));
      }
      
      const permissions = await role.getPermissions();
      res.json(successResponse('Role permissions retrieved successfully', permissions));
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      res.status(500).json(errorResponse('Failed to fetch role permissions', error.message));
    }
  },

  // Update role permissions
  updateRolePermissions: async (req, res) => {
    try {
      const { permissions } = req.body;
      const role = await Role.findByPk(req.params.id);
      
      if (!role) {
        return res.status(404).json(errorResponse('Role not found'));
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
      
      res.json(successResponse('Role permissions updated successfully', updatedRole));
    } catch (error) {
      console.error('Error updating role permissions:', error);
      res.status(500).json(errorResponse('Failed to update role permissions', error.message));
    }
  },

  // Add permission to role
  addPermissionToRole: async (req, res) => {
    try {
      const { permission_id } = req.body;
      const role = await Role.findByPk(req.params.id);
      
      if (!role) {
        return res.status(404).json(errorResponse('Role not found'));
      }
      
      if (!permission_id) {
        return res.status(400).json(errorResponse('Permission ID is required'));
      }
      
      const permission = await Permission.findByPk(permission_id);
      if (!permission) {
        return res.status(404).json(errorResponse('Permission not found'));
      }
      
      // Check if permission is already assigned
      const hasPermission = await RolePermission.findOne({
        where: {
          role_id: role.id,
          permission_id: permission.id
        }
      });
      
      if (hasPermission) {
        return res.status(400).json(errorResponse('Permission is already assigned to this role'));
      }
      
      // Add permission to role
      await role.addPermission(permission);
      
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
      
      res.json(successResponse('Permission added to role successfully', updatedRole));
    } catch (error) {
      console.error('Error adding permission to role:', error);
      res.status(500).json(errorResponse('Failed to add permission to role', error.message));
    }
  },

  // Remove permission from role
  removePermissionFromRole: async (req, res) => {
    try {
      const roleId = req.params.id;
      const permissionId = req.params.permissionId;
      
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json(errorResponse('Role not found'));
      }
      
      const permission = await Permission.findByPk(permissionId);
      if (!permission) {
        return res.status(404).json(errorResponse('Permission not found'));
      }
      
      // Remove permission from role
      await RolePermission.destroy({
        where: {
          role_id: roleId,
          permission_id: permissionId
        }
      });
      
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
      
      res.json(successResponse('Permission removed from role successfully', updatedRole));
    } catch (error) {
      console.error('Error removing permission from role:', error);
      res.status(500).json(errorResponse('Failed to remove permission from role', error.message));
    }
  }
};

module.exports = roleController;
