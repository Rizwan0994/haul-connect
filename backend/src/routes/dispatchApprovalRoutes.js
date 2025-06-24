const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../middleware/auth');
const dispatchApprovalController = require('../controllers/dispatchApprovalController');

// Apply authentication to all approval routes
router.use(authenticateToken);

// Get pending dispatches for approval
router.get('/pending', requirePermission('dispatch.view.pending'), dispatchApprovalController.getPendingDispatches);

// Manager approval
router.post('/:id/approve/manager', requirePermission('dispatch.approve.manager'), dispatchApprovalController.approveAsManager);

// Accounts approval
router.post('/:id/approve/accounts', requirePermission('dispatch.approve.accounts'), dispatchApprovalController.approveAsAccounts);

// Reject dispatch
router.post('/:id/reject', requirePermission('dispatch.reject'), dispatchApprovalController.rejectDispatch);

// Disable dispatch
router.post('/:id/disable', requirePermission('dispatch.disable'), dispatchApprovalController.disableDispatch);

// Get approval status for a specific dispatch
router.get('/:id/status', requirePermission('dispatch.view'), dispatchApprovalController.getApprovalStatus);

// Get approval history for all dispatches
router.get('/history', requirePermission('dispatch.view.history'), dispatchApprovalController.getApprovalHistory);

module.exports = router;
