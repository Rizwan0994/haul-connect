const { notification: Notification, user: User,role: Role, } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseUtils");
const { Op } = require("sequelize");

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, read } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = { 
      [Op.or]: [
        { user_id: userId },
        { email: req.user.email } 
      ]
    };
    
    // Filter by read status if provided
    if (read !== undefined) {
      where.read = read === 'true';
    }
    
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ]
    });
    
    res.json(successResponse("Notifications retrieved successfully", {
      notifications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    }));
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json(errorResponse("Error retrieving notifications", error.message));
  }
};

// Mark notifications as read
const markAsRead = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json(errorResponse("Invalid notification IDs"));
    }
    
    const result = await Notification.update(
      { read: true },
      { 
        where: { 
          id: { [Op.in]: ids },
          [Op.or]: [
            { user_id: userId },
            { email: req.user.email }
          ]
        } 
      }
    );
    
    res.json(successResponse(`${result[0]} notifications marked as read`));
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json(errorResponse("Error marking notifications as read", error.message));
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await Notification.update(
      { read: true },
      { 
        where: { 
          [Op.or]: [
            { user_id: userId },
            { email: req.user.email }
          ],
          read: false 
        } 
      }
    );
    
    res.json(successResponse(`${result[0]} notifications marked as read`));
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json(errorResponse("Error marking all notifications as read", error.message));
  }
};

// Create a notification (Admin or system function)
const createNotification = async (req, res) => {
  try {
    const { user_id, email, message, type = 'info', link } = req.body;
    
    if (!user_id && !email) {
      return res.status(400).json(errorResponse("Either user_id or email must be provided"));
    }
    
    if (!message) {
      return res.status(400).json(errorResponse("Message is required"));
    }
    
    const notification = await Notification.create({
      user_id,
      email,
      message,
      type,
      link
    });
    
    res.status(201).json(successResponse("Notification created successfully", notification));
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json(errorResponse("Error creating notification", error.message));
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await Notification.destroy({
      where: { 
        id,
        [Op.or]: [
          { user_id: userId },
          { email: req.user.email }
        ]
      }
    });
    
    if (result === 0) {
      return res.status(404).json(errorResponse("Notification not found or unauthorized"));
    }
    
    res.json(successResponse("Notification deleted successfully"));
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json(errorResponse("Error deleting notification", error.message));
  }
};

// Get unread notification count for a user
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get regular notifications count
    const notificationCount = await Notification.count({
      where: { 
        [Op.or]: [
          { user_id: userId },
          { email: req.user.email }
        ],
        read: false 
      }
    });
    
    let approvalCount = 0;
    
    // Check if user has permission to approve carriers or dispatches
    const userPermissions = req.user.permissions || [];
    const userRole = req.user.role_name || req.user.category || '';
    
    // Check if user is admin or has approval permissions
    const isAdmin = userRole.toLowerCase().includes('admin');
    const canApproveCarriers = isAdmin || userPermissions.some(p => 
      p.name === 'carrier.approve.manager' || p.name === 'carrier.approve.accounts'
    );
    const canApproveDispatches = isAdmin || userPermissions.some(p => 
      p.name === 'dispatch.approve.manager' || p.name === 'dispatch.approve.accounts'
    );
    
    if (canApproveCarriers || canApproveDispatches) {
      // Import models
      const { carrier_profile, dispatch } = require('../models');
      
      // Count pending carrier approvals
      if (canApproveCarriers) {
        const pendingCarriers = await carrier_profile.count({
          where: {
            [Op.or]: [
              { approval_status: 'pending' },
              { approval_status: 'manager_approved' } // For accounts team
            ]
          }
        });
        approvalCount += pendingCarriers;
      }
      
      // Count pending dispatch approvals
      if (canApproveDispatches) {
        const pendingDispatches = await dispatch.count({
          where: {
            [Op.or]: [
              { approval_status: 'pending' },
              { approval_status: 'manager_approved' } // For accounts team
            ]
          }
        });
        approvalCount += pendingDispatches;
      }
    }
    
    const totalCount = notificationCount + approvalCount;
    
    res.json(successResponse("Unread notification count retrieved", { 
      count: totalCount,
      breakdown: {
        notifications: notificationCount,
        approvals: approvalCount
      }
    }));
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json(errorResponse("Error retrieving unread count", error.message));
  }
};

// Create a notification utility function (for internal use)
const createSystemNotification = async (options) => {
  try {
    const { user_id, email, message, type = 'info', link } = options;
    
    if (!user_id && !email) {
      throw new Error("Either user_id or email must be provided");
    }
    
    if (!message) {
      throw new Error("Message is required");
    }
    
    return await Notification.create({
      user_id,
      email,
      message,
      type,
      link
    });
  } catch (error) {
    console.error("Error creating system notification:", error);
    throw error;
  }
};

// Get all users for admin notification sending (Admin only)
const getAllUsersForNotification = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        is_active: true
      },
        include: [  {
              model: Role,
              as: 'userRole',
      }  ],     
        
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'category'],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    });
    
    res.json(successResponse("Users retrieved successfully", users));
  } catch (error) {
    console.error("Error getting users for notification:", error);
    res.status(500).json(errorResponse("Error retrieving users", error.message));
  }
};

