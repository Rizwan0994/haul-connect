const { smtp_settings: SMTPSettings } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Encryption key for passwords (in production, use a proper key management system)
const ENCRYPTION_KEY = process.env.SMTP_ENCRYPTION_KEY || 'default-32-char-key-for-encryption';
const IV_LENGTH = 16; // For AES, this is always 16

// Encrypt password before storing
const encryptPassword = (password) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt password when retrieving
const decryptPassword = (encryptedPassword) => {
  try {
    const textParts = encryptedPassword.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error decrypting password:', error);
    return encryptedPassword; // Return as-is if decryption fails
  }
};

/**
 * @swagger
 * /api/smtp-settings:
 *   get:
 *     summary: Get all SMTP configurations
 *     tags: [SMTP Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of SMTP configurations
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const getAllSMTPSettings = async (req, res) => {
  try {
    const smtpSettings = await SMTPSettings.findAll({
      attributes: {
        exclude: ['password'] // Don't expose encrypted passwords
      },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: smtpSettings
    });
  } catch (error) {
    console.error('Error fetching SMTP settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SMTP settings',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/smtp-settings/{id}:
 *   get:
 *     summary: Get SMTP configuration by ID
 *     tags: [SMTP Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: SMTP configuration details
 *       404:
 *         description: SMTP configuration not found
 *       500:
 *         description: Server error
 */
const getSMTPSettingsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const smtpSettings = await SMTPSettings.findByPk(id, {
      attributes: {
        exclude: ['password'] // Don't expose encrypted passwords
      }
    });

    if (!smtpSettings) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    res.json({
      success: true,
      data: smtpSettings
    });
  } catch (error) {
    console.error('Error fetching SMTP settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SMTP settings',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/smtp-settings:
 *   post:
 *     summary: Create new SMTP configuration
 *     tags: [SMTP Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - host
 *               - port
 *               - username
 *               - password
 *               - from_email
 *             properties:
 *               name:
 *                 type: string
 *               host:
 *                 type: string
 *               port:
 *                 type: integer
 *               secure:
 *                 type: boolean
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               from_email:
 *                 type: string
 *               from_name:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: SMTP configuration created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
const createSMTPSettings = async (req, res) => {
  try {
    const {
      name,
      host,
      port,
      secure,
      username,
      password,
      from_email,
      from_name,
      is_default
    } = req.body;

    // Validate required fields
    if (!name || !host || !port || !username || !password || !from_email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Encrypt password before storing
    const encryptedPassword = encryptPassword(password);

    const smtpSettings = await SMTPSettings.create({
      name,
      host,
      port: parseInt(port),
      secure: secure || false,
      username,
      password: encryptedPassword,
      from_email,
      from_name: from_name || 'Haul Connect Logistics',
      is_default: is_default || false,
      created_by: req.user?.id
    });

    // Return without sensitive data
    const { password: _, ...safeData } = smtpSettings.toJSON();

    res.status(201).json({
      success: true,
      message: 'SMTP configuration created successfully',
      data: safeData
    });
  } catch (error) {
    console.error('Error creating SMTP settings:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'SMTP configuration with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating SMTP settings',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/smtp-settings/{id}:
 *   put:
 *     summary: Update SMTP configuration
 *     tags: [SMTP Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               host:
 *                 type: string
 *               port:
 *                 type: integer
 *               secure:
 *                 type: boolean
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               from_email:
 *                 type: string
 *               from_name:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: SMTP configuration updated successfully
 *       404:
 *         description: SMTP configuration not found
 *       500:
 *         description: Server error
 */
const updateSMTPSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const smtpSettings = await SMTPSettings.findByPk(id);
    if (!smtpSettings) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    // Encrypt password if provided
    if (updateData.password) {
      updateData.password = encryptPassword(updateData.password);
    }

    // Add updated_by
    updateData.updated_by = req.user?.id;

    await smtpSettings.update(updateData);

    // Return updated data without password
    const { password: _, ...safeData } = smtpSettings.toJSON();

    res.json({
      success: true,
      message: 'SMTP configuration updated successfully',
      data: safeData
    });
  } catch (error) {
    console.error('Error updating SMTP settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating SMTP settings',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/smtp-settings/{id}:
 *   delete:
 *     summary: Delete SMTP configuration
 *     tags: [SMTP Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: SMTP configuration deleted successfully
 *       404:
 *         description: SMTP configuration not found
 *       400:
 *         description: Cannot delete default configuration
 *       500:
 *         description: Server error
 */
const deleteSMTPSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const smtpSettings = await SMTPSettings.findByPk(id);
    if (!smtpSettings) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    // Don't allow deletion of default configuration
    if (smtpSettings.is_default) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default SMTP configuration'
      });
    }

    await smtpSettings.destroy();

    res.json({
      success: true,
      message: 'SMTP configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SMTP settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting SMTP settings',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/smtp-settings/{id}/test:
 *   post:
 *     summary: Test SMTP configuration
 *     tags: [SMTP Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - test_email
 *             properties:
 *               test_email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *       400:
 *         description: Invalid email or configuration
 *       404:
 *         description: SMTP configuration not found
 *       500:
 *         description: Test failed
 */
const testSMTPSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { test_email } = req.body;

    if (!test_email) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required'
      });
    }

    const smtpSettingsDB = await SMTPSettings.findByPk(id);
    const smtpSettings=smtpSettingsDB.dataValues
    console.log("smtpSettings",smtpSettings)
    if (!smtpSettings) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    // Decrypt password for testing
    const decryptedPassword = decryptPassword(smtpSettings.password);
    console.log("decryptedPassword",decryptedPassword)

    // Create test transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.secure,
      auth: {
        user: smtpSettings.username,
        pass: decryptedPassword
      }
    });

    // Test connection first
    await transporter.verify();

    // Send test email
    const testEmailContent = {
      from: `"${smtpSettings.from_name}" <${smtpSettings.from_email}>`,
      to: test_email,
      subject: 'SMTP Configuration Test - Haul Connect Logistics',
      text: `
Hello,

This is a test email to verify that your SMTP configuration is working correctly.

SMTP Configuration Details:
- Name: ${smtpSettings.name}
- Host: ${smtpSettings.host}
- Port: ${smtpSettings.port}
- Secure: ${smtpSettings.secure ? 'Yes' : 'No'}
- Username: ${smtpSettings.username}

If you received this email, your SMTP configuration is working properly!

Best regards,
Haul Connect Logistics Team
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; }
            .config-details { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 5px; }
            .success { color: #28a745; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="color: #1976d2; margin: 0;">🎉 SMTP Test Successful!</h2>
            <p style="margin: 5px 0;">Haul Connect Logistics</p>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            
            <p class="success">✅ Your SMTP configuration is working correctly!</p>
            
            <p>This is a test email to verify that your SMTP configuration is working properly.</p>
            
            <div class="config-details">
              <strong>SMTP Configuration Details:</strong><br>
              <strong>Name:</strong> ${smtpSettings.name}<br>
              <strong>Host:</strong> ${smtpSettings.host}<br>
              <strong>Port:</strong> ${smtpSettings.port}<br>
              <strong>Secure:</strong> ${smtpSettings.secure ? 'Yes (SSL/TLS)' : 'No'}<br>
              <strong>Username:</strong> ${smtpSettings.username}
            </div>
            
            <p>If you received this email, your SMTP configuration is ready to use for sending invoices and other notifications.</p>
            
            <p>Best regards,<br>
            <strong>Haul Connect Logistics Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated test email from Haul Connect Logistics SMTP Configuration.</p>
            <p>Test sent at: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(testEmailContent);

    // Update test information in database
    await smtpSettings.update({
      test_email,
      last_tested_at: new Date(),
      test_status: 'success',
      test_error: null
    });

    res.json({
      success: true,
      message: 'Test email sent successfully!',
      data: {
        messageId: result.messageId,
        test_email,
        tested_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('SMTP test failed:', error);

    // Update test failure in database
    try {
      const smtpSettings = await SMTPSettings.findByPk(req.params.id);
      if (smtpSettings) {
        await smtpSettings.update({
          test_email: req.body.test_email,
          last_tested_at: new Date(),
          test_status: 'failed',
          test_error: error.message
        });
      }
    } catch (dbError) {
      console.error('Error updating test failure:', dbError);
    }

    res.status(500).json({
      success: false,
      message: 'SMTP test failed',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/smtp-settings/{id}/set-default:
 *   put:
 *     summary: Set SMTP configuration as default
 *     tags: [SMTP Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Default SMTP configuration updated
 *       404:
 *         description: SMTP configuration not found
 *       500:
 *         description: Server error
 */
const setDefaultSMTPSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const smtpSettings = await SMTPSettings.findByPk(id);
    if (!smtpSettings) {
      return res.status(404).json({
        success: false,
        message: 'SMTP configuration not found'
      });
    }

    // Update this configuration as default (hooks will handle unsetting others)
    await smtpSettings.update({
      is_default: true,
      updated_by: req.user?.id
    });

    res.json({
      success: true,
      message: 'Default SMTP configuration updated successfully'
    });
  } catch (error) {
    console.error('Error setting default SMTP settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default SMTP settings',
      error: error.message
    });
  }
};

// Helper function to get default SMTP settings for email service
const getDefaultSMTPSettings = async () => {
  try {
    const defaultSettings = await SMTPSettings.findOne({
      where: {
        is_default: true,
        is_active: true
      }
    });

    if (!defaultSettings) {
      return null;
    }

    return {
      ...defaultSettings.toJSON(),
      password: decryptPassword(defaultSettings.password)
    };
  } catch (error) {
    console.error('Error getting default SMTP settings:', error);
    return null;
  }
};

module.exports = {
  getAllSMTPSettings,
  getSMTPSettingsById,
  createSMTPSettings,
  updateSMTPSettings,
  deleteSMTPSettings,
  testSMTPSettings,
  setDefaultSMTPSettings,
  getDefaultSMTPSettings,
  encryptPassword,
  decryptPassword
};
