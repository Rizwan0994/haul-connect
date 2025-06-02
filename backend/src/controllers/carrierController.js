const { carrier_profile: CarrierProfile, user: User, carrier_user_assignment: CarrierUserAssignment } = require("../models");
const { Op } = require("sequelize");
const NotificationService = require("../services/notificationService");

exports.createCarrier = async (req, res) => {
  try {
    const carrier = await CarrierProfile.create(req.body);
    
    // Create comprehensive notifications for carrier creation
    try {
      const carrierName = req.body.company_name || `Carrier ID: ${carrier.id}`;
      
      // Notify the creator
      if (req.user && req.user.id) {
        await NotificationService.createForUser(
          req.user.id,
          `You created a new carrier: ${carrierName}`,
          'success',
          `/carrier-management/${carrier.id}`
        );
      }
      
      // Find users with Sales roles and notify them about new carriers
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
          `New carrier added: ${carrierName}`,
          'info',
          `/carrier-management/${carrier.id}`
        );
      }
      
      // Notify all admin users about new carrier
      await NotificationService.createForAdmins(
        `New carrier created by ${req.user?.first_name || 'User'}: ${carrierName}`,
        'info',
        `/carrier-management/${carrier.id}`
      );
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
    const carriers = await CarrierProfile.findAll();
    res.json({ status: "success", data: carriers });
  } catch (error) {
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
    
    await carrier.update(req.body);

    // Create notifications for carrier updates
    try {
      const carrierName = req.body.company_name || originalCompanyName || `Carrier ID: ${carrier.id}`;
      
      // Notify the updater
      if (req.user && req.user.id) {
        await NotificationService.createForUser(
          req.user.id,
          `You updated carrier: ${carrierName}`,
          'info',
          `/carrier-management/${carrier.id}`
        );
      }
      
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
      // Notify the deleter
      if (req.user && req.user.id) {
        await NotificationService.createForUser(
          req.user.id,
          `You deleted carrier: ${carrierName}`,
          'warning',
          `/carrier-management`
        );
      }
      
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
        `/carrier-management`
      );

      // Notify the remover
      if (req.user && req.user.id) {
        await NotificationService.createForUser(
          req.user.id,
          `You removed ${userName} from carrier: ${carrierName}`,
          'info',
          `/carrier-management/${id}`
        );
      }

      // Notify admins
      await NotificationService.createForAdmins(
        `User ${userName} removed from carrier ${carrierName}`,
        'warning',
        `/carrier-management/${id}`
      );
    } catch (notifError) {
      console.error("Failed to create removal notifications:", notifError);
    }

    res.json({ 
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
