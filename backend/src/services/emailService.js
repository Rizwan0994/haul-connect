const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  // For development, use Ethereal if no SMTP credentials provided
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('No SMTP credentials found, emails will be logged to console');
    return null;
  }

  return nodemailer.createTransporter(config);
};

async function sendEmail({ to, subject, text, html, attachments }) {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      // Development mode - log email instead of sending
      console.log('📧 Email would be sent:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Text:', text);
      console.log('HTML:', html ? 'HTML content provided' : 'No HTML content');
      console.log('Attachments:', attachments?.length || 0);
      return { messageId: 'dev-mode-' + Date.now() };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Haul Connect Logistics" <noreply@haulconnectlogistics.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
      attachments: attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

async function sendInvoiceEmail({ recipientEmail, invoiceNumber, carrierName, attachmentPath, customMessage }) {
  const subject = `Invoice ${invoiceNumber} - ${carrierName}`;
  const text = customMessage || `
Dear ${carrierName},

Please find attached your invoice.

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Please review and process payment according to the terms specified.

If you have any questions concerning this invoice, please contact our billing department.

Thank you for your business.

Best regards,
Haul Connect Logistics
Email: haulconnect@gmail.com
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .invoice-details { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2 style="color: #1976d2; margin: 0;">Haul Connect Logistics</h2>
        <p style="margin: 5px 0;">Invoice Notification</p>
      </div>
      
      <div class="content">
        <p>Dear ${carrierName},</p>
        
        <p>Please find attached your invoice for the completed transportation services.</p>
        
        <div class="invoice-details">
          <strong>Invoice Number:</strong> ${invoiceNumber}<br>
          <strong>Carrier:</strong> ${carrierName}
        </div>
        
        ${customMessage ? `<p>${customMessage.replace(/\n/g, '<br>')}</p>` : `
        <p>Please review the attached invoice and process payment according to the terms specified. 
        If you have any questions concerning this invoice, please contact our billing department.</p>
        `}
        
        <p>Thank you for your continued partnership with Haul Connect Logistics.</p>
        
        <p>Best regards,<br>
        <strong>Haul Connect Logistics Team</strong></p>
      </div>
      
      <div class="footer">
        <p>Haul Connect Logistics LLC | Email: haulconnect@gmail.com</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const attachments = attachmentPath ? [
    {
      filename: `Invoice-${invoiceNumber}.pdf`,
      path: attachmentPath,
      contentType: 'application/pdf'
    }
  ] : [];

  return sendEmail({
    to: recipientEmail,
    subject,
    text,
    html,
    attachments
  });
}

module.exports = { 
  sendEmail, 
  sendInvoiceEmail 
};