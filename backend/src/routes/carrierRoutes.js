
const express = require('express');
const router = express.Router();
const carrierController = require('../controllers/carrierController');
const { authenticateToken } = require('../middleware/auth');

// Apply authenticateToken middleware to all routes
router.use(authenticateToken);

router.post('/', carrierController.createCarrier);
router.get('/', carrierController.getAllCarriers);
router.get('/:id', carrierController.getCarrierById);
router.put('/:id', carrierController.updateCarrier);
router.delete('/:id', carrierController.deleteCarrier);

module.exports = router;
