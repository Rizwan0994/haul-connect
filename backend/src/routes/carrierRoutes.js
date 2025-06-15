
const express = require('express');
const router = express.Router();
const carrierController = require('../controllers/carrierController');

router.post('/', carrierController.createCarrier);
router.get('/', carrierController.getAllCarriers);
router.get('/:id', carrierController.getCarrierById);
router.put('/:id', carrierController.updateCarrier);
router.delete('/:id', carrierController.deleteCarrier);

// User assignment routes
router.get('/:id/users', carrierController.getCarrierUsers);
router.post('/:id/users', carrierController.assignUsersToCarrier);
router.delete('/:id/users/:userId', carrierController.removeUserFromCarrier);

// Commission management routes
router.put('/:id/commission', carrierController.updateCarrierCommissionStatus);
router.post('/:id/load-completed', carrierController.markLoadCompleted);
router.get('/commission/summary', carrierController.getCommissionSummary);

module.exports = router;
