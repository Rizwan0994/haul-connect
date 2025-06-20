"use strict";

const { where } = require("sequelize");
const { notification: Notification, user: User, role: Role } = require("../models");

/**
 * Utility service for creating notifications
 */
class NotificationService {
  /**
   * Get Socket.IO service instance
   */
  static getSocketService() {
    try {
      return require("./socketService");
    } catch (error) {
      console.warn("Socket service not available:", error.message);
      return null;
    }
  }  /**
   * Create a notification for a specific user
   * 
   * @param {Object} options Notification options
   * @param {number} options.userId User ID to send notification to
   * @param {string} options.message Notification message
   * @param {string} options.type Notification type (info, warning, error, success)
   * @param {string} options.link Optional link for the notification
   * @returns {Promise<Object>} Created notification
   */
  static async createForUser(userId, message, type = 'info', link) {
    console.log("options",userId, message, type, link);
    try {
      // const { userId, message, type = 'info', link } = options;
      
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      if (!message) {
        throw new Error("Message is required");
      }
      
      const notification = await Notification.create({
        user_id: userId,
        message,
        type,
        link,
        read: false
      });

      // Send real-time notification via Socket.IO
      const socketService = this.getSocketService();
      if (socketService) {
        socketService.sendToUser(userId, {
          id: notification.id,
          message: notification.message,
          type: notification.type,
          link: notification.link,
          read: notification.read,
          created_at: notification.created_at
        });
      }
      
      return notification;
    } catch (error) {
      console.error("Error creating notification for user:", error);
      throw error;
    }
  }
    /**
   * Create a notification for a user by email
   * 
   * @param {Object} options Notification options
   * @param {string} options.email Email address to send notification to
   * @param {string} options.message Notification message
   * @param {string} options.type Notification type (info, warning, error, success)
   * @param {string} options.link Optional link for the notification
   * @returns {Promise<Object>} Created notification
   */
  static async createForEmail(options) {
    try {
      const { email, message, type = 'info', link } = options;
      
      if (!email) {
        throw new Error("Email is required");
      }
      
      if (!message) {
        throw new Error("Message is required");
      }
      
      // Check if user exists with this email
      const user = await User.findOne({ where: { email } });
      
      const notification = await Notification.create({
        user_id: user ? user.id : null,
        email,
        message,
        type,
        link,
        read: false
      });

      // Send real-time notification via Socket.IO if user exists
      const socketService = this.getSocketService();
      if (socketService && user) {
        socketService.sendToUser(user.id, {
          id: notification.id,
          message: notification.message,
          type: notification.type,
          link: notification.link,
          read: notification.read,
          created_at: notification.created_at
        });
      }
      
      return notification;
    } catch (error) {
      console.error("Error creating notification for email:", error);
      throw error;
    }
  }
    /**
   * Create notifications for multiple users
   * 
   * @param {Object} options Notification options
   * @param {number[]} options.userIds Array of user IDs to send notification to
   * @param {string} options.message Notification message
   * @param {string} options.type Notification type (info, warning, error, success)
   * @param {string} options.link Optional link for the notification
   * @returns {Promise<Object[]>} Array of created notifications
   */
  static async createForUsers(options) {
    try {
      const { userIds, message, type = 'info', link } = options;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new Error("User IDs array is required and must not be empty");
      }
      
      if (!message) {
        throw new Error("Message is required");
      }
      
      const notifications = [];
      
      // Create notifications in parallel
      await Promise.all(userIds.map(async (userId) => {
        try {
          const notification = await Notification.create({
            user_id: userId,
            message,
            type,
            link,
            read: false
          });
          
          notifications.push(notification);
        } catch (error) {
          console.error(`Error creating notification for user ${userId}:`, error);
          // Continue with other notifications even if one fails
        }
      }));

      // Send real-time notifications via Socket.IO
      const socketService = this.getSocketService();
      if (socketService && notifications.length > 0) {
        const notificationData = {
          message,
          type,
          link,
          read: false,
          created_at: new Date()
        };
        socketService.sendToUsers(userIds, notificationData);
      }
      
      return notifications;
    } catch (error) {
      console.error("Error creating notifications for users:", error);
      throw error;
    }
  }
  
  /**
   * Create notification for users with specific roles
   * 
   * @param {Object} options Notification options
   * @param {number[]} options.roleIds Array of role IDs
   * @param {string} options.message Notification message
   * @param {string} options.type Notification type (info, warning, error, success)
   * @param {string} options.link Optional link for the notification
   * @returns {Promise<Object[]>} Array of created notifications
   */  static async createForRoles(options) {
    try {
      const { roleIds, message, type = 'info', link } = options;
      
      console.log('🎭 createForRoles called with:', { roleIds, message, type, link });
      
      if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
        throw new Error("Role IDs array is required and must not be empty");
      }
      
      if (!message) {
        throw new Error("Message is required");
      }
      
      // Find all users with the specified roles
      const users = await User.findAll({
        where: {
          role_id: roleIds
        },
        attributes: ['id']
      });
      
      console.log('👥 Found users with roles:', users.map(u => u.id));
      
      const userIds = users.map(user => user.id);
      
      if (userIds.length === 0) {
        console.log('⚠️ No users found with the specified roles');
        return [];
      }
      
      return await this.createForUsers({
        userIds,
        message,
        type,
        link
      });
    } catch (error) {
      console.error("Error creating notifications for roles:", error);
      throw error;
    }
  }
  
  /**
   * Create a notification for all admin users
   * 
   * @param {Object} options Notification options
   * @param {string} options.message Notification message
   * @param {string} options.type Notification type (info, warning, error, success)
   * @param {string} options.link Optional link for the notification
   * @returns {Promise<Object[]>} Array of created notifications
   */  static async createForAdmins( message, type = 'info', link ) {
    try {
      // const { message, type = 'info', link } = options;
      
      console.log('👑 createForAdmins called with:', { message, type, link });
      
      if (!message) {
        throw new Error("Message is required");
      }
        // Find all admin users
      const adminUsers = await User.findAll({
        include : [
          {
            model: Role,
            as: 'userRole',
            where: {
              name: 'admin' 
            }
          }
        ],
        attributes: ['id']
      });
      
      console.log('👑 Found admin users:', adminUsers.map(u => u.id));
      
      const adminIds = adminUsers.map(user => user.id);
      
      if (adminIds.length === 0) {
        console.log('⚠️ No admin users found');
        return [];
      }
      
      return await this.createForUsers({
        userIds: adminIds,
        message,
        type,
        link
      });
    } catch (error) {
      console.error("Error creating notifications for admins:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
