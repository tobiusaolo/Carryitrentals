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
  Badge
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon
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
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Expose loadUnreadCount to window for manual refresh from other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshNotificationCount = loadUnreadCount;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshNotificationCount;
      }
    };
  }, []);

  const drawerWidth = 280;
  const mobileDrawerWidth = 240;

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: 'grey.50'
    }}>
      {/* Admin App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.3s ease-in-out, margin 0.3s ease-in-out',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={logoImage}
              alt="Easy Rentals Logo"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: { xs: 'none', sm: 'flex' }
              }}
              variant="rounded"
            />
            <Typography variant="h6" noWrap component="div" color="text.primary" sx={{ fontWeight: 600 }}>
              Easy Rentals - Admin Dashboard
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="inherit"
              onClick={() => window.location.href = '/admin/notifications'}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
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
          p: { xs: 1.5, md: 2 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', md: '64px' },
          bgcolor: 'grey.50',
          minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
          transition: 'width 0.3s ease-in-out',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        <Outlet />
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
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
        <MenuItem onClick={handleProfileMenuClose}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user?.first_name?.charAt(0) || 'A'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Administrator
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleProfileMenuClose}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <Settings sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminLayout;
