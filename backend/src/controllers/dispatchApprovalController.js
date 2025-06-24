const { dispatch: Dispatch, user: User, carrier_profile: Carrier, notification: Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseUtils");
const NotificationService = require("../services/notificationService");

const dispatchApprovalController = {
  
  // Get pending dispatches for approval (manager/admin can see pending, accounts can see manager_approved)
  getPendingDispatches: async (req, res) => {
    try {
      const userRole = req.user.userRole?.name || req.user.category || req.user.role;
      
      let whereClause = {};
      
      // Determine what approval statuses the user can see based on their role
      if (['manager', 'admin', 'Manager', 'Admin', 'Super Admin'].includes(userRole)) {
        // Managers and admins can see pending dispatches
        whereClause.approval_status = 'pending';
      } else if (['account', 'Account'].includes(userRole)) {
        // Accounts team can see manager-approved dispatches
        whereClause.approval_status = 'manager_approved';
      } else {
        return res.status(403).json(errorResponse('Access denied: Insufficient permissions to view pending approvals'));
      }
      
      // Don't show disabled dispatches
      whereClause.is_disabled = false;
      
      const dispatches = await Dispatch.findAll({
        where: whereClause,
        include: [
          {
            model: Carrier,
            as: "carrier",
            attributes: ["id", "company_name", "mc_number", "owner_name", "phone_number", "email_address"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email"],
          },
          {
            model: User,
            as: "managerApprover",
            attributes: ["id", "first_name", "last_name", "email"],
            required: false
          },
          {
            model: User,
            as: "accountsApprover", 
            attributes: ["id", "first_name", "last_name", "email"],
            required: false
          }
        ],
        order: [['created_at', 'ASC']]
      });

      res.json(successResponse('Pending dispatches retrieved successfully', dispatches));
    } catch (error) {
      console.error('Error fetching pending dispatches:', error);
      res.status(500).json(errorResponse('Failed to fetch pending dispatches', error.message));
    }
  },

  // Manager approval (pending -> manager_approved)
  approveAsManager: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.userRole?.name || req.user.category || req.user.role;
      
      // Check if user has manager approval permissions
      if (!['manager', 'admin', 'Manager', 'Admin', 'Super Admin'].includes(userRole)) {
        return res.status(403).json(errorResponse('Access denied: Only managers and admins can approve dispatches'));
      }

      const dispatch = await Dispatch.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email"],
          },
          {
            model: Carrier,
            as: "carrier",
            attributes: ["id", "company_name"],
          }
        ]
      });

      if (!dispatch) {
        return res.status(404).json(errorResponse('Dispatch not found'));
      }

      if (dispatch.approval_status !== 'pending') {
        return res.status(400).json(errorResponse(`Cannot approve dispatch with status: ${dispatch.approval_status}`));
      }

      if (dispatch.is_disabled) {
        return res.status(400).json(errorResponse('Cannot approve disabled dispatch'));
      }      // Update dispatch with manager approval
      await dispatch.update({
        approval_status: 'manager_approved',
        approved_by_manager: req.user.id,
        manager_approved_at: new Date()
      });

      // Create approval history record
      const { DispatchApprovalHistory } = require('../models');
      await DispatchApprovalHistory.create({
        dispatch_id: id,
        action: 'manager_approved',
        action_by_user_id: req.user.id,
        action_at: new Date(),
        notes: `Dispatch approved by manager ${req.user.first_name || 'Unknown'} ${req.user.last_name || ''}`
      });

      // Create notifications
      try {
        // Notify the creator
        await NotificationService.createForUser({
          userId: dispatch.user_id,
          message: `Your dispatch #${dispatch.id} (Load: ${dispatch.load_no || 'N/A'}) has been approved by manager ${req.user.first_name || 'Unknown'} and is now pending accounts approval`,
          type: 'success',
          link: `/dispatch-management/${dispatch.id}`
        });

        // Notify accounts team
        await NotificationService.createForRoles({
          roles: ['Account', 'account', 'Admin', 'admin', 'Super Admin'],
          message: `Dispatch #${dispatch.id} (Load: ${dispatch.load_no || 'N/A'}) has been manager-approved and is ready for accounts approval`,
          type: 'info',
          link: `/dispatch-management/approvals`,
          excludeUserId: req.user.id
        });

      } catch (notifError) {
        console.error("Failed to create approval notification:", notifError);
      }

      const updatedDispatch = await Dispatch.findByPk(id, {
        include: [
          {
            model: Carrier,
            as: "carrier",
            attributes: ["id", "company_name", "mc_number", "owner_name"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email"],
          },
          {
            model: User,
            as: "managerApprover",
            attributes: ["id", "first_name", "last_name", "email"],
            required: false
          }
        ]
      });

      res.json(successResponse('Dispatch approved by manager successfully', updatedDispatch));
    } catch (error) {
      console.error('Error approving dispatch as manager:', error);
      res.status(500).json(errorResponse('Failed to approve dispatch', error.message));
    }
  },

  // Accounts approval (manager_approved -> accounts_approved)
  approveAsAccounts: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.userRole?.name || req.user.category || req.user.role;
      
      // Check if user has accounts approval permissions
      if (!['account', 'admin', 'Account', 'Admin', 'Super Admin'].includes(userRole)) {
        return res.status(403).json(errorResponse('Access denied: Only accounts team and admins can give final approval'));
      }

      const dispatch = await Dispatch.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email"],
          },
          {
            model: Carrier,
            as: "carrier",
            attributes: ["id", "company_name"],
          }
        ]
      });

      if (!dispatch) {
        return res.status(404).json(errorResponse('Dispatch not found'));
      }

      if (dispatch.approval_status !== 'manager_approved') {
        return res.status(400).json(errorResponse(`Cannot approve dispatch with status: ${dispatch.approval_status}. Must be manager-approved first.`));
      }

      if (dispatch.is_disabled) {
        return res.status(400).json(errorResponse('Cannot approve disabled dispatch'));
      }      // Update dispatch with accounts approval
      await dispatch.update({
        approval_status: 'accounts_approved',
        approved_by_accounts: req.user.id,
        accounts_approved_at: new Date()
      });

      // Create approval history record
      const { DispatchApprovalHistory } = require('../models');
      await DispatchApprovalHistory.create({
        dispatch_id: id,
        action: 'accounts_approved',
        action_by_user_id: req.user.id,
        action_at: new Date(),
        notes: `Dispatch fully approved by accounts team member ${req.user.first_name || 'Unknown'} ${req.user.last_name || ''}`
      });

      // Create notifications
      try {
        // Notify the creator
        await NotificationService.createForUser({
          userId: dispatch.user_id,
          message: `Your dispatch #${dispatch.id} (Load: ${dispatch.load_no || 'N/A'}) has been fully approved by accounts and is now active for commission/invoice counting`,
          type: 'success',
          link: `/dispatch-management/${dispatch.id}`
        });

        // Notify managers about completion
        await NotificationService.createForRoles({
          roles: ['Manager', 'manager', 'Admin', 'admin', 'Super Admin'],
          message: `Dispatch #${dispatch.id} (Load: ${dispatch.load_no || 'N/A'}) has been fully approved and activated`,
          type: 'success',
          link: `/dispatch-management/${dispatch.id}`,
          excludeUserId: req.user.id
        });

      } catch (notifError) {
        console.error("Failed to create approval notification:", notifError);
      }

      const updatedDispatch = await Dispatch.findByPk(id, {
        include: [
          {
            model: Carrier,
            as: "carrier",
            attributes: ["id", "company_name", "mc_number", "owner_name"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email"],
          },
          {
            model: User,
            as: "managerApprover",
            attributes: ["id", "first_name", "last_name", "email"],
            required: false
          },
          {
            model: User,
            as: "accountsApprover",
            attributes: ["id", "first_name", "last_name", "email"],
            required: false
          }
        ]
      });

      res.json(successResponse('Dispatch approved by accounts successfully', updatedDispatch));
    } catch (error) {
      console.error('Error approving dispatch as accounts:', error);
      res.status(500).json(errorResponse('Failed to approve dispatch', error.message));
    }
  },

  // Reject dispatch
  rejectDispatch: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userRole = req.user.userRole?.name || req.user.category || req.user.role;
      
      // Check if user has rejection permissions
      if (!['manager', 'admin', 'account', 'Manager', 'Admin', 'Account', 'Super Admin'].includes(userRole)) {
        return res.status(403).json(errorResponse('Access denied: Insufficient permissions to reject dispatches'));
      }

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json(errorResponse('Rejection reason is required'));
      }

      const dispatch = await Dispatch.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email"],
          },
          {
            model: Carrier,
            as: "carrier",
            attributes: ["id", "company_name"],
          }
        ]
      });

      if (!dispatch) {
        return res.status(404).json(errorResponse('Dispatch not found'));
      }

      if (['accounts_approved', 'rejected', 'disabled'].includes(dispatch.approval_status)) {
        return res.status(400).json(errorResponse(`Cannot reject dispatch with status: ${dispatch.approval_status}`));
      }

      if (dispatch.is_disabled) {
        return res.status(400).json(errorResponse('Cannot reject disabled dispatch'));
      }      // Update dispatch with rejection
      await dispatch.update({
        approval_status: 'rejected',
        rejected_by: req.user.id,
        rejected_at: new Date(),
        rejection_reason: reason.trim()
      });

      // Create approval history record
      const { DispatchApprovalHistory } = require('../models');
      await DispatchApprovalHistory.create({
        dispatch_id: id,
        action: 'rejected',
        action_by_user_id: req.user.id,
        action_at: new Date(),
        notes: `Dispatch rejected by ${req.user.first_name || 'Unknown'} ${req.user.last_name || ''}`,
        rejection_reason: reason.trim()
      });

      // Create notifications
      try {
        // Notify the creator
        await NotificationService.createForUser({
          userId: dispatch.user_id,
          message: `Your dispatch #${dispatch.id} (Load: ${dispatch.load_no || 'N/A'}) has been rejected by ${req.user.first_name || 'a reviewer'}. Reason: ${reason}`,
          type: 'error',
          link: `/dispatch-management/${dispatch.id}`
        });

        // Notify managers about rejection
        await NotificationService.createForRoles({
          roles: ['Manager', 'manager', 'Admin', 'admin', 'Super Admin'],
          message: `Dispatch #${dispatch.id} (Load: ${dispatch.load_no || 'N/A'}) has been rejected`,
          type: 'warning',
          link: `/dispatch-management/${dispatch.id}`,
          excludeUserId: req.user.id
        });

      } catch (notifError) {
        console.error("Failed to create rejection notification:", notifError);
      }

      const updatedDispatch = await Dispatch.findByPk(id, {
        include: [
          {
            model: Carrier,
            as: "carrier",
            attributes: ["id", "company_name", "mc_number", "owner_name"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email"],
          },
          {
            model: User,
            as: "rejectedBy",
            attributes: ["id", "first_name", "last_name", "email"],
            required: false
          }
        ]
      });

      res.json(successResponse('Dispatch rejected successfully', updatedDispatch));
    } catch (error) {
      console.error('Error rejecting dispatch:', error);
      res.status(500).json(errorResponse('Failed to reject dispatch', error.message));
    }
  },

  // Disable dispatch
  disableDispatch: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.userRole?.name || req.user.category || req.user.role;
      
      // Check if user has disable permissions
      if (!['admin', 'Admin', 'Super Admin'].includes(userRole)) {
        return res.status(403).json(errorResponse('Access denied: Only admins can disable dispatches'));
      }

      const dispatch = await Dispatch.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email"],
          }
        ]
      });

      if (!dispatch) {
        return res.status(404).json(errorResponse('Dispatch not found'));
      }

      if (dispatch.is_disabled) {
        return res.status(400).json(errorResponse('Dispatch is already disabled'));
      }      // Update dispatch to disabled
      await dispatch.update({
        approval_status: 'disabled',
        is_disabled: true,
        disabled_by: req.user.id,
        disabled_at: new Date()
      });

      // Create approval history record
      const { DispatchApprovalHistory } = require('../models');
      await DispatchApprovalHistory.create({
        dispatch_id: id,
        action: 'disabled',
        action_by_user_id: req.user.id,
        action_at: new Date(),
        notes: `Dispatch disabled by administrator ${req.user.first_name || 'Unknown'} ${req.user.last_name || ''}`
      });

      // Create notifications
      try {
        // Notify the creator
        await NotificationService.createForUser({
          userId: dispatch.user_id,
          message: `Your dispatch #${dispatch.id} (Load: ${dispatch.load_no || 'N/A'}) has been disabled by an administrator`,
          type: 'warning',
          link: `/dispatch-management/${dispatch.id}`
        });

      } catch (notifError) {
        console.error("Failed to create disable notification:", notifError);
      }

      res.json(successResponse('Dispatch disabled successfully', dispatch));
    } catch (error) {
      console.error('Error disabling dispatch:', error);
      res.status(500).json(errorResponse('Failed to disable dispatch', error.message));
    }
  },

  // Get approval workflow status for a specific dispatch
  getApprovalStatus: async (req, res) => {
    try {
      const { id } = req.params;

      const dispatch = await Dispatch.findByPk(id, {
        attributes: [
          'id', 'load_no', 'approval_status', 'is_disabled',
          'manager_approved_at', 'accounts_approved_at', 'rejected_at', 'disabled_at',
          'rejection_reason'
        ],
        include: [
          {
            model: User,
            as: "managerApprover",
            attributes: ["id", "first_name", "last_name"],
            required: false
          },
          {
            model: User,
            as: "accountsApprover",
            attributes: ["id", "first_name", "last_name"],
            required: false
          },
          {
            model: User,
            as: "rejectedBy",
            attributes: ["id", "first_name", "last_name"],
            required: false
          },
          {
            model: User,
            as: "disabledBy",
            attributes: ["id", "first_name", "last_name"],
            required: false
          }
        ]
      });

      if (!dispatch) {
        return res.status(404).json(errorResponse('Dispatch not found'));
      }

      res.json(successResponse('Approval status retrieved successfully', dispatch));
    } catch (error) {
      console.error('Error fetching approval status:', error);
      res.status(500).json(errorResponse('Failed to fetch approval status', error.message));
    }
  },

  // Get approval history for all dispatches
  getApprovalHistory: async (req, res) => {
    try {
      const { DispatchApprovalHistory } = require('../models');
      
      const history = await DispatchApprovalHistory.findAll({
        include: [
          {
            model: Dispatch,
            as: 'dispatch',
            attributes: ['id', 'load_no'],
            include: [
              {
                model: Carrier,
                as: 'carrier',
                attributes: ['id', 'company_name', 'mc_number']
              }
            ]
          },
          {
            model: User,
            as: 'action_by',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          }
        ],
        order: [['action_at', 'DESC']],
        limit: 500 // Limit to recent 500 records to avoid performance issues
      });

      res.json(successResponse('Approval history retrieved successfully', history));
    } catch (error) {
      console.error('Error fetching approval history:', error);
      res.status(500).json(errorResponse('Failed to fetch approval history', error.message));
    }
  }
};

module.exports = dispatchApprovalController;
