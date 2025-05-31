const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../middleware/auth');
const permissionController = require('../controllers/permissionController');

// Apply authentication to all permission routes
router.use(authenticateToken);

// Get all permissions
router.get('/', requirePermission(['role.view', 'permission.assign']), permissionController.getAllPermissions);

// Get permission by ID
router.get('/:id', requirePermission(['role.view', 'permission.assign']), permissionController.getPermissionById);

// Create a new permission (Super Admin only)
router.post('/', requirePermission('role.edit'), permissionController.createPermission);

// Update a permission
router.put('/:id', requirePermission('role.edit'), permissionController.updatePermission);

// Get permission modules (distinct modules)
router.get('/modules/list', requirePermission(['role.view', 'permission.assign']), permissionController.getPermissionModules);

// Get permission types
router.get('/types/list', requirePermission(['role.view', 'permission.assign']), permissionController.getPermissionTypes);

module.exports = router;
