import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import {
  Person,
  ContactPhone,
  MedicalInformation,
  Security,
  Visibility,
  VisibilityOff,
  QrCode,
  CheckCircle
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

// Validation schema
const schema = yup.object({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().required('Phone number is required').matches(/^[0-9+\-\s()]+$/, 'Invalid phone number'),
  dateOfBirth: yup.date().required('Date of birth is required').max(new Date(), 'Date of birth cannot be in the future'),
  gender: yup.string().required('Gender is required'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required')
});

const steps = ['Personal Information', 'Medical Information', 'Emergency Contacts', 'Account Setup'];

const PatientRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  // Watch all form values for step validation
  const watchedValues = watch();

  const handleNext = async () => {
    let fieldsToValidate = [];
    
    switch (activeStep) {
      case 0:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'];
        break;
      case 1:
        // Medical information is optional
        break;
      case 2:
        // Emergency contacts are optional but recommended
        break;
      case 3:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
      default:
        break;
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (activeStep === steps.length - 1) {
      await handleRegistration();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleRegistration = async () => {
    setLoading(true);
    try {
      const formData = getValues();
      
      const registrationPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        password: formData.password,
        medicalInfo: {
          bloodGroup: formData.bloodGroup,
          allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
          chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(d => d.trim()) : [],
          medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : [],
          emergencyInfo: formData.emergencyInfo
        },
        emergencyContacts: []
      };

      // Add emergency contact if provided
      if (formData.emergencyContactName && formData.emergencyContactPhone) {
        registrationPayload.emergencyContacts.push({
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship || 'Emergency Contact',
          phone: formData.emergencyContactPhone,
          email: formData.emergencyContactEmail
        });
      }

      const result = await register(registrationPayload, 'patient');
      
      if (result.success) {
        setRegistrationData(result.data);
        setActiveStep(steps.length); // Move to success step
        toast.success('Registration successful! Your health card has been generated.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel>Gender *</InputLabel>
                    <Select {...field} label="Gender *">
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {errors.gender && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.gender.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Medical Information (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This information helps medical professionals provide better care in emergencies.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="bloodGroup"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Blood Group</InputLabel>
                    <Select {...field} label="Blood Group">
                      <MenuItem value="">Select Blood Group</MenuItem>
                      <MenuItem value="A+">A+</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="allergies"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Allergies"
                    placeholder="e.g., Penicillin, Peanuts (comma separated)"
                    helperText="List any known allergies, separated by commas"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="chronicDiseases"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Chronic Diseases"
                    placeholder="e.g., Diabetes, Hypertension (comma separated)"
                    helperText="List any chronic conditions, separated by commas"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="medications"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Current Medications"
                    placeholder="e.g., Metformin, Lisinopril (comma separated)"
                    helperText="List current medications, separated by commas"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="emergencyInfo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Emergency Medical Information"
                    multiline
                    rows={3}
                    placeholder="Any critical information for emergency situations"
                    helperText="Important medical information for emergency responders"
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Emergency Contact (Recommended)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add someone who can be contacted in case of medical emergencies.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="emergencyContactName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Emergency Contact Name"
                    placeholder="e.g., John Doe"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="emergencyContactRelationship"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Relationship"
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="emergencyContactPhone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    placeholder="Emergency contact phone"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="emergencyContactEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email (Optional)"
                    type="email"
                    placeholder="Emergency contact email"
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Account Security
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create a secure password for your account.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message || 'Password must be at least 8 characters'}
                    required
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    required
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const renderSuccessStep = () => (
    <Box textAlign="center" py={4}>
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom color="success.main">
        Registration Successful!
      </Typography>
      <Typography variant="h6" paragraph>
        Welcome to Arogya Card, {registrationData?.patient?.firstName}!
      </Typography>
      
      <Card sx={{ mt: 4, mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
            <QrCode sx={{ fontSize: 40, mr: 1 }} />
            <Typography variant="h6">Your Health Card</Typography>
          </Box>
          
          <Typography variant="body1" gutterBottom>
            Health Card ID: <strong>{registrationData?.healthCard?.id}</strong>
          </Typography>
          
          {registrationData?.qrCode && (
            <Box mt={2}>
              <img 
                src={registrationData.qrCode} 
                alt="Health Card QR Code" 
                style={{ maxWidth: '200px', border: '1px solid #ddd', borderRadius: '8px' }}
              />
            </Box>
          )}
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Save this QR code and your Health Card ID. Doctors will use this to access your medical records.
          </Alert>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          onClick={() => navigate('/patient/dashboard')}
          size="large"
        >
          Go to Dashboard
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/patient/health-card')}
          size="large"
        >
          View Health Card
        </Button>
      </Stack>
    </Box>
  );

  if (activeStep === steps.length) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {renderSuccessStep()}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Person sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Patient Registration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your account and get your digital health card
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(handleNext)}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : activeStep === steps.length - 1 ? 'Create Account' : 'Next'}
            </Button>
          </Box>
        </form>

        <Divider sx={{ my: 3 }} />
        
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button component={RouterLink} to="/patient/login" color="primary">
              Login here
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PatientRegister;