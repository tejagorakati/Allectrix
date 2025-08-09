const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DoctorSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  // Two-Factor Authentication
  twoFactorAuth: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    secret: {
      type: String,
      required: false
    },
    backupCodes: [{
      code: String,
      used: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Professional Information
  medicalLicenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: {
    primary: {
      type: String,
      required: true
    },
    secondary: [String]
  },
  qualifications: [String],
  experience: {
    type: Number, // Years of experience
    required: true
  },
  
  // Hospital/Clinic Information
  workplace: {
    name: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'private_practice', 'emergency_services'],
      required: true
    },
    registrationNumber: String
  },
  
  // Digital Signature
  digitalSignature: {
    publicKey: String,
    certificateHash: String,
    issuedBy: String,
    expiryDate: Date
  },
  
  // Access Permissions
  accessLevel: {
    type: String,
    enum: ['basic', 'advanced', 'emergency', 'admin'],
    default: 'basic'
  },
  
  permissions: {
    canViewAllPatients: {
      type: Boolean,
      default: false
    },
    canEditMedicalRecords: {
      type: Boolean,
      default: true
    },
    canAccessEmergencyInfo: {
      type: Boolean,
      default: false
    },
    canPrescribeMedications: {
      type: Boolean,
      default: true
    },
    canRequestLabTests: {
      type: Boolean,
      default: true
    }
  },
  
  // Patient Access History
  patientAccess: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    accessDate: {
      type: Date,
      default: Date.now
    },
    accessType: {
      type: String,
      enum: ['view', 'edit', 'emergency'],
      required: true
    },
    ipAddress: String,
    userAgent: String,
    sessionDuration: Number, // in minutes
    actionsPerformed: [String]
  }],
  
  // Current Active Sessions
  activeSessions: [{
    sessionId: String,
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  
  // Verification Status
  verificationStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    verificationDate: Date,
    documents: [{
      type: {
        type: String,
        enum: ['license', 'degree', 'certificate', 'id_proof']
      },
      filename: String,
      uploadDate: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }]
  },
  
  // Account Status
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated', 'pending_approval'],
    default: 'pending_approval'
  },
  
  // Notification Preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    emergencyAlerts: {
      type: Boolean,
      default: true
    }
  },
  
  // Professional Schedule
  workingHours: {
    monday: { start: String, end: String, isWorking: Boolean },
    tuesday: { start: String, end: String, isWorking: Boolean },
    wednesday: { start: String, end: String, isWorking: Boolean },
    thursday: { start: String, end: String, isWorking: Boolean },
    friday: { start: String, end: String, isWorking: Boolean },
    saturday: { start: String, end: String, isWorking: Boolean },
    sunday: { start: String, end: String, isWorking: Boolean }
  },
  
  // Statistics
  statistics: {
    totalPatientsAccessed: {
      type: Number,
      default: 0
    },
    totalRecordsCreated: {
      type: Number,
      default: 0
    },
    totalEmergencyAccesses: {
      type: Number,
      default: 0
    },
    lastActiveDate: Date
  },
  
  // Login Information
  lastLogin: Date,
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    isLocked: {
      type: Boolean,
      default: false
    },
    lockUntil: Date
  },
  
  // Blockchain tracking
  blockchainTransactions: [{
    transactionHash: String,
    action: String,
    patientId: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

// Indexes for better performance
DoctorSchema.index({ email: 1 });
DoctorSchema.index({ medicalLicenseNumber: 1 });
DoctorSchema.index({ accountStatus: 1 });
DoctorSchema.index({ 'workplace.name': 1 });
DoctorSchema.index({ 'specialization.primary': 1 });

// Pre-save middleware to hash password
DoctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
DoctorSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
DoctorSchema.methods.isLocked = function() {
  return !!(this.loginAttempts.isLocked && this.loginAttempts.lockUntil > Date.now());
};

// Method to increment login attempts
DoctorSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.loginAttempts.lockUntil && this.loginAttempts.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'loginAttempts.lockUntil': 1 },
      $set: {
        'loginAttempts.count': 1,
        'loginAttempts.lastAttempt': Date.now()
      }
    });
  }
  
  const updates = {
    $inc: { 'loginAttempts.count': 1 },
    $set: { 'loginAttempts.lastAttempt': Date.now() }
  };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts.count + 1 >= 5 && !this.loginAttempts.isLocked) {
    updates.$set['loginAttempts.isLocked'] = true;
    updates.$set['loginAttempts.lockUntil'] = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
DoctorSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      'loginAttempts.count': 1,
      'loginAttempts.lastAttempt': 1,
      'loginAttempts.isLocked': 1,
      'loginAttempts.lockUntil': 1
    }
  });
};

// Virtual for full name
DoctorSchema.virtual('fullName').get(function() {
  return `Dr. ${this.firstName} ${this.lastName}`;
});

// Virtual for display specialization
DoctorSchema.virtual('displaySpecialization').get(function() {
  let spec = this.specialization.primary;
  if (this.specialization.secondary && this.specialization.secondary.length > 0) {
    spec += `, ${this.specialization.secondary.join(', ')}`;
  }
  return spec;
});

// Ensure virtual fields are serialized
DoctorSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.twoFactorAuth.secret;
    delete ret.twoFactorAuth.backupCodes;
    return ret;
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);