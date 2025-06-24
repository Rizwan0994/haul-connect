const { carrier_profile, user, notification } = require('../models');
const { Op } = require('sequelize');
// const permissionMiddleware = require('../middleware/permissionMiddleware');

const carrierApprovalController = {
  // Get pending carrier profiles requiring approval
  getPendingCarriers: async (req, res) => {
    try {
      const { status = 'pending' } = req.query;
      
      // Build where clause based on status
      let whereClause = {};
      
      if (status === 'pending') {
        whereClause.approval_status = 'pending';
      } else if (status === 'manager_approved') {
        whereClause.approval_status = 'manager_approved';
      } else if (status === 'approved') {
        whereClause.approval_status = 'approved';
      } else if (status === 'rejected') {
        whereClause.approval_status = 'rejected';
      } else if (status === 'disabled') {
        whereClause.is_disabled = true;
      }

      const carriers = await carrier_profile.findAll({
        where: whereClause,
        include: [
          {
            model: user,
            as: 'managerApprover',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: user,
            as: 'accountsApprover',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: user,
            as: 'rejectedBy',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: user,
            as: 'disabledBy',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: carriers
      });
    } catch (error) {
      console.error('Error fetching pending carriers:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching pending carriers',
        error: error.message
      });
    }
  },  // Approve carrier as manager
  approveAsManager: async (req, res) => {
    try {
      const { carrierId } = req.params;
      const userId = req.user.id;
      const { notes } = req.body || {}; // Handle undefined req.body

      const carrierProfile = await carrier_profile.findByPk(carrierId);
      if (!carrierProfile) {
        return res.status(404).json({
          success: false,
          message: 'Carrier not found'
        });
      }

      if (carrierProfile.approval_status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Carrier is not in pending status'
        });
      }

      await carrierProfile.update({
        approval_status: 'manager_approved',
        approved_by_manager: userId,
        manager_approved_at: new Date()
      });

      // Create approval history record
      const { CarrierApprovalHistory } = require('../models');
      await CarrierApprovalHistory.create({
        carrier_id: carrierId,
        action: 'manager_approved',
        action_by_user_id: userId,
        action_at: new Date(),
        notes: notes || `Carrier approved by manager`
      });

      // Create notification for accounts team
      await notification.create({
        user_id: null, // Will be sent to all accounts users
        title: 'Carrier Approved by Manager',
        message: `Carrier ${carrierProfile.company_name} has been approved by manager and requires final approval`,
        type: 'approval',
        metadata: {
          carrier_id: carrierId,
          action: 'manager_approved'
        }
      });

      res.json({
        success: true,
        message: 'Carrier approved by manager successfully'
      });
    } catch (error) {
      console.error('Error approving carrier as manager:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving carrier',
        error: error.message
      });
    }
  },  // Approve carrier as accounts (final approval)
  approveAsAccounts: async (req, res) => {
    try {
      const { carrierId } = req.params;
      const userId = req.user.id;
      const { notes } = req.body || {}; // Handle undefined req.body

      const carrierProfile = await carrier_profile.findByPk(carrierId);
      if (!carrierProfile) {
        return res.status(404).json({
          success: false,
          message: 'Carrier not found'
        });
      }

      if (carrierProfile.approval_status !== 'manager_approved') {
        return res.status(400).json({
          success: false,
          message: 'Carrier must be approved by manager first'
        });
      }

      await carrierProfile.update({
        approval_status: 'approved',
        approved_by_accounts: userId,
        accounts_approved_at: new Date(),
        status: 'active' // Update the main status to active
      });

      // Create approval history record
      const { CarrierApprovalHistory } = require('../models');
      await CarrierApprovalHistory.create({
        carrier_id: carrierId,
        action: 'accounts_approved',
        action_by_user_id: userId,
        action_at: new Date(),
        notes: notes || `Carrier fully approved by accounts team`
      });

      // Create notification for the creator
      await notification.create({
        user_id: carrierProfile.created_by, // Use created_by field
        title: 'Carrier Profile Approved',
        message: `Your carrier profile for ${carrierProfile.company_name} has been fully approved and is now active`,
        type: 'approval',
        metadata: {
          carrier_id: carrierId,
          action: 'approved'
        }
      });

      res.json({
        success: true,
        message: 'Carrier approved successfully'
      });
    } catch (error) {
      console.error('Error approving carrier as accounts:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving carrier',        error: error.message
      });
    }
  },
  // Reject carrier
  rejectCarrier: async (req, res) => {
    try {
      const { carrierId } = req.params;
      const { reason } = req.body || {}; // Handle undefined req.body
      const userId = req.user.id;

      if (!reason || reason.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }      const carrierProfile = await carrier_profile.findByPk(carrierId);
      if (!carrierProfile) {
        return res.status(404).json({
          success: false,
          message: 'Carrier not found'
        });
      }

      if (!['pending', 'manager_approved'].includes(carrierProfile.approval_status)) {
        return res.status(400).json({
          success: false,
          message: 'Carrier cannot be rejected in current status'
        });
      }

      await carrierProfile.update({
        approval_status: 'rejected',
        rejected_by: userId,
        rejected_at: new Date(),
        rejection_reason: reason,
        status: 'suspended' // Update main status to suspended
      });

      // Create approval history record
      const { CarrierApprovalHistory } = require('../models');
      await CarrierApprovalHistory.create({
        carrier_id: carrierId,
        action: 'rejected',
        action_by_user_id: userId,
        action_at: new Date(),
        notes: `Carrier rejected`,
        rejection_reason: reason
      });

      // Create notification for the creator/assigned users
      try {
        // Try to find users assigned to this carrier
        const { carrier_user_assignment } = require('../models');
        const assignedUsers = await carrier_user_assignment.findAll({
          where: { carrier_id: carrierId },
          include: [{ model: user, as: 'user' }]
        });

        if (assignedUsers.length > 0) {
          // Notify all assigned users
          for (const assignment of assignedUsers) {
            await notification.create({
              user_id: assignment.user_id,
              title: 'Carrier Profile Rejected',
              message: `Carrier profile for ${carrierProfile.company_name} has been rejected. Reason: ${reason}`,
              type: 'error',
              link: `/carrier-management/${carrierId}`,
              metadata: {
                carrier_id: carrierId,
                action: 'rejected',
                reason: reason
              }
            });
          }
        } else {
          // Fallback: notify all sales users
          const salesUsers = await user.findAll({
            where: {
              [Op.or]: [
                { category: 'Sales' },
                { role: 'Sales' }
              ],
              is_active: true
            }
          });
          
          for (const salesUser of salesUsers) {
            await notification.create({
              user_id: salesUser.id,
              title: 'Carrier Profile Rejected',
              message: `Carrier profile for ${carrierProfile.company_name} has been rejected. Reason: ${reason}`,
              type: 'error',
              link: `/carrier-management/${carrierId}`,
              metadata: {
                carrier_id: carrierId,
                action: 'rejected',
                reason: reason
              }              });
          }
        }

      } catch (notifError) {
        console.error('Error creating rejection notification:', notifError);
      }

      res.json({
        success: true,
        message: 'Carrier rejected successfully'
      });
    } catch (error) {
      console.error('Error rejecting carrier:', error);
      res.status(500).json({
        success: false,
        message: 'Error rejecting carrier',
        error: error.message
      });
    }
  },

  // Disable carrier
  disableCarrier: async (req, res) => {
    try {
      const { carrierId } = req.params;
      const userId = req.user.id;

      const carrierProfile = await carrier_profile.findByPk(carrierId);
      if (!carrierProfile) {        return res.status(404).json({
          success: false,
          message: 'Carrier not found'
        });
      }

      await carrierProfile.update({
        is_disabled: true,
        disabled_by: userId,
        disabled_at: new Date(),
        status: 'suspended' // Update main status to suspended
      });

      // Create approval history record
      const { CarrierApprovalHistory } = require('../models');
      await CarrierApprovalHistory.create({
        carrier_id: carrierId,
        action: 'disabled',
        action_by_user_id: userId,
        action_at: new Date(),
        notes: `Carrier profile disabled`
      });

      // Create notification for the creator
      await notification.create({
        user_id: carrierProfile.created_by, // Use created_by field
        title: 'Carrier Profile Disabled',
        message: `Your carrier profile for ${carrierProfile.company_name} has been disabled`,
        type: 'info',
        metadata: {
          carrier_id: carrierId,
          action: 'disabled'
        }
      });

      res.json({
        success: true,
        message: 'Carrier disabled successfully'
      });
    } catch (error) {
      console.error('Error disabling carrier:', error);
      res.status(500).json({
        success: false,
        message: 'Error disabling carrier',
        error: error.message
      });
    }
  },

  // Get approval status for a specific carrier
  getApprovalStatus: async (req, res) => {
    try {
      const { carrierId } = req.params;

      const carrierProfile = await carrier_profile.findByPk(carrierId, {
        include: [
          {
            model: user,
            as: 'managerApprover',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: user,
            as: 'accountsApprover',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: user,
            as: 'rejectedBy',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: user,
            as: 'disabledBy',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      if (!carrierProfile) {
        return res.status(404).json({
          success: false,
          message: 'Carrier not found'
        });
      }

      res.json({
        success: true,
        data: {
          approval_status: carrierProfile.approval_status,
          manager_approved_at: carrierProfile.manager_approved_at,
          accounts_approved_at: carrierProfile.accounts_approved_at,
          rejected_at: carrierProfile.rejected_at,
          rejection_reason: carrierProfile.rejection_reason,
          is_disabled: carrierProfile.is_disabled,
          disabled_at: carrierProfile.disabled_at,
          managerApprover: carrierProfile.managerApprover,
          accountsApprover: carrierProfile.accountsApprover,
          rejectedBy: carrierProfile.rejectedBy,
          disabledBy: carrierProfile.disabledBy
        }
      });
    } catch (error) {
      console.error('Error fetching approval status:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching approval status',
        error: error.message
      });
    }
  },  // Get approval history for all carriers
  getApprovalHistory: async (req, res) => {
    try {
      const { CarrierApprovalHistory } = require('../models');
      
      const history = await CarrierApprovalHistory.findAll({
        include: [
          {
            model: carrier_profile,
            as: 'carrier',
            attributes: ['id', 'mc_number', 'company_name', 'owner_name']
          },
          {
            model: user,
            as: 'action_by',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          }
        ],
        order: [['action_at', 'DESC']],
        limit: 500 // Limit to recent 500 records to avoid performance issues
      });

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error fetching approval history:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching approval history',
        error: error.message
      });
    }
  }
};

module.exports = carrierApprovalController;
