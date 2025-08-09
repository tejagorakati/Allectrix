const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const biometricSchema = new mongoose.Schema({
  faceEncoding: {
    type: String, // Base64 encoded face data
    select: false // Don't include in regular queries for security
  },
  fingerprintHash: {
    type: String,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: String
});

const medicalInfoSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [String],
  chronicDiseases: [String],
  medications: [String],
  emergencyInfo: String, // Critical info for emergency access
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const patientSchema = new mongoose.Schema({
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
    required: [true, 'Phone number is required'],
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  
  // Health Card Information
  healthCardId: {
    type: String,
    unique: true,
    required: true
  },
  qrCodeData: {
    type: String,
    required: true
  },
  cardStatus: {
    type: String,
    enum: ['active', 'blocked', 'lost', 'expired'],
    default: 'active'
  },
  cardIssueDate: {
    type: Date,
    default: Date.now
  },
  cardExpiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) // 5 years
  },
  
  // Medical Information
  medicalInfo: medicalInfoSchema,
  
  // Emergency Contacts
  emergencyContacts: [emergencyContactSchema],
  
  // Biometric Data
  biometrics: biometricSchema,
  
  // Privacy Settings
  privacySettings: {
    allowDoctorAccess: {
      type: Boolean,
      default: true
    },
    allowEmergencyAccess: {
      type: Boolean,
      default: true
    },
    shareBasicInfo: {
      type: Boolean,
      default: true
    },
    allowResearch: {
      type: Boolean,
      default: false
    }
  },
  
  // Access Control
  authorizedDoctors: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    accessLevel: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    },
    grantedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  
  // Notification Preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    emergencyOnly: {
      type: Boolean,
      default: false
    }
  },
  
  // Profile Picture
  profilePicture: String,
  
  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Timestamps
  lastLogin: Date,
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

// Index for better performance
patientSchema.index({ healthCardId: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ cardStatus: 1 });

// Pre-save middleware to hash password
patientSchema.pre('save', async function(next) {
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
patientSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get safe patient data (without sensitive info)
patientSchema.methods.getSafeData = function() {
  const patientObject = this.toObject();
  delete patientObject.password;
  delete patientObject.biometrics;
  delete patientObject.verificationToken;
  delete patientObject.resetPasswordToken;
  return patientObject;
};

// Method to get emergency data only
patientSchema.methods.getEmergencyData = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    dateOfBirth: this.dateOfBirth,
    bloodGroup: this.medicalInfo?.bloodGroup,
    allergies: this.medicalInfo?.allergies || [],
    chronicDiseases: this.medicalInfo?.chronicDiseases || [],
    emergencyInfo: this.medicalInfo?.emergencyInfo,
    emergencyContacts: this.emergencyContacts,
    profilePicture: this.profilePicture
  };
};

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

module.exports = mongoose.model('Patient', patientSchema);