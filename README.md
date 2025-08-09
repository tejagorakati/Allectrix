# Arogya Card - Digital Health Card Management System

A comprehensive web application for managing digital health cards with blockchain logging, QR code integration, biometric authentication, and emergency access features.

## 🏥 Features

### Patient Portal
- **User Registration & Profile Setup**: Complete patient registration with medical history
- **Digital Health Card**: QR code-based health card with unique ID
- **Document Upload**: Secure upload and management of medical documents
- **Medical Records**: View and manage medical history
- **Lost Card Reporting**: Immediate card blocking and replacement
- **Biometric Integration**: Face/fingerprint authentication for enhanced security
- **Privacy Controls**: Granular control over data sharing and access

### Doctor Portal
- **Secure Authentication**: Two-factor authentication with account verification
- **QR Code Scanner**: Camera-based patient health card scanning
- **Patient Search**: Search patients by health card ID or personal details
- **Medical Record Creation**: Comprehensive medical record management
- **Digital Signatures**: Cryptographic signing of medical records
- **Audit Trail**: Complete access logging and activity tracking

### Emergency Access
- **Biometric Authentication**: Quick access using stored biometric data
- **Emergency Personnel Access**: Special access codes for emergency situations
- **Critical Information Display**: Blood group, allergies, emergency contacts
- **Location Tracking**: GPS-based emergency access logging

### Admin Dashboard
- **User Management**: Manage patients, doctors, and system users
- **Card Management**: Block, reactivate, and manage health cards
- **System Analytics**: Usage statistics and performance metrics
- **Doctor Verification**: Approve and verify healthcare professionals
- **Audit Reports**: Comprehensive system activity reports

### Security & Compliance
- **Blockchain Logging**: Immutable audit trail for all activities
- **Data Encryption**: End-to-end encryption for sensitive data
- **HIPAA Compliance**: Healthcare data protection standards
- **Multi-factor Authentication**: Enhanced security for all user types
- **Rate Limiting**: Protection against brute force attacks

## 🚀 Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **QR Code** generation and validation
- **Blockchain** integration (Ethereum/Polygon)
- **Twilio** for SMS notifications
- **Nodemailer** for email services

### Frontend
- **React 18** with functional components
- **Material-UI (MUI)** for modern UI components
- **React Router** for navigation
- **React Hook Form** for form management
- **Zustand** for state management
- **React Query** for API state management
- **Framer Motion** for animations
- **Face-API.js** for biometric authentication

### Security & DevOps
- **Helmet.js** for HTTP security headers
- **Rate limiting** and request validation
- **File encryption** and virus scanning
- **Environment-based configuration**
- **Comprehensive logging** and monitoring

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager
- Git

### Optional Services
- Twilio account (for SMS notifications)
- Email service provider (Gmail, SendGrid, etc.)
- Ethereum/Polygon testnet access (for blockchain features)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd arogya-card-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Configuration
Create `server/.env` file:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/arogya-card

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_PATH=./uploads

# Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@arogyacard.com

# Blockchain Configuration
BLOCKCHAIN_PROVIDER_URL=https://goerli.infura.io/v3/your-infura-project-id
BLOCKCHAIN_PRIVATE_KEY=your-wallet-private-key
CONTRACT_ADDRESS=your-deployed-contract-address

# Encryption Keys
ENCRYPTION_KEY=your-32-character-encryption-key
IV_KEY=your-16-character-iv-key

# Admin Configuration
ADMIN_EMAIL=admin@arogyacard.com
ADMIN_PASSWORD=admin123456
```

#### Client Configuration
Create `client/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Arogya Card
REACT_APP_VERSION=1.0.0
```

### 4. Database Setup
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start the Application

#### Development Mode
```bash
# Start both frontend and backend
npm run dev

# Or start individually
# Backend only
npm run server

# Frontend only
npm run client
```

#### Production Mode
```bash
# Build the client
npm run build

# Start production server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 Usage Guide

### Patient Registration
1. Navigate to `/patient/register`
2. Complete the 4-step registration process:
   - Personal Information
   - Emergency Contact
   - Medical History (optional)
   - Review & Submit
3. Receive QR code-based health card
4. Set up biometric authentication (optional)

### Doctor Registration
1. Navigate to `/doctor/register`
2. Provide professional credentials
3. Upload verification documents
4. Wait for admin approval
5. Set up two-factor authentication

### QR Code Scanning
1. Login as a doctor
2. Navigate to QR Scanner
3. Allow camera access
4. Scan patient's health card QR code
5. Access patient medical information

### Emergency Access
1. Navigate to `/emergency`
2. Use biometric authentication or emergency code
3. Access critical patient information
4. All emergency access is logged for audit

## 🔐 Security Features

