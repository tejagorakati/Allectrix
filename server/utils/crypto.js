const crypto = require('crypto');

// Configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

/**
 * Generate a unique health card ID
 * Format: AC + timestamp(6) + random(6) = AC123456ABCDEF
 */
function generateHealthCardId() {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 character hex
  return `AC${timestamp}${random}`;
}

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
  if (!text) return null;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    cipher.setAAD(Buffer.from('arogya-card-system'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive data
 */
function decrypt(encryptedData) {
  if (!encryptedData) return null;
  
  try {
    const { encrypted, iv, authTag } = encryptedData;
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    
    decipher.setAAD(Buffer.from('arogya-card-system'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Encrypt biometric data with additional security
 */
function encryptBiometricData(biometricTemplate) {
  if (!biometricTemplate) return null;
  
  try {
    // Add salt for additional security
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha512');
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipherGCM(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(JSON.stringify(biometricTemplate), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      authTag: authTag.toString('hex'),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Biometric encryption error:', error);
    throw new Error('Biometric encryption failed');
  }
}

/**
 * Decrypt biometric data
 */
function decryptBiometricData(encryptedBiometric) {
  if (!encryptedBiometric) return null;
  
  try {
    const { encrypted, iv, salt, authTag } = encryptedBiometric;
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, Buffer.from(salt, 'hex'), 100000, 32, 'sha512');
    
    const decipher = crypto.createDecipherGCM(ALGORITHM, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Biometric decryption error:', error);
    throw new Error('Biometric decryption failed');
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 */
function hashData(data, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(SALT_LENGTH);
  } else if (typeof salt === 'string') {
    salt = Buffer.from(salt, 'hex');
  }
  
  const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
  
  return {
    hash: hash.toString('hex'),
    salt: salt.toString('hex')
  };
}

/**
 * Verify hashed data
 */
function verifyHash(data, hashedData) {
  try {
    const { hash, salt } = hashedData;
    const verification = hashData(data, salt);
    return verification.hash === hash;
  } catch (error) {
    console.error('Hash verification error:', error);
    return false;
  }
}

/**
 * Generate a secure random token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate QR code data with security features
 */
function generateSecureQRData(patientData) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  
  const qrData = {
    ...patientData,
    timestamp,
    nonce,
    version: '1.0'
  };
  
  // Create a hash to verify data integrity
  const dataString = JSON.stringify(qrData);
  const signature = crypto.createHmac('sha256', ENCRYPTION_KEY)
    .update(dataString)
    .digest('hex');
  
  return {
    data: qrData,
    signature
  };
}

/**
 * Verify QR code data integrity
 */
function verifyQRData(qrPayload) {
  try {
    const { data, signature } = qrPayload;
    const dataString = JSON.stringify(data);
    const expectedSignature = crypto.createHmac('sha256', ENCRYPTION_KEY)
      .update(dataString)
      .digest('hex');
    
    // Check signature
    if (signature !== expectedSignature) {
      return { valid: false, reason: 'Invalid signature' };
    }
    
    // Check timestamp (QR codes expire after 24 hours for security)
    const now = Date.now();
    const qrTimestamp = data.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - qrTimestamp > maxAge) {
      return { valid: false, reason: 'QR code expired' };
    }
    
    return { valid: true, data };
  } catch (error) {
    console.error('QR verification error:', error);
    return { valid: false, reason: 'Verification failed' };
  }
}

/**
 * Generate blockchain hash for audit trail
 */
function generateBlockchainHash(data) {
  const timestamp = Date.now();
  const dataWithTimestamp = {
    ...data,
    timestamp
  };
  
  return {
    hash: crypto.createHash('sha256')
      .update(JSON.stringify(dataWithTimestamp))
      .digest('hex'),
    timestamp
  };
}

/**
 * Generate digital signature for medical records
 */
function generateDigitalSignature(recordData, privateKey) {
  try {
    const dataString = JSON.stringify(recordData);
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(dataString);
    
    return sign.sign(privateKey, 'hex');
  } catch (error) {
    console.error('Digital signature error:', error);
    throw new Error('Digital signature generation failed');
  }
}

/**
 * Verify digital signature
 */
function verifyDigitalSignature(recordData, signature, publicKey) {
  try {
    const dataString = JSON.stringify(recordData);
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(dataString);
    
    return verify.verify(publicKey, signature, 'hex');
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Anonymize sensitive data for analytics
 */
function anonymizeData(data, fields = []) {
  const anonymized = { ...data };
  
  fields.forEach(field => {
    if (anonymized[field]) {
      // Replace with hash of original value
      anonymized[field] = crypto.createHash('sha256')
        .update(anonymized[field].toString())
        .digest('hex')
        .substring(0, 8);
    }
  });
  
  return anonymized;
}

module.exports = {
  generateHealthCardId,
  encrypt,
  decrypt,
  encryptBiometricData,
  decryptBiometricData,
  hashData,
  verifyHash,
  generateSecureToken,
  generateSecureQRData,
  verifyQRData,
  generateBlockchainHash,
  generateDigitalSignature,
  verifyDigitalSignature,
  anonymizeData
};