const express = require('express');
const router = express.Router();
const brokerController = require('../controllers/brokerController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all brokers
router.get('/', brokerController.getAllBrokers);

// Get broker by ID
router.get('/:id', brokerController.getBrokerById);

// Create new broker
router.post('/', brokerController.createBroker);

// Update broker
router.put('/:id', brokerController.updateBroker);

// Delete broker
router.delete('/:id', brokerController.deleteBroker);

module.exports = router;
