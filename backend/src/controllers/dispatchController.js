const { dispatch: Dispatch, carrier_profile: Carrier } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseUtils");

const createDispatch = async (req, res) => {
  try {
    const dispatch = await Dispatch.create({
      ...req.body,
      user_id: req.user.id,
    });

    res
      .status(201)
      .json(successResponse("Dispatch created successfully", dispatch));
  } catch (error) {
    res
      .status(500)
      .json(errorResponse("Error creating dispatch", error.message));
  }
};

const getAllDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.findAll({
      // include: [
      //   {
      //     model: Carrier,
      //     attributes: ["company_name", "mc_number", "owner_name"],
      //     as: "carrier",
      //   },
      // ],
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
      // include: [
      //   {
      //     model: Carrier,
      //     attributes: ["company_name", "mc_number", "owner_name"],
      //   },
      // ],
    });

    if (!dispatch) {
      return res.status(404).json(errorResponse("Dispatch not found"));
    }

    res.json(successResponse("Dispatch retrieved successfully", dispatch));
  } catch (error) {
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

    res.json(successResponse("Dispatch updated successfully", dispatch));
  } catch (error) {
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
