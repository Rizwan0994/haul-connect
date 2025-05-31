const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticateToken, requirePermission } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// User notification routes
router.get("/", notificationController.getUserNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.put("/mark-read", notificationController.markAsRead);
router.put("/mark-all-read", notificationController.markAllAsRead);
router.delete("/:id", notificationController.deleteNotification);

// Admin notification management routes
router.get("/admin/all", requirePermission('notifications.manage'), notificationController.getAllNotifications);
router.get("/admin/stats", requirePermission('notifications.manage'), notificationController.getNotificationStats);
router.get("/admin/users", requirePermission('notifications.create'), notificationController.getAllUsersForNotification);
router.post("/admin/send-custom", requirePermission('notifications.create'), notificationController.sendCustomNotification);
router.delete("/admin/bulk-delete", requirePermission('notifications.manage'), notificationController.deleteMultipleNotifications);

// Create notification - restrict to admin or system
router.post("/", requirePermission('notifications.create'), notificationController.createNotification);

module.exports = router;
