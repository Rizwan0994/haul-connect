
const express = require('express');
const router = express.Router();
const carrierController = require('../controllers/carrierController');

router.post('/', carrierController.createCarrier);
router.get('/', carrierController.getAllCarriers);
router.get('/:id', carrierController.getCarrierById);
router.put('/:id', carrierController.updateCarrier);
router.delete('/:id', carrierController.deleteCarrier);

module.exports = router;
