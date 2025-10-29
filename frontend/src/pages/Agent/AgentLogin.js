import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  Paper,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  Phone,
  PersonPin,
  Login,
  CheckCircle,
  VpnKey
} from '@mui/icons-material';
import axios from 'axios';
import { setCredentials } from '../../store/slices/authSlice';
import authService from '../../services/authService';

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
      // Passwordless login with phone number only
      const response = await axios.post('https://carryit-backend.onrender.com/api/v1/auth/agent-login', 
        { phone },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('=== FULL RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response object:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data type:', typeof response.data);
      console.log('Response.data keys:', Object.keys(response.data || {}));
      
      const { access_token, refresh_token, user } = response.data;

      console.log('=== EXTRACTED VALUES ===');
      console.log('access_token:', access_token ? 'exists' : 'MISSING');
      console.log('refresh_token:', refresh_token ? 'exists' : 'MISSING');
      console.log('user:', user);
      console.log('user type:', typeof user);

      // Validate response has required data
      if (!access_token || !refresh_token) {
        console.error('❌ Missing tokens!');
        setError('Login error: Invalid response from server.');
        return;
      }

      if (!user) {
        console.error('❌ No user object in response!');
        console.error('Response data was:', response.data);
        setError('Login error: No user data received.');
        return;
      }

      console.log('✅ User data:', user);
      console.log('✅ User role:', user.role);

      // Check if user is an agent (flexible role check)
      const roleStr = String(user.role || '').toLowerCase();
      const isAgent = roleStr === 'agent' || roleStr === 'userrole.agent';
      
      if (!isAgent) {
        setError(`Access denied. This login is for agents only. Your role is: ${user.role || 'unknown'}`);
        return;
      }

      // Store authentication data in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('✅ Tokens stored in localStorage');
      console.log('📦 Token preview:', access_token.substring(0, 30) + '...');

      // Update authService instance with new token
      authService.refreshTokenFromStorage();

      // Also update Redux store
      dispatch(setCredentials({
        user: user,
        token: access_token,
        refreshToken: refresh_token
      }));

      console.log('✅ AuthService updated');
      console.log('✅ Redux updated');
      console.log('✅ Navigating to dashboard...');

      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/agent', { replace: true });
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your phone number.';
      
      if (err.response?.data?.detail) {
        // Handle array of validation errors
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
        py: 3,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Paper
            elevation={10}
            sx={{
              borderRadius: '50%',
              width: 100,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              bgcolor: 'white'
            }}
          >
            <PersonPin sx={{ fontSize: 60, color: 'primary.main' }} />
          </Paper>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 1
            }}
          >
            Agent Portal
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            CarryIT Property Management System
          </Typography>
        </Box>

        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Passwordless Badge */}
          <Box
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              py: 1.5,
              px: 3,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <VpnKey sx={{ fontSize: 20 }} />
            <Typography variant="body2" fontWeight="bold">
              Passwordless Login - Phone Number Only
            </Typography>
            <CheckCircle sx={{ fontSize: 20 }} />
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick & Secure Access
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your registered phone number to access your agent dashboard
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="+256750371313"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="primary" sx={{ fontSize: 28 }} />
                    </InputAdornment>
                  )
                }}
                helperText="Use the phone number provided by your administrator"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    '& input': {
                      py: 2
                    }
                  }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !phone.trim()}
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: loading
                    ? 'grey.400'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: loading ? 'none' : '0 4px 15px 0 rgba(118, 75, 162, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    boxShadow: '0 6px 20px 0 rgba(118, 75, 162, 0.6)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Login sx={{ mr: 1 }} />
                    Login to Dashboard
                  </>
                )}
              </Button>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Chip
                icon={<CheckCircle />}
                label="No Password Required"
                color="success"
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                icon={<VpnKey />}
                label="Secure Access"
                color="primary"
                size="small"
                sx={{ mb: 1 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Agent accounts are created and managed by system administrators
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Need help? Contact your property manager
              </Typography>
            </Box>
          </CardContent>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © 2025 CarryIT Property Management. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AgentLogin;

