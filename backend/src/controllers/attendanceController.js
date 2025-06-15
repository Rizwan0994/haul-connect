const { employee_attendance:EmployeeAttendance, user:User, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const ReportGenerator = require('../utils/reportGenerator');

// Get all attendance records with filtering and pagination
exports.getAllAttendance = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      startDate, 
      endDate, 
      employeeId, 
      status,
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = {};
    
    if (startDate && endDate) {
      whereConditions.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereConditions.date = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereConditions.date = {
        [Op.lte]: endDate
      };
    }
    
    if (employeeId) {
      whereConditions.employee_id = employeeId;
    }
    
    if (status) {
      whereConditions.status = status;
    }

    // Build user where conditions for search
    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }    const attendanceRecords = await EmployeeAttendance.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'username', 'email', 'role'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined
        }
      ],
      order: [['date', 'DESC'], ['employee_id', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        attendance: attendanceRecords.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(attendanceRecords.count / limit),
          totalRecords: attendanceRecords.count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// Get attendance by ID
exports.getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await EmployeeAttendance.findByPk(id, {
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'username', 'email', 'role']
        }
      ]
    });

    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    res.json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance record',
      error: error.message
    });
  }
};

// Create attendance record
exports.createAttendance = async (req, res) => {
  try {
    const { employee_id, date, check_in_time, check_out_time, status, notes } = req.body;
    const marked_by = req.user.id;

    // Check if attendance record already exists for this employee and date
    const existingRecord = await EmployeeAttendance.findOne({
      where: {
        employee_id,
        date
      }
    });

    if (existingRecord) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance record already exists for this employee and date'
      });
    }

    const attendance = await EmployeeAttendance.create({
      employee_id,
      date,
      check_in_time,
      check_out_time,
      status,
      notes,
      marked_by
    });

    const attendanceWithEmployee = await EmployeeAttendance.findByPk(attendance.id, {
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'username', 'email', 'role']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Attendance record created successfully',
      data: attendanceWithEmployee
    });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create attendance record',
      error: error.message
    });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in_time, check_out_time, status, notes } = req.body;

    const attendance = await EmployeeAttendance.findByPk(id);
    
    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    await attendance.update({
      check_in_time,
      check_out_time,
      status,
      notes
    });

    const updatedAttendance = await EmployeeAttendance.findByPk(id, {
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'username', 'email', 'role']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Attendance record updated successfully',
      data: updatedAttendance
    });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update attendance record',
      error: error.message
    });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await EmployeeAttendance.findByPk(id);
    
    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    await attendance.destroy();

    res.json({
      status: 'success',
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete attendance record',
      error: error.message
    });
  }
};

// Get attendance summary/analytics
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    // Build where conditions
    const whereConditions = {};
    
    if (startDate && endDate) {
      whereConditions.date = {
        [Op.between]: [startDate, endDate]
      };
    } else {
      // Default to current month if no dates provided
      const currentMonth = moment().format('YYYY-MM');
      whereConditions.date = {
        [Op.gte]: `${currentMonth}-01`,
        [Op.lte]: moment().endOf('month').format('YYYY-MM-DD')
      };
    }
    
    if (employeeId) {
      whereConditions.employee_id = employeeId;
    }

    // Get status summary
    const statusSummary = await EmployeeAttendance.findAll({
      where: whereConditions,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get employee attendance stats
    const employeeStats = await EmployeeAttendance.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'username', 'email']
        }
      ],      attributes: [
        'employee_id',
        [sequelize.fn('COUNT', sequelize.col('employee_attendance.id')), 'total_days'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'present' THEN 1 END")), 'present_days'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'absent' THEN 1 END")), 'absent_days'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'late' THEN 1 END")), 'late_days']
      ],
      group: ['employee_id', 'employee.id'],
      raw: false
    });

    // Get total employees
    const totalEmployees = await User.count({
      where: {
        role: { [Op.not]: 'Super Admin' } // Exclude super admin from attendance tracking
      }
    });

    res.json({
      status: 'success',
      data: {
        statusSummary,
        employeeStats,
        totalEmployees,
        dateRange: {
          startDate: startDate || `${moment().format('YYYY-MM')}-01`,
          endDate: endDate || moment().endOf('month').format('YYYY-MM-DD')
        }
      }
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance summary',
      error: error.message
    });
  }
};

