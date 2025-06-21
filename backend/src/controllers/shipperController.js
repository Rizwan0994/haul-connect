const { shipper: Shipper, user: User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Get all shippers with pagination and search
exports.getAllShippers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    const whereConditions = {};
    if (search) {
      whereConditions[Op.or] = [
        { shipper_id: { [Op.iLike]: `%${search}%` } },
        { shipper_name: { [Op.iLike]: `%${search}%` } },
        { contact: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const shippers = await Shipper.findAndCountAll({
      where: whereConditions,      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'updatedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        shippers: shippers.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(shippers.count / limit),
          totalRecords: shippers.count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching shippers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch shippers',
      error: error.message
    });
  }
};

// Get shipper by ID
exports.getShipperById = async (req, res) => {
  try {
    const { id } = req.params;
      const shipper = await Shipper.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'updatedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    if (!shipper) {
      return res.status(404).json({
        status: 'error',
        message: 'Shipper not found'
      });
    }

    res.json({
      status: 'success',
      data: shipper
    });
  } catch (error) {
    console.error('Error fetching shipper:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch shipper',
      error: error.message
    });
  }
};

// Create new shipper
exports.createShipper = async (req, res) => {
  try {
    const { shipper_name, contact, telephone, address, ext, email, notes } = req.body;
    const userId = req.user?.id;

    if (!shipper_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Shipper name is required'
      });
    }

    let attachment_path = null;
    let attachment_filename = null;

    // Handle file upload if present
    if (req.file) {
      attachment_path = req.file.path;
      attachment_filename = req.file.originalname;
    }

    const shipper = await Shipper.create({
      shipper_name,
      contact,
      telephone,
      address,
      ext,
      email,
      notes,
      attachment_path,
      attachment_filename,
      created_by: userId,
      updated_by: userId
    });    const createdShipper = await Shipper.findByPk(shipper.id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Shipper created successfully',
      data: createdShipper
    });
  } catch (error) {
    console.error('Error creating shipper:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create shipper',
      error: error.message
    });
  }
};

// Update shipper
exports.updateShipper = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipper_name, contact, telephone, address, ext, email, notes } = req.body;
    const userId = req.user?.id;

    const shipper = await Shipper.findByPk(id);
    if (!shipper) {
      return res.status(404).json({
        status: 'error',
        message: 'Shipper not found'
      });
    }

    let updateData = {
      shipper_name,
      contact,
      telephone,
      address,
      ext,
      email,
      notes,
      updated_by: userId
    };

    // Handle file upload if present
    if (req.file) {
      // Delete old file if exists
      if (shipper.attachment_path && fs.existsSync(shipper.attachment_path)) {
        fs.unlinkSync(shipper.attachment_path);
      }
      
      updateData.attachment_path = req.file.path;
      updateData.attachment_filename = req.file.originalname;
    }

    await shipper.update(updateData);    const updatedShipper = await Shipper.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'updatedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Shipper updated successfully',
      data: updatedShipper
    });
  } catch (error) {
    console.error('Error updating shipper:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update shipper',
      error: error.message
    });
  }
};

// Delete shipper
exports.deleteShipper = async (req, res) => {
  try {
    const { id } = req.params;

    const shipper = await Shipper.findByPk(id);
    if (!shipper) {
      return res.status(404).json({
        status: 'error',
        message: 'Shipper not found'
      });
    }

    // Delete associated file if exists
    if (shipper.attachment_path && fs.existsSync(shipper.attachment_path)) {
      fs.unlinkSync(shipper.attachment_path);
    }

    await shipper.destroy();

    res.json({
      status: 'success',
      message: 'Shipper deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shipper:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete shipper',
      error: error.message
    });
  }
};

// Download attachment
exports.downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const shipper = await Shipper.findByPk(id);
    if (!shipper || !shipper.attachment_path) {
      return res.status(404).json({
        status: 'error',
        message: 'Attachment not found'
      });
    }

    if (!fs.existsSync(shipper.attachment_path)) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found on server'
      });
    }

    res.download(shipper.attachment_path, shipper.attachment_filename);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download attachment',
      error: error.message
    });
  }
};