### Data Protection
- **AES-256-GCM encryption** for sensitive data
- **PBKDF2** for password hashing
- **Biometric template encryption** with salt
- **File integrity verification** with checksums

### Access Control
- **Role-based permissions** (Patient, Doctor, Admin, Emergency)
- **Session management** with automatic expiry
- **IP-based rate limiting**
- **JWT token validation** with refresh mechanism

### Audit & Compliance
- **Comprehensive audit logging** of all activities
- **Blockchain-based immutable records**
- **HIPAA compliance** features
- **Data anonymization** for analytics

## 🧪 API Documentation

### Authentication Endpoints
```
POST /api/auth/patient/login    - Patient login
POST /api/auth/doctor/login     - Doctor login
POST /api/auth/refresh          - Refresh JWT token
POST /api/auth/logout           - Logout user
```

### Patient Endpoints
```
POST /api/patients/register          - Register new patient
GET  /api/patients/profile           - Get patient profile
PUT  /api/patients/profile           - Update patient profile
GET  /api/patients/health-card       - Get health card info
POST /api/patients/upload-documents  - Upload medical documents
POST /api/patients/report-lost-card  - Report lost/stolen card
POST /api/patients/biometric         - Update biometric data
```

### Doctor Endpoints
```
POST /api/doctors/register      - Register new doctor
GET  /api/doctors/profile       - Get doctor profile
POST /api/doctors/scan-qr       - Process QR code scan
GET  /api/doctors/patients/:id  - Get patient information
POST /api/doctors/medical-record - Create medical record
```

### Emergency Endpoints
```
POST /api/emergency/access      - Emergency access to patient data
POST /api/emergency/biometric   - Biometric emergency authentication
```

### Admin Endpoints
```
GET  /api/admin/users           - Get all users
PUT  /api/admin/users/:id       - Update user status
GET  /api/admin/analytics       - Get system analytics
GET  /api/admin/audit-logs      - Get audit logs
```

## 🎨 UI Components

### Key Components
- **HealthCard**: Digital health card display with QR code
- **QRScanner**: Camera-based QR code scanning
- **BiometricAuth**: Biometric authentication interface
- **FileUpload**: Secure file upload with progress
- **MedicalRecordForm**: Comprehensive medical record creation
- **AuditLogViewer**: Activity and access logs display

### Design System
- **Material-UI** components with custom theme
- **Responsive design** for mobile and desktop
- **Accessibility** compliant (WCAG 2.1)
- **Dark/Light mode** support
- **Animation** with Framer Motion

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Run all tests
npm run test:all
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical workflows

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment Options
- **AWS**: EC2, RDS, S3, CloudFront
- **Google Cloud**: Compute Engine, Cloud SQL, Cloud Storage
- **Azure**: App Service, CosmosDB, Blob Storage
- **Heroku**: Hobby/Professional plans with MongoDB Atlas

### Environment Variables for Production
- Use strong encryption keys (32+ characters)
- Configure proper CORS origins
- Set up SSL/TLS certificates
- Configure backup and monitoring

## 📈 Monitoring & Analytics

### Built-in Analytics
- User registration trends
- Health card usage statistics
- Doctor access patterns
- Emergency access frequency
- System performance metrics

### Logging & Monitoring
- **Winston** for structured logging
- **Morgan** for HTTP request logging
- **Custom audit logging** for security events
- **Performance monitoring** with response times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation for API changes
- Follow semantic versioning for releases

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues
1. **MongoDB connection failed**: Ensure MongoDB is running
2. **JWT token invalid**: Check JWT_SECRET configuration
3. **File upload errors**: Verify upload directory permissions
4. **QR code scanning issues**: Allow camera permissions in browser

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [API Documentation](#api-documentation)
- Contact support at support@arogyacard.com

## 🔄 Changelog

### Version 1.0.0
- Initial release with core features
- Patient and doctor portals
- QR code integration
- Biometric authentication
- Blockchain logging
- Emergency access system

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Express API   │    │    MongoDB      │
│                 │◄──►│                 │◄──►│                 │
│  - Patient UI   │    │  - Auth Routes  │    │  - User Data    │
│  - Doctor UI    │    │  - Patient API  │    │  - Medical Recs │
│  - Admin UI     │    │  - Doctor API   │    │  - Audit Logs   │
│  - Emergency UI │    │  - Admin API    │    │  - Files Meta   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   File Storage  │              │
         └──────────────┤                 │──────────────┘
                        │  - Medical Docs │
                        │  - QR Codes     │
                        │  - Signatures   │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   Blockchain    │
                        │                 │
                        │  - Audit Trail  │
                        │  - Immutable    │
                        │    Records      │
                        └─────────────────┘
```

Built with ❤️ for better healthcare accessibility and security.