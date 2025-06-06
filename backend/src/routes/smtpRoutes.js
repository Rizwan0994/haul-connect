const express = require('express');
const router = express.Router();
const smtpController = require('../controllers/smtpController');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// All SMTP settings routes require admin permission
router.use(requirePermission('settings.smtp'));

// SMTP Settings CRUD operations
router.get('/', smtpController.getAllSMTPSettings);
router.get('/:id', smtpController.getSMTPSettingsById);
router.post('/', smtpController.createSMTPSettings);
router.put('/:id', smtpController.updateSMTPSettings);
router.delete('/:id', smtpController.deleteSMTPSettings);

// SMTP Settings actions
router.post('/:id/test', smtpController.testSMTPSettings);
router.put('/:id/set-default', smtpController.setDefaultSMTPSettings);

module.exports = router;
