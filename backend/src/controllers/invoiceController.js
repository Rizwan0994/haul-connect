'use strict';

const { 
  invoice: Invoice, 
  dispatch: Dispatch, 
  carrier_profile: Carrier, 
  user: User,
  notification: Notification 
} = require('../models');
const { sendEmail, sendInvoiceEmail } = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { generateInvoicePDF } = require('../services/pdfService');
const NotificationService = require('../services/notificationService');
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
      
      // Create notification for invoice creation
      try {
        // Notify the user who created the invoice (current user)
        if (req.user && req.user.id) {
          await NotificationService.createForUser({
            userId: req.user.id,
            message: `Invoice ${invoice_number} created for dispatch ${dispatch.load_no || dispatch.id}`,
            type: 'success',
            link: `/invoices/${invoice.id}`
          });
        }
        
        // Notify the dispatch creator if different from current user
        const dispatchCreatorId = dispatch.user_id;
        if (dispatchCreatorId && dispatchCreatorId !== req.user.id) {
          await NotificationService.createForUser({
            userId: dispatchCreatorId,
            message: `Invoice ${invoice_number} created for your dispatch ${dispatch.load_no || dispatch.id}`,
            type: 'info',
            link: `/invoices/${invoice.id}`
          });
        }
        
        // Notify carrier by email if available
        if (dispatch.carrier?.email_address) {
          await NotificationService.createForEmail({
            email: dispatch.carrier.email_address,
            message: `Invoice ${invoice_number} has been generated for your services on dispatch ${dispatch.load_no || dispatch.id}`,
            type: 'info',
            link: `/invoices/${invoice.id}`
          });
        }
        
        // Notify admins about new invoice
        await NotificationService.createForAdmins({
          message: `New invoice ${invoice_number} created with amount $${total_amount} (profit: $${profit_amount})`,
          type: 'info',
          link: `/invoices/${invoice.id}`
        });
      } catch (notifError) {
        console.error("Failed to create invoice notification:", notifError);
        // Don't fail the request if notification creation fails
      }

      res.status(201).json(successResponse('Invoice created successfully', createdInvoice));
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json(errorResponse('Error creating invoice', error.message));
    }  },

  // Get all invoices
  getAllInvoices: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Check user role and permissions
      const userRole = req.user?.userRole?.name || req.user?.category || req.user?.role;
      const userId = req.user?.id;
      
      // Check if user can view all invoices or only their own
      const canViewAllInvoices = ['admin', 'Admin', 'Super Admin', 'manager', 'Manager'].includes(userRole);

      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      // Build include with user filtering
      const includeOptions = [
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
      ];

      // If user cannot view all invoices, filter by dispatch user_id
      if (!canViewAllInvoices) {
        includeOptions[0].where = { user_id: userId };
        includeOptions[0].required = true; // INNER JOIN to ensure only user's dispatches
      }

      const invoices = await Invoice.findAndCountAll({
        where: whereClause,
        include: includeOptions,
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

      // Check user role and permissions
      const userRole = req.user?.userRole?.name || req.user?.category || req.user?.role;
      const userId = req.user?.id;
      
      // Check if user can view all invoices or only their own
      const canViewAllInvoices = ['admin', 'Admin', 'Super Admin', 'manager', 'Manager'].includes(userRole);

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

      // Check if user has access to this invoice
      if (!canViewAllInvoices) {
        if (invoice.dispatch && invoice.dispatch.user_id !== userId) {
          return res
            .status(403)
            .json(errorResponse('Access denied: You don\'t have permission to view this invoice'));
        }
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

      // Check if status is being updated
      const oldStatus = invoice.status;
      const newStatus = updateData.status;
      const statusChanged = newStatus && oldStatus !== newStatus;
      
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
      
      // Create notification for status change
      if (statusChanged) {
        try {
          // Determine notification type based on new status
          let notificationType = 'info';
          if (newStatus.toLowerCase() === 'paid') {
            notificationType = 'success';
          } else if (newStatus.toLowerCase() === 'overdue') {
            notificationType = 'error';
          } else if (newStatus.toLowerCase() === 'pending' || newStatus.toLowerCase() === 'draft') {
            notificationType = 'warning';
          }
          
          // Notify the invoice creator
          if (req.user && req.user.id) {
            await NotificationService.createForUser({
              userId: req.user.id,
              message: `You updated invoice ${updatedInvoice.invoice_number} status to ${newStatus}`,
              type: notificationType,
              link: `/invoices/${updatedInvoice.id}`
            });
          }
          
          // Notify the dispatch creator if different from current user
          const dispatchCreatorId = updatedInvoice.dispatch?.user_id;
          if (dispatchCreatorId && dispatchCreatorId !== req.user.id) {
            await NotificationService.createForUser({
              userId: dispatchCreatorId,
              message: `Invoice ${updatedInvoice.invoice_number} status updated to ${newStatus}`,
              type: notificationType,
              link: `/invoices/${updatedInvoice.id}`
            });
          }
          
          // For paid invoices, notify account users
          if (newStatus.toLowerCase() === 'paid') {
            // Find users with Account roles
            const accountUsers = await User.findAll({
              where: {
                [require('sequelize').Op.or]: [
                  { category: 'Account' },
                  { role: 'Account' }
                ],
                is_active: true
              }
            });
            
            // Create notifications for account users
            const userIds = accountUsers.map(user => user.id).filter(id => id !== req.user.id && id !== dispatchCreatorId);
            if (userIds.length > 0) {
              await NotificationService.createForUsers({
                userIds,
                message: `Invoice ${updatedInvoice.invoice_number} has been marked as paid`,
                type: 'success',
                link: `/invoices/${updatedInvoice.id}`
              });
            }
          }
        } catch (notifError) {
          console.error("Failed to create invoice status notification:", notifError);
          // Don't fail the request if notification creation fails
        }
      }

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
        
        // Create notification for email sent
        try {
          // Notify the user who sent the email
          if (req.user && req.user.id) {
            await NotificationService.createForUser({
              userId: req.user.id,
              message: `Invoice ${invoice.invoice_number} sent to ${emailTo}`,
              type: 'success',
              link: `/invoices/${invoice.id}`
            });
          }
          
          // Also notify the dispatch creator if different
          const dispatchCreatorId = invoice.dispatch?.user_id;
          if (dispatchCreatorId && dispatchCreatorId !== req.user.id) {
            await NotificationService.createForUser({
              userId: dispatchCreatorId,
              message: `Invoice ${invoice.invoice_number} has been emailed to carrier`,
              type: 'info',
              link: `/invoices/${invoice.id}`
            });
          }
          
          // Create email notification for carrier if email doesn't match existing user
          if (emailTo) {
            await NotificationService.createForEmail({
              email: emailTo,
              message: `Invoice ${invoice.invoice_number} has been sent to you`,
              type: 'info',
              link: `/invoices/${invoice.id}`
            });
          }
          
          // Notify admins about invoice being sent
          await NotificationService.createForAdmins({
            message: `Invoice ${invoice.invoice_number} has been sent to ${emailTo}`,
            type: 'info',
            link: `/invoices/${invoice.id}`
          });
        } catch (notifError) {
          console.error("Failed to create invoice email notification:", notifError);
          // Don't fail the request if notification creation fails
        }

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

      // Keep invoice information for notification before deleting
      const invoiceNumber = invoice.invoice_number;
      const invoiceDispatchId = invoice.dispatch_id;
      
      // Get dispatch details if needed for notification
      let dispatchCreatorId = null;
      try {
        const dispatch = await Dispatch.findByPk(invoiceDispatchId);
        dispatchCreatorId = dispatch?.user_id;
      } catch (err) {
        console.error("Error fetching dispatch for invoice deletion notification:", err);
      }
      
      await invoice.destroy();
      
      // Create notification for invoice deletion
      try {
        // Notify the user who deleted the invoice
        if (req.user && req.user.id) {
          await NotificationService.createForUser({
            userId: req.user.id,
            message: `You deleted invoice ${invoiceNumber}`,
            type: 'warning'
          });
        }
        
        // Also notify the dispatch creator if different
        if (dispatchCreatorId && dispatchCreatorId !== req.user.id) {
          await NotificationService.createForUser({
            userId: dispatchCreatorId,
            message: `Invoice ${invoiceNumber} for your dispatch has been deleted`,
            type: 'warning'
          });
        }
        
        // Notify admins about invoice deletion
        await NotificationService.createForAdmins({
          message: `Invoice ${invoiceNumber} has been deleted by ${req.user?.first_name || 'a user'}`,
          type: 'warning'
        });
      } catch (notifError) {
        console.error("Failed to create invoice deletion notification:", notifError);
        // Don't fail the request if notification creation fails
      }

      res.json(successResponse('Invoice deleted successfully'));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json(errorResponse('Error deleting invoice', error.message));
    }
  }
};

module.exports = invoiceController;