const express = require('express');
const router = express.Router();
const carrierApprovalController = require('../controllers/carrierApprovalController');
// const permissionMiddleware = require('../middleware/permissionMiddleware');

const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/carrier-approvals/pending
 * @desc Get pending carrier profiles requiring approval
 * @access Manager, Account roles
 */
router.get('/pending', 
//   permissionMiddleware(['carrier.view.pending']),
  carrierApprovalController.getPendingCarriers
);

/**
 * @route POST /api/carrier-approvals/:carrierId/approve-manager
 * @desc Approve carrier profile as manager (first approval)
 * @access Manager role
 */
router.post('/:carrierId/approve-manager',
//   permissionMiddleware(['carrier.approve.manager']),
  carrierApprovalController.approveAsManager
);

/**
 * @route POST /api/carrier-approvals/:carrierId/approve-accounts
 * @desc Approve carrier profile as accounts (final approval)
 * @access Account role
 */
router.post('/:carrierId/approve-accounts',
//   permissionMiddleware(['carrier.approve.accounts']),
  carrierApprovalController.approveAsAccounts
);

/**
 * @route POST /api/carrier-approvals/:carrierId/reject
 * @desc Reject carrier profile
 * @access Manager, Account roles
 */
router.post('/:carrierId/reject',
//   permissionMiddleware(['carrier.reject']),
  carrierApprovalController.rejectCarrier
);

/**
 * @route POST /api/carrier-approvals/:carrierId/disable
 * @desc Disable carrier profile
 * @access Manager, Account roles
 */
router.post('/:carrierId/disable',
//   permissionMiddleware(['carrier.disable']),
  carrierApprovalController.disableCarrier
);

/**
 * @route GET /api/carrier-approvals/:carrierId/status
 * @desc Get approval status for a specific carrier
 * @access Manager, Account roles
 */
router.get('/:carrierId/status',
//   permissionMiddleware(['carrier.view.pending']),
  carrierApprovalController.getApprovalStatus
);

/**
 * @route GET /api/carrier-approvals/history
 * @desc Get approval history for all carriers
 * @access Admin, Manager roles
 */
router.get('/history',
//   permissionMiddleware(['carrier.view.history']),
  carrierApprovalController.getApprovalHistory
);

module.exports = router;
