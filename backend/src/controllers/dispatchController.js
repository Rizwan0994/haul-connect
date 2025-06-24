const { dispatch: Dispatch, carrier_profile: Carrier, user: User, notification: Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseUtils");
const NotificationService = require("../services/notificationService");

const createDispatch = async (req, res) => {
  try {
    // Create dispatch with user_id from authenticated user
    const dispatch = await Dispatch.create({
      ...req.body,
      user_id: req.user.id,
      approval_status: 'pending', // New dispatches start as pending
    });

    // Create initial approval history record
    const { DispatchApprovalHistory } = require('../models');
    await DispatchApprovalHistory.create({
      dispatch_id: dispatch.id,
      action: 'created',
      action_by_user_id: req.user.id,
      action_at: new Date(),
      notes: `Dispatch created by ${req.user.first_name || 'User'} ${req.user.last_name || ''}`
    });

    // Fetch the created dispatch with associations
    const createdDispatch = await Dispatch.findByPk(dispatch.id, {
      include: [
        {
          model: Carrier,
          as: "carrier",
          attributes: ["id", "company_name", "mc_number", "owner_name", "phone_number", "email_address", "truck_type", "status"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    // Create notifications for dispatch creation
    try {
      // Notify the creator
      await NotificationService.createForUser({
        userId: req.user.id,
        message: `You created dispatch #${createdDispatch.id} with load number ${createdDispatch.load_no || 'N/A'} - now pending manager approval`,
        type: 'success',
        link: `/dispatch-management/${createdDispatch.id}`
      });
      
      // If dispatch has a carrier, notify the carrier via email if they have an email
      if (createdDispatch.carrier && createdDispatch.carrier.email_address) {
        await NotificationService.createForEmail({
          email: createdDispatch.carrier.email_address,
          message: `New dispatch #${createdDispatch.id} has been assigned to your company (${createdDispatch.carrier.company_name}) - pending approval`,
          type: 'info',
          link: `/dispatch-management/${createdDispatch.id}`
        });
      }
      
      // Notify managers about the new dispatch requiring approval
      await NotificationService.createForRoles({
        roles: ['Manager', 'manager', 'Admin', 'admin', 'Super Admin'],
        message: `New dispatch #${createdDispatch.id} created by ${req.user.first_name || 'a user'} (Load: ${createdDispatch.load_no || 'N/A'}) - requires manager approval`,
        type: 'info',
        link: `/dispatch-management/approvals`,
        excludeUserId: req.user.id
      });
    } catch (notifError) {
      console.error("Failed to create dispatch notifications:", notifError);
      // Don't fail the request if notification creation fails
    }

    res
      .status(201)
      .json(successResponse("Dispatch created successfully", createdDispatch));
  } catch (error) {
    console.error("Error creating dispatch:", error);
    res
      .status(500)
      .json(errorResponse("Error creating dispatch", error.message));
  }
};

const getAllDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.findAll({
      include: [
        {
          model: Carrier,
          as: "carrier",
          attributes: ["id", "company_name", "mc_number", "owner_name", "phone_number", "email_address", "truck_type", "status"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(successResponse("Dispatches retrieved successfully", dispatches));
  } catch (error) {
    console.error("Error fetching dispatches:", error);
    res
      .status(500)
      .json(errorResponse("Error fetching dispatches", error.message));
  }
};

const getDispatchById = async (req, res) => {
  try {
    const dispatch = await Dispatch.findByPk(req.params.id, {
      include: [
        {
          model: Carrier,
          as: "carrier",
          attributes: ["id", "company_name", "mc_number", "owner_name", "phone_number", "email_address", "truck_type", "status"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    if (!dispatch) {
      return res.status(404).json(errorResponse("Dispatch not found"));
    }

    res.json(successResponse("Dispatch retrieved successfully", dispatch));
  } catch (error) {
    console.error("Error fetching dispatch:", error);
    res
      .status(500)
      .json(errorResponse("Error fetching dispatch", error.message));
  }
};

const updateDispatch = async (req, res) => {
  try {
    const dispatch = await Dispatch.findByPk(req.params.id);

    if (!dispatch) {
      return res.status(404).json(errorResponse("Dispatch not found"));
    }
    
    // Store old values for comparison
    const oldStatus = dispatch.status;
    const oldCarrierId = dispatch.carrier_id;
    const oldLoadAmount = dispatch.load_amount;
    
    // Check what's being updated
    const newStatus = req.body.status;
    const newCarrierId = req.body.carrier_id;
    const newLoadAmount = req.body.load_amount;
    
    // Track changes
    const statusChanged = newStatus && oldStatus !== newStatus;
    const carrierChanged = newCarrierId && oldCarrierId !== newCarrierId;
    const loadAmountChanged = newLoadAmount && oldLoadAmount !== newLoadAmount;

    await dispatch.update(req.body);

    // Fetch updated dispatch with associations
    const updatedDispatch = await Dispatch.findByPk(req.params.id, {
      include: [
        {
          model: Carrier,
          as: "carrier",
          attributes: ["id", "company_name", "mc_number", "owner_name", "phone_number", "email_address", "truck_type", "status"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });
    
    try {
      // Create notifications based on what changed
      
      // Status change notifications
      if (statusChanged) {
        // Determine notification type based on new status
        let notificationType = 'info';
        if (newStatus.toLowerCase().includes('delivered')) {
          notificationType = 'success';
        } else if (newStatus.toLowerCase().includes('cancel')) {
          notificationType = 'error';
        } else if (newStatus.toLowerCase() === 'in transit') {
          notificationType = 'warning';
        }
        
        const statusMessage = `Dispatch #${updatedDispatch.id} (Load: ${updatedDispatch.load_no || 'N/A'}) status changed from ${oldStatus} to ${newStatus}`;
        
        // Notify the dispatch creator
        if (updatedDispatch.user_id) {
          await NotificationService.createForUser({
            userId: updatedDispatch.user_id,
            message: statusMessage,
            type: notificationType,
            link: `/dispatch-management/${updatedDispatch.id}`
          });
        }
        
        // Notify the user who made the change if different from creator
        if (req.user && req.user.id !== updatedDispatch.user_id) {
          await NotificationService.createForUser({
            userId: req.user.id,
            message: `You updated dispatch #${updatedDispatch.id} status to ${newStatus}`,
            type: notificationType,
            link: `/dispatch-management/${updatedDispatch.id}`
          });
        }
        
        // If status is Delivered, notify admins
        if (newStatus === 'Delivered') {
          await NotificationService.createForAdmins({
            message: `Dispatch #${updatedDispatch.id} (Load: ${updatedDispatch.load_no || 'N/A'}) has been delivered`,
            type: 'success',
            link: `/dispatch-management/${updatedDispatch.id}`
          });
        }
        
        // Notify carrier by email if available
        if (updatedDispatch.carrier && updatedDispatch.carrier.email_address) {
          await NotificationService.createForEmail({
            email: updatedDispatch.carrier.email_address,
            message: `Dispatch #${updatedDispatch.id} status changed to ${newStatus}`,
            type: notificationType,
            link: `/dispatch-management/${updatedDispatch.id}`
          });
        }
      }
      
      // Carrier change notifications
      if (carrierChanged && updatedDispatch.carrier) {
        const carrierMessage = `Dispatch #${updatedDispatch.id} has been reassigned to carrier: ${updatedDispatch.carrier.company_name}`;
        
        // Notify admins about carrier change
        await NotificationService.createForAdmins({
          message: carrierMessage,
          type: 'info',
          link: `/dispatch-management/${updatedDispatch.id}`
        });
        
        // Notify the dispatch creator
        if (updatedDispatch.user_id) {
          await NotificationService.createForUser({
            userId: updatedDispatch.user_id,
            message: carrierMessage,
            type: 'info',
            link: `/dispatch-management/${updatedDispatch.id}`
          });
        }
        
        // Notify new carrier by email
        if (updatedDispatch.carrier.email_address) {
          await NotificationService.createForEmail({
            email: updatedDispatch.carrier.email_address,
            message: `A dispatch (#${updatedDispatch.id}) has been assigned to your company`,
            type: 'info',
            link: `/dispatch-management/${updatedDispatch.id}`
          });
        }
      }
      
      // Load amount change notifications
      if (loadAmountChanged) {
        const loadMessage = `Dispatch #${updatedDispatch.id} load amount updated from $${oldLoadAmount} to $${newLoadAmount}`;
        
        // Notify admins about price change
        await NotificationService.createForAdmins({
          message: loadMessage,
          type: 'warning',
          link: `/dispatch-management/${updatedDispatch.id}`
        });
        
        // Notify the dispatch creator if not an admin
        if (updatedDispatch.user_id && req.user && req.user.id !== updatedDispatch.user_id) {
          await NotificationService.createForUser({
            userId: updatedDispatch.user_id,
            message: loadMessage,
            type: 'warning',
            link: `/dispatch-management/${updatedDispatch.id}`
          });
        }
      }
    } catch (notifError) {
      console.error("Failed to create update notifications:", notifError);
      // Don't fail the request if notification creation fails
    }

    res.json(successResponse("Dispatch updated successfully", updatedDispatch));
  } catch (error) {
    console.error("Error updating dispatch:", error);
    res
      .status(500)
      .json(errorResponse("Error updating dispatch", error.message));
  }
};

const deleteDispatch = async (req, res) => {
  try {
    const dispatch = await Dispatch.findByPk(req.params.id, {
      include: [
        {
          model: Carrier,
          as: "carrier",
          attributes: ["id", "company_name", "email_address"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    if (!dispatch) {
      return res.status(404).json(errorResponse("Dispatch not found"));
    }
    
    // Store dispatch details before deletion for notification purposes
    const dispatchId = dispatch.id;
    const loadNo = dispatch.load_no || 'N/A';
    const creatorId = dispatch.user_id;
    const carrierEmail = dispatch.carrier?.email_address;
    
    // Create notifications before deleting the dispatch
    try {
      const deleteMessage = `Dispatch #${dispatchId} (Load: ${loadNo}) has been deleted`;
      
      // Notify the creator if they are not the one deleting
      if (creatorId && req.user && creatorId !== req.user.id) {
        await NotificationService.createForUser({
          userId: creatorId,
          message: deleteMessage,
          type: 'error',
        });
      }
      
      // Notify the user who is deleting
      if (req.user && req.user.id) {
        await NotificationService.createForUser({
          userId: req.user.id,
          message: `You deleted dispatch #${dispatchId} (Load: ${loadNo})`,
          type: 'warning',
        });
      }
      
      // Notify admins
      await NotificationService.createForAdmins({
        message: `${req.user?.first_name || 'A user'} deleted dispatch #${dispatchId} (Load: ${loadNo})`,
        type: 'warning',
      });
      
      // Notify carrier by email if available
      if (carrierEmail) {
        await NotificationService.createForEmail({
          email: carrierEmail,
          message: `Dispatch #${dispatchId} has been cancelled/deleted from our system`,
          type: 'info',
        });
      }
    } catch (notifError) {
      console.error("Failed to create deletion notifications:", notifError);
      // Don't fail the request if notification creation fails
    }

    await dispatch.destroy();
    res.json(successResponse("Dispatch deleted successfully"));
  } catch (error) {
    res
      .status(500)
      .json(errorResponse("Error deleting dispatch", error.message));
  }
};

module.exports = {
  createDispatch,
  getAllDispatches,
  getDispatchById,
  updateDispatch,
  deleteDispatch,
};
