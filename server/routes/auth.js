const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const AuditLog = require('../models/AuditLog');
const { generateToken, authRateLimit } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/notifications');
const crypto = require('crypto');

const router = express.Router();

// Patient Login
router.post('/patient/login', authRateLimit, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
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

    // Find patient by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      await AuditLog.createLog({
        action: 'user_login',
        userId: null,
        userType: 'Patient',
        userName: 'Unknown',
        userEmail: email,
        description: `Failed login attempt - patient not found: ${email}`,
        category: 'authentication',
        severity: 'medium',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        errorMessage: 'Patient not found'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!patient.isActive) {
      await AuditLog.createLog({
        action: 'user_login',
        userId: patient._id,
        userType: 'Patient',
        userName: patient.fullName,
        userEmail: patient.email,
        description: 'Failed login attempt - account inactive',
        category: 'authentication',
        severity: 'medium',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        errorMessage: 'Account inactive'
      });

      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await patient.comparePassword(password);
    if (!isValidPassword) {
      await AuditLog.createLog({
        action: 'user_login',
        userId: patient._id,
        userType: 'Patient',
        userName: patient.fullName,
        userEmail: patient.email,
        description: 'Failed login attempt - invalid password',
        category: 'authentication',
        severity: 'medium',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        errorMessage: 'Invalid password'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(patient, 'Patient');

    // Update last login
    patient.lastLogin = new Date();
    await patient.save();

    // Create successful login audit log
    await AuditLog.createLog({
      action: 'user_login',
      userId: patient._id,
      userType: 'Patient',
      userName: patient.fullName,
      userEmail: patient.email,
      description: 'Successful patient login',
      category: 'authentication',
      severity: 'low',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    // Remove sensitive data
    const patientData = patient.toJSON();
    delete patientData.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: patientData,
        token,
        userType: 'Patient'
      }
    });

  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Doctor Login
router.post('/doctor/login', authRateLimit, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
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

    const { email, password, twoFactorCode } = req.body;

    // Find doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      await AuditLog.createLog({
        action: 'user_login',
        userId: null,
        userType: 'Doctor',
        userName: 'Unknown',
        userEmail: email,
        description: `Failed login attempt - doctor not found: ${email}`,
        category: 'authentication',
        severity: 'medium',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        errorMessage: 'Doctor not found'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (doctor.isLocked()) {
      await AuditLog.createLog({
        action: 'user_login',
        userId: doctor._id,
        userType: 'Doctor',
        userName: doctor.fullName,
        userEmail: doctor.email,
        description: 'Failed login attempt - account locked',
        category: 'authentication',
        severity: 'high',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        errorMessage: 'Account locked'
      });

      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts'
      });
    }

    // Check account status
    if (doctor.accountStatus !== 'active') {
      await AuditLog.createLog({
        action: 'user_login',
        userId: doctor._id,
        userType: 'Doctor',
        userName: doctor.fullName,
        userEmail: doctor.email,
        description: `Failed login attempt - account status: ${doctor.accountStatus}`,
        category: 'authentication',
        severity: 'medium',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        errorMessage: `Account ${doctor.accountStatus}`
      });

      return res.status(401).json({
        success: false,
        message: `Account is ${doctor.accountStatus}. Please contact administrator.`
      });
    }

    // Verify password
    const isValidPassword = await doctor.comparePassword(password);
    if (!isValidPassword) {
      // Increment failed login attempts
      await doctor.incLoginAttempts();

      await AuditLog.createLog({
        action: 'user_login',
        userId: doctor._id,
        userType: 'Doctor',
        userName: doctor.fullName,
        userEmail: doctor.email,
        description: 'Failed login attempt - invalid password',
        category: 'authentication',
        severity: 'medium',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        errorMessage: 'Invalid password'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if 2FA is enabled and verify code
    if (doctor.twoFactorAuth.isEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: false,
          message: 'Two-factor authentication code required',
          requiresTwoFactor: true
        });
      }

      // Verify 2FA code (implement with speakeasy or similar)
      // For now, we'll skip this implementation
    }

    // Generate token
    const token = generateToken(doctor, 'Doctor');

    // Update last login and reset failed attempts
    doctor.lastLogin = new Date();
    await doctor.resetLoginAttempts();
    await doctor.save();

    // Create successful login audit log
    await AuditLog.createLog({
      action: 'user_login',
      userId: doctor._id,
      userType: 'Doctor',
      userName: doctor.fullName,
      userEmail: doctor.email,
      description: 'Successful doctor login',
      category: 'authentication',
      severity: 'low',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success',
      authenticationMethod: doctor.twoFactorAuth.isEnabled ? '2fa' : 'password'
    });

    // Remove sensitive data
    const doctorData = doctor.toJSON();
    delete doctorData.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: doctorData,
        token,
        userType: 'Doctor'
      }
    });

  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // In a production environment, you would add this token to a blacklist
      // For now, we'll just log the logout
      
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
        
        await AuditLog.createLog({
          action: 'user_logout',
          userId: decoded.id,
          userType: decoded.userType,
          userName: 'User',
          userEmail: decoded.email,
          description: 'User logged out',
          category: 'authentication',
          severity: 'low',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          status: 'success'
        });
      } catch (jwtError) {
        // Token might be expired or invalid, which is fine for logout
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Token verification endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Find user based on type
    let user;
    if (decoded.userType === 'Patient') {
      user = await Patient.findById(decoded.id).select('-password');
    } else if (decoded.userType === 'Doctor') {
      user = await Doctor.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        userType: decoded.userType
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Password reset request
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('userType').isIn(['Patient', 'Doctor']).withMessage('Valid user type is required')
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

    const { email, userType } = req.body;

    // Find user based on type
    let user;
    if (userType === 'Patient') {
      user = await Patient.findOne({ email });
    } else if (userType === 'Doctor') {
      user = await Doctor.findOne({ email });
    }

    if (!user) {
      // Don't reveal whether user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token (you would need to add these fields to your models)
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user, resetToken);

    // Create audit log
    await AuditLog.createLog({
      action: 'password_reset_requested',
      userId: user._id,
      userType: userType,
      userName: user.fullName || `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      description: 'Password reset requested',
      category: 'authentication',
      severity: 'medium',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Password reset
router.post('/reset-password', [
  body('token').isLength({ min: 1 }).withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('userType').isIn(['Patient', 'Doctor']).withMessage('Valid user type is required')
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

    const { token, password, userType } = req.body;

    // Find user with reset token
    let user;
    if (userType === 'Patient') {
      user = await Patient.findOne({
        passwordResetToken: token,
        passwordResetExpiry: { $gt: new Date() }
      });
    } else if (userType === 'Doctor') {
      user = await Doctor.findOne({
        passwordResetToken: token,
        passwordResetExpiry: { $gt: new Date() }
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    // Create audit log
    await AuditLog.createLog({
      action: 'password_changed',
      userId: user._id,
      userType: userType,
      userName: user.fullName || `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      description: 'Password reset completed',
      category: 'authentication',
      severity: 'medium',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;