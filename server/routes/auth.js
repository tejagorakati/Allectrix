const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { verifyToken, verifyPatient, verifyDoctor, sensitiveOperationLimit } = require('../middleware/auth');
const { generateHealthCardId, generateQRData, generateQRCodeImage } = require('../utils/qrCode');

const router = express.Router();

// Generate JWT token
const generateToken = (userId, userType, expiresIn = '24h') => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Patient Registration
router.post('/patient/register', [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Please select a valid gender')
], async (req, res) => {
  try {
    // Check validation errors
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
      emergencyContacts,
      medicalInfo
    } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this email or phone already exists'
      });
    }

    // Generate health card ID
    const healthCardId = generateHealthCardId();

    // Create patient
    const patient = new Patient({
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      healthCardId,
      emergencyContacts: emergencyContacts || [],
      medicalInfo: medicalInfo || {}
    });

    // Generate QR code
    const qrData = generateQRData(patient);
    const qrCodeImage = await generateQRCodeImage(qrData);
    
    patient.qrCodeData = qrData;

    await patient.save();

    // Generate JWT token
    const token = generateToken(patient._id, 'patient');

    // Send response without sensitive data
    const patientData = patient.getSafeData();

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        patient: patientData,
        token,
        qrCode: qrCodeImage,
        healthCard: {
          id: healthCardId,
          qrData,
          status: 'active',
          issueDate: patient.cardIssueDate,
          expiryDate: patient.cardExpiryDate
        }
      }
    });

  } catch (error) {
    console.error('Patient registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Patient Login
router.post('/patient/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Find patient with password field
    const patient = await Patient.findOne({ email }).select('+password');
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is blocked
    if (patient.cardStatus === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    patient.lastLogin = new Date();
    await patient.save();

    // Generate token
    const token = generateToken(patient._id, 'patient');

    // Get safe patient data
    const patientData = patient.getSafeData();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        patient: patientData,
        token
      }
    });

  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Doctor Registration
router.post('/doctor/register', [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('medicalLicenseNumber').notEmpty().withMessage('Medical license number is required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('yearsOfExperience').isInt({ min: 0 }).withMessage('Years of experience must be a positive number')
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

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      medicalLicenseNumber,
      specialization,
      subSpecializations,
      yearsOfExperience,
      qualifications,
      hospitalAffiliations,
      bio
    } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({
      $or: [{ email }, { medicalLicenseNumber }]
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email or license number already exists'
      });
    }

    // Create doctor
    const doctor = new Doctor({
      firstName,
      lastName,
      email,
      phone,
      password,
      medicalLicenseNumber,
      specialization,
      subSpecializations: subSpecializations || [],
      yearsOfExperience,
      qualifications: qualifications || [],
      hospitalAffiliations: hospitalAffiliations || [],
      bio
    });

    await doctor.save();

    // Get safe doctor data
    const doctorData = doctor.getSafeData();

    res.status(201).json({
      success: true,
      message: 'Doctor registration submitted. Please wait for admin verification.',
      data: {
        doctor: doctorData,
        verificationStatus: 'pending'
      }
    });

  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Doctor Login
router.post('/doctor/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password, twoFactorToken } = req.body;

    // Find doctor with password field
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Prevent timing attacks
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (doctor.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check if account is active and verified
    if (!doctor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (doctor.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: `Account verification is ${doctor.verificationStatus}`
      });
    }

    // Verify password
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      await doctor.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check 2FA if enabled
    if (doctor.twoFactorEnabled) {
      if (!twoFactorToken) {
        return res.status(403).json({
          success: false,
          message: 'Two-factor authentication code required',
          requiresTwoFactor: true
        });
      }

      // Verify 2FA token (simplified for demo)
      if (twoFactorToken.length !== 6) {
        return res.status(403).json({
          success: false,
          message: 'Invalid two-factor authentication code'
        });
      }
    }

    // Reset login attempts on successful login
    if (doctor.loginAttempts > 0) {
      await doctor.resetLoginAttempts();
    }

    // Update last login
    doctor.lastLogin = new Date();
    await doctor.save();

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    // Get safe doctor data
    const doctorData = doctor.getSafeData();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        doctor: doctorData,
        token
      }
    });

  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Forgot Password (Patient)
router.post('/patient/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const { email } = req.body;
    
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'No patient found with this email address'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    patient.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    patient.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await patient.save();

    // TODO: Send reset email
    console.log('Reset token:', resetToken);

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Reset Password (Patient)
router.put('/patient/reset-password/:token', [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const patient = await Patient.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    patient.password = req.body.password;
    patient.resetPasswordToken = undefined;
    patient.resetPasswordExpire = undefined;

    await patient.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get Current User (Patient)
router.get('/patient/me', verifyToken, verifyPatient, async (req, res) => {
  try {
    const patientData = req.patient.getSafeData();
    
    res.json({
      success: true,
      data: {
        patient: patientData
      }
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get Current User (Doctor)
router.get('/doctor/me', verifyToken, verifyDoctor, async (req, res) => {
  try {
    const doctorData = req.doctor.getSafeData();
    
    res.json({
      success: true,
      data: {
        doctor: doctorData
      }
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Refresh Token
router.post('/refresh-token', verifyToken, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    
    // Generate new token
    const newToken = generateToken(userId, userType);
    
    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Logout (optional - client-side token removal)
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Token blacklisting could be implemented here
    // For now, client should remove token
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Verify Token Endpoint
router.get('/verify-token', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
        valid: true
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;