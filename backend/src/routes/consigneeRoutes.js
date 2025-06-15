const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const consigneeController = require('../controllers/consigneeController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/consignees/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept all file types
    cb(null, true);
  }
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all consignees
router.get('/', consigneeController.getAllConsignees);

// Get consignee by ID
router.get('/:id', consigneeController.getConsigneeById);

// Download attachment
router.get('/:id/attachment', consigneeController.downloadAttachment);

// Create new consignee
router.post('/', upload.single('attachment'), consigneeController.createConsignee);

// Update consignee
router.put('/:id', upload.single('attachment'), consigneeController.updateConsignee);

// Delete consignee
router.delete('/:id', consigneeController.deleteConsignee);

module.exports = router;
