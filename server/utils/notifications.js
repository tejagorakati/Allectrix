const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Configure email transporter
const emailTransporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Configure Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Send welcome email to new patients
 */
async function sendWelcomeEmail(patient) {
  try {
    if (!process.env.EMAIL_USER) {
      console.log('Email service not configured, skipping welcome email');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: patient.email,
      subject: 'Welcome to Arogya Card - Your Digital Health Card is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #10b981); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Arogya Card!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Hello ${patient.firstName} ${patient.lastName},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #64748b;">
              Congratulations! Your digital health card has been successfully created. You now have secure, 
              instant access to your medical records from anywhere.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #2563eb; margin-top: 0;">Your Health Card Details:</h3>
              <p><strong>Health Card ID:</strong> ${patient.healthCardId}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
            
            <h3 style="color: #2563eb;">What's Next?</h3>
            <ul style="color: #64748b; line-height: 1.8;">
              <li>📱 Download your QR code for easy access</li>
              <li>🏥 Upload your existing medical documents</li>
              <li>🔒 Set up biometric authentication for enhanced security</li>
              <li>👨‍⚕️ Share your health card ID with your healthcare providers</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/patient/login" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              <strong>Security Note:</strong> Your health data is encrypted and secure. Never share your login credentials with anyone.
            </p>
          </div>
          
          <div style="background: #1e293b; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; margin: 0; font-size: 14px;">
              © 2024 Arogya Card. Built for better healthcare accessibility.
            </p>
          </div>
        </div>
      `
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

/**
 * Send SMS notification
 */
async function sendSMS(phoneNumber, message) {
  try {
    if (!twilioClient) {
      console.log('Twilio not configured, skipping SMS:', message);
      return;
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

/**
 * Send email notification for card blocking
 */
async function sendCardBlockedEmail(patient) {
  try {
    if (!process.env.EMAIL_USER) {
      console.log('Email service not configured, skipping card blocked email');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: patient.email,
      subject: 'SECURITY ALERT: Your Arogya Card has been blocked',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ef4444; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🚨 Security Alert</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Hello ${patient.firstName},</h2>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #991b1b; font-weight: 600; margin: 0;">
                Your Arogya Card (ID: ${patient.healthCardId}) has been reported as lost/stolen and has been temporarily blocked.
              </p>
            </div>
            
            <p style="color: #64748b;">
              If you did not request this action, please contact our support team immediately.
            </p>
            
            <h3 style="color: #2563eb;">What This Means:</h3>
            <ul style="color: #64748b;">
              <li>Your health card is temporarily inaccessible</li>
              <li>Healthcare providers cannot access your records using the QR code</li>
              <li>You can reactivate your card through your dashboard</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/patient/dashboard" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Manage Your Card
              </a>
            </div>
          </div>
        </div>
      `
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Card blocked email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending card blocked email:', error);
    throw error;
  }
}

/**
 * Send doctor verification email
 */
async function sendDoctorVerificationEmail(doctor) {
  try {
    if (!process.env.EMAIL_USER) {
      console.log('Email service not configured, skipping doctor verification email');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: doctor.email,
      subject: 'Doctor Registration - Verification Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #10b981); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Doctor Registration Received</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Hello Dr. ${doctor.lastName},</h2>
            
            <p style="color: #64748b;">
              Thank you for registering with Arogya Card. Your application is currently under review.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; font-weight: 600; margin: 0;">
                Your account is pending verification. You will receive an email once your credentials are verified.
              </p>
            </div>
            
            <h3 style="color: #2563eb;">Next Steps:</h3>
            <ul style="color: #64748b;">
              <li>Our team will verify your medical license and credentials</li>
              <li>You will receive a confirmation email within 24-48 hours</li>
              <li>Once verified, you can access the doctor portal</li>
            </ul>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Doctor verification email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending doctor verification email:', error);
    throw error;
  }
}

/**
 * Send emergency access notification
 */
async function sendEmergencyAccessNotification(patient, accessDetails) {
  try {
    if (!twilioClient) {
      console.log('Twilio not configured, skipping emergency access SMS');
      return;
    }

    const message = `EMERGENCY ACCESS ALERT: Your Arogya Card was accessed by emergency personnel at ${new Date().toLocaleString()}. Location: ${accessDetails.location || 'Unknown'}. If this was not authorized, contact support immediately.`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: patient.phone
    });

    console.log('Emergency access SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending emergency access SMS:', error);
    throw error;
  }
}

/**
 * Send appointment reminder
 */
async function sendAppointmentReminder(patient, appointmentDetails) {
  try {
    const message = `Reminder: You have a medical appointment with ${appointmentDetails.doctorName} on ${appointmentDetails.date} at ${appointmentDetails.time}. Please bring your Arogya Card ID: ${patient.healthCardId}`;

    return await sendSMS(patient.phone, message);
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(user, resetToken) {
  try {
    if (!process.env.EMAIL_USER) {
      console.log('Email service not configured, skipping password reset email');
      return;
    }

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request - Arogya Card',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Hello ${user.firstName},</h2>
            
            <p style="color: #64748b;">
              We received a request to reset your password for your Arogya Card account.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendSMS,
  sendCardBlockedEmail,
  sendDoctorVerificationEmail,
  sendEmergencyAccessNotification,
  sendAppointmentReminder,
  sendPasswordResetEmail
};