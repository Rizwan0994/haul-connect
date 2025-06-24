const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (db) => {
  const { carrier_profile } = db;

  // Get insurance address suggestions
  router.get('/suggestions/insurance-addresses', authenticateToken, async (req, res) => {
    try {
      const { search } = req.query;

      if (!search || search.length < 1) {
        return res.json({ suggestions: [] });
      }

      // Find unique insurance company addresses that match the search term
      const results = await carrier_profile.findAll({
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

  // Get factoring address suggestions
  router.get('/suggestions/factoring-addresses', authenticateToken, async (req, res) => {
    try {
      const { search } = req.query;

      if (!search || search.length < 1) {
        return res.json({ suggestions: [] });
      }

      // Find unique factoring company addresses that match the search term
      const results = await carrier_profile.findAll({
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

  return router;
};
