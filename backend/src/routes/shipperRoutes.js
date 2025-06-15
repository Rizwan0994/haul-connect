const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const shipperController = require('../controllers/shipperController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/shippers/');
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

// Get all shippers
router.get('/', shipperController.getAllShippers);

// Get shipper by ID
router.get('/:id', shipperController.getShipperById);

// Download attachment
router.get('/:id/attachment', shipperController.downloadAttachment);

// Create new shipper
router.post('/', upload.single('attachment'), shipperController.createShipper);

// Update shipper
router.put('/:id', upload.single('attachment'), shipperController.updateShipper);

// Delete shipper
router.delete('/:id', shipperController.deleteShipper);

module.exports = router;
