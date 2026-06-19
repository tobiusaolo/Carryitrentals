import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  Paper,
  CircularProgress,
  Divider,
  Avatar,
  Fade
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Phone,
  PersonPin,
} from '@mui/icons-material';
import axios from 'axios';
import { setCredentials } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { API_BASE_URL } from '../../config/api';

const AgentLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/agent-login`, { phone });
      const { access_token, refresh_token, user } = response.data;

      if (!access_token || !refresh_token || !user) {
        setError('Login error: Invalid response from server.');
        return;
      }

      const roleStr = String(user.role || '').toLowerCase();
      const isAgent = roleStr === 'agent' || roleStr === 'userrole.agent';
      
      if (!isAgent) {
        setError(`Access denied. This login is for agents only.`);
        return;
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      authService.refreshTokenFromStorage();

      dispatch(setCredentials({
        user: user,
        token: access_token,
        refreshToken: refresh_token
      }));

      setTimeout(() => {
        navigate('/agent', { replace: true });
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your phone number.';
      if (err.response?.data?.detail) {
        errorMessage = typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : 'Validation error';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7F7F7', display: 'flex', flexDirection: 'column' }}>
      
      <Container maxWidth="xs" sx={{ mt: 12, mb: 4 }}>
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: '24px', 
              border: '1px solid #DDD',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '16px',
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#667eea',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
                variant="rounded"
              >
                <PersonPin sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#222' }}>
                Agent Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your phone to access dashboard
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="+256..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
                disabled={loading}
                margin="normal"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: '#667eea', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Passwordless login via registered phone"
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading || !phone.trim()}
                sx={{
                  mt: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#667eea',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#5a6fd8' }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login as Agent'}
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Don't have an agent account? Contact your administrator.
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default AgentLogin;
