const QRCode = require('qrcode');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique health card ID
 */
const generateHealthCardId = () => {
  const prefix = 'HC';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

/**
 * Generate QR code data for a patient
 */
const generateQRData = (patient) => {
  const qrData = {
    healthCardId: patient.healthCardId,
    patientId: patient._id.toString(),
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth,
    bloodGroup: patient.medicalInfo?.bloodGroup,
    emergencyContact: patient.emergencyContacts?.[0]?.phone,
    issuedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  // Create a hash for verification
  const dataString = JSON.stringify(qrData);
  const hash = crypto.createHash('sha256').update(dataString).digest('hex');
  qrData.hash = hash.substring(0, 16); // Use first 16 characters for brevity
  
  return JSON.stringify(qrData);
};

/**
 * Generate QR code image (base64)
 */
const generateQRCodeImage = async (qrData) => {
  try {
    const options = {
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    };
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, options);
    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`QR code generation failed: ${error.message}`);
  }
};

/**
 * Generate QR code as buffer (for file saving)
 */
const generateQRCodeBuffer = async (qrData) => {
  try {
    const options = {
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 512
    };
    
    const buffer = await QRCode.toBuffer(qrData, options);
    return buffer;
  } catch (error) {
    throw new Error(`QR code buffer generation failed: ${error.message}`);
  }
};

/**
 * Verify QR code data integrity
 */
const verifyQRData = (qrDataString) => {
  try {
    const qrData = JSON.parse(qrDataString);
    
    // Check required fields
    const requiredFields = ['healthCardId', 'patientId', 'firstName', 'lastName', 'hash'];
    for (const field of requiredFields) {
      if (!qrData[field]) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }
    
    // Verify hash
    const dataForHash = { ...qrData };
    delete dataForHash.hash;
    const dataString = JSON.stringify(dataForHash);
    const expectedHash = crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16);
    
    if (qrData.hash !== expectedHash) {
      return { valid: false, error: 'QR code data integrity check failed' };
    }
    
    // Check expiration (QR codes valid for 5 years)
    const issuedDate = new Date(qrData.issuedAt);
    const expiryDate = new Date(issuedDate.getTime() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
    
    if (new Date() > expiryDate) {
      return { valid: false, error: 'QR code has expired' };
    }
    
    return { valid: true, data: qrData };
  } catch (error) {
    return { valid: false, error: `Invalid QR code format: ${error.message}` };
  }
};

/**
 * Generate emergency access QR code (limited data)
 */
const generateEmergencyQRData = (patient) => {
  const emergencyData = {
    type: 'emergency',
    healthCardId: patient.healthCardId,
    firstName: patient.firstName,
    lastName: patient.lastName,
    bloodGroup: patient.medicalInfo?.bloodGroup,
    allergies: patient.medicalInfo?.allergies || [],
    emergencyContact: patient.emergencyContacts?.[0]?.phone,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  const hash = crypto.createHash('sha256').update(JSON.stringify(emergencyData)).digest('hex');
  emergencyData.hash = hash.substring(0, 12);
  
  return JSON.stringify(emergencyData);
};

/**
 * Generate QR code for doctor access request
 */
const generateDoctorAccessQR = (doctorId, patientId, accessLevel = 'read', expiresInHours = 24) => {
  const accessData = {
    type: 'doctor_access',
    doctorId,
    patientId,
    accessLevel,
    requestId: uuidv4(),
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
  };
  
  const hash = crypto.createHash('sha256').update(JSON.stringify(accessData)).digest('hex');
  accessData.hash = hash.substring(0, 12);
  
  return JSON.stringify(accessData);
};

/**
 * Create QR code for record sharing
 */
const generateRecordShareQR = (recordId, sharedBy, accessLevel = 'read', expiresInDays = 7) => {
  const shareData = {
    type: 'record_share',
    recordId,
    sharedBy,
    accessLevel,
    shareId: uuidv4(),
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const hash = crypto.createHash('sha256').update(JSON.stringify(shareData)).digest('hex');
  shareData.hash = hash.substring(0, 12);
  
  return JSON.stringify(shareData);
};

/**
 * Validate and decode QR code based on type
 */
const decodeQRByType = (qrDataString) => {
  const verification = verifyQRData(qrDataString);
  if (!verification.valid) {
    return verification;
  }
  
  const qrData = verification.data;
  
  switch (qrData.type) {
    case 'emergency':
      return { valid: true, type: 'emergency', data: qrData };
    case 'doctor_access':
      return { valid: true, type: 'doctor_access', data: qrData };
    case 'record_share':
      return { valid: true, type: 'record_share', data: qrData };
    default:
      // Regular patient QR code
      return { valid: true, type: 'patient', data: qrData };
  }
};

/**
 * Generate QR code with logo/branding
 */
const generateBrandedQRCode = async (qrData, logoPath = null) => {
  try {
    const options = {
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#1a365d', // Healthcare blue
        light: '#ffffff'
      },
      width: 400,
      errorCorrectionLevel: 'M'
    };
    
    let qrCodeDataURL = await QRCode.toDataURL(qrData, options);
    
    // If logo is provided, overlay it (this would require additional image processing)
    // For now, return the basic QR code
    // TODO: Implement logo overlay using canvas or sharp
    
    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`Branded QR code generation failed: ${error.message}`);
  }
};

/**
 * Create batch QR codes for multiple patients
 */
const generateBatchQRCodes = async (patients) => {
  const results = [];
  
  for (const patient of patients) {
    try {
      const qrData = generateQRData(patient);
      const qrImage = await generateQRCodeImage(qrData);
      
      results.push({
        patientId: patient._id,
        healthCardId: patient.healthCardId,
        qrData,
        qrImage,
        success: true
      });
    } catch (error) {
      results.push({
        patientId: patient._id,
        healthCardId: patient.healthCardId,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
};

module.exports = {
  generateHealthCardId,
  generateQRData,
  generateQRCodeImage,
  generateQRCodeBuffer,
  verifyQRData,
  generateEmergencyQRData,
  generateDoctorAccessQR,
  generateRecordShareQR,
  decodeQRByType,
  generateBrandedQRCode,
  generateBatchQRCodes
};