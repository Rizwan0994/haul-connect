const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../middleware/auth');
const roleController = require('../controllers/roleController');

// Apply authentication to all role routes
router.use(authenticateToken);

// Get all roles
router.get('/', requirePermission('role.view'), roleController.getAllRoles);

// Get role by ID
router.get('/:id', requirePermission('role.view'), roleController.getRoleById);

// Create a new role
router.post('/', requirePermission('role.create'), roleController.createRole);

// Update a role
router.put('/:id', requirePermission('role.edit'), roleController.updateRole);

// Delete a role
router.delete('/:id', requirePermission('role.delete'), roleController.deleteRole);

// Get role permissions
router.get('/:id/permissions', requirePermission('role.view'), roleController.getRolePermissions);

// Update role permissions (bulk update)
router.put('/:id/permissions', requirePermission('permission.assign'), roleController.updateRolePermissions);

// Add a permission to a role (single permission)
router.post('/:id/permissions', requirePermission('permission.assign'), roleController.addPermissionToRole);

// Remove a permission from a role
router.delete('/:id/permissions/:permissionId', requirePermission('permission.assign'), roleController.removePermissionFromRole);

module.exports = router;
