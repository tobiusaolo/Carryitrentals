import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  Apartment as ApartmentIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Message as MessageIcon,
  Description as DescriptionIcon,
  Bed as AirbnbIcon,
  MiscellaneousServices as ServicesIcon
} from '@mui/icons-material';

const AdminSidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    { 
      text: 'Admin Dashboard', 
      icon: <DashboardIcon />, 
      path: '/admin',
      description: 'System overview and metrics'
    },
    { 
      text: 'Property Owners', 
      icon: <BusinessIcon />, 
      path: '/admin/owners',
      description: 'Manage property owners'
    },
    { 
      text: 'Properties Overview', 
      icon: <HomeIcon />, 
      path: '/admin/properties',
      description: 'All properties in system'
    },
    { 
      text: 'Units for Rent', 
      icon: <ApartmentIcon />, 
      path: '/admin/units',
      description: 'Manage rental units'
    },
    { 
      text: 'Inspections', 
      icon: <AssignmentIcon />, 
      path: '/admin/inspections',
      description: 'Manage property inspections'
    },
    { 
      text: 'Additional Services', 
      icon: <ServicesIcon />, 
      path: '/admin/additional-services',
      description: 'Manage inspection services (Moving, Packaging, Cleaning)'
    },
    { 
      text: 'Payment Methods', 
      icon: <PaymentIcon />, 
      path: '/admin/payment-methods',
      description: 'Configure payment methods'
    },
    { 
      text: 'Agents', 
      icon: <PersonIcon />, 
      path: '/admin/agents',
      description: 'Manage inspection agents'
    },
    { 
      text: 'Airbnb Listings', 
      icon: <AirbnbIcon />, 
      path: '/admin/airbnb',
      description: 'Manage Airbnb properties'
    },
    { 
      text: 'Tenant Management', 
      icon: <PeopleIcon />, 
      path: '/admin/tenants',
      description: 'Manage all tenants'
    },
    { 
      text: 'Communications', 
      icon: <MessageIcon />, 
      path: '/admin/communications',
      description: 'System-wide messaging'
    },
    { 
      text: 'Reports', 
      icon: <DescriptionIcon />, 
      path: '/admin/reports',
      description: 'Generate reports'
    },
    { 
      text: 'System Health', 
      icon: <SecurityIcon />, 
      path: '/admin/system',
      description: 'System monitoring and health'
    },
    { 
      text: 'Activity Logs', 
      icon: <TimelineIcon />, 
      path: '/admin/activity',
      description: 'System activity and logs'
    },
    { 
      text: 'Notifications', 
      icon: <NotificationsIcon />, 
      path: '/admin/notifications',
      description: 'System notifications'
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/admin/settings',
      description: 'System configuration and mobile money settings'
    }
  ];

  const drawerWidth = 280;
  const mobileDrawerWidth = 240;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Admin Header */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 2 }}>
            <AdminIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Admin Panel
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              System Administration
            </Typography>
          </Box>
        </Box>
        <Chip 
          label="Administrator" 
          size="small" 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            fontWeight: 'bold'
          }} 
        />
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
          {adminMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) {
                      handleDrawerToggle();
                    }
                  }}
                  sx={{
                    backgroundColor: isActive ? 'primary.light' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.light' : 'action.hover',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.9rem'
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: isActive ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* System Status */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: 'success.main', 
            mr: 1 
          }} />
          <Typography variant="body2" color="text.secondary">
            System Online
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? mobileOpen : true}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', md: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: { xs: mobileDrawerWidth, md: drawerWidth },
          borderRight: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'white',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default AdminSidebar;
