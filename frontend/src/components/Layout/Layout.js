import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  Person,
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import { logout } from '../../store/slices/authSlice';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleProfileMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F7F7F7', minHeight: '100vh' }}>
      {/* App Bar - Premium Glassmorphism */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${280}px)` },
          ml: { md: `${280}px` },
          backgroundColor: alpha('#FFF', 0.8),
          backdropFilter: 'blur(12px)',
          color: '#222',
          borderBottom: '1px solid #EEE',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', display: { xs: 'none', md: 'block' } }}>
              Owner Portal
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
            )}
            
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5, border: '1px solid #EEE' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#667eea', fontWeight: 800, fontSize: '0.9rem' }}>
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            borderRadius: '16px',
            border: '1px solid #EEE',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            minWidth: 180,
            p: 1
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose} sx={{ borderRadius: '8px', mb: 0.5 }}>
          <Person sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={600}>Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose} sx={{ borderRadius: '8px', mb: 0.5 }}>
          <Settings sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={600}>Settings</Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', color: '#ef4444' }}>
          <Logout sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={700}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${280}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
