const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PatientSchema = new mongoose.Schema({
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
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  
  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  // Health Card Information
  healthCardId: {
    type: String,
    unique: true,
    required: true
  },
  qrCode: {
    type: String, // Base64 encoded QR code
    required: true
  },
  cardStatus: {
    type: String,
    enum: ['active', 'blocked', 'suspended', 'lost'],
    default: 'active'
  },
  cardIssueDate: {
    type: Date,
    default: Date.now
  },
  cardExpiryDate: {
    type: Date,
    required: true
  },
  
  // Biometric Data
  biometricData: {
    faceEncoding: {
      type: String, // Encrypted biometric template
      required: false
    },
    fingerprintTemplate: {
      type: String, // Encrypted fingerprint template
      required: false
    },
    isEnabled: {
      type: Boolean,
      default: false
    }
  },
  
  // Emergency Information
  emergencyContact: {
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
    email: {
      type: String,
      required: false
    }
  },
  
  // Medical Information
  allergies: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    description: String
  }],
  
  chronicDiseases: [{
    name: String,
    diagnosedDate: Date,
    description: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'controlled']
    }
  }],
  
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String
  }],
  
  // Medical Records
  medicalRecords: [{
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord'
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Uploaded Documents
  documents: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    documentType: {
      type: String,
      enum: ['medical_report', 'prescription', 'lab_result', 'scan', 'other']
    }
  }],
  
  // Privacy Settings
  privacySettings: {
    allowEmergencyAccess: {
      type: Boolean,
      default: true
    },
    dataShareConsent: {
      type: Boolean,
      default: false
    },
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
      }
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
    grantedDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Account Settings
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  
  // Blockchain tracking
  blockchainTransactions: [{
    transactionHash: String,
    action: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

// Indexes for better performance
PatientSchema.index({ healthCardId: 1 });
PatientSchema.index({ email: 1 });
PatientSchema.index({ phone: 1 });
PatientSchema.index({ cardStatus: 1 });

// Pre-save middleware to hash password
PatientSchema.pre('save', async function(next) {
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
PatientSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate health card ID
PatientSchema.methods.generateHealthCardId = function() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AC${timestamp.slice(-6)}${random}`;
};

// Virtual for full name
PatientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
PatientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
PatientSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.biometricData.faceEncoding;
    delete ret.biometricData.fingerprintTemplate;
    return ret;
  }
});

module.exports = mongoose.model('Patient', PatientSchema);