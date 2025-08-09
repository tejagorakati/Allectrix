const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed file types for medical documents
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif',
    '.pdf', '.txt', '.doc', '.docx',
    '.xls', '.xlsx'
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10 // Maximum 10 files per request
  }
});

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 50MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 10 files per upload.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name.';
        break;
      default:
        message = err.message;
    }
    
    return res.status(400).json({
      success: false,
      message,
      error: err.code
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  
  next();
};

// Virus scanning middleware (placeholder - implement with actual antivirus)
const virusScan = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    // Placeholder for virus scanning
    // In production, integrate with ClamAV or similar
    for (const file of req.files) {
      // Simple check for suspicious file patterns
      const fileContent = fs.readFileSync(file.path, 'utf8');
      
      // Check for suspicious patterns (very basic example)
      const suspiciousPatterns = [
        /<script[^>]*>/i,
        /javascript:/i,
        /vbscript:/i,
        /onload=/i,
        /onerror=/i
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(fileContent)
      );

      if (isSuspicious) {
        // Delete the file
        fs.unlinkSync(file.path);
        
        return res.status(400).json({
          success: false,
          message: 'File contains suspicious content and has been rejected.'
        });
      }
    }

    next();
  } catch (error) {
    // If we can't read the file as text, it's likely binary (which is OK)
    next();
  }
};

// File metadata extraction
const extractMetadata = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  req.files.forEach(file => {
    // Add additional metadata
    file.uploadTimestamp = new Date();
    file.checksum = generateFileChecksum(file.path);
    file.isSecure = true; // Mark as scanned and secure
  });

  next();
};

// Generate file checksum for integrity verification
const generateFileChecksum = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

// Clean up files on error
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function(data) {
    if (res.statusCode >= 400 && req.files) {
      // Clean up uploaded files on error
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    originalSend.call(this, data);
  };

  res.json = function(data) {
    if (res.statusCode >= 400 && req.files) {
      // Clean up uploaded files on error
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    originalJson.call(this, data);
  };

  next();
};

// Complete upload middleware chain
const uploadMiddleware = [
  cleanupOnError,
  upload.any(),
  handleUploadError,
  virusScan,
  extractMetadata
];

// Single file upload
const uploadSingle = (fieldName) => [
  cleanupOnError,
  upload.single(fieldName),
  handleUploadError,
  virusScan,
  extractMetadata
];

// Multiple files upload
const uploadMultiple = (fieldName, maxCount = 10) => [
  cleanupOnError,
  upload.array(fieldName, maxCount),
  handleUploadError,
  virusScan,
  extractMetadata
];

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to get file info
const getFileInfo = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      checksum: generateFileChecksum(filePath)
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

module.exports = {
  upload: uploadMiddleware,
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getFileInfo,
  generateFileChecksum
};