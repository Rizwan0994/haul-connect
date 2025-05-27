'use strict';

const { 
  invoice: Invoice, 
  dispatch: Dispatch, 
  carrier_profile: Carrier, 
  user: User 
} = require('../models');
const { sendEmail, sendInvoiceEmail } = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { generateInvoicePDF } = require('../services/pdfService');
const { format } = require('date-fns');

const invoiceController = {
  // Create invoice from dispatch
  createInvoice: async (req, res) => {
    try {
      const { dispatch_id } = req.body;

      // Check if invoice already exists for this dispatch
      const existingInvoice = await Invoice.findOne({ where: { dispatch_id } });
      if (existingInvoice) {
        return res.status(400).json(errorResponse('Invoice already exists for this dispatch'));
      }

      // Get dispatch details
      const dispatch = await Dispatch.findByPk(dispatch_id, {
        include: [
          {
            model: Carrier,
            as: 'carrier',
            attributes: ['id', 'company_name', 'mc_number', 'owner_name', 'phone_number', 'email_address']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      if (!dispatch) {
        return res.status(404).json(errorResponse('Dispatch not found'));
      }

      // Calculate amounts
      const total_amount = parseFloat(dispatch.load_amount);
      const carrier_percentage = parseFloat(dispatch.charge_percent);
      const carrier_amount = (total_amount * carrier_percentage) / 100;
      const profit_amount = total_amount - carrier_amount;

      // Generate invoice number
      const invoiceDate = new Date();
      const invoice_number = `INV-${dispatch.load_no}-${format(invoiceDate, 'yyyyMMdd')}`;

      // Set due date (30 days from invoice date)
      const due_date = new Date();
      due_date.setDate(due_date.getDate() + 30);

      // Create invoice
      const invoice = await Invoice.create({
        invoice_number,
        dispatch_id,
        total_amount,
        carrier_amount,
        profit_amount,
        carrier_percentage,
        invoice_date: invoiceDate,
        due_date,
        status: 'draft'
      });

      // Get the created invoice with dispatch details
      const createdInvoice = await Invoice.findByPk(invoice.id, {
        include: [
          {
            model: Dispatch,
            as: 'dispatch',
            include: [
              {
                model: Carrier,
                as: 'carrier',
                attributes: ['id', 'company_name', 'mc_number', 'owner_name', 'phone_number', 'email_address']
              },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email']
              }
            ]
          }
        ]
      });

      res.status(201).json(successResponse('Invoice created successfully', createdInvoice));
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json(errorResponse('Error creating invoice', error.message));
    }
  },

  // Get all invoices
  getAllInvoices: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      const invoices = await Invoice.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Dispatch,
            as: 'dispatch',
            include: [
              {
                model: Carrier,
                as: 'carrier',
                attributes: ['id', 'company_name', 'mc_number', 'owner_name', 'phone_number', 'email_address']
              },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json(successResponse('Invoices retrieved successfully', {
        invoices: invoices.rows,
        pagination: {
          total: invoices.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(invoices.count / limit)
        }
      }));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json(errorResponse('Error fetching invoices', error.message));
    }
  },

  // Get invoice by ID
  getInvoiceById: async (req, res) => {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: Dispatch,
            as: 'dispatch',
            include: [
              {
                model: Carrier,
                as: 'carrier',
                attributes: ['id', 'company_name', 'mc_number', 'owner_name', 'phone_number', 'email_address']
              },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email']
              }
            ]
          }
        ]
      });

      if (!invoice) {
        return res.status(404).json(errorResponse('Invoice not found'));
      }

      res.json(successResponse('Invoice retrieved successfully', invoice));
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json(errorResponse('Error fetching invoice', error.message));
    }
  },

  // Get invoice by dispatch ID
  getInvoiceByDispatchId: async (req, res) => {
    try {
      const { dispatchId } = req.params;

      const invoice = await Invoice.findOne({
        where: { dispatch_id: dispatchId },
        include: [
          {
            model: Dispatch,
            as: 'dispatch',
            include: [
              {
                model: Carrier,
                as: 'carrier',
                attributes: ['id', 'company_name', 'mc_number', 'owner_name', 'phone_number', 'email_address']
              },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email']
              }
            ]
          }
        ]
      });

      if (!invoice) {
        return res.status(404).json(errorResponse('Invoice not found for this dispatch'));
      }

      res.json(successResponse('Invoice retrieved successfully', invoice));
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json(errorResponse('Error fetching invoice', error.message));
    }
  },

  // Update invoice
  updateInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        return res.status(404).json(errorResponse('Invoice not found'));
      }

      // Don't allow updating certain fields if invoice is already sent
      if (invoice.status === 'sent' || invoice.status === 'paid') {
        const restrictedFields = ['total_amount', 'carrier_amount', 'profit_amount', 'carrier_percentage'];
        const hasRestrictedFields = restrictedFields.some(field => updateData.hasOwnProperty(field));
        
        if (hasRestrictedFields) {
          return res.status(400).json(errorResponse('Cannot modify financial details of sent or paid invoices'));
        }
      }

      await invoice.update(updateData);

      const updatedInvoice = await Invoice.findByPk(id, {
        include: [
          {
            model: Dispatch,
            as: 'dispatch',
            include: [
              {
                model: Carrier,
                as: 'carrier',
                attributes: ['id', 'company_name', 'mc_number', 'owner_name', 'phone_number', 'email_address']
              },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email']
              }
            ]
          }
        ]
      });

      res.json(successResponse('Invoice updated successfully', updatedInvoice));
    } catch (error) {
      console.error('Error updating invoice:', error);
      res.status(500).json(errorResponse('Error updating invoice', error.message));
    }
  },

  // Send invoice email
  sendInvoiceEmail: async (req, res) => {
    try {
      const { id } = req.params;
      const { recipientEmail, customMessage } = req.body;

      // Get invoice with all related data
      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: Dispatch,
            as: 'dispatch',
            include: [
              {
                model: Carrier,
                as: 'carrier',
                attributes: ['id', 'company_name', 'mc_number', 'owner_name', 'phone_number', 'email_address']
              },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email']
              }
            ]
          }
        ]
      });

      if (!invoice) {
        return res.status(404).json(errorResponse('Invoice not found'));
      }

      // Use carrier email if no recipient email provided
      const emailTo = recipientEmail || invoice.dispatch.carrier?.email_address;
      if (!emailTo) {
        return res.status(400).json(errorResponse('No recipient email address available'));
      }

      // Generate PDF
      const pdfBuffer = await generateInvoicePDF(invoice);
      
      // Create temporary file for attachment
      const fs = require('fs');
      const path = require('path');
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempPdfPath = path.join(tempDir, `invoice-${invoice.invoice_number}-${Date.now()}.pdf`);
      fs.writeFileSync(tempPdfPath, pdfBuffer);

      try {
        // Send email using enhanced email service
        await sendInvoiceEmail({
          recipientEmail: emailTo,
          invoiceNumber: invoice.invoice_number,
          carrierName: invoice.dispatch.carrier?.company_name || 'Carrier',
          attachmentPath: tempPdfPath,
          customMessage: customMessage
        });

        // Update invoice status to 'sent'
        await invoice.update({ status: 'sent' });

        res.json(successResponse('Invoice email sent successfully'));
      } finally {
        // Clean up temporary file
        if (fs.existsSync(tempPdfPath)) {
          fs.unlinkSync(tempPdfPath);
        }
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      res.status(500).json(errorResponse('Error sending invoice email', error.message));
    }
  },

  // Delete invoice
  deleteInvoice: async (req, res) => {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        return res.status(404).json(errorResponse('Invoice not found'));
      }

      // Don't allow deleting paid invoices
      if (invoice.status === 'paid') {
        return res.status(400).json(errorResponse('Cannot delete paid invoices'));
      }

      await invoice.destroy();

      res.json(successResponse('Invoice deleted successfully'));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json(errorResponse('Error deleting invoice', error.message));
    }
  }
};

module.exports = invoiceController;