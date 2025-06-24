
const express = require('express');
const router = express.Router();
const carrierController = require('../controllers/carrierController');
const { Op } = require('sequelize');
const db = require('../models');

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

// Address suggestion routes
router.get('/suggestions/insurance-addresses', async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.length < 1) {
      return res.json({ suggestions: [] });
    }

    // Find unique insurance company addresses that match the search term
    const results = await db.carrier_profile.findAll({
      attributes: ['insurance_company_address'],
      where: {
        insurance_company_address: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: '' },
            { [Op.iLike]: `%${search}%` }
          ]
        }
      },
      group: ['insurance_company_address'],
      order: [['insurance_company_address', 'ASC']],
      limit: 10,
      raw: true
    });

    const suggestions = results
      .map(result => result.insurance_company_address)
      .filter(address => address && address.trim().length > 0);

    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching insurance address suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch insurance address suggestions',
      details: error.message 
    });
  }
});

router.get('/suggestions/factoring-addresses', async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.length < 1) {
      return res.json({ suggestions: [] });
    }

    // Find unique factoring company addresses that match the search term
    const results = await db.carrier_profile.findAll({
      attributes: ['factoring_company_address'],
      where: {
        factoring_company_address: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: '' },
            { [Op.iLike]: `%${search}%` }
          ]
        }
      },
      group: ['factoring_company_address'],
      order: [['factoring_company_address', 'ASC']],
      limit: 10,
      raw: true
    });

    const suggestions = results
      .map(result => result.factoring_company_address)
      .filter(address => address && address.trim().length > 0);

    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching factoring address suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch factoring address suggestions',
      details: error.message 
    });
  }
});

module.exports = router;
