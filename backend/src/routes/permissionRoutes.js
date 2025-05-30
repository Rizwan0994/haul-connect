const express = require('express');
const router = express.Router();
const { permission: Permission } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Apply authentication to all permission routes
router.use(authenticateToken);

// Get all permissions
router.get('/', requirePermission(['role.view', 'permission.assign']), async (req, res) => {
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
    
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// Get permission by ID
router.get('/:id', requirePermission(['role.view', 'permission.assign']), async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    
    res.json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ error: 'Failed to fetch permission' });
  }
});

// Create a new permission (Super Admin only)
router.post('/', requirePermission('role.edit'), async (req, res) => {
  try {
    const { name, type, module, resource, action, description } = req.body;
    
    // Validate required fields
    if (!name || !type || !module || !resource || !action) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if permission with that name already exists
    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      return res.status(400).json({ error: 'Permission with that name already exists' });
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
    
    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
});

// Update a permission
router.put('/:id', requirePermission('role.edit'), async (req, res) => {
  try {
    const { description } = req.body;
    
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    
    // Only allow updating description, not the core attributes
    await permission.update({
      description
    });
    
    res.json(permission);
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ error: 'Failed to update permission' });
  }
});

// Get permission modules (distinct modules)
router.get('/modules/list', requirePermission(['role.view', 'permission.assign']), async (req, res) => {
  try {
    const modules = await Permission.findAll({
      attributes: [
        [Permission.sequelize.fn('DISTINCT', Permission.sequelize.col('module')), 'module']
      ],
      order: [
        ['module', 'ASC']
      ]
    });
    
    res.json(modules.map(m => m.module));
  } catch (error) {
    console.error('Error fetching permission modules:', error);
    res.status(500).json({ error: 'Failed to fetch permission modules' });
  }
});

// Get permission types
router.get('/types/list', requirePermission(['role.view', 'permission.assign']), async (req, res) => {
  try {
    const types = await Permission.findAll({
      attributes: [
        [Permission.sequelize.fn('DISTINCT', Permission.sequelize.col('type')), 'type']
      ],
      order: [
        ['type', 'ASC']
      ]
    });
    
    res.json(types.map(t => t.type));
  } catch (error) {
    console.error('Error fetching permission types:', error);
    res.status(500).json({ error: 'Failed to fetch permission types' });
  }
});

module.exports = router;