// Bulk mark attendance
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { date, attendanceData } = req.body; // attendanceData is array of {employee_id, status, notes}
    const marked_by = req.user.id;

    const results = [];
    const errors = [];

    for (const record of attendanceData) {
      try {
        const { employee_id, status, check_in_time, check_out_time, notes } = record;
        
        // Check if record already exists
        const existingRecord = await EmployeeAttendance.findOne({
          where: { employee_id, date }
        });

        if (existingRecord) {
          // Update existing record
          await existingRecord.update({
            status,
            check_in_time,
            check_out_time,
            notes
          });
          results.push({ employee_id, action: 'updated' });
        } else {
          // Create new record
          await EmployeeAttendance.create({
            employee_id,
            date,
            check_in_time,
            check_out_time,
            status,
            notes,
            marked_by
          });
          results.push({ employee_id, action: 'created' });
        }
      } catch (error) {
        errors.push({ employee_id: record.employee_id, error: error.message });
      }
    }

    res.json({
      status: 'success',
      message: 'Bulk attendance marking completed',
      data: {
        results,
        errors,
        totalProcessed: attendanceData.length,
        successCount: results.length,
        errorCount: errors.length
      }
    });
  } catch (error) {    console.error('Error in bulk attendance marking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process bulk attendance marking',
      error: error.message
    });
  }
};

// Get employees for bulk attendance (with current attendance status)
exports.getEmployeesForBulkAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        status: 'error',
        message: 'Date parameter is required'
      });
    }

    // Get all users (employees) except super admin
    const employees = await User.findAll({
      where: {
        role: { [Op.not]: 'Super Admin' }
      },
      attributes: ['id', 'username', 'email', 'role'],
      order: [['username', 'ASC']]
    });

    // Get existing attendance records for the date
    const attendanceRecords = await EmployeeAttendance.findAll({
      where: { date },
      attributes: ['employee_id', 'status', 'check_in_time', 'check_out_time', 'notes', 'id'],
      raw: true
    });

    // Create a map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.employee_id] = record;
    });

    // Combine employee data with attendance status
    const employeesWithAttendance = employees.map(employee => ({
      ...employee.toJSON(),
      department: employee.role, // Use role as department for now
      currentAttendance: attendanceMap[employee.id] || null
    }));

    res.json({
      status: 'success',
      data: employeesWithAttendance
    });
  } catch (error) {
    console.error('Error fetching employees for bulk attendance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employees for bulk attendance',
      error: error.message
    });
  }
};

// Generate attendance report
exports.generateAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'pdf' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date and end date are required'
      });
    }

    // Validate format
    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format must be either "pdf" or "excel"'
      });
    }

    // Get attendance data for the date range
    const attendanceData = await EmployeeAttendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'username', 'email', 'role']
        }
      ],
      order: [['date', 'DESC'], ['employee_id', 'ASC']]
    });

    let buffer;
    let mimeType;
    let filename;

    if (format === 'excel') {
      // Generate Excel report
      buffer = ReportGenerator.generateExcelReport(attendanceData);
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `attendance-report-${startDate}-to-${endDate}.xlsx`;
    } else {
      // Generate PDF report
      buffer = ReportGenerator.generatePDFReport(attendanceData, startDate, endDate);
      mimeType = 'application/pdf';
      filename = `attendance-report-${startDate}-to-${endDate}.pdf`;
    }

    // Set headers for file download
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    // Send the file
    res.send(buffer);

  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate attendance report',
      error: error.message
    });
  }
};
