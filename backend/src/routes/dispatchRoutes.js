
const express = require('express');
const { 
  createDispatch, 
  getAllDispatches, 
  getDispatchById,
  updateDispatch,
  deleteDispatch
} = require('../controllers/dispatchController');
const router = express.Router();

router.post('/', createDispatch);
router.get('/', getAllDispatches);
router.get('/:id', getDispatchById);
router.put('/:id', updateDispatch);
router.delete('/:id', deleteDispatch);

module.exports = router;
