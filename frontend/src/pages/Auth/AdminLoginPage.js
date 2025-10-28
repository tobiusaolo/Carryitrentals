import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Divider,
  Link
} from '@mui/material';
import {
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { loginUser, getCurrentUser, clearError } from '../../store/slices/authSlice';

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    try {
      console.log('Attempting login with:', formData);
      const result = await dispatch(loginUser(formData));
      console.log('Login result:', result);
      
      if (result.type === 'auth/login/fulfilled') {
        console.log('Login successful, fetching user data...');
        // Fetch user data after successful login
        const userResult = await dispatch(getCurrentUser());
        console.log('User data result:', userResult);
        
        if (userResult.type === 'auth/getCurrentUser/fulfilled') {
          const userRole = userResult.payload?.role;
          console.log('User role:', userRole);
          
          if (userRole === 'admin') {
            console.log('Admin user detected, redirecting to /admin');
            navigate('/admin');
          } else {
            console.log('Non-admin user, showing error');
            // Show error for non-admin users
            dispatch(clearError());
            setFormData({ email: '', password: '' });
          }
        } else {
          console.log('Failed to get user data:', userResult);
        }
      } else {
        console.log('Login failed:', result);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AdminIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Admin Login
            </Typography>
            <Typography variant="body1" color="text.secondary">
              System Administrator Access
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Admin Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: <SecurityIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Sign In as Admin'
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Are you a property owner?
            </Typography>
            <Link 
              href="/login" 
              variant="body2"
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <BusinessIcon sx={{ mr: 1, fontSize: 16 }} />
              Go to Owner Login
            </Link>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Admin Credentials:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: admin@example.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Password: admin123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLoginPage;
