import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Step,
  Stepper,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  ContactEmergency as EmergencyIcon,
  MedicalServices as MedicalIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const steps = ['Personal Info', 'Emergency Contact', 'Medical History', 'Review & Submit'];

const PatientRegister = () => {
  const navigate = useNavigate();
  const { register: registerPatient, isLoading } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [allergies, setAllergies] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [medications, setMedications] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      }
    }
  });

  const watchPassword = watch('password');

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'dateOfBirth', 'gender'];
      case 1:
        return ['emergencyContact.name', 'emergencyContact.relationship', 'emergencyContact.phone'];
      case 2:
        return []; // Medical history is optional
      default:
        return [];
    }
  };

  const addAllergy = (allergyName) => {
    if (allergyName && !allergies.find(a => a.name === allergyName)) {
      setAllergies([...allergies, { name: allergyName, severity: 'mild' }]);
    }
  };

  const removeAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addDisease = (diseaseName) => {
    if (diseaseName && !diseases.find(d => d.name === diseaseName)) {
      setDiseases([...diseases, { 
        name: diseaseName, 
        diagnosedDate: new Date(),
        status: 'active'
      }]);
    }
  };

  const removeDisease = (index) => {
    setDiseases(diseases.filter((_, i) => i !== index));
  };

  const addMedication = (medicationName) => {
    if (medicationName && !medications.find(m => m.name === medicationName)) {
      setMedications([...medications, {
        name: medicationName,
        dosage: '',
        frequency: '',
        startDate: new Date()
      }]);
    }
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    const registrationData = {
      ...data,
      allergies,
      chronicDiseases: diseases,
      medications
    };

    const result = await registerPatient(registrationData, 'Patient');
    
    if (result.success) {
      navigate('/patient/login', {
        state: {
          message: 'Registration successful! You can now login with your credentials.',
          healthCard: result.healthCard
        }
      });
    }
  };

  const renderPersonalInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" />
          Personal Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your basic information to create your health card profile
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="firstName"
            control={control}
            rules={{ 
              required: 'First name is required',
              minLength: { value: 2, message: 'First name must be at least 2 characters' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="lastName"
            control={control}
            rules={{ 
              required: 'Last name is required',
              minLength: { value: 2, message: 'Last name must be at least 2 characters' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Last Name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            rules={{ 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="email"
                label="Email Address"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={control}
            rules={{ 
              required: 'Phone number is required',
              pattern: {
                value: /^[+]?[\d\s\-\(\)]{10,}$/,
                message: 'Invalid phone number'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Phone Number"
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="password"
            control={control}
            rules={{ 
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain uppercase, lowercase, and number'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="password"
                label="Password"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{ 
              required: 'Please confirm your password',
              validate: value => value === watchPassword || 'Passwords do not match'
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="password"
                label="Confirm Password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="dateOfBirth"
            control={control}
            rules={{ required: 'Date of birth is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.gender}>
            <InputLabel>Gender</InputLabel>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Gender is required' }}
              render={({ field }) => (
                <Select {...field} label="Gender">
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              )}
            />
            {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Blood Group (Optional)</InputLabel>
            <Controller
              name="bloodGroup"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Blood Group (Optional)">
                  <MenuItem value="">Not Known</MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              )}
            />
          </FormControl>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderEmergencyContact = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmergencyIcon color="primary" />
          Emergency Contact
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Provide emergency contact information for urgent situations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="emergencyContact.name"
            control={control}
            rules={{ required: 'Emergency contact name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Full Name"
                error={!!errors.emergencyContact?.name}
                helperText={errors.emergencyContact?.name?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="emergencyContact.relationship"
            control={control}
            rules={{ required: 'Relationship is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Relationship"
                placeholder="e.g., Father, Mother, Spouse, Friend"
                error={!!errors.emergencyContact?.relationship}
                helperText={errors.emergencyContact?.relationship?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="emergencyContact.phone"
            control={control}
            rules={{ 
              required: 'Emergency contact phone is required',
              pattern: {
                value: /^[+]?[\d\s\-\(\)]{10,}$/,
                message: 'Invalid phone number'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Phone Number"
                error={!!errors.emergencyContact?.phone}
                helperText={errors.emergencyContact?.phone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="emergencyContact.email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="email"
                label="Email (Optional)"
                error={!!errors.emergencyContact?.email}
                helperText={errors.emergencyContact?.email?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderMedicalHistory = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MedicalIcon color="primary" />
          Medical History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add your medical history (optional but recommended for better care)
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Allergies Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Allergies</Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type allergy name and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addAllergy(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {allergies.map((allergy, index) => (
              <Chip
                key={index}
                label={`${allergy.name} (${allergy.severity})`}
                onDelete={() => removeAllergy(index)}
                color="error"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>

        {/* Chronic Diseases Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Chronic Diseases</Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type chronic disease and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addDisease(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {diseases.map((disease, index) => (
              <Chip
                key={index}
                label={disease.name}
                onDelete={() => removeDisease(index)}
                color="warning"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>

        {/* Current Medications Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Current Medications</Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type medication name and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addMedication(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {medications.map((medication, index) => (
              <Chip
                key={index}
                label={medication.name}
                onDelete={() => removeMedication(index)}
                color="info"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderReview = () => {
    const formData = watch();
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            Review & Submit
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please review your information before submitting
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 'fit-content' }}>
              <Typography variant="subtitle1" gutterBottom color="primary">
                Personal Information
              </Typography>
              <Typography variant="body2"><strong>Name:</strong> {formData.firstName} {formData.lastName}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {formData.email}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {formData.phone}</Typography>
              <Typography variant="body2"><strong>Date of Birth:</strong> {formData.dateOfBirth}</Typography>
              <Typography variant="body2"><strong>Gender:</strong> {formData.gender}</Typography>
              {formData.bloodGroup && (
                <Typography variant="body2"><strong>Blood Group:</strong> {formData.bloodGroup}</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 'fit-content' }}>
              <Typography variant="subtitle1" gutterBottom color="primary">
                Emergency Contact
              </Typography>
              <Typography variant="body2"><strong>Name:</strong> {formData.emergencyContact.name}</Typography>
              <Typography variant="body2"><strong>Relationship:</strong> {formData.emergencyContact.relationship}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {formData.emergencyContact.phone}</Typography>
              {formData.emergencyContact.email && (
                <Typography variant="body2"><strong>Email:</strong> {formData.emergencyContact.email}</Typography>
              )}
            </Paper>
          </Grid>

          {(allergies.length > 0 || diseases.length > 0 || medications.length > 0) && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Medical History
                </Typography>
                
                {allergies.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Allergies:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {allergies.map((allergy, index) => (
                        <Chip key={index} label={allergy.name} size="small" color="error" />
                      ))}
                    </Box>
                  </Box>
                )}

                {diseases.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Chronic Diseases:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {diseases.map((disease, index) => (
                        <Chip key={index} label={disease.name} size="small" color="warning" />
                      ))}
                    </Box>
                  </Box>
                )}

                {medications.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Current Medications:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {medications.map((medication, index) => (
                        <Chip key={index} label={medication.name} size="small" color="info" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          By submitting this form, you agree to our terms of service and privacy policy. 
          Your health data will be encrypted and securely stored.
        </Alert>
      </motion.div>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderEmergencyContact();
      case 2:
        return renderMedicalHistory();
      case 3:
        return renderReview();
      default:
        return 'Unknown step';
    }
  };

  return (
    <>
      <Helmet>
        <title>Patient Registration - Arogya Card</title>
        <meta name="description" content="Register for your digital health card" />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom color="primary">
                Create Your Health Card
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join thousands of patients who trust Arogya Card for their medical records
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <form onSubmit={handleSubmit(onSubmit)}>
              {getStepContent(activeStep)}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>

                <Box sx={{ flex: '1 1 auto' }} />

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/patient/login" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </>
  );
};

export default PatientRegister;