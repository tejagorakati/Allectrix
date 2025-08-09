const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  // Patient Information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  
  // Doctor Information
  createdBy: {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    doctorName: {
      type: String,
      required: true
    },
    hospitalName: {
      type: String,
      required: true
    },
    licenseNumber: {
      type: String,
      required: true
    }
  },
  
  // Record Type and Category
  recordType: {
    type: String,
    enum: [
      'consultation',
      'diagnosis', 
      'prescription',
      'lab_result',
      'imaging',
      'surgery',
      'vaccination',
      'emergency_visit',
      'follow_up',
      'discharge_summary'
    ],
    required: true
  },
  
  // Medical Information
  chiefComplaint: {
    type: String,
    required: function() {
      return ['consultation', 'emergency_visit'].includes(this.recordType);
    }
  },
  
  presentingSymptoms: [{
    symptom: String,
    duration: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    notes: String
  }],
  
  diagnosis: {
    primary: {
      icdCode: String,
      description: String,
      certainty: {
        type: String,
        enum: ['confirmed', 'probable', 'suspected']
      }
    },
    secondary: [{
      icdCode: String,
      description: String,
      certainty: {
        type: String,
        enum: ['confirmed', 'probable', 'suspected']
      }
    }]
  },
  
  // Physical Examination
  physicalExamination: {
    vitalSigns: {
      temperature: { value: Number, unit: String },
      bloodPressure: { systolic: Number, diastolic: Number },
      heartRate: { value: Number, unit: String },
      respiratoryRate: { value: Number, unit: String },
      oxygenSaturation: { value: Number, unit: String },
      weight: { value: Number, unit: String },
      height: { value: Number, unit: String },
      bmi: Number
    },
    findings: String,
    systemsReview: {
      cardiovascular: String,
      respiratory: String,
      gastrointestinal: String,
      neurological: String,
      musculoskeletal: String,
      dermatological: String,
      other: String
    }
  },
  
  // Medications and Prescriptions
  medications: [{
    medicationName: {
      type: String,
      required: true
    },
    genericName: String,
    dosage: {
      amount: String,
      unit: String,
      frequency: String
    },
    route: {
      type: String,
      enum: ['oral', 'intravenous', 'intramuscular', 'topical', 'inhalation', 'sublingual', 'rectal']
    },
    startDate: Date,
    endDate: Date,
    duration: String,
    instructions: String,
    refills: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Laboratory Results
  labResults: [{
    testName: String,
    testCode: String,
    result: String,
    normalRange: String,
    unit: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical', 'pending']
    },
    performedDate: Date,
    laboratoryName: String,
    notes: String
  }],
  
  // Imaging Studies
  imagingStudies: [{
    studyType: {
      type: String,
      enum: ['x-ray', 'ct_scan', 'mri', 'ultrasound', 'mammography', 'pet_scan', 'other']
    },
    bodyPart: String,
    findings: String,
    impression: String,
    performedDate: Date,
    radiologistName: String,
    imagingCenter: String,
    imageUrls: [String] // URLs to stored images
  }],
  
  // Procedures and Surgeries
  procedures: [{
    procedureName: String,
    procedureCode: String, // CPT or ICD-10 procedure code
    description: String,
    performedDate: Date,
    performedBy: String,
    location: String, // Hospital/clinic where performed
    outcome: String,
    complications: String,
    notes: String
  }],
  
  // Treatment Plan
  treatmentPlan: {
    planDescription: String,
    goals: [String],
    instructions: String,
    followUpDate: Date,
    followUpInstructions: String,
    dietaryRecommendations: String,
    activityRestrictions: String,
    warningSignsToWatch: [String]
  },
  
  // Referrals
  referrals: [{
    referToSpecialist: String,
    specialization: String,
    reason: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency']
    },
    referralDate: Date,
    contactInfo: {
      name: String,
      phone: String,
      email: String,
      address: String
    }
  }],
  
  // Attachments and Documents
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    description: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Visit Information
  visitDetails: {
    visitDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    visitType: {
      type: String,
      enum: ['in_person', 'telemedicine', 'emergency', 'home_visit'],
      default: 'in_person'
    },
    duration: Number, // in minutes
    location: String,
    appointmentId: String
  },
  
  // Billing and Insurance
  billing: {
    totalCharge: Number,
    insuranceCoverage: Number,
    patientResponsibility: Number,
    insuranceClaimNumber: String,
    billingCodes: [{
      code: String,
      description: String,
      amount: Number
    }]
  },
  
  // Quality and Compliance
  qualityMetrics: {
    documentationScore: Number,
    completenessScore: Number,
    timelyDocumentation: Boolean,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    reviewDate: Date
  },
  
  // Access Control and Audit
  accessLog: [{
    accessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    accessDate: {
      type: Date,
      default: Date.now
    },
    accessType: {
      type: String,
      enum: ['view', 'edit', 'download', 'print']
    },
    ipAddress: String,
    userAgent: String
  }],
  
  // Record Status
  status: {
    type: String,
    enum: ['draft', 'final', 'amended', 'corrected', 'archived'],
    default: 'draft'
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    versionNumber: Number,
    modifiedDate: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    changes: String,
    recordData: mongoose.Schema.Types.Mixed
  }],
  
  // Privacy and Sharing
  sharingPermissions: {
    shareWithPatient: {
      type: Boolean,
      default: true
    },
    shareWithEmergencyContacts: {
      type: Boolean,
      default: false
    },
    shareWithOtherProviders: {
      type: Boolean,
      default: false
    },
    restrictedAccess: {
      type: Boolean,
      default: false
    },
    accessRestrictedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }]
  },
  
  // Digital Signature
  digitalSignature: {
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    signatureHash: String,
    signedDate: {
      type: Date,
      default: Date.now
    },
    signatureMethod: {
      type: String,
      enum: ['digital_certificate', 'biometric', 'password'],
      default: 'digital_certificate'
    }
  },
  
  // Blockchain tracking
  blockchainHash: String,
  blockchainTransactionId: String,
  
  // Archive Information
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  retentionPeriod: Number // in years
  
}, {
  timestamps: true
});

// Indexes for better performance
MedicalRecordSchema.index({ patientId: 1, createdAt: -1 });
MedicalRecordSchema.index({ 'createdBy.doctorId': 1 });
MedicalRecordSchema.index({ recordType: 1 });
MedicalRecordSchema.index({ status: 1 });
MedicalRecordSchema.index({ 'visitDetails.visitDate': -1 });
MedicalRecordSchema.index({ 'diagnosis.primary.icdCode': 1 });

// Pre-save middleware for version control
MedicalRecordSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Method to create a new version
MedicalRecordSchema.methods.createVersion = function(modifiedBy, changes) {
  this.previousVersions.push({
    versionNumber: this.version,
    modifiedDate: new Date(),
    modifiedBy: modifiedBy,
    changes: changes,
    recordData: this.toObject()
  });
  this.version += 1;
};

// Method to check if record can be edited
MedicalRecordSchema.methods.canBeEdited = function() {
  return this.status === 'draft' || this.status === 'final';
};

// Virtual for display diagnosis
MedicalRecordSchema.virtual('displayDiagnosis').get(function() {
  if (this.diagnosis && this.diagnosis.primary) {
    return this.diagnosis.primary.description;
  }
  return 'No diagnosis recorded';
});

// Virtual for record age
MedicalRecordSchema.virtual('recordAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtual fields are serialized
MedicalRecordSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);