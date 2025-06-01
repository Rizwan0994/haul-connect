const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { user: User, user_document:UserDocument } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and documents
  if (file.fieldname === 'photo') {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed for photos!'), false);
    }
  } else if (file.fieldname === 'document') {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/)) {
      return cb(new Error('Only image, PDF, and document files are allowed!'), false);
    }
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max file size
  }
});

const router = express.Router();

// Update profile information
// Get profile information
router.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
      // Find user with all profile details
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
      // Return user data without sensitive information
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      sudoName: user.username,
      fatherName: user.fatherName,
      address: user.address,
      contact: user.contact,
      cnic: user.cnic,
      experience: user.experience,
      department: user.department,
      onboardDate: user.createdAt,
      lastLogin: user.lastLogin,
      lastLoginIp: user.lastLoginIp,
      photoUrl: user.photoUrl,
      role: user.role,
      category: user.category
    };
    
    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile information'
    });
  }
});

router.put('/api/profile', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { firstName, lastName, sudoName, fatherName, address, contact, cnic, experience } = req.body;
    const userId = req.user.id;

    // Update user profile in database - map camelCase to database fields
    const updateData = {
      first_name: firstName,
      last_name: lastName,
      username: sudoName,
      fatherName,
      address,
      contact,
      cnic,
      experience
    };
    
    // Add photo URL if a file was uploaded
    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
    }
      await User.update(
      updateData,
      {
        where: { id: userId }
      }
    );
    
    // Get updated user data
    const updatedUser = await User.findByPk(userId);

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        sudoName: updatedUser.username,
        fatherName: updatedUser.fatherName,
        address: updatedUser.address,
        contact: updatedUser.contact,
        cnic: updatedUser.cnic,
        experience: updatedUser.experience,
        photoUrl: updatedUser.photoUrl
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Update password
router.put('/api/profile/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }    // Get user
    const user = await User.findByPk(userId);

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
});

// Get all user documents
router.get('/api/profile/documents', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
      // Find all documents for the current user
    const documents = await UserDocument.findAll({
      where: { user_id:userId },
      order: [['created_at', 'DESC']]
    });
      res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        documentName: doc.document_name,
        filePath: doc.document_url,
        uploadedAt: doc.created_at
      }))
    });
  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// Upload documents
router.post('/api/profile/documents', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get document name from request or use original filename
    const documentName = req.body.documentName || req.file.originalname;    // Save document reference in database
    const document = await UserDocument.create({
      userId: req.user.id,
      documentUrl: `/uploads/${req.file.filename}`,
      documentName: documentName
    });    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        documentName: document.documentName,
        filePath: document.documentUrl,
        uploadedAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

// Delete document
router.delete('/api/profile/documents/:id', authenticateToken, async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
      // Find the document
    const document = await UserDocument.findOne({
      where: {
        id: documentId,
        userId: userId
      }
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or you do not have permission to delete it'
      });
    }
    
    // Remove the actual file
    const filePath = path.join(process.cwd(), document.documentUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove database entry
    await document.destroy();
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Document delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

module.exports = router;
