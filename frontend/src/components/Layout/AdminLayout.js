import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
  Badge,
  alpha
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  Notifications as NotificationsIcon,
  Person
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import AdminSidebar from './AdminSidebar';
import authService from '../../services/authService';

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const loadUnreadCount = async () => {
    try {
      const api = authService.createAxiosInstance();
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data?.unread_count || 0);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const drawerWidth = 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F7F7F7' }}>
      {/* Admin App Bar - Premium Glassmorphism */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
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
              Control Center
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              sx={{ bgcolor: alpha('#EEE', 0.5), mr: 1 }}
              onClick={() => window.location.href = '#/admin/notifications'}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
            
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5, border: '1px solid #EEE' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#222', fontWeight: 800, fontSize: '0.9rem' }}>
                {user?.first_name?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Admin Sidebar */}
      <AdminSidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>

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
            minWidth: 200,
            p: 1
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{user?.first_name} {user?.last_name}</Typography>
          <Typography variant="caption" color="text.secondary">System Administrator</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleProfileMenuClose} sx={{ borderRadius: '8px', mb: 0.5 }}>
          <Person sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={600}>Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose} sx={{ borderRadius: '8px', mb: 0.5 }}>
          <Settings sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={600}>System Settings</Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', color: '#ef4444' }}>
          <Logout sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={700}>Sign Out</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminLayout;
