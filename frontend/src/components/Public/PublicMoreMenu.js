import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  Menu as MenuIcon,
  Gavel,
  Login,
  HomeWork,
  Business,
  AdminPanelSettings,
  PersonPin,
  Dashboard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PublicMoreMenu = ({ onRequestProperty }) => {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  const go = (path) => {
    navigate(path);
    setAnchor(null);
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ border: `1px solid ${'#EBEBEB'}`, borderRadius: '12px' }}
        aria-label="More options"
      >
        <MenuIcon sx={{ fontSize: 20 }} />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: '12px', minWidth: 220, mt: 1 } }}
      >
        {onRequestProperty && (
          <MenuItem onClick={() => { onRequestProperty(); setAnchor(null); }}>
            <ListItemIcon><HomeWork fontSize="small" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Request a home</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => go('/guidelines')}>
          <ListItemIcon><Gavel fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Trust & fees</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => go('/portals')}>
          <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
          <ListItemText
            primary="Owner / Admin / Agent"
            secondary="Portal sign-in"
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </MenuItem>
        <MenuItem onClick={() => go('/owner-login')}>
          <ListItemIcon><Business fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Property owner login</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => go('/admin-login')}>
          <ListItemIcon><AdminPanelSettings fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Admin login</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => go('/agent-login')}>
          <ListItemIcon><PersonPin fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Agent login</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => go('/login')}>
          <ListItemIcon><Login fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Tenant sign in</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default PublicMoreMenu;
