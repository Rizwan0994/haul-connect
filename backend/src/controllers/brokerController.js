const { broker: Broker, user: User } = require('../models');
const { Op } = require('sequelize');

// Get all brokers with pagination and search
exports.getAllBrokers = async (req, res) => {
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
        { brokerage_company: { [Op.iLike]: `%${search}%` } },
        { agent_name: { [Op.iLike]: `%${search}%` } },
        { agent_email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const brokers = await Broker.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'updatedBy',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        brokers: brokers.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(brokers.count / limit),
          totalRecords: brokers.count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch brokers',
      error: error.message
    });
  }
};

// Get broker by ID
exports.getBrokerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const broker = await Broker.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'updatedBy',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!broker) {
      return res.status(404).json({
        status: 'error',
        message: 'Broker not found'
      });
    }

    res.json({
      status: 'success',
      data: broker
    });
  } catch (error) {
    console.error('Error fetching broker:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch broker',
      error: error.message
    });
  }
};

// Create new broker
exports.createBroker = async (req, res) => {
  try {
    const { brokerage_company, agent_name, agent_phone, agent_email } = req.body;
    const userId = req.user?.id;

    if (!brokerage_company || !agent_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Brokerage company and agent name are required'
      });
    }

    const broker = await Broker.create({
      brokerage_company,
      agent_name,
      agent_phone,
      agent_email,
      created_by: userId,
      updated_by: userId
    });

    const createdBroker = await Broker.findByPk(broker.id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Broker created successfully',
      data: createdBroker
    });
  } catch (error) {
    console.error('Error creating broker:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create broker',
      error: error.message
    });
  }
};

// Update broker
exports.updateBroker = async (req, res) => {
  try {
    const { id } = req.params;
    const { brokerage_company, agent_name, agent_phone, agent_email } = req.body;
    const userId = req.user?.id;

    const broker = await Broker.findByPk(id);
    if (!broker) {
      return res.status(404).json({
        status: 'error',
        message: 'Broker not found'
      });
    }

    await broker.update({
      brokerage_company,
      agent_name,
      agent_phone,
      agent_email,
      updated_by: userId
    });

    const updatedBroker = await Broker.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'updatedBy',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Broker updated successfully',
      data: updatedBroker
    });
  } catch (error) {
    console.error('Error updating broker:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update broker',
      error: error.message
    });
  }
};

// Delete broker
exports.deleteBroker = async (req, res) => {
  try {
    const { id } = req.params;

    const broker = await Broker.findByPk(id);
    if (!broker) {
      return res.status(404).json({
        status: 'error',
        message: 'Broker not found'
      });
    }

    await broker.destroy();

    res.json({
      status: 'success',
      message: 'Broker deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting broker:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete broker',
      error: error.message
    });
  }
};