// Send custom notification to selected users (Admin only)
const sendCustomNotification = async (req, res) => {
  try {
    const { user_ids, emails, message, type = 'info', link, title } = req.body;
    const userIds=user_ids;
    if (!message) {
      return res.status(400).json(errorResponse("Message is required"));
    }
    
    if ((!userIds || userIds.length === 0) && (!emails || emails.length === 0)) {
      return res.status(400).json(errorResponse("At least one recipient (user ID or email) is required"));
    }
    
    const notifications = [];
    let successCount = 0;
    let errorCount = 0;
    
    // Send to selected users by ID
    if (userIds && userIds.length > 0) {
      for (const userId of userIds) {
        try {
          const notification = await Notification.create({
            user_id: userId,
            message,
            type,
            link,
            title: title || 'Custom Notification',
            sender_id: req.user.id, // Track who sent it
            is_custom: true
          });
          notifications.push(notification);
          successCount++;
        } catch (error) {
          console.error(`Error creating notification for user ${userId}:`, error);
          errorCount++;
        }
      }
    }
    
    // Send to emails (for external users or as backup)
    if (emails && emails.length > 0) {
      for (const email of emails) {
        try {
          // Check if user exists with this email
          const user = await User.findOne({ where: { email } });
          
          const notification = await Notification.create({
            user_id: user ? user.id : null,
            email,
            message,
            type,
            link,
            title: title || 'Custom Notification',
            sender_id: req.user.id,
            is_custom: true
          });
          notifications.push(notification);
          successCount++;
        } catch (error) {
          console.error(`Error creating notification for email ${email}:`, error);
          errorCount++;
        }
      }
    }
    
    res.status(201).json(successResponse(
      `Custom notification sent successfully. Success: ${successCount}, Errors: ${errorCount}`,
      {
        notifications,
        successCount,
        errorCount,
        totalSent: successCount
      }
    ));
  } catch (error) {
    console.error("Error sending custom notification:", error);
    res.status(500).json(errorResponse("Error sending custom notification", error.message));
  }
};

// Get all notifications (admin logs) - Admin only
const getAllNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      type, 
      is_custom, 
      sender_id, 
      start_date, 
      end_date,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (is_custom !== undefined) {
      where.is_custom = is_custom === 'true';
    }
    
    if (sender_id) {
      where.sender_id = sender_id;
    }
    
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    if (search) {
      where[Op.or] = [
        { message: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'category']
        },
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'email', 'first_name', 'last_name'],
          required: false
        }
      ]
    });
    
    res.json(successResponse("All notifications retrieved successfully", {
      notifications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    }));
  } catch (error) {
    console.error("Error getting all notifications:", error);
    res.status(500).json(errorResponse("Error retrieving all notifications", error.message));
  }
};

// Get notification statistics (Admin only)
const getNotificationStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const whereClause = {};
    if (start_date && end_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    // Get total counts
    const totalNotifications = await Notification.count({ where: whereClause });
    const customNotifications = await Notification.count({ 
      where: { ...whereClause, is_custom: true } 
    });
    const systemNotifications = await Notification.count({ 
      where: { ...whereClause, [Op.or]: [{ is_custom: false }, { is_custom: null }] } 
    });
    const unreadNotifications = await Notification.count({ 
      where: { ...whereClause, read: false } 
    });
    
    // Get type breakdown
    const typeBreakdown = await Notification.findAll({
      where: whereClause,
      attributes: [
        'type',
        [Notification.sequelize.fn('COUNT', Notification.sequelize.col('type')), 'count']
      ],
      group: ['type'],
      raw: true
    });
    
    // Get recent activity (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentActivity = await Notification.findAll({
      where: {
        created_at: {
          [Op.gte]: last7Days
        }
      },
      attributes: [
        [Notification.sequelize.fn('DATE', Notification.sequelize.col('created_at')), 'date'],
        [Notification.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [Notification.sequelize.fn('DATE', Notification.sequelize.col('created_at'))],
      order: [[Notification.sequelize.fn('DATE', Notification.sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    res.json(successResponse("Notification statistics retrieved successfully", {
      totalNotifications,
      customNotifications,
      systemNotifications,
      unreadNotifications,
      typeBreakdown,
      recentActivity
    }));
  } catch (error) {
    console.error("Error getting notification statistics:", error);
    res.status(500).json(errorResponse("Error retrieving notification statistics", error.message));
  }
};

// Delete multiple notifications (Admin only)
const deleteMultipleNotifications = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(errorResponse("Invalid notification IDs"));
    }
    
    const result = await Notification.destroy({
      where: { 
        id: { [Op.in]: ids }
      }
    });
    
    res.json(successResponse(`${result} notifications deleted successfully`));
  } catch (error) {
    console.error("Error deleting multiple notifications:", error);
    res.status(500).json(errorResponse("Error deleting notifications", error.message));
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getUnreadCount,
  createSystemNotification,
  // New admin functions
  getAllUsersForNotification,
  sendCustomNotification,
  getAllNotifications,
  getNotificationStats,
  deleteMultipleNotifications
};
