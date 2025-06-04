const express = require('express');
const router = express.Router();
const carrierApprovalController = require('../controllers/carrierApprovalController');
// const authMiddleware = require('../middleware/authMiddleware');
// const permissionMiddleware = require('../middleware/permissionMiddleware');

// All routes require authentication
// router.use(authMiddleware);

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

module.exports = router;
