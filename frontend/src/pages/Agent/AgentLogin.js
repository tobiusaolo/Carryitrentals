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
  IconButton,
  Paper
} from '@mui/material';
import {
  Phone,
  PersonPin,
  Login
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 3
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 4,
              textAlign: 'center'
            }}
          >
            <PersonPin sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Agent Login
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              CarryIT Property Management
            </Typography>
          </Box>

          {/* Form */}
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Passwordless Login</strong> - Just enter your registered phone number
              </Typography>
            </Alert>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="+256750371313"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="primary" />
                    </InputAdornment>
                  )
                }}
                helperText="Enter the phone number registered by your admin"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<Login />}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Logging in...' : 'Login as Agent'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Agent accounts are created by administrators
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default AgentLogin;

