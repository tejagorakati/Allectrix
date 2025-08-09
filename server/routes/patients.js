const express = require('express');
const { verifyToken, verifyPatient, auditLog } = require('../middleware/auth');
const Patient = require('../models/Patient');
const { generateQRCodeImage, generateHealthCardId } = require('../utils/qrCode');

const router = express.Router();

// Get patient profile
router.get('/profile', verifyToken, verifyPatient, auditLog('view_profile'), async (req, res) => {
  try {
    const patient = req.patient.getSafeData();
    
    res.json({
      success: true,
      data: { patient }
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update patient profile
router.put('/profile', verifyToken, verifyPatient, auditLog('update_profile'), async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'emergencyContacts', 
      'medicalInfo', 'notificationPreferences', 'profilePicture'
    ];
    
    // Filter allowed updates
    const validUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        validUpdates[key] = updates[key];
      }
    });

    // Update patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.patient._id,
      { ...validUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    const patientData = updatedPatient.getSafeData();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { patient: patientData }
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get health card details
router.get('/health-card', verifyToken, verifyPatient, auditLog('view_health_card'), async (req, res) => {
  try {
    const patient = req.patient;
    
    // Generate QR code image if not exists
    let qrCodeImage = null;
    if (patient.qrCodeData) {
      qrCodeImage = await generateQRCodeImage(patient.qrCodeData);
    }

    const healthCard = {
      id: patient.healthCardId,
      status: patient.cardStatus,
      issueDate: patient.cardIssueDate,
      expiryDate: patient.cardExpiryDate,
      qrCodeData: patient.qrCodeData,
      qrCodeImage
    };

    res.json({
      success: true,
      data: { healthCard }
    });
  } catch (error) {
    console.error('Get health card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Report lost/stolen card
router.post('/report-lost-card', verifyToken, verifyPatient, auditLog('report_lost_card'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    // Block current card
    await Patient.findByIdAndUpdate(req.patient._id, {
      cardStatus: 'lost',
      updatedAt: new Date()
    });

    // TODO: Generate new card with new QR code
    // TODO: Notify admin and doctors about blocked card
    // TODO: Add to audit log

    res.json({
      success: true,
      message: 'Card reported as lost/stolen. A new card will be issued shortly.',
      data: {
        reportedAt: new Date(),
        reason: reason || 'Lost/Stolen'
      }
    });
  } catch (error) {
    console.error('Report lost card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get medical records (patient view)
router.get('/records', verifyToken, verifyPatient, auditLog('view_own_records'), async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { 
      patientId: req.patient._id,
      isDeleted: false
    };

    if (type) {
      query.recordType = type;
    }

    // Get records with pagination
    const MedicalRecord = require('../models/MedicalRecord');
    const records = await MedicalRecord.find(query)
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MedicalRecord.countDocuments(query);

    // Convert to patient view
    const patientRecords = records.map(record => record.getPatientView());

    res.json({
      success: true,
      data: {
        records: patientRecords,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: records.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Get patient records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update privacy settings
router.put('/privacy', verifyToken, verifyPatient, auditLog('update_privacy'), async (req, res) => {
  try {
    const { privacySettings } = req.body;
    
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.patient._id,
      { 
        privacySettings: {
          ...req.patient.privacySettings,
          ...privacySettings
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: {
        privacySettings: updatedPatient.privacySettings
      }
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get access logs
router.get('/access-logs', verifyToken, verifyPatient, auditLog('view_access_logs'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const MedicalRecord = require('../models/MedicalRecord');
    
    // Get all records for this patient to extract audit trails
    const records = await MedicalRecord.find({ 
      patientId: req.patient._id 
    }).populate('auditTrail.performedBy.userId', 'firstName lastName');

    // Extract and flatten audit trails
    let allAuditEntries = [];
    records.forEach(record => {
      if (record.auditTrail && record.auditTrail.length > 0) {
        record.auditTrail.forEach(entry => {
          allAuditEntries.push({
            ...entry.toObject(),
            recordId: record._id,
            recordType: record.recordType
          });
        });
      }
    });

    // Sort by timestamp (newest first)
    allAuditEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const paginatedEntries = allAuditEntries.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        accessLogs: paginatedEntries,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(allAuditEntries.length / limit),
          count: paginatedEntries.length,
          totalLogs: allAuditEntries.length
        }
      }
    });
  } catch (error) {
    console.error('Get access logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;