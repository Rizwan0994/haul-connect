'use strict';

const { sendEmail } = require('../services/emailService'); // Import the sendEmail function
const { successResponse, errorResponse } = require('../utils/responseUtils'); // Import response utility functions

const invoiceController = {
  sendInvoiceEmail: async (req, res) => {
    const { invoiceId } = req.params;

    try {
      // Dummy data - replace with actual database fetching later
      const dummyInvoiceDetails = {
        id: invoiceId,
        invoice_number: `INV-${invoiceId}`,
        carrier_name: 'Dummy Carrier',
        invoice_date: new Date().toISOString().split('T')[0], // Current date
        amount: 1234.56,
        lineItems: [
          { description: 'Dummy Service 1', quantity: 1, price: 1000.00, total: 1000.00 },
          { description: 'Dummy Service 2', quantity: 2, price: 117.28, total: 234.56 },
        ],
      };

      const recipientEmail = 'mb0587494@gmail.com'; // Replace with a real test email address
      const subject = `Invoice ${dummyInvoiceDetails.invoice_number} from Your Company`;
      const html = `
        <h1>Invoice ${dummyInvoiceDetails.invoice_number}</h1>
        <p>Date: ${dummyInvoiceDetails.invoice_date}</p>
        <p>To: ${dummyInvoiceDetails.carrier_name}</p>
        <p>Amount: $${dummyInvoiceDetails.amount.toFixed(2)}</p>
        <p>This is a dummy invoice email.</p>
        `; // Basic HTML for the email body

      const result=await sendEmail({ to: recipientEmail, subject, html });

      res.status(200).json(successResponse(' invoice email sent successfully!'));
    } catch (error) {
      console.error('Error sending dummy invoice email:', error);
      res.status(500).json(errorResponse('An error occurred while trying to send the invoice email.', error.message));
    }
  }
};

module.exports = invoiceController;