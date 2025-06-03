"use strict";

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { user: User, role: Role } = require("../models");

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket instance
    this.userRooms = new Map(); // userId -> Set of room names
  }

  /**
   * Initialize Socket.IO server
   * @param {http.Server} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Socket authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
        
        if (!token) {
          return next(new Error("Authentication token required"));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user with role information
        const user = await User.findByPk(decoded.id, {
          include: [{
            model: Role,
            as: 'userRole',
            attributes: ['id', 'name']
          }],
          attributes: ['id', 'email', 'first_name', 'last_name', 'role_id', 'category']
        });

        if (!user) {
          return next(new Error("User not found"));
        }

        socket.userId = user.id;
        socket.userEmail = user.email;
        socket.userRole = user.userRole?.name || user.category;
        socket.user = user;

        next();
      } catch (error) {
        console.error("Socket authentication error:", error);
        next(new Error("Authentication failed"));
      }
    });

    // Handle socket connections
    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });

    console.log("✅ Socket.IO server initialized");
  }

  /**
   * Handle new socket connection
   * @param {Socket} socket - Socket instance
   */
  handleConnection(socket) {
    const userId = socket.userId;
    const userRole = socket.userRole;

    console.log(`🔌 User ${userId} (${userRole}) connected via Socket.IO`);

    // Store user connection
    this.connectedUsers.set(userId, socket);
    
    // Join user-specific room
    socket.join(`user-${userId}`);
    
    // Join role-based rooms
    this.joinRoleRooms(socket, userRole);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔌 User ${userId} disconnected`);
      this.connectedUsers.delete(userId);
      this.userRooms.delete(userId);
    });

    // Handle notification acknowledgment
    socket.on("notification-read", (notificationId) => {
      console.log(`📖 User ${userId} read notification ${notificationId}`);
      // You can add logic here to track read receipts
    });

    // Send initial connection confirmation
    socket.emit("connected", {
      message: "Connected to real-time notifications",
      userId,
      rooms: Array.from(this.userRooms.get(userId) || [])
    });
  }

  /**
   * Join user to appropriate role-based rooms
   * @param {Socket} socket - Socket instance
   * @param {string} userRole - User role
   */
  joinRoleRooms(socket, userRole) {
    const userId = socket.userId;
    const rooms = new Set();

    // Join role-specific room
    if (userRole) {
      const roleRoom = `role-${userRole.toLowerCase()}`;
      socket.join(roleRoom);
      rooms.add(roleRoom);
    }

    // Join admin rooms for admin users
    if (this.isAdmin(userRole)) {
      socket.join("role-admin");
      socket.join("role-super-admin");
      rooms.add("role-admin");
      rooms.add("role-super-admin");
    }

    // Join all-users room
    socket.join("all-users");
    rooms.add("all-users");

    this.userRooms.set(userId, rooms);
  }

  /**
   * Check if user is admin
   * @param {string} userRole - User role
   * @returns {boolean}
   */
  isAdmin(userRole) {
    return ['Admin', 'Super Admin', 'admin', 'super admin'].includes(userRole);
  }

  /**
   * Send notification to specific user
   * @param {number} userId - User ID
   * @param {Object} notification - Notification data
   */
  sendToUser(userId, notification) {
    if (!this.io) return;

    const room = `user-${userId}`;
    this.io.to(room).emit("notification", {
      ...notification,
      timestamp: new Date(),
      realtime: true
    });

    console.log(`📱 Sent notification to user ${userId}:`, notification.message);
  }

  /**
   * Send notification to users by role
   * @param {string} role - Role name
   * @param {Object} notification - Notification data
   */
  sendToRole(role, notification) {
    if (!this.io) return;

    const room = `role-${role.toLowerCase()}`;
    this.io.to(room).emit("notification", {
      ...notification,
      timestamp: new Date(),
      realtime: true
    });

    console.log(`📱 Sent notification to role ${role}:`, notification.message);
  }

  /**
   * Send notification to admin users
   * @param {Object} notification - Notification data
   */
  sendToAdmins(notification) {
    if (!this.io) return;

    this.io.to("role-admin").emit("notification", {
      ...notification,
      timestamp: new Date(),
      realtime: true
    });

    console.log(`📱 Sent notification to admins:`, notification.message);
  }

  /**
   * Send notification to all connected users
   * @param {Object} notification - Notification data
   */
  sendToAll(notification) {
    if (!this.io) return;

    this.io.to("all-users").emit("notification", {
      ...notification,
      timestamp: new Date(),
      realtime: true
    });

    console.log(`📱 Sent notification to all users:`, notification.message);
  }

  /**
   * Send notification to multiple users
   * @param {number[]} userIds - Array of user IDs
   * @param {Object} notification - Notification data
   */
  sendToUsers(userIds, notification) {
    if (!this.io || !userIds || userIds.length === 0) return;

    userIds.forEach(userId => {
      this.sendToUser(userId, notification);
    });
  }

  /**
   * Get connected users count
   * @returns {number}
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get connected users list
   * @returns {Array}
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Check if user is online
   * @param {number} userId - User ID
   * @returns {boolean}
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Export singleton instance
module.exports = new SocketService();
