const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Verify patient authentication
const verifyPatient = async (req, res, next) => {
  try {
    if (req.user.userType !== 'patient') {
      return res.status(403).json({ message: 'Access denied. Patient role required.' });
    }
    
    const patient = await Patient.findById(req.user.userId).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (patient.cardStatus === 'blocked') {
      return res.status(403).json({ message: 'Account is blocked. Please contact support.' });
    }
    
    req.patient = patient;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify doctor authentication
const verifyDoctor = async (req, res, next) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor role required.' });
    }
    
    const doctor = await Doctor.findById(req.user.userId).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (!doctor.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact administrator.' });
    }
    
    if (doctor.verificationStatus !== 'verified') {
      return res.status(403).json({ message: 'Account is not verified. Please wait for verification.' });
    }
    
    if (doctor.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked due to multiple failed login attempts.' });
    }
    
    req.doctor = doctor;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify admin authentication
const verifyAdmin = async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    // Add admin model verification if needed
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify emergency access
const verifyEmergencyAccess = (req, res, next) => {
  try {
    // Check if it's emergency access or regular doctor access
    if (req.headers['x-emergency-access'] === 'true') {
      // Emergency access - reduced verification requirements
      // Biometric verification should be handled in the route
      req.isEmergencyAccess = true;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check two-factor authentication for doctors
const verifyTwoFactor = async (req, res, next) => {
  try {
    if (req.doctor && req.doctor.twoFactorEnabled) {
      const twoFactorToken = req.header('x-2fa-token');
      
      if (!twoFactorToken) {
        return res.status(403).json({ 
          message: 'Two-factor authentication required',
          requiresTwoFactor: true 
        });
      }
      
      // Verify 2FA token (implementation depends on 2FA library used)
      // This is a simplified version
      if (!verifyTwoFactorToken(req.doctor.twoFactorSecret, twoFactorToken)) {
        return res.status(403).json({ message: 'Invalid two-factor authentication code' });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to verify 2FA token (simplified)
const verifyTwoFactorToken = (secret, token) => {
  // This would use a library like speakeasy in a real implementation
  // For now, return true for demonstration
  return token && token.length === 6;
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = `${req.ip}:${req.user?.userId || 'anonymous'}`;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, []);
    }
    
    const userAttempts = attempts.get(key);
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    attempts.set(key, validAttempts);
    
    if (validAttempts.length >= maxAttempts) {
      return res.status(429).json({ 
        message: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil((validAttempts[0] + windowMs - now) / 1000)
      });
    }
    
    validAttempts.push(now);
    next();
  };
};

// Verify QR code access
const verifyQRAccess = async (req, res, next) => {
  try {
    const { healthCardId, qrData } = req.body;
    
    if (!healthCardId || !qrData) {
      return res.status(400).json({ message: 'Health card ID and QR data are required' });
    }
    
    const patient = await Patient.findOne({ 
      healthCardId,
      cardStatus: 'active'
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Invalid health card or card is not active' });
    }
    
    // Verify QR data matches
    if (patient.qrCodeData !== qrData) {
      return res.status(403).json({ message: 'Invalid QR code data' });
    }
    
    req.patient = patient;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Audit logging middleware
const auditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Log the action
      const logData = {
        action,
        userId: req.user?.userId,
        userType: req.user?.userType,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        success: res.statusCode < 400,
        endpoint: req.originalUrl,
        method: req.method
      };
      
      // Store audit log (you might want to use a separate logging service)
      console.log('Audit Log:', logData);
      
      // You could also store this in a database
      // AuditLog.create(logData);
      
      originalSend.call(this, body);
    };
    
    next();
  };
};

module.exports = {
  verifyToken,
  verifyPatient,
  verifyDoctor,
  verifyAdmin,
  verifyEmergencyAccess,
  verifyTwoFactor,
  sensitiveOperationLimit,
  verifyQRAccess,
  auditLog
};