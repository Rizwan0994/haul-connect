const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController')
const { authenticateToken, requirePermission } = require('../middleware/auth');
// Apply authentication to all approval routes
router.use(authenticateToken);
// Get all attendance records with filtering
router.get('/', 
  requirePermission('attendance.view'), 
  attendanceController.getAllAttendance
);

// Get attendance summary/analytics
router.get('/summary',  
  requirePermission('attendance.view'), 
  attendanceController.getAttendanceSummary
);

// Get employees for bulk attendance marking
router.get('/employees-for-date',  
  requirePermission('attendance.view'), 
  attendanceController.getEmployeesForBulkAttendance
);

// Generate attendance report
router.get('/report',  
  requirePermission('attendance.view'), 
  attendanceController.generateAttendanceReport
);

// Get attendance by ID
router.get('/:id', 
  requirePermission('attendance.view'), 
  attendanceController.getAttendanceById
);

// Create attendance record
router.post('/', 
  requirePermission('attendance.create'), 
  attendanceController.createAttendance
);

// Bulk mark attendance
router.post('/bulk', 
  requirePermission('attendance.create'), 
  attendanceController.bulkMarkAttendance
);

// Update attendance record
router.put('/:id', 
  requirePermission('attendance.edit'), 
  attendanceController.updateAttendance
);

// Delete attendance record
router.delete('/:id', 
  requirePermission('attendance.delete'), 
  attendanceController.deleteAttendance
);

module.exports = router;
