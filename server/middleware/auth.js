const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const AuditLog = require('../models/AuditLog');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
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
        message: 'Token is not valid.'
      });
    }

    // Check if user account is active
    if (decoded.userType === 'Patient' && !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    if (decoded.userType === 'Doctor' && user.accountStatus !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Doctor account is not active.'
      });
    }

    // Add user info to request
    req.user = {
      id: user._id,
      email: user.email,
      userType: decoded.userType,
      ...user.toObject()
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Create audit log for failed authentication
    try {
      await AuditLog.createLog({
        action: 'authentication_failed',
        userId: null,
        userType: 'Unknown',
        userName: 'Unknown',
        userEmail: 'Unknown',
        description: `Authentication failed: ${error.message}`,
        category: 'authentication',
        severity: 'medium',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        errorMessage: error.message
      });
    } catch (logError) {
      console.error('Failed to create audit log:', logError);
    }

    res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

// Middleware for doctor-specific routes
const doctorAuth = async (req, res, next) => {
  try {
    // First run standard auth
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is a doctor
    if (req.user.userType !== 'Doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor privileges required.'
      });
    }

    // Check if doctor is verified and active
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor.verificationStatus.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Doctor account not verified.'
      });
    }

    if (doctor.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Doctor account is not active.'
      });
    }

    next();
  } catch (error) {
    console.error('Doctor auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Middleware for patient-specific routes
const patientAuth = async (req, res, next) => {
  try {
    // First run standard auth
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is a patient
    if (req.user.userType !== 'Patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Patient privileges required.'
      });
    }

    // Check if patient account is active
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Patient account is not active.'
      });
    }

    next();
  } catch (error) {
    console.error('Patient auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Middleware for admin routes
const adminAuth = async (req, res, next) => {
  try {
    // First run standard auth
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user has admin privileges
    if (req.user.userType === 'Doctor' && req.user.accessLevel !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Middleware for emergency access
const emergencyAuth = async (req, res, next) => {
  try {
    const { emergencyCode, biometricData } = req.body;
    
    // Emergency access can bypass normal authentication in specific scenarios
    if (emergencyCode === process.env.EMERGENCY_ACCESS_CODE) {
      // Log emergency access
      await AuditLog.createLog({
        action: 'emergency_access',
        userId: null,
        userType: 'Emergency',
        userName: 'Emergency Personnel',
        userEmail: 'emergency@system.local',
        description: 'Emergency access granted using emergency code',
        category: 'authentication',
        severity: 'critical',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'success'
      });

      req.user = {
        id: 'emergency',
        userType: 'Emergency',
        isEmergencyAccess: true
      };
      
      return next();
    }

    // Otherwise, require normal authentication
    auth(req, res, next);
  } catch (error) {
    console.error('Emergency auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Rate limiting middleware for authentication attempts
const authRateLimit = (req, res, next) => {
  // This could be enhanced with Redis for production
  const clientIP = req.ip || req.connection.remoteAddress;
  const key = `auth_attempts:${clientIP}`;
  
  // Simple in-memory rate limiting (replace with Redis in production)
  if (!global.authAttempts) {
    global.authAttempts = new Map();
  }

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempts = global.authAttempts.get(key) || [];
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(time => now - time < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil((windowMs - (now - recentAttempts[0])) / 1000)
    });
  }

  // Add current attempt
  recentAttempts.push(now);
  global.authAttempts.set(key, recentAttempts);

  next();
};

// Token generation utility
const generateToken = (user, userType, expiresIn = '7d') => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      userType
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn }
  );
};

// Token refresh utility
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required.'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
    
    let user;
    if (decoded.userType === 'Patient') {
      user = await Patient.findById(decoded.id);
    } else if (decoded.userType === 'Doctor') {
      user = await Doctor.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    const newToken = generateToken(user, decoded.userType);
    
    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id,
          email: user.email,
          userType: decoded.userType
        }
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token.'
    });
  }
};

module.exports = {
  auth,
  doctorAuth,
  patientAuth,
  adminAuth,
  emergencyAuth,
  authRateLimit,
  generateToken,
  refreshToken
};