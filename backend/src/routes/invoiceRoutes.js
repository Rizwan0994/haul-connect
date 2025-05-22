const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/:invoiceId/send-email', invoiceController.sendInvoiceEmail);

module.exports = router;