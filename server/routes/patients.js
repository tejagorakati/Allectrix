const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const { generateHealthCardId, encryptBiometricData } = require('../utils/crypto');
const { sendWelcomeEmail, sendSMS } = require('../utils/notifications');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Patient Registration
router.post('/register', [
  // Validation middleware
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('emergencyContact.name').trim().isLength({ min: 2 }).withMessage('Emergency contact name is required'),
  body('emergencyContact.phone').isMobilePhone().withMessage('Valid emergency contact phone is required'),
  body('emergencyContact.relationship').trim().isLength({ min: 2 }).withMessage('Emergency contact relationship is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      bloodGroup,
      emergencyContact,
      allergies,
      chronicDiseases,
      medications
    } = req.body;

    // Check if user already exists
    const existingPatient = await Patient.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'Patient already exists with this email or phone number'
      });
    }

    // Generate unique health card ID
    const healthCardId = Patient.generateHealthCardId();

    // Generate QR code with health card data
    const qrData = {
      healthCardId,
      patientName: `${firstName} ${lastName}`,
      bloodGroup: bloodGroup || 'Unknown',
      emergencyContact: emergencyContact.phone,
      issueDate: new Date().toISOString()
    };

    const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Calculate card expiry date (5 years from now)
    const cardExpiryDate = new Date();
    cardExpiryDate.setFullYear(cardExpiryDate.getFullYear() + 5);

    // Create new patient
    const patient = new Patient({
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      bloodGroup,
      healthCardId,
      qrCode: qrCodeString,
      cardExpiryDate,
      emergencyContact,
      allergies: allergies || [],
      chronicDiseases: chronicDiseases || [],
      medications: medications || []
    });

    await patient.save();

    // Create audit log
    await AuditLog.createLog({
      action: 'user_register',
      userId: patient._id,
      userType: 'Patient',
      userName: patient.fullName,
      userEmail: patient.email,
      description: `New patient registered: ${patient.fullName}`,
      category: 'authentication',
      severity: 'medium',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    // Send welcome email and SMS
    try {
      await sendWelcomeEmail(patient);
      await sendSMS(patient.phone, `Welcome to Arogya Card! Your Health Card ID is: ${healthCardId}`);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail registration if notifications fail
    }

    // Remove sensitive data from response
    const patientResponse = patient.toJSON();
    delete patientResponse.password;

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        patient: patientResponse,
        healthCard: {
          cardId: healthCardId,
          qrCode: qrCodeString,
          expiryDate: cardExpiryDate
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Create audit log for failed registration
    await AuditLog.createLog({
      action: 'user_register',
      userId: null,
      userType: 'Patient',
      userName: req.body.firstName + ' ' + req.body.lastName,
      userEmail: req.body.email,
      description: `Failed patient registration: ${error.message}`,
      category: 'authentication',
      severity: 'high',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'failure',
      errorMessage: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Upload medical documents
router.post('/upload-documents', auth, upload.array('documents', 10), async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Process uploaded files
    const uploadedDocuments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      documentType: req.body.documentType || 'other',
      uploadDate: new Date()
    }));

    // Add documents to patient record
    patient.documents.push(...uploadedDocuments);
    await patient.save();

    // Create audit log
    await AuditLog.createLog({
      action: 'file_upload',
      userId: patient._id,
      userType: 'Patient',
      userName: patient.fullName,
      userEmail: patient.email,
      description: `Uploaded ${uploadedDocuments.length} medical documents`,
      category: 'data_modification',
      severity: 'low',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success',
      metadata: new Map([
        ['fileCount', uploadedDocuments.length],
        ['totalSize', uploadedDocuments.reduce((sum, doc) => sum + doc.size, 0)]
      ])
    });

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      data: {
        uploadedFiles: uploadedDocuments
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get patient profile
router.get('/profile', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id)
      .select('-password')
      .populate('medicalRecords.recordId');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Create audit log
    await AuditLog.createLog({
      action: 'profile_viewed',
      userId: patient._id,
      userType: 'Patient',
      userName: patient.fullName,
      userEmail: patient.email,
      description: 'Patient viewed their profile',
      category: 'data_access',
      severity: 'low',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      data: { patient }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update patient profile
router.put('/profile', auth, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().isMobilePhone(),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Store old data for audit log
    const oldData = {
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      bloodGroup: patient.bloodGroup
    };

    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'bloodGroup', 'emergencyContact', 'allergies', 'chronicDiseases'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(patient, updates);
    await patient.save();

    // Create audit log
    await AuditLog.createLog({
      action: 'profile_updated',
      userId: patient._id,
      userType: 'Patient',
      userName: patient.fullName,
      userEmail: patient.email,
      description: 'Patient updated their profile',
      category: 'data_modification',
      severity: 'medium',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success',
      dataChanges: {
        before: oldData,
        after: updates,
        fieldsChanged: Object.keys(updates)
      }
    });

    const updatedPatient = patient.toJSON();
    delete updatedPatient.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { patient: updatedPatient }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get health card information
router.get('/health-card', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('healthCardId qrCode cardStatus cardIssueDate cardExpiryDate firstName lastName bloodGroup');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: {
        healthCard: {
          cardId: patient.healthCardId,
          qrCode: patient.qrCode,
          status: patient.cardStatus,
          patientName: patient.fullName,
          bloodGroup: patient.bloodGroup,
          issueDate: patient.cardIssueDate,
          expiryDate: patient.cardExpiryDate
        }
      }
    });

  } catch (error) {
    console.error('Health card fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health card',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Report lost/stolen card
router.post('/report-lost-card', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update card status
    const oldStatus = patient.cardStatus;
    patient.cardStatus = 'lost';
    await patient.save();

    // Create audit log
    await AuditLog.createLog({
      action: 'card_blocked',
      userId: patient._id,
      userType: 'Patient',
      userName: patient.fullName,
      userEmail: patient.email,
      targetIdentifier: patient.healthCardId,
      description: 'Patient reported card as lost/stolen',
      category: 'security',
      severity: 'high',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success',
      dataChanges: {
        before: { cardStatus: oldStatus },
        after: { cardStatus: 'lost' },
        fieldsChanged: ['cardStatus']
      }
    });

    // Send notification
    try {
      await sendSMS(patient.phone, 'ALERT: Your Arogya Card has been reported as lost and temporarily blocked. Contact support if this was not you.');
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    res.json({
      success: true,
      message: 'Card has been reported as lost and temporarily blocked',
      data: {
        cardStatus: 'lost',
        reportedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Card blocking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report lost card',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update biometric data
router.post('/biometric', auth, async (req, res) => {
  try {
    const { faceEncoding, fingerprintTemplate } = req.body;
    
    if (!faceEncoding && !fingerprintTemplate) {
      return res.status(400).json({
        success: false,
        message: 'At least one biometric data type is required'
      });
    }

    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Encrypt biometric data
    const encryptedBiometrics = {};
    if (faceEncoding) {
      encryptedBiometrics.faceEncoding = encryptBiometricData(faceEncoding);
    }
    if (fingerprintTemplate) {
      encryptedBiometrics.fingerprintTemplate = encryptBiometricData(fingerprintTemplate);
    }

    // Update patient biometric data
    patient.biometricData = {
      ...patient.biometricData.toObject(),
      ...encryptedBiometrics,
      isEnabled: true
    };

    await patient.save();

    // Create audit log
    await AuditLog.createLog({
      action: 'biometric_updated',
      userId: patient._id,
      userType: 'Patient',
      userName: patient.fullName,
      userEmail: patient.email,
      description: 'Patient updated biometric data',
      category: 'security',
      severity: 'medium',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Biometric data updated successfully',
      data: {
        biometricEnabled: true,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Biometric update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update biometric data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get patient documents
router.get('/documents', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('documents');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: {
        documents: patient.documents
      }
    });

  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Download document
router.get('/documents/:filename', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const document = patient.documents.find(doc => doc.filename === req.params.filename);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const filePath = path.join(__dirname, '../uploads', document.filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Create audit log
    await AuditLog.createLog({
      action: 'file_download',
      userId: patient._id,
      userType: 'Patient',
      userName: patient.fullName,
      userEmail: patient.email,
      description: `Downloaded document: ${document.originalName}`,
      category: 'data_access',
      severity: 'low',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.download(filePath, document.originalName);

  } catch (error) {
    console.error('Document download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;