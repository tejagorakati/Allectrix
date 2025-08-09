# Arogya Card - Digital Healthcare System

A comprehensive blockchain-powered digital health card system with QR code access, emergency biometric authentication, and real-time medical record management.

## Features

### 🏥 **For Patients**
- **Digital Health Cards**: Secure QR code-based health cards for instant access
- **Medical Record Management**: Store and manage medical history securely
- **Emergency Contacts**: Manage emergency contact information
- **Privacy Controls**: Control who can access your medical data
- **Real-time Notifications**: Get notified when your records are accessed

### 👨‍⚕️ **For Doctors**
- **QR Code Scanner**: Scan patient QR codes to access records
- **Secure Authentication**: Two-factor authentication for enhanced security
- **Digital Prescriptions**: Create and manage digital prescriptions
- **Audit Trail**: Complete visibility of record access and modifications
- **Patient Access Management**: Grant and revoke access to patient records

### 🚨 **Emergency Access**
- **Biometric Authentication**: Access critical patient info during emergencies
- **Limited Data Access**: Emergency personnel can access essential information
- **Location Tracking**: Track emergency access with location data
- **Instant Access**: Quick access to life-saving medical information

### 🔐 **Admin Dashboard**
- **User Management**: Manage patients, doctors, and system users
- **Doctor Verification**: Verify doctor credentials and licenses
- **System Analytics**: Monitor system health and usage statistics
- **Card Management**: Issue, block, and manage health cards
- **Security Monitoring**: Track and monitor security events

### 🔗 **Blockchain Security**
- **Immutable Records**: All medical record changes are logged on blockchain
- **Audit Trail**: Complete transparency of who accessed what and when
- **Data Integrity**: Cryptographic verification of record authenticity
- **Decentralized Storage**: Secure, distributed storage of critical data

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **Web3.js** for blockchain integration
- **Multer** for file uploads
- **QRCode** library for QR code generation
- **Twilio** for SMS notifications
- **Nodemailer** for email notifications

### Frontend
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** with Yup validation
- **React Webcam** for camera access
- **Face-API.js** for biometric authentication
- **Chart.js** for analytics dashboards

### Security & Infrastructure
- **Helmet.js** for security headers
- **Rate limiting** for API protection
- **CORS** configuration
- **Input validation** and sanitization
- **Encryption** for sensitive data
- **Audit logging** for all operations

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arogya-card-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install all dependencies (client + server)
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit the environment file with your configurations
   nano server/.env
   ```

4. **Configure Environment Variables**
   Edit `server/.env` with your settings:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/arogya_card
   
   # JWT Secret (generate a secure random string)
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   
   # Twilio (for SMS)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Blockchain (optional for development)
   BLOCKCHAIN_NETWORK_URL=https://goerli.infura.io/v3/your_infura_project_id
   ```

5. **Start the Development Servers**
   ```bash
   # Start both client and server concurrently
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend server (Port 5000)
   npm run server
   
   # Terminal 2 - Frontend client (Port 3000)
   npm run client
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## Application Structure

```
arogya-card-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main app component
│   └── public/             # Static files
├── server/                 # Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── index.js            # Server entry point
└── package.json            # Root package configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/patient/register` - Patient registration
- `POST /api/auth/patient/login` - Patient login
- `POST /api/auth/doctor/register` - Doctor registration
- `POST /api/auth/doctor/login` - Doctor login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/verify-token` - Verify token validity

### Patient Management
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile
- `GET /api/patients/health-card` - Get health card details
- `POST /api/patients/report-lost-card` - Report lost/stolen card

### Doctor Operations
- `POST /api/doctors/scan-qr` - Scan patient QR code
- `GET /api/doctors/patients/:id` - Access patient records
- `POST /api/doctors/records` - Create new medical record
- `PUT /api/doctors/records/:id` - Update medical record

### Emergency Access
- `POST /api/emergency/access` - Emergency biometric access
- `GET /api/emergency/patient/:id` - Get emergency patient data

### Admin Functions
- `GET /api/admin/doctors/pending` - Get pending doctor verifications
- `PUT /api/admin/doctors/:id/verify` - Verify doctor
- `GET /api/admin/analytics` - System analytics
- `GET /api/admin/cards` - Manage health cards

## Usage Guide

### Patient Registration
1. Visit the application homepage
2. Click "Register Now" or navigate to patient registration
3. Fill out the multi-step registration form:
   - Personal Information
   - Medical Information (optional)
   - Emergency Contacts (recommended)
   - Account Security
4. Upon successful registration, receive your digital health card with QR code

### Doctor Access
1. Register as a doctor (requires admin verification)
2. Once verified, login to the doctor portal
3. Use the QR scanner to access patient records
4. Create and manage medical records
5. Digital prescriptions and test orders

### Emergency Access
1. Navigate to the emergency access portal
2. Use biometric authentication (face recognition)
3. Access limited patient information for emergency care
4. All emergency access is logged and audited

### Admin Management
1. Login to admin dashboard
2. Verify pending doctor registrations
3. Monitor system health and analytics
4. Manage health cards and user accounts

## Security Features

- **End-to-end Encryption**: All sensitive data encrypted in transit and at rest
- **Blockchain Audit Trail**: Immutable logging of all record access and modifications
- **Multi-factor Authentication**: 2FA for doctors and admins
- **Biometric Emergency Access**: Face recognition for emergency situations
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation of all user inputs
- **Access Control**: Role-based permissions and access levels

## Development

### Adding New Features
1. Create feature branch from main
2. Implement backend API endpoints in `server/routes/`
3. Add corresponding frontend components in `client/src/`
4. Update documentation and tests
5. Submit pull request for review

### Database Schema
- **Patients**: User profiles, medical info, health cards
- **Doctors**: Professional info, credentials, permissions
- **MedicalRecords**: Patient records, prescriptions, test results
- **AuditLogs**: Blockchain-backed audit trail
- **Notifications**: System notifications and alerts

### Blockchain Integration
The system uses Ethereum blockchain for audit logging:
- Record access events are logged on-chain
- Smart contracts ensure data integrity
- Immutable audit trail for compliance
- Optional: IPFS for distributed file storage

## Deployment

### Production Setup
1. Set up production MongoDB instance
2. Configure environment variables for production
3. Set up blockchain network connection
4. Configure SMS and email services
5. Deploy to cloud platform (AWS, Azure, GCP)

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/arogya_card
JWT_SECRET=production_jwt_secret_256_bit_key
TWILIO_ACCOUNT_SID=production_twilio_sid
# ... other production configs
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced biometric authentication
- [ ] AI-powered health insights
- [ ] Telemedicine integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with existing hospital systems
- [ ] Wearable device integration

---

**Arogya Card** - Revolutionizing healthcare with blockchain technology and digital innovation.