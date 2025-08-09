const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  // Action Information
  action: {
    type: String,
    required: true,
    enum: [
      'user_register',
      'user_login',
      'user_logout',
      'card_created',
      'card_blocked',
      'card_reactivated',
      'medical_record_created',
      'medical_record_updated',
      'medical_record_viewed',
      'medical_record_deleted',
      'doctor_access_granted',
      'doctor_access_revoked',
      'emergency_access',
      'file_upload',
      'file_download',
      'settings_updated',
      'password_changed',
      'biometric_updated',
      'notification_sent',
      'blockchain_transaction',
      'admin_action',
      'system_backup',
      'data_export',
      'privacy_settings_changed'
    ]
  },
  
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Patient', 'Doctor', 'Admin', 'System']
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  
  // Target Information (if action involves another user/record)
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  targetType: {
    type: String,
    enum: ['Patient', 'Doctor', 'MedicalRecord', 'HealthCard', 'File']
  },
  targetIdentifier: String, // Health card ID, record ID, etc.
  
  // Action Details
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['authentication', 'authorization', 'data_access', 'data_modification', 'system', 'security'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Request Information
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  requestMethod: String,
  requestUrl: String,
  requestHeaders: {
    type: Map,
    of: String
  },
  
  // Response Information
  responseStatus: Number,
  responseTime: Number, // in milliseconds
  
  // Data Changes (for modification actions)
  dataChanges: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    fieldsChanged: [String]
  },
  
  // Security Information
  authenticationMethod: {
    type: String,
    enum: ['password', 'biometric', '2fa', 'emergency', 'api_key', 'admin_override']
  },
  sessionId: String,
  
  // Location Information
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Device Information
  deviceInfo: {
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown']
    },
    browser: String,
    operatingSystem: String,
    deviceId: String
  },
  
  // Status and Outcome
  status: {
    type: String,
    enum: ['success', 'failure', 'warning', 'error'],
    required: true
  },
  errorMessage: String,
  errorCode: String,
  
  // Compliance and Legal
  complianceFlags: [{
    regulation: {
      type: String,
      enum: ['HIPAA', 'GDPR', 'SOX', 'FDA', 'local_health_law']
    },
    requirement: String,
    status: {
      type: String,
      enum: ['compliant', 'non_compliant', 'under_review']
    }
  }],
  
  // Blockchain Information
  blockchainHash: String,
  blockchainTransactionId: String,
  immutableRecord: {
    type: Boolean,
    default: false
  },
  
  // Risk Assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  anomalyFlags: [{
    type: String,
    description: String,
    confidence: Number
  }],
  
  // Retention and Archival
  retentionPeriod: {
    type: Number,
    default: 2557 // 7 years in days
  },
  archiveDate: Date,
  
  // System Information
  systemVersion: String,
  moduleVersion: String,
  
  // Alert Information
  alertTriggered: {
    type: Boolean,
    default: false
  },
  alertLevel: {
    type: String,
    enum: ['info', 'warning', 'critical']
  },
  alertRecipients: [String],
  
  // Additional Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Timestamp (using createdAt from timestamps option)
}, {
  timestamps: true
});

// Indexes for better performance and querying
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, createdAt: -1 });
AuditLogSchema.index({ severity: 1, createdAt: -1 });
AuditLogSchema.index({ status: 1, createdAt: -1 });
AuditLogSchema.index({ targetId: 1, targetType: 1 });
AuditLogSchema.index({ ipAddress: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ blockchainHash: 1 });

// TTL index for automatic deletion after retention period
AuditLogSchema.index({ 
  createdAt: 1 
}, { 
  expireAfterSeconds: 220838400 // 7 years in seconds
});

// Static method to create audit log entry
AuditLogSchema.statics.createLog = async function(logData) {
  try {
    // Calculate risk score based on action and other factors
    const riskScore = calculateRiskScore(logData);
    
    const auditLog = new this({
      ...logData,
      riskScore,
      alertTriggered: riskScore > 70
    });
    
    await auditLog.save();
    
    // Trigger alerts if high risk
    if (riskScore > 70) {
      // Alert logic would go here
      console.log(`High risk activity detected: ${logData.action} by ${logData.userName}`);
    }
    
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

// Static method to get activity summary for a user
AuditLogSchema.statics.getUserActivity = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' },
        successCount: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to detect anomalies
AuditLogSchema.statics.detectAnomalies = async function(userId, timeWindow = 24) {
  const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
  
  const recentActivity = await this.find({
    userId,
    createdAt: { $gte: cutoffTime }
  }).sort({ createdAt: -1 });
  
  const anomalies = [];
  
  // Check for unusual login patterns
  const logins = recentActivity.filter(log => log.action === 'user_login');
  const uniqueIPs = new Set(logins.map(log => log.ipAddress));
  
  if (uniqueIPs.size > 3) {
    anomalies.push({
      type: 'multiple_ip_addresses',
      description: `Login from ${uniqueIPs.size} different IP addresses`,
      confidence: 0.8
    });
  }
  
  // Check for rapid succession of failed attempts
  const failedAttempts = recentActivity.filter(log => 
    log.status === 'failure' && log.category === 'authentication'
  );
  
  if (failedAttempts.length > 5) {
    anomalies.push({
      type: 'multiple_failed_attempts',
      description: `${failedAttempts.length} failed authentication attempts`,
      confidence: 0.9
    });
  }
  
  return anomalies;
};

// Helper function to calculate risk score
function calculateRiskScore(logData) {
  let score = 0;
  
  // Base score by action type
  const actionScores = {
    'emergency_access': 30,
    'card_blocked': 25,
    'medical_record_deleted': 40,
    'doctor_access_granted': 20,
    'biometric_updated': 15,
    'password_changed': 10,
    'user_login': 5
  };
  
  score += actionScores[logData.action] || 5;
  
  // Increase score for failure status
  if (logData.status === 'failure') {
    score += 20;
  }
  
  // Increase score for off-hours activity (6 PM to 6 AM)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 18) {
    score += 10;
  }
  
  // Increase score for high severity
  if (logData.severity === 'high' || logData.severity === 'critical') {
    score += 15;
  }
  
  return Math.min(score, 100);
}

// Virtual for human-readable timestamp
AuditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toLocaleString();
});

// Ensure virtual fields are serialized
AuditLogSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);