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
  alpha,
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
  MiscellaneousServices as ServicesIcon,
} from '@mui/icons-material';
import { colors, layout } from '../../theme/designTokens';

const drawerWidth = layout.adminSidebarWidth;

const navSections = [
  {
    label: 'Overview',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
      { text: 'Platform revenue', icon: <PaymentIcon />, path: '/admin/revenue' },
    ],
  },
  {
    label: 'Listings',
    items: [
      { text: 'Owners', icon: <BusinessIcon />, path: '/admin/owners' },
      { text: 'Properties', icon: <HomeIcon />, path: '/admin/properties' },
      { text: 'Units', icon: <ApartmentIcon />, path: '/admin/units' },
      { text: 'Airbnb', icon: <AirbnbIcon />, path: '/admin/airbnb' },
    ],
  },
  {
    label: 'People',
    items: [
      { text: 'Agents', icon: <PersonIcon />, path: '/admin/agents' },
      { text: 'Tenants', icon: <PeopleIcon />, path: '/admin/tenants' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { text: 'Inspections', icon: <AssignmentIcon />, path: '/admin/inspections' },
      { text: 'Services', icon: <ServicesIcon />, path: '/admin/additional-services' },
      { text: 'Payment methods', icon: <PaymentIcon />, path: '/admin/payment-methods' },
      { text: 'Viewing payments', icon: <PaymentIcon />, path: '/admin/viewing-payments' },
      { text: 'Messages', icon: <MessageIcon />, path: '/admin/communications' },
      { text: 'Reports', icon: <DescriptionIcon />, path: '/admin/reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { text: 'Health', icon: <SecurityIcon />, path: '/admin/system' },
      { text: 'Logs', icon: <TimelineIcon />, path: '/admin/activity' },
      { text: 'Alerts', icon: <NotificationsIcon />, path: '/admin/notifications' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
    ],
  },
];

const NavItem = ({ item, isActive, onNavigate }) => (
  <ListItem disablePadding sx={{ mb: 0.25 }}>
    <ListItemButton
      onClick={() => onNavigate(item.path)}
      sx={{
        py: 0.75,
        px: 1.5,
        borderRadius: `${layout.radius.md}px`,
        bgcolor: isActive ? alpha(colors.adminAccent, 0.08) : 'transparent',
        color: isActive ? colors.text : colors.textMuted,
        '&:hover': { bgcolor: alpha(colors.adminAccent, 0.06), color: colors.text },
      }}
    >
      <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
        {React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
      </ListItemIcon>
      <ListItemText
        primary={item.text}
        primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.8125rem' }}
      />
    </ListItemButton>
  </ListItem>
);

const AdminSidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path) => {
    navigate(path);
    if (isMobile) handleDrawerToggle();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.surface }}>
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${colors.border}` }}>
        <Avatar src={logoImage} alt="CarryIT" sx={{ width: 36, height: 36, borderRadius: '8px' }} variant="rounded" />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.text, lineHeight: 1.2 }}>
            CarryIT
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 600 }}>
            Admin
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, px: 1.5, py: 2, overflowY: 'auto' }}>
        {navSections.map((section) => (
          <Box key={section.label} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                mb: 0.5,
                display: 'block',
                fontWeight: 700,
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.65rem',
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  onNavigate={go}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: `1px solid ${colors.border}`,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;
