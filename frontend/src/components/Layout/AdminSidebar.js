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
  Avatar,
  Chip,
  alpha
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
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

const drawerWidth = 280;

const adminMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Owners', icon: <BusinessIcon />, path: '/admin/owners' },
  { text: 'Properties', icon: <HomeIcon />, path: '/admin/properties' },
  { text: 'Units', icon: <ApartmentIcon />, path: '/admin/units' },
  { text: 'Inspections', icon: <AssignmentIcon />, path: '/admin/inspections' },
  { text: 'Services', icon: <ServicesIcon />, path: '/admin/additional-services' },
  { text: 'Payments', icon: <PaymentIcon />, path: '/admin/payment-methods' },
  { text: 'Agents', icon: <PersonIcon />, path: '/admin/agents' },
  { text: 'Airbnb', icon: <AirbnbIcon />, path: '/admin/airbnb' },
  { text: 'Tenants', icon: <PeopleIcon />, path: '/admin/tenants' },
  { text: 'Messages', icon: <MessageIcon />, path: '/admin/communications' },
  { text: 'Reports', icon: <DescriptionIcon />, path: '/admin/reports' },
  { text: 'System', icon: <SecurityIcon />, path: '/admin/system' },
  { text: 'Logs', icon: <TimelineIcon />, path: '/admin/activity' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/admin/notifications' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' }
];

const AdminSidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      {/* Admin Header */}
      <Box sx={{ px: 4, py: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={logoImage}
          alt="CarryIT Admin"
          sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#222' }}
          variant="rounded"
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#222', letterSpacing: '-0.03em', lineHeight: 1 }}>
            CarryIT
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Admin
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, px: 2, pb: 4, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#EEE', borderRadius: '4px' } }}>
        <List sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
          {adminMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) handleDrawerToggle();
                  }}
                  sx={{
                    py: 1,
                    px: 2,
                    borderRadius: '12px',
                    bgcolor: isActive ? alpha('#222', 0.08) : 'transparent',
                    color: isActive ? '#222' : '#666',
                    '&:hover': {
                      bgcolor: isActive ? alpha('#222', 0.12) : '#F7F7F7',
                      color: isActive ? '#222' : '#222',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#222' : '#999',
                      minWidth: 36,
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.85rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Status */}
      <Box sx={{ p: 3, borderTop: '1px solid #EEE' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#666' }}>System Active</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid #EEE',
            boxShadow: isMobile ? 'none' : '4px 0 24px rgba(0,0,0,0.02)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;
