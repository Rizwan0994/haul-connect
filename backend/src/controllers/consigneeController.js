const { consignee: Consignee, user: User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Get all consignees with pagination and search
exports.getAllConsignees = async (req, res) => {
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
        { consignee_id: { [Op.iLike]: `%${search}%` } },
        { consignee_name: { [Op.iLike]: `%${search}%` } },
        { contact: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const consignees = await Consignee.findAndCountAll({
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
        consignees: consignees.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(consignees.count / limit),
          totalRecords: consignees.count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching consignees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch consignees',
      error: error.message
    });
  }
};

// Get consignee by ID
exports.getConsigneeById = async (req, res) => {
  try {
    const { id } = req.params;
      const consignee = await Consignee.findByPk(id, {
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

    if (!consignee) {
      return res.status(404).json({
        status: 'error',
        message: 'Consignee not found'
      });
    }

    res.json({
      status: 'success',
      data: consignee
    });
  } catch (error) {
    console.error('Error fetching consignee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch consignee',
      error: error.message
    });
  }
};

// Create new consignee
exports.createConsignee = async (req, res) => {
  try {
    const { consignee_name, contact, telephone, address, ext, email, notes } = req.body;
    const userId = req.user?.id;

    if (!consignee_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Consignee name is required'
      });
    }

    let attachment_path = null;
    let attachment_filename = null;

    // Handle file upload if present
    if (req.file) {
      attachment_path = req.file.path;
      attachment_filename = req.file.originalname;
    }

    const consignee = await Consignee.create({
      consignee_name,
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
    });    const createdConsignee = await Consignee.findByPk(consignee.id, {
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
      message: 'Consignee created successfully',
      data: createdConsignee
    });
  } catch (error) {
    console.error('Error creating consignee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create consignee',
      error: error.message
    });
  }
};

// Update consignee
exports.updateConsignee = async (req, res) => {
  try {
    const { id } = req.params;
    const { consignee_name, contact, telephone, address, ext, email, notes } = req.body;
    const userId = req.user?.id;

    const consignee = await Consignee.findByPk(id);
    if (!consignee) {
      return res.status(404).json({
        status: 'error',
        message: 'Consignee not found'
      });
    }

    let updateData = {
      consignee_name,
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
      if (consignee.attachment_path && fs.existsSync(consignee.attachment_path)) {
        fs.unlinkSync(consignee.attachment_path);
      }
      
      updateData.attachment_path = req.file.path;
      updateData.attachment_filename = req.file.originalname;
    }

    await consignee.update(updateData);    const updatedConsignee = await Consignee.findByPk(id, {
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
      message: 'Consignee updated successfully',
      data: updatedConsignee
    });
  } catch (error) {
    console.error('Error updating consignee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update consignee',
      error: error.message
    });
  }
};

// Delete consignee
exports.deleteConsignee = async (req, res) => {
  try {
    const { id } = req.params;

    const consignee = await Consignee.findByPk(id);
    if (!consignee) {
      return res.status(404).json({
        status: 'error',
        message: 'Consignee not found'
      });
    }

    // Delete associated file if exists
    if (consignee.attachment_path && fs.existsSync(consignee.attachment_path)) {
      fs.unlinkSync(consignee.attachment_path);
    }

    await consignee.destroy();

    res.json({
      status: 'success',
      message: 'Consignee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting consignee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete consignee',
      error: error.message
    });
  }
};

// Download attachment
exports.downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const consignee = await Consignee.findByPk(id);
    if (!consignee || !consignee.attachment_path) {
      return res.status(404).json({
        status: 'error',
        message: 'Attachment not found'
      });
    }

    if (!fs.existsSync(consignee.attachment_path)) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found on server'
      });
    }

    res.download(consignee.attachment_path, consignee.attachment_filename);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download attachment',
      error: error.message
    });
  }
};
