# Arogya Card - Digital Health Management System

A comprehensive digital health card system built with Next.js, TypeScript, and modern web technologies. This system provides secure patient registration, QR code-based health cards, doctor portals, and emergency access functionality.

## 🌟 Features

### ✅ Implemented Features

#### 1. **Patient Registration Portal**
- Complete patient registration with form validation
- File upload for medical records and profile pictures
- Automatic health card ID generation
- QR code generation for emergency access
- Responsive design with drag-and-drop file upload

#### 2. **Digital Health Card**
- Beautiful digital health card display
- QR code for quick scanning
- Patient information with profile picture
- Card blocking/unblocking functionality
- Medical information with privacy controls

#### 3. **Doctor Authentication Portal**
- Secure doctor login with license verification
- JWT token-based authentication
- Dashboard with QR scanner and patient search
- Access logging and audit trails

#### 4. **QR Code Scanner**
- Real-time QR code scanning using device camera
- Integrated in doctor dashboard
- Quick patient lookup and access

#### 5. **Emergency Access Module**
- Special emergency portal for critical situations
- QR code scanning for instant patient information
- Access to critical medical data (allergies, blood group, emergency contact)
- Automatic logging and patient notifications

#### 6. **Security & Audit Logging**
- All access attempts are logged
- Patient notifications for every access
- Card blocking functionality
- Secure file uploads with validation

### 🚧 Features for Future Development

#### Admin Dashboard
- User management and card administration
- System analytics and usage statistics
- Doctor approval and management

#### Blockchain Integration
- Immutable audit trails
- Decentralized record verification
- Smart contract integration

#### Advanced Notifications
- SMS/Email notifications via Twilio/SendGrid
- Real-time push notifications
- Customizable notification preferences

#### Biometric Authentication
- Face recognition for emergency access
- Fingerprint authentication
- Device-based security

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd arogya-card
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up the database:**
```bash
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to `http://localhost:3000`

## 📋 Test Credentials

### Doctor Login
- **Email:** dr.smith@hospital.com
- **License:** MED001
- **Password:** doctor123

### Alternative Doctor
- **Email:** dr.patel@clinic.com
- **License:** MED002
- **Password:** doctor456

### Admin (Future Use)
- **Email:** admin@arogyacard.com
- **Password:** admin123

## 🏗️ System Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation
- **HTML5 QR Code Scanner** for camera integration

### Backend
- **Next.js API Routes** for serverless functions
- **Prisma ORM** with SQLite database
- **JWT** for authentication
- **bcrypt** for password hashing

### File Upload
- Local file storage in `public/uploads/`
- Support for images, PDFs, and text files
- File size and type validation

## 📁 Project Structure

```
arogya-card/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API endpoints
│   │   ├── patient/         # Patient portal pages
│   │   ├── doctor/          # Doctor portal pages
│   │   ├── emergency/       # Emergency access
│   │   └── admin/           # Admin dashboard (future)
│   ├── lib/                 # Utility functions
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── db.ts            # Database connection
│   │   ├── qr.ts            # QR code utilities
│   │   └── utils.ts         # General utilities
│   └── components/          # Reusable components (future)
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Seed data
├── public/
│   └── uploads/             # File uploads
└── package.json
```

## 🔒 Security Features

1. **Authentication & Authorization**
   - JWT token-based authentication
   - Role-based access control
   - Secure password hashing with bcrypt

2. **Data Protection**
   - Input validation with Zod
   - SQL injection prevention with Prisma
   - File upload validation

3. **Audit & Logging**
   - Complete access logs
   - Patient notifications for all access
   - Emergency access tracking

4. **Privacy Controls**
   - Card blocking functionality
   - Selective information sharing
   - Emergency-only data access

## 🔧 API Endpoints

### Patient APIs
- `POST /api/patient/register` - Register new patient
- `GET /api/patient/card/[healthCardId]` - Get patient card
- `POST /api/patient/card/[healthCardId]/block` - Block health card

### Doctor APIs
- `POST /api/doctor/login` - Doctor authentication
- `GET /api/doctor/profile` - Get doctor profile

### Emergency APIs
- `POST /api/emergency/access/[healthCardId]` - Emergency patient access

## 📱 Usage Workflows

### 1. Patient Registration
1. Navigate to "Patient Portal"
2. Fill registration form with required details
3. Upload optional profile picture and medical files
4. Submit to generate health card with QR code

### 2. Doctor Access
1. Login through "Doctor Portal"
2. Use QR scanner or manual search to find patients
3. Access patient records (with full audit logging)
4. Add new medical records if needed

### 3. Emergency Access
1. Navigate to "Emergency Access"
2. Scan patient's QR code
3. View critical information (allergies, blood group, emergency contact)
4. Access is automatically logged and patient is notified

## 🚀 Deployment

### Environment Variables
```env
DATABASE_URL="file:./prod.db"
NEXTAUTH_SECRET="your-production-secret"
JWT_SECRET="your-jwt-secret"
# Add email/SMS credentials for notifications
```

### Production Deployment
1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@arogyacard.com

## 🎯 Future Roadmap

- [ ] Admin dashboard with analytics
- [ ] Blockchain integration for immutable records
- [ ] SMS/Email notification system
- [ ] Biometric authentication
- [ ] Mobile app development
- [ ] Integration with hospital management systems
- [ ] Telemedicine features
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Data export and backup features

---

**Built with ❤️ for better healthcare accessibility**
