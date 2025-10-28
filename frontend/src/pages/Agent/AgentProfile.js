import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  Work,
  CalendarToday,
  CheckCircle,
  Home,
  AttachMoney,
  LocationOn,
  Badge as BadgeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import api from '../../services/api/api';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AgentProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [agentProfile, setAgentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutDialog, setLogoutDialog] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadAgentProfile();
  }, []);

  const loadAgentProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agents/my-profile');
      console.log('Agent profile loaded:', response.data);
      setAgentProfile(response.data);
    } catch (err) {
      console.error('Error loading agent profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/agent-login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const displayName = agentProfile?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Agent';
  const initials = agentProfile?.name
    ? agentProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '');

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        My Profile
      </Typography>

      {/* Profile Card */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 3, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Avatar
            src={agentProfile?.profile_picture || ''}
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.3)',
              fontSize: '3rem',
              border: '4px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
            }}
          >
            {!agentProfile?.profile_picture && initials}
          </Avatar>
          
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {displayName}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
            Property Agent
          </Typography>
          
          {agentProfile?.specialization && (
            <Chip
              label={agentProfile.specialization}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                mb: 2,
                fontWeight: 'bold'
              }}
            />
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <CheckCircle fontSize="small" />
            <Typography variant="body2">
              {agentProfile?.is_active ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Phone Number"
                  secondary={agentProfile?.phone || user?.phone || 'Not provided'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={agentProfile?.email || user?.email || 'Not provided'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <LocationOn color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Location"
                  secondary={agentProfile?.location || 'Not provided'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <BadgeIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="NIN Number"
                  secondary={agentProfile?.nin_number || 'Not provided'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Person color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Age"
                  secondary={agentProfile?.age ? `${agentProfile.age} years` : 'Not provided'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CalendarToday color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Member Since"
                  secondary={new Date(agentProfile?.created_at || user?.created_at || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Additional Information */}
        {agentProfile?.notes && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Additional Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {agentProfile.notes}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Logout Button */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => setLogoutDialog(true)}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Logout
          </Button>
        </Grid>
      </Grid>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setLogoutDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: { xs: '90vw', sm: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <LogoutIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Logout Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to logout from your agent account?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setLogoutDialog(false)}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none'
            }}
          >
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentProfile;

