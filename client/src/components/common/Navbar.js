import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  LocalHospital as HealthIcon,
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    return user.userType === 'Doctor' ? '/doctor/dashboard' :
           user.userType === 'Admin' ? '/admin/dashboard' :
           '/patient/dashboard';
  };

  const renderProfileMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      onClick={handleMenuClose}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 200,
          '& .MuiMenuItem-root': {
            px: 2,
            py: 1
          }
        }
      }}
    >
      <MenuItem onClick={() => navigate(getDashboardPath())}>
        <DashboardIcon sx={{ mr: 1 }} />
        Dashboard
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  const renderMobileMenu = () => (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMenuClose}
      onClick={handleMenuClose}
    >
      {!isAuthenticated ? (
        [
          <MenuItem key="patient-login" onClick={() => navigate('/patient/login')}>
            Patient Login
          </MenuItem>,
          <MenuItem key="doctor-login" onClick={() => navigate('/doctor/login')}>
            Doctor Login
          </MenuItem>,
          <MenuItem key="patient-register" onClick={() => navigate('/patient/register')}>
            Register
          </MenuItem>
        ]
      ) : (
        [
          <MenuItem key="dashboard" onClick={() => navigate(getDashboardPath())}>
            Dashboard
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>
            Logout
          </MenuItem>
        ]
      )}
    </Menu>
  );

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Logo and App Name */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: { xs: 1, md: 0 },
            mr: { md: 4 }
          }}
        >
          <HealthIcon 
            sx={{ 
              mr: 1, 
              fontSize: 30,
              color: 'primary.main'
            }} 
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb, #10b981)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Arogya Card
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            {!isAuthenticated && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  color="inherit"
                  component={Link}
                  to="/emergency"
                  sx={{ fontWeight: 500 }}
                >
                  Emergency Access
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Right side buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isMobile ? (
            // Desktop buttons
            !isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/patient/login"
                  sx={{ fontWeight: 500 }}
                >
                  Patient Login
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/doctor/login"
                  sx={{ fontWeight: 500 }}
                >
                  Doctor Login
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/patient/register"
                  sx={{ ml: 1 }}
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  Welcome, {user?.firstName}
                </Typography>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{
                    p: 0.5,
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem'
                    }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                </IconButton>
              </>
            )
          ) : (
            // Mobile menu button
            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {renderProfileMenu()}
        {renderMobileMenu()}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;