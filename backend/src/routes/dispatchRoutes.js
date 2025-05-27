
const express = require('express');
const { 
  createDispatch, 
  getAllDispatches, 
  getDispatchById,
  updateDispatch,
  deleteDispatch
} = require('../controllers/dispatchController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();



// Apply authenticateToken middleware to all routes
router.use(authenticateToken);

router.post('/', createDispatch);
router.get('/', getAllDispatches);
router.get('/:id', getDispatchById);
router.put('/:id', updateDispatch);
router.delete('/:id', deleteDispatch);

module.exports = router;
