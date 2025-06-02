const express = require('express');
const router = express.Router();
const followupSheetController = require('../controllers/followupSheetController');
// const { checkPermission } = require('../middleware/auth');

// Create a new followup sheet
router.post('/', 
//   checkPermission('followup_sheets.create'),
  followupSheetController.createFollowupSheet
);

// Get all followup sheets with pagination and search
router.get('/', 
//   checkPermission('followup_sheets.read'),
  followupSheetController.getAllFollowupSheets
);

// Get followup sheet statistics
router.get('/stats', 
//   checkPermission('followup_sheets.read'),
  followupSheetController.getFollowupSheetStats
);

// Get a specific followup sheet by ID
router.get('/:id', 
//   checkPermission('followup_sheets.read'),
  followupSheetController.getFollowupSheetById
);

// Update a specific followup sheet
router.put('/:id', 
//   checkPermission('followup_sheets.update'),
  followupSheetController.updateFollowupSheet
);

// Delete a specific followup sheet
router.delete('/:id', 
//   checkPermission('followup_sheets.delete'),
  followupSheetController.deleteFollowupSheet
);

module.exports = router;
