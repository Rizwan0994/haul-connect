const { followup_sheet: FollowupSheet } = require("../models");
const { Op, sequelize } = require("sequelize");
const NotificationService = require("../services/notificationService");

exports.createFollowupSheet = async (req, res) => {
  try {
    const followupSheet = await FollowupSheet.create(req.body);
    
    // Create notifications for followup sheet creation
    try {
      const sheetName = req.body.name || `Followup Sheet ID: ${followupSheet.id}`;
      
      // Notify the creator
      if (req.user && req.user.id) {
        await NotificationService.createForUser(
          req.user.id,
          `You created a new followup sheet: ${sheetName}`,
          'success',
          `/carrier-management/followup-sheets`
        );
      }
      
      // Notify all admin users about new followup sheet
      await NotificationService.createForAdmins(
        `New followup sheet created by ${req.user?.first_name || 'User'}: ${sheetName}`,
        'info',
        `/carrier-management/followup-sheets`
      );
    } catch (notifError) {
      console.error("Failed to create followup sheet notification:", notifError);
    }
    
    res.status(201).json({
      success: true,
      data: followupSheet,
      message: "Followup sheet created successfully"
    });
  } catch (error) {
    console.error("Error creating followup sheet:", error);
    res.status(500).json({
      success: false,
      message: "Error creating followup sheet",
      error: error.message
    });
  }
};

exports.getAllFollowupSheets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    const whereClause = search ? {
      [Op.or]: [
        { agent_name: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } },
        { mc_no: { [Op.iLike]: `%${search}%` } },
        { truck_type: { [Op.iLike]: `%${search}%` } },
        { preferred_lanes: { [Op.iLike]: `%${search}%` } },
        { equipment: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await FollowupSheet.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching followup sheets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching followup sheets",
      error: error.message
    });
  }
};

exports.getFollowupSheetById = async (req, res) => {
  try {
    const followupSheet = await FollowupSheet.findByPk(req.params.id);
    
    if (!followupSheet) {
      return res.status(404).json({
        success: false,
        message: "Followup sheet not found"
      });
    }

    res.json({
      success: true,
      data: followupSheet
    });
  } catch (error) {
    console.error("Error fetching followup sheet:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching followup sheet",
      error: error.message
    });
  }
};

exports.updateFollowupSheet = async (req, res) => {
  try {
    const followupSheet = await FollowupSheet.findByPk(req.params.id);
    
    if (!followupSheet) {
      return res.status(404).json({
        success: false,
        message: "Followup sheet not found"
      });
    }

    await followupSheet.update(req.body);
    
    // Create notification for followup sheet update
    try {
      const sheetName = req.body.name || followupSheet.name || `Followup Sheet ID: ${followupSheet.id}`;
      
      if (req.user && req.user.id) {
        await NotificationService.createForUser(
          req.user.id,
          `You updated followup sheet: ${sheetName}`,
          'success',
          `/carrier-management/followup-sheets`
        );
      }
    } catch (notifError) {
      console.error("Failed to create followup sheet update notification:", notifError);
    }

    res.json({
      success: true,
      data: followupSheet,
      message: "Followup sheet updated successfully"
    });
  } catch (error) {
    console.error("Error updating followup sheet:", error);
    res.status(500).json({
      success: false,
      message: "Error updating followup sheet",
      error: error.message
    });
  }
};

exports.deleteFollowupSheet = async (req, res) => {
  try {
    const followupSheet = await FollowupSheet.findByPk(req.params.id);
    
    if (!followupSheet) {
      return res.status(404).json({
        success: false,
        message: "Followup sheet not found"
      });
    }

    const sheetName = followupSheet.name;
    await followupSheet.destroy();
    
    // Create notification for followup sheet deletion
    try {
      if (req.user && req.user.id) {
        await NotificationService.createForUser(
          req.user.id,
          `You deleted followup sheet: ${sheetName}`,
          'info',
          `/carrier-management/followup-sheets`
        );
      }
    } catch (notifError) {
      console.error("Failed to create followup sheet deletion notification:", notifError);
    }

    res.json({
      success: true,
      message: "Followup sheet deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting followup sheet:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting followup sheet",
      error: error.message
    });
  }
};

exports.getFollowupSheetStats = async (req, res) => {
  try {
    const totalSheets = await FollowupSheet.count();
    const thisMonthSheets = await FollowupSheet.count({
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });
    
    const todaySheets = await FollowupSheet.count({
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Get average percentage
    const avgPercentage = await FollowupSheet.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('percentage')), 'avg_percentage']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        total: totalSheets,
        thisMonth: thisMonthSheets,
        today: todaySheets,
        averagePercentage: parseFloat(avgPercentage?.avg_percentage || 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error("Error fetching followup sheet stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching followup sheet statistics",
      error: error.message
    });
  }
};
