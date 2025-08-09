const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const qualificationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: true
  },
  institution: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
});

const hospitalAffiliationSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true
  },
  department: String,
  position: String,
  startDate: Date,
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

const doctorSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  
  // Two-Factor Authentication
  twoFactorSecret: {
    type: String,
    select: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  backupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    }
  }],
  
  // Professional Information
  medicalLicenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  subSpecializations: [String],
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0
  },
  
  // Qualifications
  qualifications: [qualificationSchema],
  
  // Hospital Affiliations
  hospitalAffiliations: [hospitalAffiliationSchema],
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verificationDate: Date,
  verificationNotes: String,
  
  // Profile
  profilePicture: String,
  bio: String,
  consultationFee: Number,
  
  // Digital Signature
  digitalSignature: {
    publicKey: String,
    privateKeyHash: {
      type: String,
      select: false
    }
  },
  
  // Access Permissions
  permissions: {
    canAccessEmergencyRecords: {
      type: Boolean,
      default: false
    },
    canModifyRecords: {
      type: Boolean,
      default: true
    },
    canPrescribeMedication: {
      type: Boolean,
      default: true
    },
    canOrderTests: {
      type: Boolean,
      default: true
    }
  },
  
  // Activity Tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  deactivationReason: String,
  deactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Settings
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    emergencyAlerts: {
      type: Boolean,
      default: true
    }
  },
  
  // Statistics
  stats: {
    totalPatientsAccessed: {
      type: Number,
      default: 0
    },
    totalRecordsCreated: {
      type: Number,
      default: 0
    },
    lastPatientAccess: Date
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
doctorSchema.index({ email: 1 });
doctorSchema.index({ medicalLicenseNumber: 1 });
doctorSchema.index({ verificationStatus: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ isActive: 1 });

// Virtual to check if account is locked
doctorSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
doctorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
doctorSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
doctorSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to get safe doctor data (without sensitive info)
doctorSchema.methods.getSafeData = function() {
  const doctorObject = this.toObject();
  delete doctorObject.password;
  delete doctorObject.twoFactorSecret;
  delete doctorObject.backupCodes;
  delete doctorObject.digitalSignature?.privateKeyHash;
  delete doctorObject.loginAttempts;
  delete doctorObject.lockUntil;
  return doctorObject;
};

// Method to get public doctor info for patients
doctorSchema.methods.getPublicInfo = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    specialization: this.specialization,
    subSpecializations: this.subSpecializations,
    yearsOfExperience: this.yearsOfExperience,
    qualifications: this.qualifications.filter(q => q.verificationStatus === 'verified'),
    hospitalAffiliations: this.hospitalAffiliations.filter(h => h.isActive),
    profilePicture: this.profilePicture,
    bio: this.bio,
    consultationFee: this.consultationFee,
    verificationStatus: this.verificationStatus
  };
};

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return `Dr. ${this.firstName} ${this.lastName}`;
});

// Virtual for active qualifications
doctorSchema.virtual('verifiedQualifications').get(function() {
  return this.qualifications.filter(q => q.verificationStatus === 'verified');
});

// Virtual for active hospital affiliations
doctorSchema.virtual('activeAffiliations').get(function() {
  return this.hospitalAffiliations.filter(h => h.isActive);
});

module.exports = mongoose.model('Doctor', doctorSchema);