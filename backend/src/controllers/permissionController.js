'use strict';

const { permission: Permission } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseUtils');

const permissionController = {
  // Get all permissions
  getAllPermissions: async (req, res) => {
    try {
      let query = {};
      
      // Filter by type if specified
      if (req.query.type) {
        query.type = req.query.type;
      }
      
      // Filter by module if specified
      if (req.query.module) {
        query.module = req.query.module;
      }
      
      const permissions = await Permission.findAll({
        where: query,
        order: [
          ['module', 'ASC'],
          ['type', 'ASC'],
          ['name', 'ASC']
        ]
      });
      
      res.json(successResponse('Permissions retrieved successfully', permissions));
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json(errorResponse('Failed to fetch permissions', error.message));
    }
  },

  // Get permission by ID
  getPermissionById: async (req, res) => {
    try {
      const permission = await Permission.findByPk(req.params.id);
      
      if (!permission) {
        return res.status(404).json(errorResponse('Permission not found'));
      }
      
      res.json(successResponse('Permission retrieved successfully', permission));
    } catch (error) {
      console.error('Error fetching permission:', error);
      res.status(500).json(errorResponse('Failed to fetch permission', error.message));
    }
  },

  // Create a new permission (Super Admin only)
  createPermission: async (req, res) => {
    try {
      const { name, type, module, resource, action, description } = req.body;
      
      // Validate required fields
      if (!name || !type || !module || !resource || !action) {
        return res.status(400).json(errorResponse('All fields are required'));
      }
      
      // Check if permission with that name already exists
      const existingPermission = await Permission.findOne({ where: { name } });
      if (existingPermission) {
        return res.status(400).json(errorResponse('Permission with that name already exists'));
      }
      
      // Create the permission
      const permission = await Permission.create({
        name,
        type,
        module,
        resource,
        action,
        description
      });
      
      res.status(201).json(successResponse('Permission created successfully', permission));
    } catch (error) {
      console.error('Error creating permission:', error);
      res.status(500).json(errorResponse('Failed to create permission', error.message));
    }
  },

  // Update a permission
  updatePermission: async (req, res) => {
    try {
      const { description } = req.body;
      
      const permission = await Permission.findByPk(req.params.id);
      if (!permission) {
        return res.status(404).json(errorResponse('Permission not found'));
      }
      
      // Only allow updating description, not the core attributes
      await permission.update({
        description
      });
      
      res.json(successResponse('Permission updated successfully', permission));
    } catch (error) {
      console.error('Error updating permission:', error);
      res.status(500).json(errorResponse('Failed to update permission', error.message));
    }
  },

  // Get permission modules (distinct modules)
  getPermissionModules: async (req, res) => {
    try {
      const modules = await Permission.findAll({
        attributes: [
          [Permission.sequelize.fn('DISTINCT', Permission.sequelize.col('module')), 'module']
        ],
        order: [
          ['module', 'ASC']
        ]
      });
      
      res.json(successResponse('Permission modules retrieved successfully', modules.map(m => m.module)));
    } catch (error) {
      console.error('Error fetching permission modules:', error);
      res.status(500).json(errorResponse('Failed to fetch permission modules', error.message));
    }
  },

  // Get permission types
  getPermissionTypes: async (req, res) => {
    try {
      const types = await Permission.findAll({
        attributes: [
          [Permission.sequelize.fn('DISTINCT', Permission.sequelize.col('type')), 'type']
        ],
        order: [
          ['type', 'ASC']
        ]
      });
      
      res.json(successResponse('Permission types retrieved successfully', types.map(t => t.type)));
    } catch (error) {
      console.error('Error fetching permission types:', error);
      res.status(500).json(errorResponse('Failed to fetch permission types', error.message));
    }
  }
};

module.exports = permissionController;
