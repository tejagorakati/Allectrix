import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  QrCodeScanner,
  LocalHospital,
  Dashboard,
  Security,
  AdminPanelSettings,
  NotificationsActive
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const getNavItems = () => {
    if (!isAuthenticated) {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/patient/login"
            variant={location.pathname === '/patient/login' ? 'outlined' : 'text'}
          >
            Patient Login
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/doctor/login"
            variant={location.pathname === '/doctor/login' ? 'outlined' : 'text'}
          >
            Doctor Login
          </Button>
          <Button
            color="secondary"
            component={Link}
            to="/patient/register"
            variant="contained"
            sx={{ ml: 1 }}
          >
            Register
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* User-specific navigation */}
        {user?.userType === 'patient' && (
          <>
            <Tooltip title="My Health Card">
              <IconButton
                color="inherit"
                component={Link}
                to="/patient/health-card"
                size="small"
              >
                <LocalHospital />
              </IconButton>
            </Tooltip>
            <Tooltip title="Dashboard">
              <IconButton
                color="inherit"
                component={Link}
                to="/patient/dashboard"
                size="small"
              >
                <Dashboard />
              </IconButton>
            </Tooltip>
          </>
        )}

        {user?.userType === 'doctor' && (
          <>
            <Tooltip title="Scan QR Code">
              <IconButton
                color="inherit"
                component={Link}
                to="/doctor/scan"
                size="small"
              >
                <QrCodeScanner />
              </IconButton>
            </Tooltip>
            <Tooltip title="Dashboard">
              <IconButton
                color="inherit"
                component={Link}
                to="/doctor/dashboard"
                size="small"
              >
                <Dashboard />
              </IconButton>
            </Tooltip>
          </>
        )}

        {user?.userType === 'admin' && (
          <Tooltip title="Admin Dashboard">
            <IconButton
              color="inherit"
              component={Link}
              to="/admin/dashboard"
              size="small"
            >
              <AdminPanelSettings />
            </IconButton>
          </Tooltip>
        )}

        {/* Emergency Access Button */}
        <Tooltip title="Emergency Access">
          <IconButton
            color="inherit"
            component={Link}
            to="/emergency"
            size="small"
          >
            <Badge badgeContent="!" color="error">
              <Security />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton color="inherit" size="small">
            <Badge badgeContent={3} color="secondary">
              <NotificationsActive />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Avatar and Menu */}
        <IconButton
          onClick={handleMenuOpen}
          size="small"
          sx={{ ml: 1 }}
          aria-controls={anchorEl ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={anchorEl ? 'true' : undefined}
        >
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
            src={user?.profilePicture}
          >
            {user?.firstName?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info */}
          <MenuItem sx={{ cursor: 'default' }}>
            <Avatar src={user?.profilePicture}>
              {user?.firstName?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.userType?.charAt(0).toUpperCase() + user?.userType?.slice(1)}
              </Typography>
            </Box>
          </MenuItem>
          
          <Divider />

          {/* Profile */}
          <MenuItem onClick={() => handleNavigation(`/${user?.userType}/profile`)}>
            <AccountCircle fontSize="small" sx={{ mr: 1 }} />
            Profile
          </MenuItem>

          {/* Settings */}
          <MenuItem onClick={() => handleNavigation('/settings')}>
            <Settings fontSize="small" sx={{ mr: 1 }} />
            Settings
          </MenuItem>

          {/* Privacy Settings */}
          <MenuItem onClick={() => handleNavigation('/privacy')}>
            <Security fontSize="small" sx={{ mr: 1 }} />
            Privacy & Security
          </MenuItem>

          <Divider />

          {/* Logout */}
          <MenuItem onClick={handleLogout}>
            <Logout fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <LocalHospital sx={{ mr: 1, fontSize: 28 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            Arogya Card
          </Typography>
          {user && (
            <Typography
              variant="caption"
              sx={{
                ml: 2,
                px: 1,
                py: 0.5,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 1,
                textTransform: 'capitalize'
              }}
            >
              {user.userType}
            </Typography>
          )}
        </Box>

        {/* Navigation Items */}
        {getNavItems()}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;