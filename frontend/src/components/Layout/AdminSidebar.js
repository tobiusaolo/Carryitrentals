import React, { useState, useEffect } from 'react';
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
  Badge,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
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
  Analytics as AnalyticsIcon,
  Report as ReportIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { colors, layout } from '../../theme/designTokens';
import { ADMIN_NAV_SECTIONS } from '../../constants/adminNav';
import useAdminNavBadges from '../../hooks/useAdminNavBadges';

const drawerWidth = layout.adminSidebarWidth;

const PATH_ICONS = {
  '/admin': <DashboardIcon />,
  '/admin/revenue': <PaymentIcon />,
  '/admin/analytics': <AnalyticsIcon />,
  '/admin/owners': <BusinessIcon />,
  '/admin/properties': <HomeIcon />,
  '/admin/internal-units': <ApartmentIcon />,
  '/admin/listing-requests': <AssignmentIcon />,
  '/admin/listing-reports': <ReportIcon />,
  '/admin/payment-intents': <PaymentIcon />,
  '/admin/maintenance': <BuildIcon />,
  '/admin/units': <ApartmentIcon />,
  '/admin/airbnb': <AirbnbIcon />,
  '/admin/tenants': <PeopleIcon />,
  '/admin/agents': <PersonIcon />,
  '/admin/inspections': <AssignmentIcon />,
  '/admin/viewing-payments': <PaymentIcon />,
  '/admin/additional-services': <ServicesIcon />,
  '/admin/communications': <MessageIcon />,
  '/admin/reports': <DescriptionIcon />,
  '/admin/payment-methods': <PaymentIcon />,
  '/admin/notifications': <NotificationsIcon />,
  '/admin/system': <SecurityIcon />,
  '/admin/activity': <TimelineIcon />,
  '/admin/settings': <SettingsIcon />,
};

const NavItem = ({ item, isActive, onNavigate, badgeCount = 0 }) => (
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
        <Badge
          badgeContent={badgeCount}
          color="error"
          invisible={!badgeCount}
          sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}
        >
          {React.cloneElement(PATH_ICONS[item.path] || <DashboardIcon />, { sx: { fontSize: 18 } })}
        </Badge>
      </ListItemIcon>
      <ListItemText
        primary={item.text}
        primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.8125rem' }}
      />
    </ListItemButton>
  </ListItem>
);

const COLLAPSE_STORAGE_KEY = 'carryit-admin-nav-collapsed';

const AdminSidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { badges } = useAdminNavBadges(true);
  const [collapsedSections, setCollapsedSections] = useState(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const toggleSection = (label) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const go = (path) => {
    navigate(path);
    if (isMobile) handleDrawerToggle();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.surface }}>
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
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
        {ADMIN_NAV_SECTIONS.map((section) => {
          const isCollapsed = Boolean(collapsedSections[section.label]);
          return (
          <Box key={section.label} sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                mb: 0.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => toggleSection(section.label)}
            >
              <Typography
                variant="caption"
                sx={{
                  px: 0.5,
                  fontWeight: 700,
                  color: colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.65rem',
                }}
              >
                {section.label}
              </Typography>
              <IconButton size="small" sx={{ p: 0.25 }} aria-label={`Toggle ${section.label}`}>
                {isCollapsed ? <ExpandMoreIcon sx={{ fontSize: 16 }} /> : <ExpandLessIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Box>
            <Collapse in={!isCollapsed}>
            <List disablePadding>
              {section.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  onNavigate={go}
                  badgeCount={item.badgeKey ? badges[item.badgeKey] : 0}
                />
              ))}
            </List>
            </Collapse>
          </Box>
        );
        })}
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
