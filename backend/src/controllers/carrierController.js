const { carrier_profile: CarrierProfile, user: User } = require("../models");
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
