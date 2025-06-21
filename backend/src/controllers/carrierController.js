const { carrier_profile: CarrierProfile, user: User, carrier_user_assignment: CarrierUserAssignment, role: Role } = require("../models");
const { Op } = require("sequelize");
const NotificationService = require("../services/notificationService");

exports.createCarrier = async (req, res) => {
  try {
    // Set initial approval status for new carriers
    const carrierData = {
      ...req.body,
      approval_status: 'pending',
      status: 'pending', // Also set the main status to pending
      sales_agent_id: req.user?.role === 'sales' ? req.user.id : req.body.sales_agent_id, // Set sales agent ID for sales users
      created_by: req.user?.id, // Set created_by to current user
    };
    
    const carrier = await CarrierProfile.create(carrierData);
      // Create comprehensive notifications for carrier creation
    try {
      const carrierName = req.body.company_name || `Carrier ID: ${carrier.id}`;
      
      console.log('🔔 Creating notifications for carrier creation:', carrierName);
      
      // Notify managers about new carrier requiring approval
      const managerRole = await Role.findOne({ where: { name: 'manager' } });
      console.log('📋 Manager role found:', managerRole ? managerRole.id : 'NOT FOUND');
      
      if (managerRole) {
        console.log('📤 Sending notification to managers...');
        await NotificationService.createForRoles({
          roleIds: [managerRole.id],
          message: `New carrier requires approval: ${carrierName}`,
          type: 'approval',
          link: `/carrier-management/approvals`
        });
        console.log('✅ Manager notification sent');
      }
      
      // Notify all admin users about new carrier
      console.log('📤 Sending notification to admins...');
      await NotificationService.createForAdmins(
        `New carrier created by ${req.user?.first_name || 'User'}: ${carrierName} - Requires approval`,
        'info',
        `/carrier-management/approvals`
      );
      console.log('✅ Admin notification sent');
    } catch (notifError) {
      console.error("Failed to create carrier notification:", notifError);
      // Don't fail the request if notification creation fails
    }
    
    res.status(201).json({ status: "success", data: carrier });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.getAllCarriers = async (req, res) => {
  try {
    const carriers = await CarrierProfile.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name'],
          required: false // LEFT JOIN to include carriers without creators
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ status: "success", data: carriers });
  } catch (error) {
    console.log("error",error)
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getCarrierById = async (req, res) => {
  try {
    const carrier = await CarrierProfile.findByPk(req.params.id);
    if (!carrier) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrier not found" });
    }
    res.json({ status: "success", data: carrier });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateCarrier = async (req, res) => {
  try {
    const carrier = await CarrierProfile.findByPk(req.params.id);
    if (!carrier) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrier not found" });
    }

    // Store original values for comparison
    const originalCompanyName = carrier.company_name;
    const originalStatus = carrier.status;
    
    // Check if user is trying to change status
    if (req.body.status && req.body.status !== originalStatus) {
      // Check if user has permission to manage status
      const userPermissions = req.user.permissions || [];
      const userRole = req.user.role_name || req.user.category || '';
      const isAdmin = userRole.toLowerCase().includes('admin');
      const canManageStatus = isAdmin || userPermissions.some(p => p.name === 'carriers.manage_status');
      
      if (!canManageStatus) {
        return res.status(403).json({ 
          status: "error", 
          message: "You don't have permission to change carrier status" 
        });
      }
      
      // If status is being changed to 'active', reset approval status to trigger re-approval
      if (req.body.status === 'active' && originalStatus !== 'active') {
        req.body.approval_status = 'pending';
        req.body.approved_by_manager = null;
        req.body.approved_by_accounts = null;
        req.body.manager_approved_at = null;
        req.body.accounts_approved_at = null;
      }
    }
    
    await carrier.update(req.body);

    // Create notifications for carrier updates
    try {      const carrierName = req.body.company_name || originalCompanyName || `Carrier ID: ${carrier.id}`;
      
      // Notify admin users about carrier updates
      await NotificationService.createForAdmins(
        `Carrier ${carrierName} was updated by ${req.user?.first_name || 'User'}`,
        'info',
        `/carrier-management/${carrier.id}`
      );

      // Notify sales users if this is a significant update
      const salesUsers = await User.findAll({
        where: {
          [Op.or]: [
            { category: 'Sales' },
            { role: 'Sales' }
          ],
          is_active: true
        }
      });
      
      if (salesUsers.length > 0) {
        const salesUserIds = salesUsers.map(user => user.id);
        await NotificationService.createForUsers(
          salesUserIds,
          `Carrier profile updated: ${carrierName}`,
          'info',
          `/carrier-management/${carrier.id}`
        );
      }
    } catch (notifError) {
      console.error("Failed to create carrier update notification:", notifError);
    }

    res.json({ status: "success", data: carrier });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteCarrier = async (req, res) => {
  try {
    const carrier = await CarrierProfile.findByPk(req.params.id);
    if (!carrier) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrier not found" });
    }

    const carrierName = carrier.company_name || `Carrier ID: ${carrier.id}`;
    
    await carrier.destroy();

    // Create notifications for carrier deletion
    try {
      // Notify admin users about carrier deletion
      await NotificationService.createForAdmins(
        `Carrier ${carrierName} was deleted by ${req.user?.first_name || 'User'}`,
        'warning',
        `/carrier-management`
      );

      // Notify sales users about carrier deletion
      const salesUsers = await User.findAll({
        where: {
          [Op.or]: [
            { category: 'Sales' },
            { role: 'Sales' }
          ],
          is_active: true
        }
      });
      
      if (salesUsers.length > 0) {
        const salesUserIds = salesUsers.map(user => user.id);
        await NotificationService.createForUsers(
          salesUserIds,
          `Carrier deleted: ${carrierName}`,
          'warning',
          `/carrier-management`
        );
      }
    } catch (notifError) {
      console.error("Failed to create carrier deletion notification:", notifError);
    }

    res.json({ status: "success", message: "Carrier deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get assigned users for a carrier
exports.getCarrierUsers = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if carrier exists
    const carrier = await CarrierProfile.findByPk(id);
    if (!carrier) {
      return res.status(404).json({ 
        status: "error", 
        message: "Carrier not found" 
      });
    }

    // Get assigned users with assignment details
    const assignments = await CarrierUserAssignment.findAll({
      where: { carrier_id: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'category']
        },
        {
          model: User,
          as: 'assignedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    const assignedUsers = assignments.map(assignment => ({
      id: assignment.user.id,
      first_name: assignment.user.first_name,
      last_name: assignment.user.last_name,
      email: assignment.user.email,
      role: assignment.user.role,
      category: assignment.user.category,
      assigned_at: assignment.assigned_at,
      assigned_by: assignment.assignedBy ? {
        id: assignment.assignedBy.id,
        first_name: assignment.assignedBy.first_name,
        last_name: assignment.assignedBy.last_name,
        email: assignment.assignedBy.email
      } : null
    }));

    res.json({ 
      status: "success", 
      data: assignedUsers 
    });
  } catch (error) {
    console.error("Error fetching carrier users:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

// Assign users to a carrier
exports.assignUsersToCarrier = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        status: "error", 
        message: "User IDs array is required" 
      });
    }

    // Check if carrier exists
    const carrier = await CarrierProfile.findByPk(id);
    if (!carrier) {
      return res.status(404).json({ 
        status: "error", 
        message: "Carrier not found" 
      });
    }

    // Verify all users exist
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } }
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({ 
        status: "error", 
        message: "One or more users not found" 
      });
    }

    // Get existing assignments to avoid duplicates
    const existingAssignments = await CarrierUserAssignment.findAll({
      where: { 
        carrier_id: id,
        user_id: { [Op.in]: userIds }
      }
    });

    const existingUserIds = existingAssignments.map(assignment => assignment.user_id);
    const newUserIds = userIds.filter(userId => !existingUserIds.includes(userId));

    if (newUserIds.length === 0) {
      return res.status(400).json({ 
        status: "error", 
        message: "All users are already assigned to this carrier" 
      });
    }

    // Create new assignments
    const assignmentData = newUserIds.map(userId => ({
      carrier_id: id,
      user_id: userId,
      assigned_by: req.user?.id || null
    }));

    await CarrierUserAssignment.bulkCreate(assignmentData);

    // Send notifications
    try {
      const carrierName = carrier.company_name || `Carrier ID: ${id}`;
      const newUsers = users.filter(user => newUserIds.includes(user.id));
      
      // Notify assigned users
      for (const user of newUsers) {
        await NotificationService.createForUser(
          user.id,
          `You have been assigned to carrier: ${carrierName}`,
          'info',
          `/carrier-management/${id}`
        );
      }

      // Notify the assigner
      if (req.user && req.user.id) {
        const userNames = newUsers.map(user => `${user.first_name} ${user.last_name}`).join(', ');
        await NotificationService.createForUser(
          req.user.id,
          `You assigned users (${userNames}) to carrier: ${carrierName}`,
          'success',
          `/carrier-management/${id}`
        );
      }

      // Notify admins
      const userNames = newUsers.map(user => `${user.first_name} ${user.last_name}`).join(', ');
      await NotificationService.createForAdmins(
        `Users assigned to carrier ${carrierName}: ${userNames}`,
        'info',
        `/carrier-management/${id}`
      );
    } catch (notifError) {
      console.error("Failed to create assignment notifications:", notifError);
    }

    res.status(201).json({ 
      status: "success", 
      message: `${newUserIds.length} user(s) assigned successfully`,
      data: { assignedCount: newUserIds.length, skippedCount: existingUserIds.length }
    });
  } catch (error) {
    console.error("Error assigning users to carrier:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

// Remove user from carrier
exports.removeUserFromCarrier = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    // Check if carrier exists
    const carrier = await CarrierProfile.findByPk(id);
    if (!carrier) {
      return res.status(404).json({ 
        status: "error", 
        message: "Carrier not found" 
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        status: "error", 
        message: "User not found" 
      });
    }

    // Find and delete the assignment
    const assignment = await CarrierUserAssignment.findOne({
      where: { 
        carrier_id: id,
        user_id: userId 
      }
    });

    if (!assignment) {
      return res.status(404).json({ 
        status: "error", 
        message: "User is not assigned to this carrier" 
      });
    }

    await assignment.destroy();

    // Send notifications
    try {
      const carrierName = carrier.company_name || `Carrier ID: ${id}`;
      const userName = `${user.first_name} ${user.last_name}`;
      
      // Notify the user who was removed
      await NotificationService.createForUser(
        userId,
        `You have been removed from carrier: ${carrierName}`,
        'warning',
        `/carrier-management`      );

      // Notify admins
      await NotificationService.createForAdmins(
        `User ${userName} removed from carrier ${carrierName}`,
        'warning',
        `/carrier-management/${id}`
      );
    } catch (notifError) {
      console.error("Failed to create removal notifications:", notifError);
    }    res.json({ 
      status: "success", 
      message: "User removed from carrier successfully" 
    });
  } catch (error) {
    console.error("Error removing user from carrier:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

// Commission Management Endpoints

/**
 * Update commission status for a carrier
 */
exports.updateCarrierCommissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { commission_status, commission_amount, loads_completed, first_load_completed_at, sales_agent_id } = req.body;

    const carrier = await CarrierProfile.findByPk(id);
    if (!carrier) {
      return res.status(404).json({
        status: "error",
        message: "Carrier not found"
      });
    }

    const updateData = {};
    
    if (commission_status) updateData.commission_status = commission_status;
    if (commission_amount !== undefined) updateData.commission_amount = commission_amount;
    if (loads_completed !== undefined) updateData.loads_completed = loads_completed;
    if (first_load_completed_at) updateData.first_load_completed_at = first_load_completed_at;
    if (sales_agent_id !== undefined) updateData.sales_agent_id = sales_agent_id;

    // If marking as paid, record the payment details
    if (commission_status === 'paid') {
      updateData.commission_paid_at = new Date();
      updateData.commission_paid_by = req.user.id;
    }

    // If first load is completed and status is not set, mark as confirmed sale
    if (loads_completed > 0 && !carrier.first_load_completed_at && first_load_completed_at) {
      updateData.commission_status = 'confirmed_sale';
    }

    await carrier.update(updateData);

    // Create notification for commission status change
    try {
      const carrierName = carrier.company_name || `Carrier ID: ${carrier.id}`;      if (commission_status === 'confirmed_sale') {
        // Notify accounts team about confirmed sale
        const accountRole = await Role.findOne({ where: { name: 'account' } });
        if (accountRole) {
          await NotificationService.createForRoles({
            roleIds: [accountRole.id],
            message: `Confirmed sale: ${carrierName} - Commission payment required`,
            type: 'commission',
            link: `/carrier-management/${carrier.id}`
          });
        }
        
        // Notify sales agent if available
        if (carrier.sales_agent_id) {
          await NotificationService.createForUser(
            carrier.sales_agent_id,
            `Confirmed sale: ${carrierName} - Your commission is pending payment`,
            'success',
            `/carrier-management/${carrier.id}`
          );
        }
      } else if (commission_status === 'paid') {
        // Notify sales agent about commission payment
        if (carrier.sales_agent_id) {
          await NotificationService.createForUser(
            carrier.sales_agent_id,
            `Commission paid for ${carrierName} - $${commission_amount || 'N/A'}`,
            'success',
            `/carrier-management/${carrier.id}`
          );
        }
      }
    } catch (notifError) {
      console.error("Failed to create commission notification:", notifError);
    }

    const updatedCarrier = await CarrierProfile.findByPk(id, {
      include: [
        {
          model: User,
          as: 'salesAgent',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'commissionPaidBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json({
      status: "success",
      message: "Commission status updated successfully",
      data: updatedCarrier
    });
  } catch (error) {
    console.error("Error updating commission status:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

/**
 * Mark load as completed for commission tracking
 */
exports.markLoadCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { load_number, completed_at } = req.body;

    const carrier = await CarrierProfile.findByPk(id);
    if (!carrier) {
      return res.status(404).json({
        status: "error",
        message: "Carrier not found"
      });
    }

    const updateData = {
      loads_completed: (carrier.loads_completed || 0) + 1
    };

    // If this is the first load, mark it and set status to confirmed sale
    if (!carrier.first_load_completed_at) {
      updateData.first_load_completed_at = completed_at || new Date();
      updateData.commission_status = 'confirmed_sale';
    }

    await carrier.update(updateData);

    // Create notification for first load completion
    if (!carrier.first_load_completed_at) {
      try {
        const carrierName = carrier.company_name || `Carrier ID: ${carrier.id}`;        // Notify accounts team
        const accountRole = await Role.findOne({ where: { name: 'account' } });
        if (accountRole) {
          await NotificationService.createForRoles({
            roleIds: [accountRole.id],
            message: `First load completed: ${carrierName} - Commission payment now due`,
            type: 'commission',
            link: `/carrier-management/${carrier.id}`
          });
        }
        
        // Notify sales agent
        if (carrier.sales_agent_id) {
          await NotificationService.createForUser(
            carrier.sales_agent_id,
            `Confirmed sale! ${carrierName} completed their first load - Commission pending`,
            'success',
            `/carrier-management/${carrier.id}`
          );
        }
      } catch (notifError) {
        console.error("Failed to create load completion notification:", notifError);
      }
    }

    res.json({
      status: "success",
      message: "Load marked as completed",
      data: {
        carrier_id: carrier.id,
        loads_completed: updateData.loads_completed,
        first_load_completed: !carrier.first_load_completed_at,
        commission_status: updateData.commission_status || carrier.commission_status
      }
    });
  } catch (error) {
    console.error("Error marking load as completed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

/**
 * Get commission summary/stats across all carriers
 */
exports.getCommissionSummary = async (req, res) => {
  try {
    const summary = await CarrierProfile.findAll({
      attributes: [
        'commission_status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('commission_amount')), 'total_amount']
      ],
      group: ['commission_status']
    });

    const stats = {
      not_eligible: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      confirmed_sale: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 }
    };

    summary.forEach(item => {
      const status = item.getDataValue('commission_status');
      const count = parseInt(item.getDataValue('count'));
      const amount = parseFloat(item.getDataValue('total_amount')) || 0;
      
      if (stats[status]) {
        stats[status] = { count, amount };
      }
    });

    res.json({
      status: "success",
      data: stats
    });
  } catch (error) {
    console.error("Error getting commission summary:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};
