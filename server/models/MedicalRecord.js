const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  duration: String,
  instructions: String,
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  }
});

const testResultSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    enum: ['blood', 'urine', 'xray', 'mri', 'ct', 'ultrasound', 'ecg', 'other'],
    required: true
  },
  result: String,
  normalRange: String,
  unit: String,
  status: {
    type: String,
    enum: ['normal', 'abnormal', 'critical'],
    required: true
  },
  performedDate: {
    type: Date,
    required: true
  },
  reportFile: String, // Path to uploaded report file
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  }
});

const vitalSignsSchema = new mongoose.Schema({
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  heartRate: Number,
  temperature: Number,
  respiratoryRate: Number,
  oxygenSaturation: Number,
  height: Number,
  weight: Number,
  bmi: Number,
  recordedAt: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }
});

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: String,
  fileType: String,
  fileSize: Number,
  filePath: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  description: String
});

const medicalRecordSchema = new mongoose.Schema({
  // Patient Information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  
  // Record Metadata
  recordType: {
    type: String,
    enum: ['consultation', 'prescription', 'test_result', 'emergency', 'surgery', 'vaccination', 'other'],
    required: true
  },
  recordId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Consultation Details
  chiefComplaint: String,
  historyOfPresentIllness: String,
  physicalExamination: String,
  diagnosis: {
    primary: String,
    secondary: [String],
    icd10Codes: [String]
  },
  
  // Treatment Plan
  treatmentPlan: String,
  medications: [medicationSchema],
  recommendedTests: [String],
  followUpInstructions: String,
  nextAppointment: Date,
  
  // Test Results
  testResults: [testResultSchema],
  
  // Vital Signs
  vitalSigns: vitalSignsSchema,
  
  // Attachments
  attachments: [attachmentSchema],
  
  // Doctor Information
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  
  // Visit Information
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  visitType: {
    type: String,
    enum: ['routine', 'emergency', 'follow_up', 'consultation', 'surgery'],
    default: 'routine'
  },
  hospitalName: String,
  department: String,
  
  // Record Status
  status: {
    type: String,
    enum: ['draft', 'completed', 'amended', 'archived'],
    default: 'draft'
  },
  
  // Digital Signature
  digitalSignature: {
    doctorSignature: String,
    signatureHash: String,
    signedAt: Date,
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Blockchain Logging
  blockchainHash: String,
  blockchainTxId: String,
  blockchainTimestamp: Date,
  
  // Access Control
  confidentialityLevel: {
    type: String,
    enum: ['normal', 'confidential', 'restricted'],
    default: 'normal'
  },
  
  // Sharing and Consent
  sharedWith: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    sharedAt: Date,
    accessLevel: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    },
    expiresAt: Date
  }],
  
  // Patient Consent
  patientConsent: {
    given: {
      type: Boolean,
      default: false
    },
    consentDate: Date,
    consentType: {
      type: String,
      enum: ['treatment', 'research', 'sharing'],
      default: 'treatment'
    }
  },
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'viewed', 'shared', 'deleted'],
      required: true
    },
    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      userType: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        required: true
      },
      userEmail: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    details: String,
    blockchainTxId: String
  }],
  
  // Emergency Access
  emergencyAccess: [{
    accessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    accessDate: Date,
    accessReason: String,
    biometricVerified: Boolean,
    ipAddress: String
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }
}, {
  timestamps: true
});

// Indexes for better performance
medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
medicalRecordSchema.index({ doctorId: 1, visitDate: -1 });
medicalRecordSchema.index({ recordId: 1 });
medicalRecordSchema.index({ recordType: 1 });
medicalRecordSchema.index({ status: 1 });
medicalRecordSchema.index({ visitDate: -1 });
medicalRecordSchema.index({ isDeleted: 1 });
medicalRecordSchema.index({ blockchainHash: 1 });

// Pre-save middleware to update timestamps
medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add audit trail entry
medicalRecordSchema.methods.addAuditEntry = function(action, performedBy, details = '', ipAddress = '', userAgent = '') {
  this.auditTrail.push({
    action,
    performedBy,
    timestamp: new Date(),
    ipAddress,
    userAgent,
    details
  });
  return this.save();
};

// Method to check if doctor has access
medicalRecordSchema.methods.hasAccess = function(doctorId) {
  // Doctor who created the record always has access
  if (this.doctorId.toString() === doctorId.toString()) {
    return true;
  }
  
  // Check if explicitly shared
  const sharedAccess = this.sharedWith.find(share => 
    share.doctorId.toString() === doctorId.toString() &&
    (!share.expiresAt || share.expiresAt > new Date())
  );
  
  return !!sharedAccess;
};

// Method to get safe record data for patient view
medicalRecordSchema.methods.getPatientView = function() {
  const record = this.toObject();
  
  // Remove sensitive doctor information
  if (record.auditTrail) {
    record.auditTrail.forEach(entry => {
      delete entry.ipAddress;
      delete entry.userAgent;
    });
  }
  
  return record;
};

// Method to get summary for listing
medicalRecordSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    recordId: this.recordId,
    recordType: this.recordType,
    visitDate: this.visitDate,
    visitType: this.visitType,
    chiefComplaint: this.chiefComplaint,
    diagnosis: this.diagnosis,
    status: this.status,
    doctorId: this.doctorId,
    hospitalName: this.hospitalName
  };
};

// Virtual for record age
medicalRecordSchema.virtual('recordAge').get(function() {
  const now = new Date();
  const visitDate = new Date(this.visitDate);
  const diffTime = Math.abs(now - visitDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is recent (within 30 days)
medicalRecordSchema.virtual('isRecent').get(function() {
  return this.recordAge <= 30;
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);