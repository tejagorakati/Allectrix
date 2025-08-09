const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Extract the field name from the error
    const field = Object.keys(err.keyValue)[0];
    if (field === 'email') {
      message = 'Email address is already registered';
    } else if (field === 'phone') {
      message = 'Phone number is already registered';
    } else if (field === 'healthCardId') {
      message = 'Health card ID already exists';
    } else if (field === 'medicalLicenseNumber') {
      message = 'Medical license number is already registered';
    }
    
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = { message: messages.join(', '), statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file upload';
    error = { message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection error';
    error = { message, statusCode: 503 };
  }

  // Blockchain errors
  if (err.message && err.message.includes('blockchain')) {
    const message = 'Blockchain service temporarily unavailable';
    error = { message, statusCode: 503 };
  }

  // SMS/Email service errors
  if (err.message && (err.message.includes('Twilio') || err.message.includes('nodemailer'))) {
    const message = 'Notification service temporarily unavailable';
    error = { message, statusCode: 503 };
  }

  // QR Code generation errors
  if (err.message && err.message.includes('QR')) {
    const message = 'QR code generation failed';
    error = { message, statusCode: 500 };
  }

  // Biometric verification errors
  if (err.message && err.message.includes('biometric')) {
    const message = 'Biometric verification failed';
    error = { message, statusCode: 401 };
  }

  // Emergency access errors
  if (err.message && err.message.includes('emergency')) {
    const message = 'Emergency access verification failed';
    error = { message, statusCode: 403 };
  }

  // File processing errors
  if (err.message && err.message.includes('file')) {
    const message = 'File processing error';
    error = { message, statusCode: 400 };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  // Additional error details for development
  const errorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }

  // Add request ID if available
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  // Log error details
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  console[logLevel](`${statusCode} - ${message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

  // Special handling for specific error types
  if (statusCode === 401) {
    // Clear any auth-related headers
    res.removeHeader('x-auth-token');
  }

  if (statusCode === 429) {
    // Add retry-after header for rate limiting
    res.set('Retry-After', '60');
  }

  if (statusCode >= 500) {
    // Log server errors for monitoring
    console.error('Server Error Details:', {
      error: err,
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      user: req.user,
      timestamp: new Date().toISOString()
    });
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;