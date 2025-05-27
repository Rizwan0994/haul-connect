const { dispatch: Dispatch, carrier_profile: Carrier, user: User } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseUtils");

const createDispatch = async (req, res) => {
  try {
    // Create dispatch with user_id from authenticated user
    const dispatch = await Dispatch.create({
      ...req.body,
      user_id: req.user.id,
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
    const dispatch = await Dispatch.findByPk(req.params.id);

    if (!dispatch) {
      return res.status(404).json(errorResponse("Dispatch not found"));
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
