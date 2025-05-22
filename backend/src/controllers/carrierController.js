const { carrier_profile: CarrierProfile } = require("../models");

exports.createCarrier = async (req, res) => {
  try {
    const carrier = await CarrierProfile.create(req.body);
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
    await carrier.update(req.body);
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
    await carrier.destroy();
    res.json({ status: "success", message: "Carrier deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
