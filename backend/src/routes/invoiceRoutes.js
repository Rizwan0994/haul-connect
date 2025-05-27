const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Invoice CRUD operations
router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.get('/dispatch/:dispatchId', invoiceController.getInvoiceByDispatchId);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

// Invoice actions
router.post('/:id/send-email', invoiceController.sendInvoiceEmail);

module.exports = router;